import { afterEach, describe, expect, it, vi } from 'vitest';
import { getActiveBanners } from '@/lib/home';
import type { RawBanner } from '@/lib/data/banners';
import { getAllCharacters, slugForId } from '@/lib/data/characters';

// L'instant du rendu et les bannières lues en runtime : tous deux bouchonnés.
const now = vi.hoisted(() => ({ value: new Date() }));
const banners = vi.hoisted(() => ({ value: [] as RawBanner[] }));
vi.mock('@/lib/time', () => ({ serverNow: () => now.value }));
vi.mock('@/lib/data/banners', () => ({ loadBanners: async () => banners.value }));

afterEach(() => {
  banners.value = [];
});

describe('getActiveBanners — `end` exclusif, comme le compte à rebours client', () => {
  // Un perso réel (la vue l'enrichit par `getCharacter`), dates inventées.
  const id = getAllCharacters().find((c) => slugForId(c.id))!.id;
  const banner: RawBanner = { id, name: 'x', start: '2026-10-01', end: '2026-10-15' };

  it('le jour de `end` (00:00 UTC passé), la bannière n’est plus servie', async () => {
    banners.value = [banner];
    now.value = new Date('2026-10-15T00:00:00Z');
    expect(await getActiveBanners('en')).toEqual([]);
    now.value = new Date('2026-10-15T23:59:59Z');
    expect(await getActiveBanners('en')).toEqual([]);
  });

  it('la veille de `end` est le dernier jour servi', async () => {
    banners.value = [banner];
    now.value = new Date('2026-10-14T23:59:59Z');
    expect((await getActiveBanners('en')).map((b) => [b.id, b.end])).toEqual([[id, '2026-10-15']]);
  });

  it('`start` reste inclusif', async () => {
    banners.value = [banner];
    now.value = new Date('2026-10-01T00:00:00Z');
    expect(await getActiveBanners('en')).toHaveLength(1);
    now.value = new Date('2026-09-30T23:59:59Z');
    expect(await getActiveBanners('en')).toEqual([]);
  });
});
