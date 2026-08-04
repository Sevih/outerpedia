/**
 * Trace de calcul (harnais § 2) — la trace est produite PAR le moteur, suit
 * l'ordre réel d'exécution, et ses sorties d'étape collent EXACTEMENT aux
 * valeurs retournées (elle ne recalcule rien). Sans trace demandée, rien ne
 * change (les autres suites tournent toutes sans trace).
 */
import { describe, expect, it } from 'vitest';
import { calcDamageCore, checkDamageRate } from './formula';
import type { TraceStep } from './harness';
import { buildSkillReport, type ReportScenario } from './report';
import { sheetToCombatStat } from './sheet';
import { DamageRateType, Element } from './types';

const scenario = (): ReportScenario => ({
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
    defense: 500,
    avoid: 0,
    dmgReduceRate: 0,
    enemyCriticalDamageReduce: 0,
    element: Element.Water,
  },
});

describe('trace — § 8.2 calcDamageCore', () => {
  it('une étape par troncature exécutée, la dernière sortie = résultat', () => {
    const trace: TraceStep[] = [];
    const damage = calcDamageCore(
      {
        attackStat: 28414,
        skillFactor: 1840,
        piercePowerRate: 350,
        piercePower: 0,
        defense: 1873,
        damageFactor: 1000,
        damageRate: 1500,
        defenderMarked: true,
        elementalRate: 1200,
        isMissed: false,
        finalReduceRate: 100,
      },
      trace,
    );
    expect(trace.map((s) => s.label)).toEqual([
      'atk × facteur du hit × facteur du skill (÷1000)',
      'mitigation défense (pénétration incluse)',
      'taux du hit (§ 7)',
      'cible marquée (BT_MARKING)',
      'taux élémentaire (§ 6)',
      "réduction finale (§ 9.3) et retombée d'échelle (÷1e6)",
    ]);
    expect(trace.every((s) => s.ref === '§ 8.2')).toBe(true);
    expect(trace.at(-1)?.out).toBe(damage);
    // Les étapes conditionnelles non exécutées (miss) n'apparaissent pas.
    expect(trace.some((s) => s.label.includes('MISS'))).toBe(false);
  });

  it('le clamp « minimum 1 » n’apparaît que s’il agit', () => {
    const trace: TraceStep[] = [];
    const damage = calcDamageCore(
      {
        attackStat: 1,
        skillFactor: 1,
        piercePowerRate: 0,
        piercePower: 0,
        defense: 0,
        damageFactor: 1,
        damageRate: 1000,
        elementalRate: 1000,
      },
      trace,
    );
    expect(damage).toBe(1);
    expect(trace.at(-1)).toMatchObject({ label: 'minimum 1 par hit', out: 1 });
  });
});

describe('trace — § 7 checkDamageRate', () => {
  it('taux de base de la branche, modificateurs, plancher quand il agit', () => {
    const trace: TraceStep[] = [];
    const result = checkDamageRate(
      {
        attacker: { criticalRate: 0, criticalDmgRate: 1500, dmgBoost: 0 },
        defender: {
          avoid: 0,
          dmgReduceRate: 900,
          enemyCriticalDamageReduce: 0,
          hasInvincibleBuff: false,
        },
        previousResult: DamageRateType.Normal,
        rolls: { avoid: 0, critical: 0 },
      },
      trace,
    );
    expect(result.rate).toBe(300); // 1000 − 900 = 100 → plancher
    expect(trace.map((s) => s.ref)).toEqual(['§ 7', '§ 7.6', '§ 7.7']);
    expect(trace.at(-1)?.out).toBe(300);
  });

  it('branche critique : le taux de base expose ses opérandes', () => {
    const trace: TraceStep[] = [];
    checkDamageRate(
      {
        attacker: { criticalRate: 0, criticalDmgRate: 1500, dmgBoost: 0 },
        defender: {
          avoid: 0,
          dmgReduceRate: 0,
          enemyCriticalDamageReduce: 200,
          hasInvincibleBuff: false,
        },
        previousResult: DamageRateType.Critical,
        rolls: { avoid: 0, critical: 0 },
      },
      trace,
    );
    expect(trace[0]).toMatchObject({
      ref: '§ 7',
      in: { criticalDmgRate: 1500, enemyCriticalDamageReduce: 200 },
      out: 1300,
    });
  });
});

describe('trace — § 16.1 sheetToCombatStat', () => {
  it('trois étapes, la dernière sortie = stat de combat', () => {
    const trace: TraceStep[] = [];
    const combat = sheetToCombatStat(
      {
        sheetValue: 10000,
        baseValue: 2000,
        archiveRatePermille: 50,
        buffValue: 180,
        buffValueRate: 300,
      },
      trace,
    );
    expect(trace.map((s) => s.ref)).toEqual(['§ 16.1', '§ 16.1', '§ 16.1']);
    expect(trace[0].out).toBe(100); // terme archive : 2000 × 50 ÷ 1000
    expect(trace.at(-1)?.out).toBe(combat);
  });
});

describe('trace — buildSkillReport', () => {
  const skill = {
    skillFactor: 1000,
    states: [{ chain: 'S1', hits: [{ id: 'h1', damageFactor: 1000 }] }],
  };

  it('sans option : aucune trace, résultats identiques', () => {
    const report = buildSkillReport(skill, scenario());
    expect(report.states[0].branches[0].trace).toBeUndefined();
    expect(report.wgTrace).toBeUndefined();
  });

  it('avec { trace: true } : préambule § 6/§ 9, § 7, § 8.2 du total, § 8.3 en dernier', () => {
    const withTrace = buildSkillReport(skill, scenario(), { trace: true });
    const bare = buildSkillReport(skill, scenario());
    const branch = withTrace.states[0].branches[0];
    expect(branch.trace).toBeDefined();
    const refs = branch.trace!.map((s) => s.ref);
    // Ordre réel : élément, agrégats défenseur, § 9.1, § 7, cœur du total, § 8.3.
    expect(refs.slice(0, 4)).toEqual(['§ 6', '§ 9.2', '§ 9.3', '§ 9.1']);
    expect(refs).toContain('§ 7');
    expect(refs.filter((r) => r === '§ 8.2').length).toBeGreaterThan(0);
    expect(branch.trace!.at(-1)).toMatchObject({ ref: '§ 8.3', out: branch.totalDamage });
    // La trace n'altère RIEN du calcul.
    expect(branch.totalDamage).toBe(bare.states[0].branches[0].totalDamage);
    expect(withTrace.wgTrace).toHaveLength(1);
  });

  it('swap § 10.1 actif sans lecteur de stat : étape unresolved, jamais une valeur devinée', () => {
    const s = scenario();
    s.attackerBuffs = [
      { type: 'BT_SWAP_STAT_ATTACK', stat: 'ST_HP', applyingType: 'OAT_RATE', value: 500 },
    ];
    const report = buildSkillReport(skill, s, { trace: true });
    const step = report.states[0].branches[0].trace!.find((t) => t.ref === '§ 10.1');
    expect(step).toMatchObject({ unresolved: true, out: s.attacker.attackStat });
  });
});
