/**
 * Tests du générateur unlock-content — son CŒUR PUR non trivial
 * `buildSeasonDisplayMap` : le jeu découpe une saison JOUEUR en plusieurs
 * SeasonID internes à numérotation d'épisodes CONTINUE (S2 = ép. 1-5 puis 6-10
 * sur deux ids) ; seule une remise à 1 des épisodes ouvre une nouvelle saison
 * AFFICHÉE. Le reste (`stageLabel`, `resolveDungeon`) sont des closures sur les
 * tables → couverts par les invariants sur le `unlock-content.json` committé.
 *
 * Tourne SANS `.gamedata` : `buildSeasonDisplayMap` est pur (Row[] en entrée).
 */
import { describe, expect, it } from 'vitest';
import unlockData from '../../data/generated/unlock-content.json';
import type { Row } from '../lib/tables';
import { buildSeasonDisplayMap, type UnlockContentData } from './unlock-content';

const area = (season: string, episode: string): Row => ({ SeasonID: season, EpisodeNum: episode });

describe('buildSeasonDisplayMap — SeasonID interne → n° de saison joueur', () => {
  it('un redémarrage des épisodes à 1 ouvre une saison ; une suite ne l’ouvre pas', () => {
    const map = buildSeasonDisplayMap([
      area('1', '1'),
      area('1', '2'), // S1 (ép. 1-2)
      area('2', '1'),
      area('2', '2'), // S2 partie 1 (ép. 1-2) → affichée 2
      area('3', '6'),
      area('3', '7'), // S2 partie 2 (ép. 6-7, minEp≠1) → RESTE 2
      area('4', '1'), // nouvelle saison (ép. redémarrent à 1) → 3
    ]);
    expect([...map.entries()].sort((a, b) => a[0] - b[0])).toEqual([
      [1, 1],
      [2, 2],
      [3, 2],
      [4, 3],
    ]);
  });

  it('la toute première saison ouvre le n°1 même si ses épisodes ne partent pas de 1', () => {
    const map = buildSeasonDisplayMap([area('5', '3'), area('5', '4')]);
    expect(map.get(5)).toBe(1);
  });

  it('ignore les lignes sans saison ou sans épisode', () => {
    const map = buildSeasonDisplayMap([area('1', '1'), { SeasonID: '2' }, { EpisodeNum: '3' }, {}]);
    expect([...map.keys()]).toEqual([1]);
  });
});

describe('unlock-content.json — invariants', () => {
  const { entries } = unlockData as unknown as UnlockContentData;
  const STAGE_RE = /^S\d+H?-\d+-\d+$/;
  const dictOk = (d?: { en?: string }): boolean => !d || Boolean(d.en);

  it('entrées non vides, triées par contentType', () => {
    expect(entries.length).toBeGreaterThan(0);
    const types = entries.map((e) => e.contentType);
    expect(types).toEqual([...types].sort((a, b) => a.localeCompare(b)));
    expect(types.every(Boolean)).toBe(true);
  });

  it('chaque prérequis : stage bien formé, mode connu, dicts renseignés si présents', () => {
    const bad: string[] = [];
    for (const e of entries) {
      if (!dictOk(e.lockScreenName)) bad.push(`${e.contentType} : lockScreenName vide`);
      if (!dictOk(e.officialName)) bad.push(`${e.contentType} : officialName vide`);
      for (const r of e.requirements) {
        if (r.stage && !STAGE_RE.test(r.stage)) bad.push(`${e.contentType} : stage « ${r.stage} »`);
        if (r.mode && r.mode !== 'story' && r.mode !== 'origin')
          bad.push(`${e.contentType} : mode « ${r.mode} »`);
        if (!dictOk(r.dungeonName)) bad.push(`${e.contentType} : dungeonName vide`);
        if (!dictOk(r.areaName)) bad.push(`${e.contentType} : areaName vide`);
      }
    }
    expect(bad).toEqual([]);
  });
});
