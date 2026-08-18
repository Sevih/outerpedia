import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Ce que ces tests tiennent : le `Location` de `/s/[id]` reste un chemin
 * RELATIF. Reconstruire une URL absolue côté serveur (`new URL(path,
 * request.url)`) renvoyait les visiteurs sur `https://0.0.0.0:3000/…`, l'adresse
 * d'écoute de l'image standalone (bug du 18/08/2026) — invisible en dev, où
 * cette adresse se trouve être joignable.
 */

const rows: Array<{ path: unknown }> = [];
let connAvailable = true;

vi.mock('@/lib/db', () => ({
  getDbConnection: async () =>
    connAvailable
      ? {
          query: async () => [[], []],
          execute: async () => [rows, []],
          end: async () => {},
        }
      : null,
}));

const { GET } = await import('./route');

const call = (id: string) =>
  GET(new Request(`http://0.0.0.0:3000/s/${id}`), { params: Promise.resolve({ id }) });

beforeEach(() => {
  rows.length = 0;
  connAvailable = true;
});

describe('GET /s/[id]', () => {
  it('redirige vers le chemin stocké, en relatif', async () => {
    rows.push({ path: '/characters?z=N4IgJiBcDaBMDsBdAvkA' });
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

    connAvailable = false;
    const noDb = await call('0oLx4q4AbSI3');
    expect(noDb.headers.get('location')).toBe('/');

    // Pas de cache sur ces trois-là : l'id peut être créé après coup.
    for (const res of [bad, missing, noDb]) expect(res.headers.get('cache-control')).toBeNull();
  });

  it('refuse un chemin externe lu en base (open redirect)', async () => {
    rows.push({ path: '//evil.com/x' });
    expect((await call('0oLx4q4AbSI3')).headers.get('location')).toBe('/');
  });
});
