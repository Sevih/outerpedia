/**
 * LE PALIER DE TRANSCENDANCE DE LA TIER LIST — la confusion que ce test grave.
 *
 * Le sélecteur PvE a longtemps offert `[3, 4, 5, 6]` en croyant parler de
 * paliers ; c'étaient des COMPTES D'ÉTOILES, la lecture humaine. Le portrait, lui,
 * n'a jamais connu que le palier du jeu (`TransStar`) — et les deux ne coïncident
 * qu'en dessous de 5 : le palier 6 montre CINQ étoiles, le palier 9 en montre six.
 * La pastille « 6★ » rendait donc des portraits à 5 étoiles.
 *
 * La donnée curée portait la même lecture et a été migrée avec le composant
 * (3★→3, 4★→4, 5★→6, 6★→9). Ces tests tiennent les deux bouts : la table décide
 * bien de ce que la pastille montre, et plus aucun compte d'étoiles ne traîne
 * dans `data/curated/characters.json`.
 */
import { describe, expect, it } from 'vitest';
import type { TranscendData } from '@contracts';
import transcendData from '@data/generated/transcend.json';
import {
  transcendenceFullSteps,
  transcendenceLabel,
  transcendenceStars,
  transcendenceSteps,
} from '@/lib/transcendence';
import { loadCuratedCharacters } from '@/lib/data/curated';
import { atStep } from './TierListBrowser';

const TRANSCEND = transcendData as unknown as TranscendData;

/** La rareté de référence du sélecteur : la seule à porter des teintes. */
const R = 3;

describe('les paliers du sélecteur', () => {
  it('ne retient que les paliers PLEINS — 3★, 4★, 5★, 6★', () => {
    expect(transcendenceFullSteps(R)).toEqual([3, 4, 6, 9]);
    expect(transcendenceFullSteps(R).map((s) => transcendenceLabel(R, s))).toEqual([
      '3★',
      '4★',
      '5★',
      '6★',
    ]);
  });

  it('les paliers « + » existent, ils sont juste hors du filtre', () => {
    expect(transcendenceSteps(R)).toEqual([3, 4, 5, 6, 7, 8, 9]);
    expect(transcendenceSteps(R).map((s) => transcendenceLabel(R, s))).toEqual([
      '3★',
      '4★',
      '4★+',
      '5★',
      '5★+',
      '5★++',
      '6★',
    ]);
  });

  it('le palier n’est PAS le compte d’étoiles au-delà de 4 — la panne d’origine', () => {
    // Ce que l'ancien sélecteur envoyait au portrait, et ce qu'il en obtenait :
    expect(transcendenceStars(R, 5)).toHaveLength(4); // « 5★ » demandé → 4 étoiles
    expect(transcendenceStars(R, 6)).toHaveLength(5); // « 6★ » demandé → 5 étoiles
    // Ce que les vrais paliers rendent :
    expect(transcendenceStars(R, 6)).toEqual(['y', 'y', 'y', 'y', 'y']);
    expect(transcendenceStars(R, 9)).toEqual(['y', 'y', 'y', 'y', 'y', 'y']);
  });

  it('les trois paliers à cinq étoiles ne se distinguent que par la dernière', () => {
    expect(transcendenceStars(R, 6)).toEqual(['y', 'y', 'y', 'y', 'y']);
    expect(transcendenceStars(R, 7)).toEqual(['y', 'y', 'y', 'y', 'r']);
    expect(transcendenceStars(R, 8)).toEqual(['y', 'y', 'y', 'y', 'v']);
  });
});

describe('le libellé d’un palier', () => {
  it('vient de `StarPlus`, jamais de la couleur — le bug du slider 1★/2★', () => {
    // Sur les raretés 1 et 2, les paliers « + » restent JAUNES : déduire le
    // suffixe de la couleur donnait trois crans nommés « 5 » à la suite.
    for (const rarity of [1, 2]) {
      const labels = transcendenceSteps(rarity).map((s) => transcendenceLabel(rarity, s));
      expect(new Set(labels).size).toBe(labels.length);
      expect(labels).toContain('4★+');
      expect(labels).toContain('5★++');
    }
  });
});

describe('atStep — l’escalier des paliers curés', () => {
  // Kal (2000059) après migration : A jusqu'au 5★, S au 6★.
  const kal = { 3: 'A', 4: 'A', 6: 'A', 9: 'S' };

  it('rend la valeur du palier curé exact', () => {
    expect(atStep(kal, 3, 'S')).toBe('A');
    expect(atStep(kal, 9, 'S')).toBe('S');
  });

  it('rend le palier curé juste EN DESSOUS quand le cran n’est pas noté', () => {
    // 4★+ et 5★+ ne sont pas curés : ils valent le cran précédent, pas la base.
    expect(atStep(kal, 5, 'S')).toBe('A');
    expect(atStep(kal, 7, 'S')).toBe('A');
    expect(atStep(kal, 8, 'S')).toBe('A');
  });

  it('sous le premier palier curé, c’est ce premier qui s’applique', () => {
    expect(atStep({ 6: 'B', 9: 'A' }, 3, 'A')).toBe('B');
  });

  it('sans aucun palier curé, la valeur de base', () => {
    expect(atStep(undefined, 5, 'C')).toBe('C');
    expect(atStep({}, 5, 'C')).toBe('C');
  });
});

describe('la source unique', () => {
  /**
   * Les colonnes d'affichage étaient recopiées à la main dans `Thumbnail` en plus
   * d'être extraites. La copie est partie ; ce test garde la porte fermée sur ce
   * que `transcendenceRow` ne sait PAS faire — distinguer un perso à échelle
   * propre. Dix personnages en ont une, et elle est aujourd'hui identique au
   * générique de leur rareté sur ces trois colonnes seulement.
   */
  it('aucune échelle propre ne diverge du générique sur l’affichage', () => {
    const shape = (
      steps: { star: number; showStar: number; starColor: string; starPlus: number }[],
    ) => steps.map((s) => `${s.star}:${s.showStar}:${s.starColor}:${s.starPlus}`).join(' ');
    for (const [id, steps] of Object.entries(TRANSCEND.overrides)) {
      const generic = TRANSCEND.byStar['3'];
      expect(`${id} ${shape(steps)}`).toBe(`${id} ${shape(generic)}`);
    }
  });
});

describe('la donnée curée', () => {
  const curated = Object.entries(loadCuratedCharacters());
  const valid = new Set(transcendenceSteps(R));

  it('ne note que de VRAIS paliers — aucun compte d’étoiles résiduel', () => {
    const offenders: string[] = [];
    for (const [id, c] of curated)
      for (const field of ['rankByTranscend', 'roleByTranscend'] as const)
        for (const key of Object.keys(c[field] ?? {}))
          if (!valid.has(Number(key))) offenders.push(`${id}.${field}["${key}"]`);
    expect(offenders).toEqual([]);
  });

  it('fait concorder le palier le plus haut curé avec le rang de base (6★)', () => {
    // `rank` EST le rang au 6★ : la tier list par défaut l'affiche tel quel. Si le
    // palier 9 disait autre chose, la liste se contredirait à son propre cran haut.
    for (const [id, c] of curated) {
      if (!c.rankByTranscend?.[9] || !c.rank) continue;
      expect(`${id}:${c.rankByTranscend[9]}`).toBe(`${id}:${c.rank}`);
    }
  });
});
