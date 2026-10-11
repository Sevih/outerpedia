/**
 * La règle de datation des guides, partagée par `scripts/stamp-guides.ts` et
 * quick (lot F18) : ce qu'elle tient — un fichier d'archive ne re-date pas le
 * guide, le `meta.json` re-daté garde l'ordre de ses clés et la forme
 * prettier, deux stamps de la même date n'écrivent qu'une fois, la date du
 * jour est LOCALE. Sur des fichiers temporaires : rien n'est lu de l'arbre
 * du site, aucun git.
 */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
  STAMP_DATE_RE,
  archivePrefixes,
  hasRelevantChange,
  stampMeta,
  todayLocal,
  versionKeys,
} from './guide-stamp';

const root = mkdtempSync(join(tmpdir(), 'guide-stamp-'));
afterAll(() => rmSync(root, { recursive: true, force: true }));

const BASE = 'src/app/[lang]/guides/_contents/joint-challenge/annihilator/';
const KEYS = ['2026-10', '2026-05', '2025-12'];

describe('hasRelevantChange — ce qui re-date un guide', () => {
  const archives = archivePrefixes(BASE, KEYS);

  it('les archives sont toutes les versions sauf la plus récente', () => {
    expect(archives).toEqual([`${BASE}versions/2026-05/`, `${BASE}versions/2025-12/`]);
    expect(archivePrefixes(BASE, [])).toEqual([]);
  });

  it('un fichier partagé du guide, ou de sa DERNIÈRE version, compte', () => {
    expect(hasRelevantChange(BASE, [`${BASE}strings.json`], archives)).toBe(true);
    expect(hasRelevantChange(BASE, [`${BASE}versions/2026-10/tips.json`], archives)).toBe(true);
    expect(hasRelevantChange(BASE, [`${BASE}meta.json`], archives)).toBe(true);
  });

  it('un fichier d’ARCHIVE ne compte pas — corriger un vieux guide ne le remonte pas', () => {
    expect(hasRelevantChange(BASE, [`${BASE}versions/2026-05/tips.json`], archives)).toBe(false);
    expect(
      hasRelevantChange(
        BASE,
        [`${BASE}versions/2025-12/config.json`, `${BASE}versions/2026-05/teams.json`],
        archives,
      ),
    ).toBe(false);
  });

  it('un fichier d’un AUTRE guide ne compte pas, même voisin', () => {
    const other = 'src/app/[lang]/guides/_contents/joint-challenge/annihilator-ex/meta.json';
    expect(hasRelevantChange(BASE, [other, 'docs/TODO.md'], archives)).toBe(false);
  });

  it('`ignore` écarte ce que l’appelant veut (le meta dont seul `updated` bouge)', () => {
    expect(
      hasRelevantChange(BASE, [`${BASE}meta.json`], archives, (f) => f === `${BASE}meta.json`),
    ).toBe(false);
  });
});

describe('versionKeys — les dossiers de versions, la plus récente d’abord', () => {
  it('ignore ce qui n’est pas un dossier `YYYY-MM`', () => {
    const dir = join(root, 'g1');
    for (const k of ['2026-05', '2026-10', 'brouillon', '2026-13'])
      mkdirSync(join(dir, 'versions', k), { recursive: true });
    writeFileSync(join(dir, 'versions', '2025-01'), 'un fichier, pas un dossier');
    expect(versionKeys(dir)).toEqual(['2026-10', '2026-05']);
    expect(versionKeys(join(root, 'absent'))).toEqual([]);
  });
});

describe('stampMeta — le meta re-daté', () => {
  const metaPath = join(root, 'meta.json');

  it('garde l’ordre des clés quand `updated` existe, et la forme prettier (tableaux courts inline)', async () => {
    writeFileSync(
      metaPath,
      JSON.stringify(
        {
          title: { en: 'T' },
          description: { en: 'D' },
          icon: 'I',
          author: 'A',
          updated: '2026-01-01',
          dungeons: ['100805'],
        },
        null,
        2,
      ),
    );
    expect(await stampMeta(metaPath, '2026-10-11')).toBe(true);
    const text = readFileSync(metaPath, 'utf8');
    expect(Object.keys(JSON.parse(text) as object)).toEqual([
      'title',
      'description',
      'icon',
      'author',
      'updated',
      'dungeons',
    ]);
    expect(text).toContain('"updated": "2026-10-11"');
    expect(text).toContain('"dungeons": ["100805"]');
    expect(text.endsWith('\n')).toBe(true);
  });

  it('insère `updated` après `author` quand il manque', async () => {
    writeFileSync(
      metaPath,
      JSON.stringify({ title: { en: 'T' }, icon: 'I', author: 'A', order: 3 }, null, 2),
    );
    expect(await stampMeta(metaPath, '2026-10-11')).toBe(true);
    expect(Object.keys(JSON.parse(readFileSync(metaPath, 'utf8')) as object)).toEqual([
      'title',
      'icon',
      'author',
      'updated',
      'order',
    ]);
  });

  it('n’écrit RIEN quand la date est déjà là (idempotent)', async () => {
    writeFileSync(metaPath, JSON.stringify({ author: 'A', updated: '2026-10-11' }, null, 2));
    const before = readFileSync(metaPath, 'utf8');
    expect(await stampMeta(metaPath, '2026-10-11')).toBe(false);
    expect(readFileSync(metaPath, 'utf8')).toBe(before);
  });
});

describe('todayLocal — la date du jour, locale', () => {
  it('rend `YYYY-MM-DD`, dans le fuseau du poste (un commit à 1 h du matin reste au bon jour)', () => {
    expect(todayLocal()).toMatch(STAMP_DATE_RE);
    const d = new Date(2026, 9, 11, 1, 30); // 11 octobre 2026, 1 h 30, heure locale
    expect(todayLocal(d)).toBe('2026-10-11');
  });
});
