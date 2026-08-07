import { describe, expect, it, vi } from 'vitest';
import type { Connection } from 'mysql2/promise';
import { createHashStore, ID_LENGTH } from '@/lib/hash-store';

/**
 * `hash-store.ts` — socle extrait de `short-links.ts` et `tierlist/_store.ts`
 * (audit 07/08). Ce qu'on garde sous test, c'est ce que la factorisation
 * pourrait casser : le déterminisme des ids (des liens partagés en dépendent)
 * et l'ISOLATION de la mémoïsation entre stores (une seule table créée sinon).
 */

/** Connexion factice : on n'observe que les `query` reçues. */
function fakeConn() {
  const query = vi.fn().mockResolvedValue([[], []]);
  return { conn: { query } as unknown as Connection, query };
}

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
    const { conn, query } = fakeConn();
    await Promise.all([s.ensureTable(conn), s.ensureTable(conn), s.ensureTable(conn)]);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0][0]).toContain('CREATE TABLE IF NOT EXISTS demo');
    expect(query.mock.calls[0][0]).toContain('value VARCHAR(128)');
  });

  it('N’ISOLE PAS deux stores : chacun crée SA table', async () => {
    const a = createHashStore(spec);
    const b = createHashStore({ ...spec, table: 'autre', column: 'payload' });
    const { conn, query } = fakeConn();
    await a.ensureTable(conn);
    await b.ensureTable(conn);
    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[1][0]).toContain('CREATE TABLE IF NOT EXISTS autre');
  });

  it('réessaie après un échec (pas de table condamnée pour la vie du process)', async () => {
    const s = createHashStore(spec);
    const query = vi
      .fn()
      .mockRejectedValueOnce(new Error('BDD injoignable'))
      .mockResolvedValue([[], []]);
    const conn = { query } as unknown as Connection;

    await expect(s.ensureTable(conn)).rejects.toThrow('BDD injoignable');
    await expect(s.ensureTable(conn)).resolves.toBeUndefined();
    expect(query).toHaveBeenCalledTimes(2);
  });

  it('reste mémoïsé une fois détaché de son objet (les stores le ré-exportent)', async () => {
    const { ensureTable } = createHashStore(spec);
    const { conn, query } = fakeConn();
    await ensureTable(conn);
    await ensureTable(conn);
    expect(query).toHaveBeenCalledTimes(1);
  });
});
