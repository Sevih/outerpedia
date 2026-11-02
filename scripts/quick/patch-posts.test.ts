import { mkdtempSync, readFileSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { patchPostsReader } from './patch-posts';

const post = (id: number, title: string) => ({
  id,
  date: '2026-11-02',
  slug: `note-${id}`,
  lang: 'en',
  type: 'update',
  title,
  content: '<p>…</p>',
});

describe('notes de patch de quick, relues quand posts.json change', () => {
  let dir: string;
  let file: string;
  let reads: number;
  let warnings: string[];
  const deps = () => ({
    readFile: async (f: string) => {
      reads++;
      return readFileSync(f, 'utf8');
    },
    warn: (m: string) => warnings.push(m),
  });
  const write = (posts: unknown[], at: number) => {
    writeFileSync(file, JSON.stringify({ posts }));
    // Deux écritures dans la même milliseconde gardent la mtime : on la pose.
    utimesSync(file, at, at);
  };

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'quick-patch-posts-'));
    file = join(dir, 'posts.json');
    reads = 0;
    warnings = [];
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it('lit le fichier une fois, puis ne le relit pas tant que rien ne bouge', async () => {
    write([post(1, 'Patch 1')], 1_000_000);
    const posts = patchPostsReader(file, deps());
    expect((await posts()).map((p) => p.title)).toEqual(['Patch 1']);
    expect((await posts()).map((p) => p.title)).toEqual(['Patch 1']);
    expect(reads).toBe(1);
  });

  it('relit après une réécriture qui change la mtime', async () => {
    write([post(1, 'Patch 1')], 1_000_000);
    const posts = patchPostsReader(file, deps());
    await posts();
    write([post(2, 'Patch 2'), post(1, 'Patch 1')], 1_000_100);
    expect((await posts()).map((p) => p.title)).toEqual(['Patch 2', 'Patch 1']);
    expect(reads).toBe(2);
  });

  it('relit aussi quand seule la taille change', async () => {
    write([post(1, 'Patch 1')], 1_000_000);
    const posts = patchPostsReader(file, deps());
    await posts();
    write([post(1, 'Patch 1 corrigé')], 1_000_000);
    expect((await posts())[0].title).toBe('Patch 1 corrigé');
    expect(reads).toBe(2);
  });

  it('deux demandes simultanées partagent la même lecture', async () => {
    write([post(1, 'Patch 1')], 1_000_000);
    const posts = patchPostsReader(file, deps());
    await Promise.all([posts(), posts()]);
    expect(reads).toBe(1);
  });

  it('fichier absent : liste vide, un seul avertissement, sans jeter', async () => {
    const posts = patchPostsReader(join(dir, 'absent.json'), deps());
    await expect(posts()).resolves.toEqual([]);
    await expect(posts()).resolves.toEqual([]);
    expect(reads).toBe(0);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatch(/introuvable/);
  });

  it('fichier illisible ou d’une autre forme : liste vide, puis relu une fois réparé', async () => {
    writeFileSync(file, '{ pas du json');
    utimesSync(file, 1_000_000, 1_000_000);
    const posts = patchPostsReader(file, deps());
    await expect(posts()).resolves.toEqual([]);
    await expect(posts()).resolves.toEqual([]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatch(/illisible/);

    writeFileSync(file, JSON.stringify({ notes: [] }));
    utimesSync(file, 1_000_100, 1_000_100);
    await expect(posts()).resolves.toEqual([]);
    expect(warnings[1]).toMatch(/sans tableau/);

    write([post(1, 'Patch 1')], 1_000_200);
    expect((await posts()).map((p) => p.title)).toEqual(['Patch 1']);
    expect(reads).toBe(3);
  });
});
