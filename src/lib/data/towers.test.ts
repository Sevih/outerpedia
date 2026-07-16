import { describe, expect, it } from 'vitest';
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
 * la donnée committée ; les comptes exacts (étages, pool, combats) sont datés
 * du 2026-07-16 et bougent avec les patchs, comme dans tags.test.ts.
 */

const tower = (key: string): Tower => {
  const t = getTower(key);
  expect(t, key).toBeDefined();
  return t!;
};

describe('towers.json — invariants structurels', () => {
  it('8 tours : les 3 difficultés puis les 5 élémentaires', () => {
    expect(TOWER_KEYS).toHaveLength(8);
    expect(TOWER_KEYS.slice(0, 3)).toEqual([...TOWER_DIFFICULTY_MODES]);
    for (const k of TOWER_KEYS.slice(3)) expect(k).toMatch(/^tower_element_/);
    expect(isTowerKey('tower_hard')).toBe(true);
    expect(isTowerKey('fire-tower')).toBe(false); // slug V2, plus une clé
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
    expect(tower('tower').floors).toHaveLength(100);
    expect(tower('tower_hard').floors).toHaveLength(40);
    expect(tower('tower_very_hard').floors).toHaveLength(20);
    for (const el of ['fire', 'water', 'earth', 'light', 'dark'])
      expect(tower(`tower_element_${el}`).floors).toHaveLength(100);
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
    // Les 23 bans/quotas possibles (groupe 1001 des tables) — dédupliqués.
    expect(vh.restrictionsPool).toHaveLength(23);
    const keys = vh.restrictionsPool!.map((r) => `${r.type}|${r.subType}|${r.count}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('randomisé partout SAUF les paliers fixes 5/10/15/20', () => {
    const fixed = vh.floors.filter((f) => !f.randomized).map((f) => f.floor);
    expect(fixed).toEqual([5, 10, 15, 20]);
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
    expect(getTowerFloor(t, 1)?.floor).toBe(1);
    expect(getTowerFloor(t, 40)?.floor).toBe(40);
    expect(getTowerFloor(t, 0)).toBeUndefined();
    expect(getTowerFloor(t, 41)).toBeUndefined();
  });

  const restriction = (over: Partial<TowerRestriction>): TowerRestriction => ({
    type: 'element',
    subType: 'water',
    count: 4,
    desc: { en: '{0} Water hero(es) must be deployed', jp: '', kr: '', zh: '' },
    ...over,
  });

  it('quota : interpole {0} = count', () => {
    expect(formatRestriction(restriction({}), 'en')).toBe('4 Water hero(es) must be deployed');
  });

  it('ban (-1) : la phrase se suffit, pas d’interpolation', () => {
    const r = restriction({ count: -1, desc: { en: 'No Fire heroes', jp: '', kr: '', zh: '' } });
    expect(formatRestriction(r, 'en')).toBe('No Fire heroes');
  });

  it('fr retombe sur en (le jeu ne fournit pas de fr)', () => {
    expect(formatRestriction(restriction({}), 'fr')).toBe('4 Water hero(es) must be deployed');
  });
});

describe('getTowerCombats — combats very hard', () => {
  const vh = tower('tower_very_hard');
  const combats = getTowerCombats(vh);

  it('21 combats (état 2026-07-16) : 2 d’étage 20, 3 Demiurges, 16 du pool', () => {
    const byGroup = (g: string) => combats.filter((c) => c.group === g).length;
    expect(combats).toHaveLength(21);
    expect(byGroup('floor20')).toBe(2); // Sigma / Iota
    expect(byGroup('demiurge')).toBe(3);
    expect(byGroup('random')).toBe(16);
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
