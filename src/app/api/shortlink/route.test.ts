import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PURGE_INTERVAL_MS } from '@/lib/hash-store';

/**
 * Rétention (B55) côté écriture : re-partager un lien existant rafraîchit
 * son `last_access`, la purge du jour passe, et une purge ratée ne change pas
 * l'`{ id }` rendu.
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

const { POST } = await import('./route');

const call = (body: unknown) =>
  POST(
    new Request('http://0.0.0.0:3000/api/shortlink', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  );

describe('POST /api/shortlink', () => {
  it('upsert qui rafraîchit `last_access`', async () => {
    const res = await call({ path: '/characters?z=N4Ig' });
    expect(res.status).toBe(200);
    const { id } = (await res.json()) as { id: string };
    const inserts = sqls(/^INSERT INTO short_links/);
    expect(inserts).toHaveLength(1);
    expect(inserts[0][0]).toContain('ON DUPLICATE KEY UPDATE last_access = CURRENT_TIMESTAMP');
    expect(inserts[0][1]).toEqual([id, '/characters?z=N4Ig']);
  });

  it('purge une fois sur deux accès du même jour, de nouveau après 24 h', async () => {
    await call({ path: '/characters?z=N4Ig' });
    await call({ path: '/characters?z=N4Ig' });
    expect(sqls(/DELETE FROM/)).toHaveLength(1);
    vi.setSystemTime(clock + PURGE_INTERVAL_MS);
    await call({ path: '/characters?z=N4Ig' });
    expect(sqls(/DELETE FROM/)).toHaveLength(2);
  });

  it('une purge qui lève ne change pas la réponse', async () => {
    db.fail = /DELETE FROM/;
    const res = await call({ path: '/characters?z=N4Ig' });
    expect(res.status).toBe(200);
    expect(sqls(/DELETE FROM/)).toHaveLength(1);
  });
});
