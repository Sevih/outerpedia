/**
 * Lignes de rapport — témoins § 4 (probabilités exactes), § 7 (taux par
 * branche), § 8.1/8.3 (facteur total et rattrapage du dernier hit), § 10.1
 * (swap), § 11 + § 5 (DOT). Les valeurs attendues sont calculées à la main
 * ou par PROPRIÉTÉ contre les primitives du moteur (déjà prouvées vs le
 * binaire dans formula.test.ts) — jamais recopiées depuis le rendu.
 */
import { describe, expect, it } from 'vitest';
import { calcDamageCore } from './formula';
import {
  buildDotLine,
  buildSkillReport,
  enumerateBranches,
  groupHitsByChain,
  permilleSuccessProbability,
  resistProbability,
  resolveAttackStat,
  type ReportScenario,
} from './report';
import { Element } from './types';

/** Scénario neutre : ni buffs ni défense — chaque couche s'isole dessus. */
const baseScenario = (): ReportScenario => ({
  attacker: {
    attackStat: 10000,
    criticalRate: 0,
    criticalDmgRate: 1500,
    dmgBoost: 0,
    piercePowerRate: 0,
    piercePower: 0,
    element: Element.Earth,
  },
  defender: {
    defense: 0,
    avoid: 0,
    dmgReduceRate: 0,
    enemyCriticalDamageReduce: 0,
    element: Element.Earth,
  },
});

describe('report — probabilités § 4', () => {
  it('P = (v+1)/1001, bornée [v<1 → 0 ; v≥1000 → 1]', () => {
    expect(permilleSuccessProbability(0)).toBe(0);
    expect(permilleSuccessProbability(50)).toBe(51 / 1001);
    expect(permilleSuccessProbability(1000)).toBe(1);
    expect(permilleSuccessProbability(1500)).toBe(1);
  });

  it('P(résist) suit le seuil float32 § 5 : diff 0 → 9 ; diff 100 → 500', () => {
    expect(resistProbability(0, 0)).toBe(10 / 1001);
    expect(resistProbability(0, 100)).toBe(501 / 1001);
    expect(resistProbability(500, 100)).toBe(0); // chance > resist : jamais
  });

  it("l'esquive se tire d'abord, le crit ensuite — Σ branches = 1", () => {
    const branches = enumerateBranches({ criticalRate: 250 }, { avoid: 100 });
    const pMiss = 101 / 1001;
    const pCrit = (1 - pMiss) * (251 / 1001);
    expect(branches).toEqual([
      { branch: 'normal', probability: 1 - pMiss - pCrit },
      { branch: 'critical', probability: pCrit },
      { branch: 'miss', probability: pMiss },
    ]);
    expect(branches.reduce((s, b) => s + b.probability, 0)).toBeCloseTo(1, 12);
  });

  it('normal et crit TOUJOURS émis (P=0 autorisé) ; miss si possible ou forcé ; override § 7.5bis', () => {
    // Les dégâts d'une branche ne dépendent pas de sa probabilité (Sevih
    // 05/08/2026) : sans CHC, le crit est émis à P=0 — jamais caché.
    expect(enumerateBranches({ criticalRate: 0 }, { avoid: 0 })).toEqual([
      { branch: 'normal', probability: 1 },
      { branch: 'critical', probability: 0 },
    ]);
    // crit 100 % : la branche normale reste émise à P=0, l'esquive possible.
    const sure = enumerateBranches({ criticalRate: 1000 }, { avoid: 100 });
    expect(sure.map((b) => b.branch)).toEqual(['normal', 'critical', 'miss']);
    expect(sure[0].probability).toBe(0);
    // Le miss n'existe plus hors buff de « miss chance » : absent par défaut,
    // FORCÉ (P=0) pour comparer un coup manqué observé.
    const forced = enumerateBranches({ criticalRate: 0 }, { avoid: 0 }, false, true);
    expect(forced.at(-1)).toEqual({ branch: 'miss', probability: 0 });
    expect(enumerateBranches({ criticalRate: 1000 }, { avoid: 100 }, true)).toEqual([
      { branch: 'normal', probability: 1 },
    ]);
  });
});

describe('report — groupHitsByChain', () => {
  it('un état par chaîne (ordre de PREMIÈRE APPARITION — pas de devinette sur l’état « de base »), hits triés par index', () => {
    const states = groupHitsByChain([
      { chain: 'S2_Burst1', hit: 1, id: 'b1', damageFactor: 1000 },
      { chain: 'S2', hit: 2, id: 'a2', damageFactor: 600 },
      { chain: 'S2', hit: 1, id: 'a1', damageFactor: 400 },
    ]);
    expect(states.map((s) => s.chain)).toEqual(['S2_Burst1', 'S2']);
    expect(states[1].hits.map((h) => h.id)).toEqual(['a1', 'a2']);
  });
});

describe('report — buildSkillReport', () => {
  it('mono-hit sans contexte : dégâts = ATK × factor × skillFactor (‰²), toutes couches neutres', () => {
    const report = buildSkillReport(
      { skillFactor: 1000, states: [{ chain: 'S1', hits: [{ id: 'h1', damageFactor: 1000 }] }] },
      baseScenario(),
    );
    expect(report.defenderInvincible).toBe(false);
    const [state] = report.states;
    // Normal P=1 + crit P=0 (toujours émis) — l'espérance ne pondère que P>0.
    expect(state.branches.map((b) => b.branch)).toEqual(['normal', 'critical']);
    expect(state.branches[0]).toMatchObject({ branch: 'normal', probability: 1, damageRate: 1000 });
    expect(state.branches[0].hits[0].damage).toBe(10000);
    expect(state.expectedDamage).toBe(10000);
  });

  it('§ 8.1/8.3 : Σ hits (dernier rattrapé) = calcDamageCore(facteur total), multi-hit déplié', () => {
    const scenario = baseScenario();
    scenario.attacker.attackStat = 28414; // valeurs qui TRONQUENT par hit
    scenario.attacker.piercePowerRate = 350;
    scenario.defender.defense = 1873;
    const skill = {
      skillFactor: 1840,
      states: [
        {
          chain: 'S3',
          hits: [
            { id: 'h1', damageFactor: 333 },
            { id: 'h2', damageFactor: 333, maxHitCount: 2 },
            { id: 'h3', damageFactor: 1 },
          ],
        },
      ],
    };
    const [state] = buildSkillReport(skill, scenario).states;
    expect(state.totalFactor).toBe(333 + 333 * 2 + 1);
    const branch = state.branches[0];
    expect(branch.hits).toHaveLength(4); // h2 déplié en 2 occurrences
    const expectedTotal = calcDamageCore({
      attackStat: 28414,
      skillFactor: 1840,
      piercePowerRate: 350,
      piercePower: 0,
      defense: 1873,
      damageFactor: state.totalFactor,
      damageRate: 1000,
      elementalRate: 1000,
    });
    expect(branch.totalDamage).toBe(expectedTotal);
    expect(branch.hits.at(-1)?.adjusted).toBe(true);
    expect(branch.hits.reduce((s, h) => s + h.damage, 0)).toBe(expectedTotal);
  });

  it('branches : crit remplace le taux, miss ×500 ‰, NOT_CRITICAL tombe en crit — espérance pondérée', () => {
    const scenario = baseScenario();
    scenario.attacker.criticalRate = 500;
    scenario.defender.avoid = 200;
    scenario.attackerBuffs = [{ type: 'BT_DMG_NOT_CRITICAL', value: 200 }];
    const report = buildSkillReport(
      { skillFactor: 1000, states: [{ chain: 'S1', hits: [{ id: 'h1', damageFactor: 1000 }] }] },
      scenario,
    );
    const [state] = report.states;
    const by = Object.fromEntries(state.branches.map((b) => [b.branch, b]));
    expect(by.normal.damageRate).toBe(1200); // 1000 + 200 (§ 9.1 hors crit)
    expect(by.critical.damageRate).toBe(1500); // CriticalDMGRate, sans NOT_CRITICAL
    expect(by.miss.damageRate).toBe(1200); // taux 1000 + 200, la pénalité est ×0,5
    expect(by.normal.hits[0].damage).toBe(12000);
    expect(by.critical.hits[0].damage).toBe(15000);
    expect(by.miss.hits[0].damage).toBe(6000); // ×500 ‰ § 8.2
    const expected =
      by.normal.probability * 12000 + by.critical.probability * 15000 + by.miss.probability * 6000;
    expect(state.expectedDamage).toBeCloseTo(expected, 9);
  });

  it('défenseur invincible : branches non émises, dégâts 0 — la jauge reste servie', () => {
    const scenario = baseScenario();
    scenario.defenderBuffs = [{ type: 'BT_INVINCIBLE', value: 0 }];
    const report = buildSkillReport(
      {
        skillFactor: 1000,
        wgReduce: 30,
        states: [{ chain: 'S1', hits: [{ id: 'h1', damageFactor: 1000 }] }],
      },
      scenario,
    );
    expect(report.defenderInvincible).toBe(true);
    expect(report.states[0].branches).toEqual([]);
    expect(report.states[0].expectedDamage).toBe(0);
    expect(report.weaknessGaugeDamage).toBe(30);
    // WG invincible, lui, coupe la jauge.
    scenario.defenderBuffs = [{ type: 'BT_WG_INVINCIBLE', value: 0 }];
    expect(
      buildSkillReport({ skillFactor: 1000, wgReduce: 30, states: [] }, scenario)
        .weaknessGaugeDamage,
    ).toBe(0);
  });

  it('drapeaux du scénario : marking ×1150, break −200 ‰ § 9.2, swap § 10.1 via attackerStat', () => {
    const scenario = baseScenario();
    scenario.defenderBuffs = [
      { type: 'BT_MARKING', value: 0 },
      // BID_BREAK_1 réel : la cible break PREND +200 ‰ via § 9.2.
      { type: 'BT_DMG_REDUCE', applyingType: 'OAT_RATE', value: -200 },
    ];
    scenario.attackerBuffs = [
      { type: 'BT_SWAP_STAT_ATTACK', stat: 'ST_HP', applyingType: 'OAT_RATE', value: 500 },
    ];
    scenario.additionalContext = { attackerStat: (s) => (s === 'ST_HP' ? 50000 : 0) };
    const [state] = buildSkillReport(
      { skillFactor: 1000, states: [{ chain: 'S1', hits: [{ id: 'h1', damageFactor: 1000 }] }] },
      scenario,
    ).states;
    // ATK swappée : 50000 × 500 ‰ = 25000 ; taux 1000 + 200 ; marking ×1150.
    expect(state.branches[0].damageRate).toBe(1200);
    expect(state.branches[0].hits[0].damage).toBe(
      Math.trunc((Math.trunc((25000 * 1200) / 1000) * 1150) / 1000),
    );
  });

  it('resolveAttackStat sans lecteur de stat : retombe sur ST_ATK (contexte incomplet ≠ devinette)', () => {
    const swap = { stat: 'ST_HP', applyingType: 'OAT_ADD', value: 777 };
    expect(resolveAttackStat(10000, swap)).toBe(10000);
    expect(resolveAttackStat(10000, swap, () => 50000)).toBe(50777);
    expect(resolveAttackStat(10000, undefined, () => 50000)).toBe(10000);
  });

  it('BT_DMG_ENEMY_TEAM_DECREASE : ajouté APRÈS le plancher, × cibles décomptées', () => {
    const scenario = baseScenario();
    scenario.attackerBuffs = [{ type: 'BT_DMG_ENEMY_TEAM_DECREASE', value: 60 }];
    scenario.decreaseTargetCount = 3;
    const [state] = buildSkillReport(
      { skillFactor: 1000, states: [{ chain: 'S1', hits: [{ id: 'h1', damageFactor: 1000 }] }] },
      scenario,
    ).states;
    expect(state.branches[0].damageRate).toBe(1000 + 60 * 3);
  });
});

describe('report — ligne DOT (§ 11 + § 5)', () => {
  it('tick = calcDamageDOT ; P(pose) = P(CreateRate) × (1 − P(résist))', () => {
    const line = buildDotLine({
      attackRate: 700,
      statValue: 10000,
      defense: 1000,
      piercePowerRate: 0,
      piercePower: 0,
      dmgReduceRate: 0,
      createRatePermille: 500,
    });
    // § 11 : 700 × 10000 × 1e6 / (1e6 + 1000×1000) = 3 500 000, puis
    // × (1000 − 0) / 1e6 → 3500 (la défense 1000 divise par 2).
    expect(line.damagePerTick).toBe(3500);
    // chance = resist = 0 : diff 0 → seuil 9 → P(résist) = 10/1001.
    expect(line.applyProbability).toBeCloseTo((501 / 1001) * (1 - 10 / 1001), 12);
  });

  it('CreateRate 1000 et cible sans résistance effective : pose quasi certaine, jamais arrondie à 1', () => {
    const line = buildDotLine({
      attackRate: 100,
      statValue: 1000,
      defense: 0,
      piercePowerRate: 0,
      piercePower: 0,
      dmgReduceRate: 0,
      createRatePermille: 1000,
      buffChancePermille: 500,
      buffResistPermille: 0, // chance > resist : jamais résisté
    });
    expect(line.damagePerTick).toBe(100); // 100 × 1000 × 1e6 / 1e6, puis ×1000/1e6
    expect(line.applyProbability).toBe(1);
  });

  it('DEBUFF_IGNORE_RESIST : la pose saute le CheckResist § 5 (P = CreateRate seul)', () => {
    // Sans le flag, chance 0 vs resist 0 → seuil 9 → P(résist) ≈ 1 % ; avec le
    // flag (Bleed de Francesca), P(pose) = P‰(1000) = 1 exactement.
    const base = {
      attackRate: 700,
      statValue: 10000,
      defense: 0,
      piercePowerRate: 0,
      piercePower: 0,
      dmgReduceRate: 0,
      createRatePermille: 1000,
    };
    expect(buildDotLine(base).applyProbability).toBeLessThan(1);
    expect(buildDotLine({ ...base, ignoreResist: true }).applyProbability).toBe(1);
  });

  it('jump table des ticks (24/08/2026) : `flat` sans défense, ENHANCE sur le taux, cap CURSE', () => {
    const base = {
      defense: 1000,
      piercePowerRate: 0,
      piercePower: 0,
      dmgReduceRate: 100,
      createRatePermille: 1000,
      ignoreResist: true,
    };
    // `flat` (BURN / CURSE / DoT custom 61) : MulPermille(stat, taux) — ni
    // défense ni réduction (Eternal Bleeding : 636 × 7000 ‰ = 4452 exact).
    expect(
      buildDotLine({ ...base, attackRate: 7000, statValue: 636, formula: 'flat' as const })
        .damagePerTick,
    ).toBe(4452);
    // ENHANCE : ApplyRate AVANT la formule — 7000 ‰ → 10500 ‰.
    expect(
      buildDotLine({
        ...base,
        attackRate: 7000,
        statValue: 636,
        formula: 'flat' as const,
        enhancePermille: 500,
      }).damagePerTick,
    ).toBe(6678);
    // Cap (CURSE) : plafond dur APRÈS la formule.
    expect(
      buildDotLine({
        ...base,
        attackRate: 7000,
        statValue: 636,
        formula: 'flat' as const,
        capValue: 1000,
      }).damagePerTick,
    ).toBe(1000);
    // `defense` + ENHANCE : le taux boosté passe dans CalcDamageDOT —
    // 1050 × 10000 × 1e6 / 2e6 = 5 250 000, ×(1000−100)/1e6 = 4725.
    expect(
      buildDotLine({ ...base, attackRate: 700, statValue: 10000, enhancePermille: 500 })
        .damagePerTick,
    ).toBe(4725);
  });
});
