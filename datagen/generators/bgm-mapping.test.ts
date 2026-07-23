/**
 * Tests du générateur bgm-mapping — ses deux CŒURS PURS :
 *   - `formatFilenameAsName` : nom de repli dérivé du fichier quand la piste n'a
 *     pas de ligne lobby (camelCase → espaces, digit collé → séparé, acronymes
 *     tout-majuscule gardés, suffixe `_intro` → « (Intro) »).
 *   - `byFileNameCI` : comparateur DÉTERMINISTE (indépendant de l'ICU) qui fixe
 *     l'ordre du JSON servi.
 * La construction réelle (ffprobe + tables + fs) n'est pas testée ici ; un lot
 * d'invariants valide la forme et l'ORDRE du `bgm_mapping.json` committé.
 *
 * Tourne SANS `.gamedata` : les deux cœurs sont purs.
 */
import { describe, expect, it } from 'vitest';
import bgmData from '../../data/generated/bgm_mapping.json';
import { byFileNameCI, formatFilenameAsName, type BgmTrack } from './bgm-mapping';

describe('formatFilenameAsName — nom de repli lisible', () => {
  it('sépare digit collé à une lettre', () => {
    expect(formatFilenameAsName('Track01')).toBe('Track 01');
    expect(formatFilenameAsName('Battle_02')).toBe('Battle 02');
  });

  it('éclate le camelCase', () => {
    expect(formatFilenameAsName('TitleScreen')).toBe('Title Screen');
    expect(formatFilenameAsName('GreatWall')).toBe('Great Wall');
  });

  it('garde un acronyme tout-majuscule (≥ 2 lettres) intact', () => {
    expect(formatFilenameAsName('OST_Main')).toBe('OST Main');
  });

  it('normalise la casse d’un mot ordinaire', () => {
    expect(formatFilenameAsName('battle')).toBe('Battle');
  });

  it('suffixe `_intro` → « (Intro) », le reste inchangé', () => {
    expect(formatFilenameAsName('Boss_Season_01_intro')).toBe('Boss Season 01 (Intro)');
  });
});

describe('byFileNameCI — ordre déterministe, casse ignorée puis départagée', () => {
  it('classe sans tenir compte de la casse', () => {
    // Un tri brut par unités de code mettrait « Banana » (B=66) avant « apple ».
    expect(byFileNameCI('apple', 'Banana')).toBeLessThan(0);
    expect(byFileNameCI('b', 'A')).toBeGreaterThan(0);
  });

  it('départage deux noms égaux à la casse près (stabilité)', () => {
    expect(byFileNameCI('File', 'file')).toBeLessThan(0); // F(70) < f(102)
  });

  it('égalité stricte → 0', () => {
    expect(byFileNameCI('x', 'x')).toBe(0);
  });
});

describe('bgm_mapping.json — invariants de forme et d’ordre', () => {
  const tracks = bgmData as unknown as BgmTrack[];

  it('catalogue non vide, chaque piste bien formée, fichiers uniques', () => {
    expect(tracks.length).toBeGreaterThan(0);
    const seen = new Set<string>();
    const bad: string[] = [];
    for (const t of tracks) {
      if (!t.file) bad.push('piste sans fichier');
      if (seen.has(t.file)) bad.push(`${t.file} : doublon`);
      seen.add(t.file);
      if (!t.name) bad.push(`${t.file} : sans nom`);
      if (!(typeof t.size === 'number' && t.size >= 0)) bad.push(`${t.file} : size ${t.size}`);
      if (!(typeof t.duration === 'number' && t.duration >= 0))
        bad.push(`${t.file} : duration ${t.duration}`);
    }
    expect(bad).toEqual([]);
  });

  it('trié par `byFileNameCI` sur le fichier', () => {
    const bad: string[] = [];
    for (let i = 1; i < tracks.length; i++)
      if (byFileNameCI(tracks[i - 1].file, tracks[i].file) > 0)
        bad.push(`${tracks[i - 1].file} > ${tracks[i].file}`);
    expect(bad).toEqual([]);
  });
});
