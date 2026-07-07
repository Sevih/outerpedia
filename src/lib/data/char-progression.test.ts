import { describe, expect, it } from 'vitest';
import type { Character } from '@contracts';
import { composeStep } from '@/lib/stat-compose';
import { computeStatSteps, getStatLayers, getTranscendTiers } from './char-progression';
import charactersData from '@data/generated/characters.json';

const CHARS = charactersData as unknown as Record<string, Character>;

/**
 * ORACLE : perso 2000073 (Vlada, 3★ fire striker). Jusqu'au niveau 100 =
 * `character-stats.json` V2 (mêmes tables : interpolation /99, floor,
 * évolutions cumulées, premium plat CHC +5). Au-delà du niveau 100 la
 * croissance est AMPLIFIÉE par `LevelUpStatModifierAfter100` (200/400/700
 * per-mille aux LB 1/2/3) — validé 0-diff IN-GAME par le gear-solver ; la V2
 * omettait ce terme (écart assumé, la V2 sous-estimait au-delà du lv100).
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

describe('computeStatSteps (oracle V2, perso 2000073)', () => {
  const view = computeStatSteps(CHARS['2000073']);

  it('produit les 9 paliers lv1..lv120', () => {
    expect(view.steps.map((s) => s.key)).toEqual(Object.keys(ORACLE));
  });

  it.each(Object.entries(ORACLE))('%s : stats identiques à la V2', (key, expected) => {
    const step = view.steps.find((s) => s.key === key)!;
    for (const [stat, value] of Object.entries(expected)) {
      expect(step.stats[stat as keyof typeof step.stats], `${key}.${stat}`).toBe(value);
    }
  });

  it('premium : CHC +5 plat sur tous les paliers', () => {
    expect(view.premiumStat).toBe('CHC');
    for (const s of view.steps) expect(s.premiumValue).toBe(5);
  });

  it('limit breaks aux niveaux 105/110/120 avec les coûts du jeu', () => {
    const lb = view.steps.filter((s) => s.limitBreak);
    expect(lb.map((s) => s.level)).toEqual([105, 110, 120]);
    expect(lb[0].limitBreak).toEqual({ pieces: 50, recallItemId: '30512', price: 500000 });
  });
});

describe('composeStep — couches quirks / codex / transcendance (CalcFinalStat)', () => {
  // Vlada (3★ fire striker/attacker) au lv120 : base ATK interpolée 1217
  // (93 + floor(837×119/99) + floor(837×20×700/99000)), évo +286.
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
    const c = composeStep(step, layers, { tierIdx: -1, codexLevel: 11, quirksOn: false });
    // Niveau 11 = 100 per-mille sur ATK/DEF/HP, sur la BASE seule (pas l'évo).
    expect(c.ATK.value).toBe(step.stats.ATK + Math.trunc(step.base.ATK / 10));
    expect(c.HP.value).toBe(step.stats.HP + Math.trunc(step.base.HP / 10));
    expect(c.SPD.delta).toBe(0);
  });

  it('tout au max : ATK 2665 (quirks +200 plat & +15% striker, transcend +30%, codex +10%)', () => {
    const c = composeStep(step, layers, {
      tierIdx: layers.transcend.length - 1,
      codexLevel: 11,
      quirksOn: true,
    });
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

  it('libellés V2 : 3, 4, 4+, 5, 5+, 5++, 6', () => {
    expect(tiers.map((t) => t.label)).toEqual(['3', '4', '4+', '5', '5+', '5++', '6']);
  });

  it('étoiles : 4+ = 3 jaunes + 1 orange, 5++ = 4 jaunes + 1 violette', () => {
    expect(tiers[2].stars).toEqual([
      'CM_icon_star_y',
      'CM_icon_star_y',
      'CM_icon_star_y',
      'CM_icon_star_o',
      'CM_icon_star_w',
      'CM_icon_star_w',
    ]);
    expect(tiers[5].stars[4]).toBe('CM_icon_star_v');
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
