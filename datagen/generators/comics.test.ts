/**
 * Invariants du générateur comics sur `comics.json` committé. Le générateur est
 * un simple SCAN fs (`.editorial/comics/<LANG>`) sans cœur pur à isoler → on
 * valide la FORME du catalogue servi : clés = langues d'origine connues, stems
 * sans extension, uniques et triés (ordre stable du JSON).
 *
 * Tourne SANS `.gamedata` (le générateur ne lit que l'éditorial, ici pas lu).
 */
import { describe, expect, it } from 'vitest';
import comicsData from '../../data/generated/comics.json';
import { COMIC_LANGS, type ComicsData } from './comics';

const comics = comicsData as ComicsData;
const IMAGE_RE = /\.(png|jpe?g|webp)$/i;

describe('comics.json — invariants de catalogue', () => {
  it('clés = langues d’origine connues (EN/JP/KR)', () => {
    expect(Object.keys(comics).sort()).toEqual([...COMIC_LANGS].sort());
  });

  it('chaque langue : stems sans extension, uniques, triés', () => {
    const bad: string[] = [];
    for (const lang of COMIC_LANGS) {
      const list = comics[lang];
      if (!Array.isArray(list)) {
        bad.push(`${lang} : pas une liste`);
        continue;
      }
      if (new Set(list).size !== list.length) bad.push(`${lang} : doublons`);
      if (list.some((s) => IMAGE_RE.test(s))) bad.push(`${lang} : extension dans un stem`);
      const sorted = [...list].sort();
      if (JSON.stringify(list) !== JSON.stringify(sorted)) bad.push(`${lang} : non trié`);
    }
    expect(bad).toEqual([]);
  });
});
