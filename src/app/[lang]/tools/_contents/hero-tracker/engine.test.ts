import { describe, expect, it } from 'vitest';
import {
  accountNeed,
  foodBreakdown,
  giftBreakdown,
  hasWork,
  heroNeed,
  mergeBreakdowns,
  type GrowthRules,
  type HeroProgress,
  type TrackedHero,
} from './engine';

/**
 * Moteur du suivi de compte. Tout est synthétique : les barèmes réels vivent
 * dans `hero-growth.json` (testé chez lui), ici on ne vérifie que les RÈGLES —
 * différentiels de cumul, paliers franchis, bornes, agrégation.
 */

const dict = (en: string) => ({ en, jp: '', kr: '', zh: '' });
const item = (id: string, name = id) => ({ id, name: dict(name), icon: '', grade: 'normal' });

const RULES: GrowthRules = {
  // Niveaux 1..5 : 0, 100, 300, 600, 1000 d'XP cumulé.
  xpCurve: [0, 100, 300, 600, 1000],
  // Affinité 1..4 : 0, 1000, 3000, 7500 points cumulés.
  affinityCurve: [0, 1000, 3000, 7500],
  gifts: [
    { ...item('g100', 'Small gift'), points: 100, presentType: 'present_01' },
    { ...item('g500', 'Big gift'), points: 500, presentType: 'present_01' },
    { ...item('g100b', 'Other small'), points: 100, presentType: 'present_02' },
  ],
  xpFood: [
    { ...item('food250', 'Sandwich'), xp: 250 },
    { ...item('food1000', 'Steak'), xp: 1000 },
  ],
  skillUpgrade: {
    '3': [
      { level: 2, manuals: [{ item: item('manual1'), count: 3 }], gold: 20000 },
      { level: 3, manuals: [{ item: item('manual1'), count: 5 }], gold: 30000 },
    ],
  },
  limitBreak: {
    '3_water': [
      { maxLevel: 3, pieces: 25, recallItemId: 'memory_water', price: 250000 },
      { maxLevel: 5, pieces: 75, recallItemId: 'memory_water', price: 500000 },
    ],
  },
  eeEnchant: [
    { level: 1, materials: [{ item: item('hammer'), count: 5 }], gold: 100000, gemSlot: 0 },
    { level: 2, materials: [{ item: item('hammer'), count: 10 }], gold: 200000, gemSlot: 0 },
  ],
  transcendLadder: () => [
    { materials: 0, price: 0 },
    { materials: 150, price: 10000 },
    { materials: 250, price: 20000 },
  ],
};

const HERO: TrackedHero = { id: '2000118', rarity: 3, element: 'water' };

/** Le même héros, mais en version Core Fusion (barème solidaire, pas de manuels). */
const FUSED: TrackedHero = {
  id: '2700118',
  rarity: 3,
  element: 'water',
  fusionLevels: [
    { level: 1, cost: { item: item('core', 'Fusion-Type Core'), count: 300 } },
    { level: 2, cost: { item: item('core', 'Fusion-Type Core'), count: 150 } },
    { level: 3, cost: { item: item('core', 'Fusion-Type Core'), count: 150 } },
  ],
};

const progress = (over: Partial<HeroProgress> = {}): HeroProgress => ({
  level: 1,
  skills: [1, 1, 1, 1],
  fusion: 0,
  affinity: 1,
  transcend: 0,
  ee: [0],
  ...over,
});

describe('heroNeed — niveau', () => {
  it('XP = différence des CUMULS, pas la somme des paliers', () => {
    const n = heroNeed(HERO, progress({ level: 2 }), progress({ level: 4 }), RULES);
    expect(n.xp).toBe(500); // 600 − 100
  });

  it('embarque les paliers de limit break franchis, avec la mémoire de son ÉLÉMENT', () => {
    const n = heroNeed(HERO, progress({ level: 2 }), progress({ level: 5 }), RULES);
    // Paliers maxLevel 3 et 5 franchis : 25 + 75 mémoires, 750 000 gold.
    expect(n.items.memory_water).toBe(100);
    expect(n.gold).toBe(750000);
  });

  it('ne compte PAS un palier que la cible n’atteint pas', () => {
    const n = heroNeed(HERO, progress({ level: 1 }), progress({ level: 2 }), RULES);
    expect(n.items.memory_water).toBeUndefined();
    expect(n.gold).toBe(0);
  });

  it('cible en deçà de l’état : zéro, jamais de dette', () => {
    const n = heroNeed(HERO, progress({ level: 5 }), progress({ level: 2 }), RULES);
    expect(n.xp).toBe(0);
    expect(hasWork(n)).toBe(false);
  });

  it('borne les niveaux hors plage sur la courbe (saisie manuelle aberrante)', () => {
    const n = heroNeed(HERO, progress({ level: 0 }), progress({ level: 999 }), RULES);
    expect(n.xp).toBe(1000); // niveau 1 → 5, le maximum de la courbe
  });
});

describe('heroNeed — skills', () => {
  it('additionne les paliers franchis des QUATRE slots (chain passive incluse)', () => {
    const n = heroNeed(HERO, progress(), progress({ skills: [3, 2, 1, 2] }), RULES);
    // slot 1 : niveaux 2+3 (3+5) ; slot 2 : niveau 2 (3) ; slot 4 : niveau 2 (3).
    expect(n.items.manual1).toBe(14);
    expect(n.gold).toBe(90000);
  });

  it('un slot déjà au niveau visé ne coûte rien', () => {
    const n = heroNeed(
      HERO,
      progress({ skills: [3, 3, 3, 3] }),
      progress({ skills: [3, 3, 3, 3] }),
      RULES,
    );
    expect(n.items.manual1).toBeUndefined();
  });
});

describe('heroNeed — Core Fusion', () => {
  it('les skills se paient en cores, PAS en manuels — et le palier 1 est le déblocage', () => {
    const n = heroNeed(FUSED, progress({ fusion: 0 }), progress({ fusion: 3 }), RULES);
    expect(n.items.core).toBe(600); // 300 (déblocage) + 150 + 150
    expect(n.items.manual1).toBeUndefined();
    expect(n.gold).toBe(0);
  });

  it('un fusionné déjà débloqué ne repaie pas les 300', () => {
    const n = heroNeed(FUSED, progress({ fusion: 1 }), progress({ fusion: 3 }), RULES);
    expect(n.items.core).toBe(300);
  });

  it('les slots saisis sur un fusionné sont IGNORÉS (son barème est solidaire)', () => {
    const n = heroNeed(
      FUSED,
      progress({ fusion: 1, skills: [1, 1, 1, 1] }),
      progress({ fusion: 1, skills: [5, 5, 5, 5] }),
      RULES,
    );
    expect(hasWork(n)).toBe(false);
  });
});

describe('heroNeed — affinité, transcendance, EE', () => {
  it('affinité : différence des cumuls', () => {
    const n = heroNeed(HERO, progress({ affinity: 2 }), progress({ affinity: 4 }), RULES);
    expect(n.affinityPoints).toBe(6500); // 7500 − 1000
  });

  it('transcendance : pièces du héros, gold, et le NOMBRE d’étapes (= doublons)', () => {
    const n = heroNeed(HERO, progress({ transcend: 0 }), progress({ transcend: 2 }), RULES);
    expect(n.pieces).toBe(400); // 150 + 250
    expect(n.transcendSteps).toBe(2);
    expect(n.gold).toBe(30000);
  });

  it('transcendance : une cible au-delà de l’échelle ne fabrique pas de palier', () => {
    const n = heroNeed(HERO, progress({ transcend: 0 }), progress({ transcend: 99 }), RULES);
    expect(n.pieces).toBe(400);
    expect(n.transcendSteps).toBe(2);
  });

  it('EE : matériaux des paliers franchis', () => {
    const n = heroNeed(HERO, progress({ ee: [1] }), progress({ ee: [2] }), RULES);
    expect(n.items.hammer).toBe(10);
    expect(n.gold).toBe(200000);
  });

  it('EE : un fusionné en porte DEUX, chacun compté pour lui-même', () => {
    const n = heroNeed(FUSED, progress({ ee: [2, 0] }), progress({ ee: [2, 2] }), RULES);
    // Le premier EE est déjà au max visé ; seul le second (0 → 2) coûte.
    expect(n.items.hammer).toBe(15);
    expect(n.gold).toBe(300000);
  });
});

describe('accountNeed — agrégation', () => {
  it('additionne les items, garde les pièces PAR héros, ignore les héros à jour', () => {
    const a = heroNeed(HERO, progress(), progress({ skills: [2, 1, 1, 1], transcend: 1 }), RULES);
    const b = heroNeed(
      { id: '2000003', rarity: 3, element: 'water' },
      progress(),
      progress({ skills: [2, 1, 1, 1] }),
      RULES,
    );
    const idle = heroNeed(
      { id: '2000009', rarity: 3, element: 'water' },
      progress(),
      progress(),
      RULES,
    );

    const total = accountNeed([a, b, idle]);
    expect(total.items.manual1).toBe(6); // 3 + 3
    expect(total.pieces).toEqual({ '2000118': { pieces: 150, steps: 1 } });
    expect(total.heroes.map((h) => h.heroId)).toEqual(['2000118', '2000003']);
  });
});

describe('foodBreakdown / giftBreakdown — conversion en items', () => {
  it('glouton du plus gros au plus petit, dernier palier arrondi au SUPÉRIEUR', () => {
    // 2 300 XP = 2 Steak (2 000) + 300 restants → 2 Sandwiches (500 > 300).
    expect(foodBreakdown(2300, RULES.xpFood).map((b) => [b.entry.id, b.count])).toEqual([
      ['food1000', 2],
      ['food250', 2],
    ]);
  });

  it('rien à couvrir → aucune ligne', () => {
    expect(foodBreakdown(0, RULES.xpFood)).toEqual([]);
  });

  it('cadeaux : UN item par palier de points, filtré sur le type préféré', () => {
    const out = giftBreakdown(1200, RULES.gifts, 'present_01');
    expect(out.map((b) => [b.entry.id, b.count])).toEqual([
      ['g500', 2],
      ['g100', 2],
    ]);
  });

  it('sans type préféré, ne propose pas deux fois le même palier', () => {
    const out = giftBreakdown(200, RULES.gifts);
    expect(out).toHaveLength(1);
    expect(out[0].count).toBe(2);
  });

  it('bonus « cadeau préféré » : le même besoin coûte moins de cadeaux', () => {
    const plain = giftBreakdown(1500, RULES.gifts, 'present_01');
    const bonus = giftBreakdown(1500, RULES.gifts, 'present_01', 0.5);
    expect(plain.find((b) => b.entry.id === 'g500')?.count).toBe(3); // 3 × 500
    expect(bonus.find((b) => b.entry.id === 'g500')?.count).toBe(2); // 2 × 750
  });

  it('le bonus n’a de sens que sur un type préféré : sans type, taux de base', () => {
    expect(giftBreakdown(1000, RULES.gifts, undefined, 0.5)).toEqual(
      giftBreakdown(1000, RULES.gifts),
    );
  });
});

describe('mergeBreakdowns — totaliser APRÈS avoir converti par héros', () => {
  it('somme les quantités du même item', () => {
    const a = foodBreakdown(1000, RULES.xpFood);
    const b = foodBreakdown(2000, RULES.xpFood);
    const merged = mergeBreakdowns([a, b]);
    expect(merged.map((m) => [m.entry.id, m.count])).toEqual([['food1000', 3]]);
  });

  it('convertir héros par héros coûte PLUS que convertir le total — et c’est le vrai prix', () => {
    // Deux héros à 100 XP chacun : chacun doit ouvrir un Sandwich (250), soit 2.
    // Le total (200 XP) n’en demanderait qu’un — mais un plat ne se partage pas.
    const perHero = mergeBreakdowns([
      foodBreakdown(100, RULES.xpFood),
      foodBreakdown(100, RULES.xpFood),
    ]);
    expect(perHero.map((m) => [m.entry.id, m.count])).toEqual([['food250', 2]]);
    expect(foodBreakdown(200, RULES.xpFood).map((m) => m.count)).toEqual([1]);
  });

  it('rien à convertir → aucune ligne', () => {
    expect(mergeBreakdowns([[], []])).toEqual([]);
  });
});
