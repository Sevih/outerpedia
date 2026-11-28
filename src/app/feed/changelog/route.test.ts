import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ResolvedChangelogEntry } from '@/lib/data/changelog';
import { DEFAULT_LANG } from '@/lib/i18n/config';
import { buildUrl } from '@/lib/site';

/**
 * Ce que ces tests tiennent : le `guid` d'un item du flux du journal est l'id
 * STABLE de l'entrée. Il valait `changelog-<date>-<rang>`, le rang dans les 30
 * dernières : chaque nouvelle entrée renumérotait toutes les autres, et un
 * lecteur RSS revoyait le flux entier (A65).
 */

const feed = vi.hoisted(() => ({ entries: [] as ResolvedChangelogEntry[] }));

vi.mock('@/lib/data/changelog', () => ({
  getChangelog: (_lang: string, options?: { limit?: number }) =>
    options?.limit ? feed.entries.slice(0, options.limit) : feed.entries,
}));

const { GET } = await import('./route');

const entry = (id: string, date: string): ResolvedChangelogEntry => ({
  id,
  date,
  type: 'guide',
  title: `Entrée ${id}`,
  content: ['Une **puce**'],
});

/** Les `guid` du flux, dans l'ordre. */
async function guids(): Promise<string[]> {
  const xml = await (await GET()).text();
  return [...xml.matchAll(/<guid isPermaLink="false">([^<]*)<\/guid>/g)].map((m) => m[1]);
}

beforeEach(() => {
  feed.entries = [entry('0a1b2c3d', '2026-10-10'), entry('4e5f6a7b', '2026-10-10')];
});

describe('GET /feed/changelog — guid', () => {
  it('le guid d’une entrée est `changelog-<id>`', async () => {
    expect(await guids()).toEqual(['changelog-0a1b2c3d', 'changelog-4e5f6a7b']);
  });

  it('une entrée plus récente en tête ne change pas le guid des autres', async () => {
    const before = await guids();
    feed.entries = [entry('8c9d0e1f', '2026-10-12'), ...feed.entries];
    const after = await guids();
    expect(after).toEqual(['changelog-8c9d0e1f', ...before]);
  });
});

describe('GET /feed/changelog — liens des puces (B77)', () => {
  /** La `description` du seul item du flux, déséchappée. */
  async function description(content: string[]): Promise<string> {
    feed.entries = [{ ...entry('0a1b2c3d', '2026-11-28'), content }];
    const xml = await (await GET()).text();
    const m = xml.match(/<description>([^<]*)<\/description>\s*<pubDate>/);
    return (m?.[1] ?? '').replace(/&amp;/g, '&');
  }

  it('un lien externe s’aplatit en `libellé (url)`', async () => {
    expect(
      await description([
        '🔗 [Survey (Global)](https://t.co/KxxijqwJ0f) · [問卷連結 (繁體中文)](https://t.co/OgdUxsLmOv)',
      ]),
    ).toBe(
      '🔗 Survey (Global) (https://t.co/KxxijqwJ0f) · 問卷連結 (繁體中文) (https://t.co/OgdUxsLmOv)',
    );
  });

  it('un lien interne prend l’url absolue du site, le gras de son libellé aplati', async () => {
    expect(await description(['See **[the guide](/guides/x)**.', 'Une **puce**'])).toBe(
      `See the guide (${buildUrl(DEFAULT_LANG, '/guides/x')}). — Une puce`,
    );
  });
});
