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
  towerCombatSpawns,
  towerFloorSpawn,
} from '@/lib/data/towers';
import { getEncounter } from '@/lib/data/encounters';
import { getMonster } from '@/lib/data/monsters';
import { statAt } from '@/lib/monster-stats';

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

  it('portent les jours de leur débuff (sam+dim + le jour propre) et leur debuff', () => {
    // `debuffDays` = calendrier du DÉBUFF (`TowerElementalConfigTemplet.DayOfWeek`),
    // pas l'ouverture (`DungeonPVEGroupTemplet.DayList`, vide pour ces tours).
    for (const el of Object.keys(COUNTER)) {
      const t = tower(`${TOWER_ELEMENT_MODE}_${el}`);
      expect(t.debuffDays, el).toHaveLength(3);
      expect(t.debuffDays, el).toContain('sun');
      expect(t.debuffDays, el).toContain('sat');
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

describe('getTowerCombats — un combat, plusieurs étages (B58)', () => {
  const vh = tower('tower_very_hard');
  const combats = getTowerCombats(vh);
  const combat = (bossId: string) => {
    const c = combats.find((x) => x.boss.id === bossId);
    expect(c, bossId).toBeDefined();
    return c!;
  };

  it('le combat de 40103001 tombe sur les 12 étages de son pool, niveaux 130 à 148', () => {
    const c = combat('40103001');
    expect(c.floors.map((f) => f.floor)).toEqual([1, 2, 4, 6, 7, 9, 11, 12, 14, 16, 17, 19]);
    expect(c.floors[0].level).toBe(130);
    expect(c.floors.at(-1)!.level).toBe(148);
  });

  it('un Demiurge tombe sur 5, 10 et 15', () => {
    const demiurges = combats.filter((c) => c.group === 'demiurge');
    expect(demiurges.length).toBeGreaterThan(0);
    for (const c of demiurges) expect(c.floors.map((f) => f.floor)).toEqual([5, 10, 15]);
  });

  it('chaque étage porte son niveau et l’`adv` de SON donjon', () => {
    for (const c of combats) {
      for (const f of c.floors) {
        const floor = getTowerFloor(vh, f.floor)!;
        expect(f.level, `${c.boss.id} @${f.floor}F`).toBe(floor.level);
        expect(f.adv, `${c.boss.id} @${f.floor}F`).toEqual(getEncounter(floor.dungeon)?.adv);
      }
    }
  });
});

describe('contextes de spawn des cartes de tour — l’adv change les stats (B58)', () => {
  const stats = (id: string) => {
    const m = getMonster(id);
    expect(m, id).toBeDefined();
    return m!.stats;
  };

  it('very hard 19F : niveau 148, adv +280 ‰ sur ATK/DEF/PV/SPD', () => {
    const c = getTowerCombats(tower('tower_very_hard')).find((x) => x.boss.id === '40103001')!;
    const spawns = towerCombatSpawns(c);
    const at19 = spawns[c.floors.findIndex((f) => f.floor === 19)];
    expect(at19).toEqual({ level: 148, adv: { atk: 280, def: 280, hp: 280, spd: 280 } });
    const s = stats('40103001');
    for (const slug of ['atk', 'def', 'hp', 'speed']) {
      const without = statAt(slug, s[slug], { level: 148 });
      expect(statAt(slug, s[slug], at19), slug).toBe(Math.floor((without * 1280) / 1000));
      expect(statAt(slug, s[slug], at19), slug).toBeGreaterThan(without);
    }
  });

  it('Skyward normal 1F : l’adv négative du donjon baisse ATK et PV', () => {
    const t = tower('tower');
    const floor = getTowerFloor(t, 1)!;
    const ref = getEncounter(floor.dungeon)!;
    const boss = ref.monsters!.find((m) => m.role === 'boss')!;
    const ctx = towerFloorSpawn(floor, boss.level);
    expect(ctx.adv).toEqual(ref.adv);
    expect(ctx.adv?.atk).toBeLessThan(0);
    expect(ctx.adv?.hp).toBeLessThan(0);
    const s = stats(boss.id);
    for (const slug of ['atk', 'hp'] as const) {
      const without = statAt(slug, s[slug], { level: boss.level });
      const adv = ctx.adv![slug]!;
      expect(statAt(slug, s[slug], ctx), slug).toBe(Math.floor((without * (1000 + adv)) / 1000));
      expect(statAt(slug, s[slug], ctx), slug).toBeLessThan(without);
    }
  });
});
