import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Connection } from 'mysql2/promise';
import { createHashStore, ID_LENGTH, PURGE_INTERVAL_MS } from '@/lib/hash-store';

/**
 * `hash-store.ts` — socle extrait de `short-links.ts` et `tierlist/_store.ts`
 * (audit 07/08). Ce qu'on garde sous test, c'est ce que la factorisation
 * pourrait casser : le déterminisme des ids (des liens partagés en dépendent)
 * et l'ISOLATION de la mémoïsation entre stores (une seule table créée sinon).
 * Et la rétention (B55) : la migration de `last_access`, la marque de lecture,
 * la purge d'au plus une fois par jour. Pas de MySQL ici : on vérifie le SQL
 * émis.
 */

/**
 * Connexion factice : `query` et `execute` notent le SQL reçu. `hasColumn` dit
 * si `information_schema` connaît `last_access` ; une requête qui matche `fail`
 * lève.
 */
function fakeConn({ hasColumn = true, fail }: { hasColumn?: boolean; fail?: RegExp } = {}) {
  const run = vi.fn(async (sql: string) => {
    if (fail?.test(sql)) throw new Error('BDD');
    if (sql.includes('information_schema')) return [hasColumn ? [{ 1: 1 }] : [], []];
    return [[], []];
  });
  const sqls = () => run.mock.calls.map(([sql]) => sql);
  const count = (re: RegExp) => sqls().filter((sql) => re.test(sql)).length;
  return { conn: { query: run, execute: run } as unknown as Connection, run, sqls, count };
}

const CREATE = /CREATE TABLE IF NOT EXISTS/;
const ALTER = /ALTER TABLE/;
const DELETE = /DELETE FROM/;

const spec = { table: 'demo', column: 'value', maxLength: 128 };

describe('id — dérivé du contenu', () => {
  it('même valeur ⇒ même id, valeurs différentes ⇒ ids différents', () => {
    const s = createHashStore(spec);
    expect(s.id('/tools/x?z=abc')).toBe(s.id('/tools/x?z=abc'));
    expect(s.id('/tools/x?z=abc')).not.toBe(s.id('/tools/x?z=abd'));
  });

  it('produit ID_LENGTH caractères base64url, conformes au motif par défaut', () => {
    const s = createHashStore(spec);
    for (const v of ['/', '/characters/ame', 'x'.repeat(1000)]) {
      expect(s.id(v)).toHaveLength(ID_LENGTH);
      expect(s.id(v)).toMatch(s.idPattern);
    }
  });

  it('ne dépend pas du store : deux stores dérivent le même id', () => {
    const a = createHashStore(spec);
    const b = createHashStore({ ...spec, table: 'autre', column: 'payload' });
    expect(a.id('/x')).toBe(b.id('/x'));
  });
});

describe('idPattern', () => {
  it('par défaut, exige exactement ID_LENGTH caractères', () => {
    const { idPattern } = createHashStore(spec);
    expect('a'.repeat(ID_LENGTH)).toMatch(idPattern);
    expect('a'.repeat(ID_LENGTH - 1)).not.toMatch(idPattern);
    expect('a/b').not.toMatch(idPattern);
  });

  it('reste celui fourni quand un store hérite d’ids plus anciens', () => {
    const legacy = /^[A-Za-z0-9_-]{1,16}$/;
    expect(createHashStore({ ...spec, idPattern: legacy }).idPattern).toBe(legacy);
  });
});

describe('ensureTable — mémoïsation', () => {
  it('ne crée la table qu’une fois par store, même sur appels répétés', async () => {
    const s = createHashStore(spec);
    const { conn, count, sqls } = fakeConn();
    await Promise.all([s.ensureTable(conn), s.ensureTable(conn), s.ensureTable(conn)]);
    expect(count(CREATE)).toBe(1);
    expect(sqls()[0]).toContain('CREATE TABLE IF NOT EXISTS demo');
    expect(sqls()[0]).toContain('value VARCHAR(128)');
  });

  it('N’ISOLE PAS deux stores : chacun crée SA table', async () => {
    const a = createHashStore(spec);
    const b = createHashStore({ ...spec, table: 'autre', column: 'payload' });
    const { conn, count, sqls } = fakeConn();
    await a.ensureTable(conn);
    await b.ensureTable(conn);
    expect(count(CREATE)).toBe(2);
    expect(sqls().filter((sql) => CREATE.test(sql))[1]).toContain(
      'CREATE TABLE IF NOT EXISTS autre',
    );
  });

  it('réessaie après un échec (pas de table condamnée pour la vie du process)', async () => {
    const s = createHashStore(spec);
    const query = vi
      .fn()
      .mockRejectedValueOnce(new Error('BDD injoignable'))
      .mockResolvedValue([[{ 1: 1 }], []]);
    const conn = { query } as unknown as Connection;

    await expect(s.ensureTable(conn)).rejects.toThrow('BDD injoignable');
    await expect(s.ensureTable(conn)).resolves.toBeUndefined();
    expect(query.mock.calls.filter(([sql]) => CREATE.test(sql))).toHaveLength(2);
  });

  it('reste mémoïsé une fois détaché de son objet (les stores le ré-exportent)', async () => {
    const { ensureTable } = createHashStore(spec);
    const { conn, count } = fakeConn();
    await ensureTable(conn);
    await ensureTable(conn);
    expect(count(CREATE)).toBe(1);
  });
});

describe('ensureTable — `last_access`', () => {
  it('crée la table avec la colonne et son index', async () => {
    const { conn, sqls } = fakeConn();
    await createHashStore(spec).ensureTable(conn);
    expect(sqls()[0]).toContain('last_access TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP');
    expect(sqls()[0]).toContain('INDEX idx_last_access (last_access)');
  });

  it('lit la colonne dans le schéma de la base courante, pour SA table', async () => {
    const { conn, run } = fakeConn();
    await createHashStore(spec).ensureTable(conn);
    const [sql, params] = run.mock.calls[1] as unknown as [string, unknown[]];
    expect(sql).toContain('information_schema.COLUMNS');
    expect(sql).toContain('TABLE_SCHEMA = DATABASE()');
    expect(sql).toContain("COLUMN_NAME = 'last_access'");
    expect(params).toEqual(['demo']);
  });

  it('table existante sans la colonne : un ALTER, une fois', async () => {
    const s = createHashStore(spec);
    const { conn, count, sqls } = fakeConn({ hasColumn: false });
    await s.ensureTable(conn);
    await s.ensureTable(conn);
    expect(count(ALTER)).toBe(1);
    const alter = sqls().find((sql) => ALTER.test(sql))!;
    expect(alter).toContain('ALTER TABLE demo');
    expect(alter).toContain('ADD COLUMN last_access TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP');
    expect(alter).toContain('ADD INDEX idx_last_access (last_access)');
  });

  it('table qui a déjà la colonne : aucun ALTER', async () => {
    const { conn, count } = fakeConn({ hasColumn: true });
    await createHashStore(spec).ensureTable(conn);
    expect(count(ALTER)).toBe(0);
  });

  it('un ALTER qui lève remet la mémoïsation à zéro', async () => {
    const s = createHashStore(spec);
    const failing = fakeConn({ hasColumn: false, fail: ALTER });
    await expect(s.ensureTable(failing.conn)).rejects.toThrow('BDD');
    const ok = fakeConn({ hasColumn: false });
    await s.ensureTable(ok.conn);
    expect(ok.count(ALTER)).toBe(1);
  });
});

describe('touch — marque de lecture', () => {
  it('UPDATE de la ligne, au plus une fois par jour', async () => {
    const { conn, run } = fakeConn();
    await createHashStore(spec).touch(conn, 'abc');
    const [sql, params] = run.mock.calls[0] as unknown as [string, unknown[]];
    expect(sql).toContain('UPDATE demo SET last_access = CURRENT_TIMESTAMP');
    expect(sql).toContain('WHERE id = ? AND last_access < CURRENT_TIMESTAMP - INTERVAL 1 DAY');
    expect(params).toEqual(['abc']);
  });

  it('avale un échec', async () => {
    const { conn } = fakeConn({ fail: /UPDATE/ });
    await expect(createHashStore(spec).touch(conn, 'abc')).resolves.toBeUndefined();
  });
});

describe('purgeIfDue — rétention', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('ne purge rien tant que la table n’est pas prête', async () => {
    const { conn, count } = fakeConn();
    await createHashStore(spec).purgeIfDue(conn);
    expect(count(DELETE)).toBe(0);
  });

  it('efface le non-relu depuis 12 mois, par lots de 1000', async () => {
    const s = createHashStore(spec);
    const { conn, sqls } = fakeConn();
    await s.ensureTable(conn);
    await s.purgeIfDue(conn);
    const del = sqls().find((sql) => DELETE.test(sql))!;
    expect(del).toContain('DELETE FROM demo');
    expect(del).toContain('WHERE last_access < CURRENT_TIMESTAMP - INTERVAL 12 MONTH');
    expect(del).toContain('LIMIT 1000');
  });

  it('une seule purge sur deux accès du même jour, de nouveau après 24 h', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-16T08:00:00Z'));
    const s = createHashStore(spec);
    const { conn, count } = fakeConn();
    await s.ensureTable(conn);

    await s.purgeIfDue(conn);
    vi.setSystemTime(new Date('2026-10-16T20:00:00Z'));
    await s.purgeIfDue(conn);
    expect(count(DELETE)).toBe(1);

    vi.setSystemTime(new Date(Date.parse('2026-10-16T08:00:00Z') + PURGE_INTERVAL_MS));
    await s.purgeIfDue(conn);
    expect(count(DELETE)).toBe(2);
  });

  it('deux stores ont chacun leur échéance', async () => {
    const a = createHashStore(spec);
    const b = createHashStore({ ...spec, table: 'autre' });
    const { conn, sqls } = fakeConn();
    await a.ensureTable(conn);
    await b.ensureTable(conn);
    await a.purgeIfDue(conn);
    await b.purgeIfDue(conn);
    expect(sqls().filter((sql) => DELETE.test(sql))).toEqual([
      expect.stringContaining('DELETE FROM demo'),
      expect.stringContaining('DELETE FROM autre'),
    ]);
  });

  it('avale un échec, qui attend l’intervalle suivant', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-16T08:00:00Z'));
    const s = createHashStore(spec);
    const { conn, count } = fakeConn({ fail: DELETE });
    await s.ensureTable(conn);
    await expect(s.purgeIfDue(conn)).resolves.toBeUndefined();
    await s.purgeIfDue(conn);
    expect(count(DELETE)).toBe(1);
    vi.advanceTimersByTime(PURGE_INTERVAL_MS);
    await s.purgeIfDue(conn);
    expect(count(DELETE)).toBe(2);
  });
});
