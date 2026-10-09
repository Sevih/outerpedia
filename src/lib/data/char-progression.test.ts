import { describe, expect, it } from 'vitest';
import type { Character, ProgressionData } from '@contracts';
import { composeStep, type StatLayersView, type StatStepView } from '@/lib/stat-compose';
import { transcendStarRow } from '@/lib/images';
import { getTranscend } from './transcend';
import {
  computeStatSteps,
  getStatLayers,
  getSubstatFlatProfile,
  getTranscendTiers,
} from './char-progression';
import { getSubstatTicks } from './sub-ticks';
import { judgeSubstat, SUBSTAT_AXES, sumFlatAt } from '@/lib/substat-verdict';
import charactersData from '@data/generated/characters.json';
import progressionData from '@data/generated/progression.json';

const CHARS = charactersData as unknown as Record<string, Character>;
const PROGRESSION = progressionData as unknown as ProgressionData;

/**
 * ORACLE : perso 2000073 (Vlada, 3★ fire striker). Jusqu'au niveau 100 =
 * l'ancien `character-stats.json` (mêmes tables : interpolation /99, floor,
 * évolutions cumulées, premium plat CHC +5). Au-delà du niveau 100 la
 * croissance est AMPLIFIÉE par `LevelUpStatModifierAfter100` (200/400/700
 * per-mille aux LB 1/2/3) — validé 0-diff IN-GAME par le gear-solver ; l'oracle
 * omettait ce terme (écart assumé, il sous-estimait au-delà du lv100).
 */
const ORACLE: Record<string, Record<string, number>> = {
  lv1_ev0: { ATK: 93, DEF: 23, HP: 486, SPD: 122, EFF: 10, RES: 11, CHC: 5, CHD: 150 },
  lv20_ev1: { ATK: 279, DEF: 65, HP: 1060, SPD: 124, EFF: 30, RES: 30, CHC: 5, CHD: 150 },
  lv40_ev2: { ATK: 474, DEF: 111, HP: 1665, SPD: 126, EFF: 60, RES: 50, CHC: 5, CHD: 150 },
  lv60_ev3: { ATK: 682, DEF: 156, HP: 2270, SPD: 130, EFF: 90, RES: 70, CHC: 5, CHD: 150 },
  lv80_ev4: { ATK: 890, DEF: 201, HP: 2875, SPD: 134, EFF: 120, RES: 90, CHC: 5, CHD: 150 },
  lv100_ev5: { ATK: 1099, DEF: 320, HP: 3884, SPD: 134, EFF: 120, RES: 110, CHC: 5, CHD: 150 },
  lv105_ev6: {
    ATK: 1188,
    DEF: 333,
    HP: 4266,
    SPD: 134,
    EFF: 120,
    RES: 116,
    CHC: 5,
    CHD: 150,
    'DMG UP%': 2,
  },
  lv110_ev7: {
    ATK: 1294,
    DEF: 351,
    HP: 4508,
    SPD: 134,
    EFF: 140,
    RES: 124,
    CHC: 5,
    CHD: 150,
    'DMG UP%': 4,
  },
  lv120_ev8: {
    ATK: 1503,
    DEF: 396,
    HP: 5314,
    SPD: 134,
    EFF: 140,
    RES: 144,
    CHC: 5,
    CHD: 150,
    'DMG UP%': 6,
  },
};

describe('computeStatSteps (oracle hérité, perso 2000073)', () => {
  const view = computeStatSteps(CHARS['2000073']);

  it('produit les 9 paliers lv1..lv120', () => {
    expect(view.steps.map((s) => s.key)).toEqual(Object.keys(ORACLE));
  });

  it.each(Object.entries(ORACLE))('%s : stats identiques à l’oracle', (key, expected) => {
    const step = view.steps.find((s) => s.key === key)!;
    for (const [stat, value] of Object.entries(expected)) {
      expect(step.stats[stat as keyof typeof step.stats], `${key}.${stat}`).toBe(value);
    }
  });

  it('premium : CHC +5 plat sur tous les paliers', () => {
    expect(view.premiumStat).toBe('CHC');
    for (const s of view.steps) expect(s.premiumValue).toBe(5);
  });

  it('limit breaks aux niveaux et aux coûts de la table du jeu', () => {
    // Les niveaux (105/110/120) et le coût (50 pièces, 500 000) se lisent dans
    // progression.json : les recopier ici ferait casser le test au premier
    // patch qui ajoute un palier ou retouche un prix.
    const table = PROGRESSION.limitBreak[`${CHARS['2000073'].rarity}_${CHARS['2000073'].element}`];
    const lb = view.steps.filter((s) => s.limitBreak);
    expect(lb.length).toBeGreaterThan(0);
    expect(lb.map((s) => s.level)).toEqual(table.map((s) => s.maxLevel));
    for (const s of lb) {
      expect(s.limitBreak!.pieces, `lv${s.level}`).toBeGreaterThan(0);
      expect(s.limitBreak!.price, `lv${s.level}`).toBeGreaterThan(0);
      expect(s.limitBreak!.recallItemId, `lv${s.level}`).toBeTruthy();
    }
  });
});

describe('composeStep — couches quirks / codex / transcendance (CalcFinalStat)', () => {
  // Vlada (3★ fire striker/attacker) au lv120, sur la donnée committée.
  const char = CHARS['2000073'];
  const layers = getStatLayers(char);
  const step = computeStatSteps(char).steps.at(-1)!;

  it('couches désactivées : portion blanche + premium seul', () => {
    const c = composeStep(step, layers, { tierIdx: -1, codexLevel: 0, quirksOn: false });
    expect(c.ATK.value).toBe(step.stats.ATK);
    expect(c.HP.delta).toBe(0);
    // Premium (passif de classe) : CHC +5 plat, toujours actif comme in-game.
    expect(c.CHC).toEqual({ value: 10, delta: 5 });
  });

  it('codex seul : trunc(base × taux / 1000) ajouté après le compound', () => {
    const top = layers.codex.length - 1;
    const codex = layers.codex[top];
    expect(codex.atkPM).toBeGreaterThan(0);
    const c = composeStep(step, layers, { tierIdx: -1, codexLevel: top, quirksOn: false });
    // Le taux s'applique à la BASE seule (pas l'évo) ; sa valeur vient de la table.
    expect(c.ATK.value).toBe(step.stats.ATK + Math.trunc((step.base.ATK * codex.atkPM) / 1000));
    expect(c.HP.value).toBe(step.stats.HP + Math.trunc((step.base.HP * codex.hpPM) / 1000));
    expect(c.SPD.delta).toBe(0);
  });
});

describe('composeStep — ordre des opérations de CalcFinalStat (fixture)', () => {
  /**
   * FIXTURE : les couches de Vlada au lv120 relevées le 2026-07-16 (base ATK
   * 1217 = 93 + floor(837×119/99) + floor(837×20×700/99000), évo +286). Écrites
   * ici plutôt que lues dans la donnée : le test garde l'ORDRE des troncatures
   * de la formule, il n'a pas à casser quand un patch retouche les quirks.
   */
  const zero = { ATK: 0, DEF: 0, HP: 0, SPD: 0, CHC: 0, CHD: 0 };
  const stats = { ...zero, 'PEN%': 0, 'DMG UP%': 6, 'DMG RED%': 0, 'CDMG RED%': 0 };
  const step: StatStepView = {
    key: 'lv120_ev8',
    level: 120,
    evo: 8,
    stats: {
      ...stats,
      ATK: 1503,
      DEF: 396,
      HP: 5314,
      SPD: 134,
      CHC: 5,
      CHD: 150,
      EFF: 140,
      RES: 144,
    },
    base: {
      ...stats,
      'DMG UP%': 0,
      ATK: 1217,
      DEF: 323,
      HP: 4509,
      SPD: 122,
      CHC: 5,
      CHD: 150,
      EFF: 10,
      RES: 144,
    },
  };
  const layers: StatLayersView = {
    transcend: [
      {
        label: '6',
        showStar: 6,
        starPlus: 0,
        atkPM: 300,
        defPM: 300,
        hpPM: 300,
        skill8: { flat: { CHD: 8 } },
      },
    ],
    codex: [
      { atkPM: 0, defPM: 0, hpPM: 0 },
      { atkPM: 100, defPM: 100, hpPM: 100 },
    ],
    quirks: {
      stat: { flat: { CHC: 10, CHD: 30, ATK: 200, DEF: 600, HP: 200, SPD: 2 } },
      buff: { ratePM: { ATK: 150 } },
    },
    premium: { key: 'CHC', mode: 'flat', value: 50 },
  };

  it('tout au max : ATK 2665 (quirks +200 plat & +15% striker, transcend +30%, codex +10%)', () => {
    const c = composeStep(step, layers, { tierIdx: 0, codexLevel: 1, quirksOn: true });
    // part1 = trunc((1217+286+200)×1300/1000) = 2213 ; part2 = trunc(2213×1150/1000)
    // = 2544 ; codex = trunc(1217×100/1000) = 121 → 2665.
    expect(c.ATK.value).toBe(2665);
    // CHC : 5 blanc + 10 quirks fire (per-mille ÷10) + 5 premium.
    expect(c.CHC.value).toBe(20);
    // CHD : 150 + 30 quirks fire + 8 skill_8 (niveau 4 : upgrade 80 per-mille).
    expect(c.CHD.value).toBe(188);
    // SPD : +2 plat du sous-arbre attacker.
    expect(c.SPD.value).toBe(136);
    // EFF/RES : aucune couche pour ce perso.
    expect(c.EFF.value).toBe(step.stats.EFF);
  });
});

describe('getTranscendTiers (3★)', () => {
  const tiers = getTranscendTiers(CHARS['2000073'], 'en');

  // Le barème de la rareté (3, 4, 4+, 5, 5+, 5++, 6 au 2026-07-16) vient de
  // transcend.json : on vérifie le CÂBLAGE palier → vue, pas l'échelle du jour.
  const steps = getTranscend().byStar[String(CHARS['2000073'].rarity)];

  it('un palier de vue par palier du barème, libellé « étoiles + StarPlus »', () => {
    expect(tiers).toHaveLength(steps.length);
    tiers.forEach((t, i) =>
      expect(t.label, `palier ${i}`).toBe(`${steps[i].showStar}${'+'.repeat(steps[i].starPlus)}`),
    );
    // Le « + » survit (la panne d'origine le perdait) dès que le barème en porte.
    if (steps.some((s) => s.starPlus > 0))
      expect(tiers.some((t) => t.label.endsWith('+'))).toBe(true);
  });

  it('étoiles : la dernière allumée porte la couleur du palier, les autres jaunes', () => {
    tiers.forEach((t, i) =>
      expect(t.stars, `palier ${i}`).toEqual(
        transcendStarRow(steps[i].showStar, steps[i].starColor),
      ),
    );
    expect(new Set(tiers.map((t) => t.stars[t.star - 1])).size).toBeGreaterThan(1);
  });

  it('déblocages : burst 3 au palier « 5 » (texte officiel TextSkill)', () => {
    expect(tiers.find((t) => t.passives.includes('Burst Level 3 Unlocked'))?.label).toBe('5');
  });

  it('passifs cumulés (textes officiels) : +4% au « 4 », +8% et +25 AP au « 6 »', () => {
    // Chaque niveau du passif porte son DELTA — les libellés identiques s'additionnent.
    expect(tiers[1].passives).toContain('+4% Ally Team Critical Damage');
    expect(tiers[6].passives).toContain('+8% Ally Team Critical Damage');
    expect(tiers[6].passives).toContain('+25 Action Points at battle start');
    expect(tiers[6].passives).toContain('+1 Chain Passive Weakness Gauge damage');
    // Le palier de base (« 3 », niveau de passif 1) = déblocage du burst 2 seul.
    expect(tiers[0].passives).toEqual(['Burst Level 2 Unlocked']);
  });
});

describe('getSubstatFlatProfile — base aux paliers stables pour le verdict flat / %', () => {
  const char = CHARS['2000073'];
  const layers = getStatLayers(char);
  const profile = getSubstatFlatProfile(char, layers);
  const { steps } = computeStatSteps(char);
  const lb = PROGRESSION.limitBreak[`${char.rarity}_${char.element}`];

  it('paliers lus dans les tables : 100 (sans LB) puis le maxLevel de chaque LB', () => {
    expect(profile.levels).toEqual([lb[0].requireLevel, ...lb.map((s) => s.maxLevel)]);
  });

  it('sans entrée de limit break (rareté/élément inconnus) : un seul palier, le lv100 — rien d’inventé', () => {
    const orphan = { ...char, element: 'unknown_element' };
    const p = getSubstatFlatProfile(orphan);
    expect(p.levels).toEqual([100]);
    // Même base qu’au lv100 de la fiche : pas de terme LB appliqué en douce.
    for (const axis of SUBSTAT_AXES)
      expect(p.flatByLevel[axis][100]).toBe(profile.flatByLevel[axis][100]);
  });

  it('coïncide avec les paliers de la fiche (même formule, évolutions comprises)', () => {
    const shared = steps.filter((s) => profile.levels.includes(s.level));
    expect(shared).toHaveLength(profile.levels.length);
    for (const st of shared)
      for (const axis of SUBSTAT_AXES)
        expect(profile.flatByLevel[axis][st.level], `${axis} lv${st.level}`).toBe(st.stats[axis]);
  });

  it('chaque palier donne le modificateur LB de la table (0 ‰ au lv100)', () => {
    // 200 / 400 / 700 ‰ au 2026-07-16 : la valeur est celle de la table, la
    // règle est qu'elle croît d'un palier à l'autre.
    const mods = lb.map((s) => s.statModifier);
    expect(mods[0]).toBeGreaterThan(0);
    for (let i = 1; i < mods.length; i++) expect(mods[i]).toBeGreaterThan(mods[i - 1]);
    const { min: mn, max } = char.stats.atk;
    const rng = max - mn;
    const evoAt = (L: number): number => {
      const st = steps.find((s) => s.level === L)!;
      return st.stats.ATK - st.base.ATK;
    };
    // lv100 : pas de LB → pas de terme au-delà de 100.
    expect(profile.flatByLevel.ATK[100]).toBe(mn + rng + evoAt(100));
    for (const s of lb) {
      const L = s.maxLevel;
      const growth = Math.floor((rng * (L - 1)) / 99);
      const above = Math.floor((rng * (L - 100) * s.statModifier) / 99000);
      expect(above, `lv${L} : le modificateur doit peser`).toBeGreaterThan(0);
      expect(profile.flatByLevel.ATK[L], `lv${L}`).toBe(mn + growth + above + evoAt(L));
    }
  });

  it('croît de palier en palier sur chaque axe', () => {
    for (const axis of SUBSTAT_AXES)
      for (let i = 1; i < profile.levels.length; i++)
        expect(profile.flatByLevel[axis][profile.levels[i]]).toBeGreaterThan(
          profile.flatByLevel[axis][profile.levels[i - 1]],
        );
  });

  it('quirks : le PLAT IOT_STAT seulement — le taux est exclu', () => {
    for (const axis of SUBSTAT_AXES)
      expect(profile.awakFlat[axis]).toBe(layers.quirks?.stat.flat?.[axis] ?? 0);
    // Vlada est striker : le taux ATK du quirk de classe (+15 % au 2026-07-16)
    // est un taux de BUFF — il n'entre jamais dans la somme plate du verdict.
    expect(layers.quirks?.buff.ratePM?.ATK).toBeGreaterThan(0);
    expect(profile.awakFlat.ATK).toBeLessThan(1000);
  });

  it('roster entier (gear 6★, quirks) : verdict monotone du lv100 au niveau max ; HP penche vers le %, DEF est l’axe partagé', () => {
    const ticks = getSubstatTicks();
    expect(ticks).not.toBeNull();
    const rank = { flat: 0, close: 1, pct: 2 } as const;
    const tally = () =>
      Object.fromEntries(SUBSTAT_AXES.map((a) => [a, { pct: 0, flat: 0, close: 0 }])) as Record<
        (typeof SUBSTAT_AXES)[number],
        Record<keyof typeof rank, number>
      >;
    const at100 = tally();
    const at120 = tally();
    let n = 0;
    for (const c of Object.values(CHARS)) {
      const p = getSubstatFlatProfile(c);
      const table = PROGRESSION.limitBreak[`${c.rarity}_${c.element}`];
      expect(p.levels, c.id).toEqual([table[0].requireLevel, ...table.map((s) => s.maxLevel)]);
      n++;
      for (const axis of SUBSTAT_AXES) {
        let prev = -1;
        for (const l of p.levels) {
          const k = judgeSubstat(sumFlatAt(p, axis, l, true), ticks![axis]).kind;
          expect(rank[k], `${c.id} ${axis} lv${l}`).toBeGreaterThanOrEqual(prev);
          prev = rank[k];
        }
        const [first, last] = [p.levels[0], p.levels[p.levels.length - 1]];
        at100[axis][judgeSubstat(sumFlatAt(p, axis, first, true), ticks![axis]).kind]++;
        at120[axis][judgeSubstat(sumFlatAt(p, axis, last, true), ticks![axis]).kind]++;
      }
    }
    // Grosse base (HP, ATK) → le % ; petite base (DEF) → les verdicts se partagent.
    // Un roster uniforme, ou le motif inversé, signerait une mauvaise base.
    for (const t of [at100, at120]) {
      expect(t.HP.pct / n).toBeGreaterThan(0.9);
      expect(t.ATK.pct / n).toBeGreaterThan(0.5);
      expect(t.DEF.flat).toBeGreaterThan(0);
      expect(t.DEF.pct + t.DEF.close).toBeGreaterThan(0);
    }
  });
});
