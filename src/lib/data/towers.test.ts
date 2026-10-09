import { describe, expect, it } from 'vitest';
import { emptyDict } from '@datagen/lib/lang';
import type { Tower, TowerRestriction } from '@contracts';
import {
  TOWER_DIFFICULTY_MODES,
  TOWER_ELEMENT_MODE,
  TOWER_KEYS,
  formatRestriction,
  getTower,
  getTowerCombats,
  getTowerFloor,
  isTowerKey,
} from '@/lib/data/towers';

/**
 * Les compositions et RESTRICTIONS des tours sont un dérivé silencieux des
 * tables (datagen/generators/towers.ts) : une dérive du parsing — numéro
 * d'étage lu dans le NameID, discrimination waves/encounters par la FORME des
 * groupes, singleton vs pool randomisé — n'a aucun symptôme visible, la page
 * rend simplement des étages faux. Ces tests ancrent le CONTRAT structurel sur
 * la donnée committée. Aucun compte exact (étages, pool, combats) n'y est
 * écrit : ils bougent avec les patchs, alors que le contrat, lui, ne bouge pas.
 */

const tower = (key: string): Tower => {
  const t = getTower(key);
  expect(t, key).toBeDefined();
  return t!;
};

const ELEMENTS = ['fire', 'water', 'earth', 'light', 'dark'] as const;

describe('towers.json — invariants structurels', () => {
  // Ni le nombre de tours ni celui des étages élémentaires ne sont écrits en
  // dur : le patch du 06/10/2026 ajoute une tour (Universal Tower) et porte les
  // élémentaires de 100 à 150 étages — un « 8 » ou un « 100 » ici bloquait le patch.
  it('les 3 difficultés d’abord, puis les tours du menu élémentaire (les 5 éléments au moins)', () => {
    expect(TOWER_KEYS.slice(0, 3)).toEqual([...TOWER_DIFFICULTY_MODES]);
    for (const k of TOWER_KEYS.slice(3)) expect(k).toMatch(/^tower_/);
    for (const el of ELEMENTS) expect(TOWER_KEYS).toContain(`${TOWER_ELEMENT_MODE}_${el}`);
    expect(isTowerKey('tower_hard')).toBe(true);
    expect(isTowerKey('fire-tower')).toBe(false); // ancien slug, plus une clé
  });

  it('les étages sont exactement 1..N, triés (parsing des NameID)', () => {
    for (const key of TOWER_KEYS) {
      const floors = tower(key).floors.map((f) => f.floor);
      // Uniques + max == longueur + tous ≥ 1 ⇒ exactement la suite 1..N.
      expect(new Set(floors).size, key).toBe(floors.length);
      expect(Math.min(...floors), key).toBe(1);
      expect(Math.max(...floors), key).toBe(floors.length);
      expect(
        [...floors].sort((a, b) => a - b),
        key,
      ).toEqual(floors);
    }
    for (const key of TOWER_DIFFICULTY_MODES)
      expect(tower(key).floors.length, key).toBeGreaterThan(0);
    // Les cinq élémentaires montent ensemble : même hauteur, jamais sous 100.
    const heights = ELEMENTS.map((el) => tower(`${TOWER_ELEMENT_MODE}_${el}`).floors.length);
    expect(new Set(heights).size, heights.join(',')).toBe(1);
    expect(heights[0]).toBeGreaterThanOrEqual(100);
  });

  it('chaque étage a UNE composition : waves OU encounters, jamais les deux', () => {
    for (const key of TOWER_KEYS) {
      for (const f of tower(key).floors) {
        const hasWaves = Boolean(f.waves?.length);
        const hasEncounters = Boolean(f.encounters?.length);
        expect(hasWaves !== hasEncounters, `${key} étage ${f.floor}`).toBe(true);
        // encounters = régime very hard uniquement (pools alternatifs).
        if (hasEncounters) expect(key).toBe('tower_very_hard');
      }
    }
  });

  it('restrictions : toujours présentes ([] explicite), count = -1 (ban) ou quota > 0', () => {
    for (const key of TOWER_KEYS) {
      for (const f of tower(key).floors) {
        expect(Array.isArray(f.restrictions), `${key} étage ${f.floor}`).toBe(true);
        for (const r of f.restrictions) {
          expect(['element', 'class', 'star'], `${key} ${f.floor}`).toContain(r.type);
          expect(r.count === -1 || r.count > 0, `${key} ${f.floor} count=${r.count}`).toBe(true);
          expect(r.desc.en, `${key} ${f.floor}`).toBeTruthy();
        }
      }
    }
  });
});

describe('tower_very_hard — restrictions randomisées', () => {
  const vh = tower('tower_very_hard');

  it('rien de figé par étage : le menu vit dans restrictionsPool', () => {
    for (const f of vh.floors) expect(f.restrictions, `étage ${f.floor}`).toEqual([]);
    // Les bans/quotas possibles (groupe 1001 des tables) — dédupliqués.
    expect(vh.restrictionsPool?.length).toBeGreaterThan(0);
    const keys = vh.restrictionsPool!.map((r) => `${r.type}|${r.subType}|${r.count}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('randomisé partout SAUF les paliers fixes, un étage sur cinq', () => {
    const fixed = vh.floors.filter((f) => !f.randomized).map((f) => f.floor);
    const everyFifth = vh.floors.map((f) => f.floor).filter((n) => n % 5 === 0);
    expect(fixed.length).toBeGreaterThan(0);
    expect(fixed).toEqual(everyFifth);
  });
});

describe('tours élémentaires — contre-élément requis', () => {
  /**
   * Le contre-élément vient des TABLES (restriction singleton portée par
   * chaque étage), jamais d'une map maison — c'est précisément ce que ce test
   * garde : si le parsing singleton/multi dérive, le quota disparaît ou change.
   * Cycle du jeu : water > fire > earth > water ; light <> dark.
   */
  const COUNTER: Record<string, string> = {
    fire: 'water',
    water: 'earth',
    earth: 'fire',
    light: 'dark',
    dark: 'light',
  };

  for (const [element, counter] of Object.entries(COUNTER)) {
    it(`${element} : chaque étage exige 4 héros ${counter}`, () => {
      const t = tower(`${TOWER_ELEMENT_MODE}_${element}`);
      expect(t.element).toBe(element);
      for (const f of t.floors) {
        expect(f.restrictions, `étage ${f.floor}`).toHaveLength(1);
        const r = f.restrictions[0];
        expect({ type: r.type, subType: r.subType, count: r.count }, `étage ${f.floor}`).toEqual({
          type: 'element',
          subType: counter,
          count: 4,
        });
      }
    });
  }

  it('portent leurs jours d’ouverture (sam+dim + le jour propre) et leur debuff', () => {
    for (const el of Object.keys(COUNTER)) {
      const t = tower(`${TOWER_ELEMENT_MODE}_${el}`);
      expect(t.days, el).toHaveLength(3);
      expect(t.days, el).toContain('sun');
      expect(t.days, el).toContain('sat');
      expect(t.debuff?.title.en, el).toBeTruthy();
      expect(t.debuff?.buffs.length, el).toBeGreaterThan(0);
    }
  });
});

describe('getTowerFloor / formatRestriction', () => {
  it('étage par numéro joueur, undefined hors bornes', () => {
    const t = tower('tower_hard');
    const top = t.floors.length;
    expect(getTowerFloor(t, 1)?.floor).toBe(1);
    expect(getTowerFloor(t, top)?.floor).toBe(top);
    expect(getTowerFloor(t, 0)).toBeUndefined();
    expect(getTowerFloor(t, top + 1)).toBeUndefined();
  });

  const restriction = (over: Partial<TowerRestriction>): TowerRestriction => ({
    type: 'element',
    subType: 'water',
    count: 4,
    desc: { ...emptyDict(), en: '{0} Water hero(es) must be deployed' },
    ...over,
  });

  it('quota : interpole {0} = count', () => {
    expect(formatRestriction(restriction({}), 'en')).toBe('4 Water hero(es) must be deployed');
  });

  it('ban (-1) : la phrase se suffit, pas d’interpolation', () => {
    const r = restriction({ count: -1, desc: { ...emptyDict(), en: 'No Fire heroes' } });
    expect(formatRestriction(r, 'en')).toBe('No Fire heroes');
  });

  it('fr lit le texte du jeu (langue officielle depuis le 23/09/2026), interpolation comprise', () => {
    const r = restriction({
      desc: {
        ...emptyDict(),
        en: '{0} Water hero(es) must be deployed',
        fr: '{0} héros Eau requis',
      },
    });
    expect(formatRestriction(r, 'fr')).toBe('4 héros Eau requis');
  });
});

describe('getTowerCombats — combats very hard', () => {
  const vh = tower('tower_very_hard');
  const combats = getTowerCombats(vh);

  it('trois groupes, chacun non vide, qui couvrent tous les combats', () => {
    // Les effectifs (2 / 3 / 16 au 2026-07-16) suivent les patchs : seul le
    // partage en trois groupes est une règle.
    const byGroup = (g: string) => combats.filter((c) => c.group === g).length;
    for (const g of ['floor20', 'demiurge', 'random']) expect(byGroup(g), g).toBeGreaterThan(0);
    expect(byGroup('floor20') + byGroup('demiurge') + byGroup('random')).toBe(combats.length);
  });

  it('dédupliqués par boss, rangés floor20 → demiurge → random, boss hors adds', () => {
    const ids = combats.map((c) => c.boss.id);
    expect(new Set(ids).size).toBe(ids.length);
    const order = ['floor20', 'demiurge', 'random'];
    const ranks = combats.map((c) => order.indexOf(c.group));
    expect([...ranks].sort((a, b) => a - b)).toEqual(ranks);
    for (const c of combats) expect(c.adds.map((u) => u.id)).not.toContain(c.boss.id);
  });

  it('une tour à vagues n’a aucun combat (le modèle est propre au very hard)', () => {
    expect(getTowerCombats(tower('tower'))).toEqual([]);
  });
});
