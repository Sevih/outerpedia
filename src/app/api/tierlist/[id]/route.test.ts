import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PURGE_INTERVAL_MS } from '@/lib/hash-store';

/**
 * Rétention (B55) côté lecture de la tier-list : la lecture marque la ligne,
 * la purge du jour passe, et ni l'une ni l'autre ne change le `{ z }` rendu
 * quand elle échoue.
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
  GET(new Request(`http://0.0.0.0:3000/api/tierlist/${id}`), { params: Promise.resolve({ id }) });

describe('GET /api/tierlist/[id]', () => {
  it('rend la liste et marque la ligne lue, au plus une fois par jour', async () => {
    db.rows.push({ payload: '1abc' });
    const res = await call('0oLx4q4AbSI3');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ z: '1abc' });
    const updates = sqls(/^UPDATE tier_lists/);
    expect(updates).toHaveLength(1);
    expect(updates[0][0]).toContain('last_access < CURRENT_TIMESTAMP - INTERVAL 1 DAY');
    expect(updates[0][1]).toEqual(['0oLx4q4AbSI3']);
  });

  it('ne marque rien sur 404', async () => {
    const res = await call('0oLx4q4AbSI3');
    expect(res.status).toBe(404);
    expect(sqls(/^UPDATE/)).toHaveLength(0);
  });

  it('une marque de lecture qui lève ne change pas la réponse', async () => {
    db.rows.push({ payload: '1abc' });
    db.fail = /^UPDATE/;
    const res = await call('0oLx4q4AbSI3');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ z: '1abc' });
    expect(res.headers.get('cache-control')).toBe('public, max-age=300');
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
    db.rows.push({ payload: '1abc' });
    db.fail = /DELETE FROM/;
    const res = await call('0oLx4q4AbSI3');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ z: '1abc' });
    expect(sqls(/DELETE FROM/)).toHaveLength(1);
  });
});
