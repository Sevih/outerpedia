import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PURGE_INTERVAL_MS } from '@/lib/hash-store';

/**
 * Ce que ces tests tiennent : le `Location` de `/s/[id]` reste un chemin
 * RELATIF. Reconstruire une URL absolue côté serveur (`new URL(path,
 * request.url)`) renvoyait les visiteurs sur `https://0.0.0.0:3000/…`, l'adresse
 * d'écoute de l'image standalone (bug du 18/08/2026) — invisible en dev, où
 * cette adresse se trouve être joignable.
 *
 * Et la rétention (B55) : la lecture marque le lien, la purge du jour passe,
 * et ni l'une ni l'autre ne change la redirection quand elle échoue.
 */

const db = vi.hoisted(() => ({
  rows: [] as Array<Record<string, unknown>>,
  available: true,
  /** Une requête qui matche lève. */
  fail: null as RegExp | null,
  calls: [] as Array<[string, unknown[] | undefined]>,
}));

vi.mock('@/lib/db', () => {
  const run = async (sql: string, params?: unknown[]) => {
    db.calls.push([sql, params]);
    if (db.fail?.test(sql)) throw new Error('BDD');
    if (sql.includes('information_schema')) return [[{ 1: 1 }], []];
    if (sql.startsWith('SELECT')) return [db.rows, []];
    return [[], []];
  };
  return {
    getDbConnection: async () =>
      db.available ? { query: run, execute: run, end: async () => {} } : null,
  };
});

const sqls = (re: RegExp) => db.calls.filter(([sql]) => re.test(sql));

// Chaque test part avec une purge due : l'échéance (24 h) est par process,
// donc partagée par les tests du fichier.
let clock = Date.parse('2026-10-16T08:00:00Z');
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  clock += 2 * PURGE_INTERVAL_MS;
  vi.setSystemTime(clock);
  db.rows.length = 0;
  db.available = true;
  db.fail = null;
  db.calls.length = 0;
});
afterEach(() => {
  vi.useRealTimers();
});

const { GET } = await import('./route');

const call = (id: string) =>
  GET(new Request(`http://0.0.0.0:3000/s/${id}`), { params: Promise.resolve({ id }) });

describe('GET /s/[id]', () => {
  it('redirige vers le chemin stocké, en relatif', async () => {
    db.rows.push({ path: '/characters?z=N4IgJiBcDaBMDsBdAvkA' });
    const res = await call('0oLx4q4AbSI3');
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('/characters?z=N4IgJiBcDaBMDsBdAvkA');
    // L'id étant un hash du chemin, l'association ne change jamais.
    expect(res.headers.get('cache-control')).toBe('public, max-age=3600');
  });

  it('renvoie à l accueil sur id invalide, lien mort ou stockage absent', async () => {
    const bad = await call('pas-un-id');
    expect(bad.headers.get('location')).toBe('/');

    const missing = await call('0oLx4q4AbSI3'); // rows vide
    expect(missing.headers.get('location')).toBe('/');

    db.available = false;
    const noDb = await call('0oLx4q4AbSI3');
    expect(noDb.headers.get('location')).toBe('/');

    // Pas de cache sur ces trois-là : l'id peut être créé après coup.
    for (const res of [bad, missing, noDb]) expect(res.headers.get('cache-control')).toBeNull();
  });

  it('refuse un chemin externe lu en base (open redirect)', async () => {
    db.rows.push({ path: '//evil.com/x' });
    expect((await call('0oLx4q4AbSI3')).headers.get('location')).toBe('/');
  });

  it('crée la table avec `last_access` au premier accès', async () => {
    // La table est déjà « prête » pour le module des tests d'avant (mémoïsation
    // par process) : un module neuf rejoue le premier accès.
    vi.resetModules();
    const fresh = await import('./route');
    await fresh.GET(new Request('http://0.0.0.0:3000/s/0oLx4q4AbSI3'), {
      params: Promise.resolve({ id: '0oLx4q4AbSI3' }),
    });
    expect(sqls(/CREATE TABLE IF NOT EXISTS short_links/)[0][0]).toContain('last_access');
  });

  it('marque la ligne lue, au plus une fois par jour', async () => {
    db.rows.push({ path: '/characters' });
    await call('0oLx4q4AbSI3');
    const updates = sqls(/^UPDATE short_links/);
    expect(updates).toHaveLength(1);
    expect(updates[0][0]).toContain('last_access < CURRENT_TIMESTAMP - INTERVAL 1 DAY');
    expect(updates[0][1]).toEqual(['0oLx4q4AbSI3']);
  });

  it('ne marque pas un lien mort ou refusé', async () => {
    await call('0oLx4q4AbSI3');
    db.rows.push({ path: '//evil.com/x' });
    await call('0oLx4q4AbSI3');
    expect(sqls(/^UPDATE/)).toHaveLength(0);
  });

  it('une marque de lecture qui lève ne change pas la redirection', async () => {
    db.rows.push({ path: '/characters' });
    db.fail = /^UPDATE/;
    const res = await call('0oLx4q4AbSI3');
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('/characters');
    expect(res.headers.get('cache-control')).toBe('public, max-age=3600');
  });

  it('purge une fois sur deux accès du même jour, de nouveau après 24 h', async () => {
    await call('0oLx4q4AbSI3');
    await call('0oLx4q4AbSI3');
    expect(sqls(/DELETE FROM/)).toHaveLength(1);
    vi.setSystemTime(clock + PURGE_INTERVAL_MS);
    await call('0oLx4q4AbSI3');
    expect(sqls(/DELETE FROM/)).toHaveLength(2);
  });

  it('une purge qui lève ne change pas la réponse', async () => {
    db.rows.push({ path: '/characters' });
    db.fail = /DELETE FROM/;
    const res = await call('0oLx4q4AbSI3');
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('/characters');
    expect(sqls(/DELETE FROM/)).toHaveLength(1);
  });
});
