/**
 * Sélection du « meilleur hit » (solver-best-skill.ts) sur des kits
 * SYNTHÉTIQUES — sans `.gamedata` (contrainte CI). Ce qu'on verrouille :
 * multi-hit = somme, clips résolus > tables, burst rattaché au slot burstable
 * (et jamais sans marqueur), passifs / skills à facteur 0 ignorés, chaîne
 * irrésolue = facteur plein SIGNALÉ, kit sans dégâts = undefined.
 */
import { describe, expect, it } from 'vitest';
import type { DamageCharacter, DamageHit, DamageSkill } from '../damage/characters';
import { bestSkillOf, skillMaxFactor } from './solver-best-skill';

function hit(id: string, damageFactor: number, maxHitCount = 0): DamageHit {
  const m = /^(.*)_(\d+)$/.exec(id);
  return {
    id,
    chain: m ? m[1] : id,
    hit: m ? Number(m[2]) : 1,
    damageFactor,
    damageType: 'DT_CUT',
    multiHit: maxHitCount > 1,
    maxHitCount,
    isAdditive: false,
  };
}

function skill(
  id: string,
  type: string,
  factors: number[],
  hits: DamageHit[] = [],
  extra: Partial<DamageSkill> = {},
): DamageSkill {
  return {
    id,
    type,
    subType: 'ACTIVE',
    targetTeamType: 'ENEMY',
    rangeType: 'SINGLE',
    levels: factors.map((damageFactor, i) => ({
      level: i + 1,
      damageFactor,
      wgReduce: 0,
      buffIds: [],
      cool: 0,
      startCool: 0,
    })),
    hits,
    ...extra,
  };
}

function char(ids: string[]): Pick<DamageCharacter, 'skills'> {
  return { skills: ids.map((id, i) => ({ slot: i + 1, id })) };
}

describe('skillMaxFactor — facteur d’UN skill au niveau max', () => {
  it('niveau MAX × Σ des hits (multi-hit = somme, MaxHitCount déplié)', () => {
    // S3 de Rhona : 40×5 + 100 + 300 + 100×4 = 1000 ‰ ; DamageFactor 1670 au niveau 5.
    const sk = skill(
      '803',
      'SKT_ULTIMATE',
      [1000, 1200, 1400, 1550, 1670],
      [
        hit('X_Skill_3_1', 40, 5),
        hit('X_Skill_3_2', 100),
        hit('X_Skill_3_3', 300),
        hit('X_Skill_3_4', 100, 4),
      ],
    );
    expect(skillMaxFactor(sk)).toEqual({ factor: 1670 });
  });

  it('clips résolus : la somme des events fait foi (rejeu, facteur > 1000)', () => {
    // Tables : 700 ‰ (comblé à 1000 en fallback) ; clip réel : 700 + 300×2 = 1300.
    const sk = skill(
      '819',
      'SKT_BURST_1',
      [1840],
      [hit('X_Skill_2_1', 700), hit('X_Skill_2_2', 300)],
      {
        variants: [
          {
            key: 'base',
            trigger: 'Burst1',
            clip: {
              name: 'X_Skill_2_Upgrade',
              events: [
                { id: 'X_Skill_2_1', factor: 700, count: 1 },
                { id: 'X_Skill_2_2', factor: 300, count: 2 },
              ],
            },
          },
        ],
      },
    );
    expect(skillMaxFactor(sk)).toEqual({ factor: Math.round((1840 * 1300) / 1000) });
  });

  it('variantes : le max sur les variantes, suite additionnelle COMPTÉE (meilleur cas, comme les bursts)', () => {
    // Sterope S1 : base 1000 ‰ + suite déclarée 300 ‰ (non selfMet) → 1300 ;
    // Demiurge Astei S1 : base 1000, second 1300 → 1300.
    const sterope = skill(
      '5701',
      'SKT_FIRST',
      [1600],
      [hit('S_Skill_1_1', 1000), hit('S_Skill_1_4', 300)],
      {
        variants: [
          {
            key: 'base',
            trigger: 'Skill1',
            clip: { name: 'S_Skill_1', events: [{ id: 'S_Skill_1_1', factor: 1000, count: 1 }] },
            additive: {
              clip: { name: 'S_Skill_1_2', events: [{ id: 'S_Skill_1_4', factor: 300, count: 1 }] },
              buffIds: ['S_1_1'],
            },
          },
        ],
      },
    );
    expect(skillMaxFactor(sterope)).toEqual({ factor: Math.round((1600 * 1300) / 1000) });
    const astei = skill(
      '5901',
      'SKT_FIRST',
      [1500],
      [hit('A_Skill_1_1', 1000), hit('A_Skill_extra_1', 1300)],
      {
        variants: [
          {
            key: 'base',
            trigger: 'Skill1',
            clip: { name: 'A_Skill_1', events: [{ id: 'A_Skill_1_1', factor: 1000, count: 1 }] },
          },
          {
            key: 'second',
            trigger: 'Skill1_1',
            gate: { type: 'BT_SECOND_TRIGGER', buffIds: ['A_1_1'] },
            clip: {
              name: 'A_Skill_Extra',
              events: [{ id: 'A_Skill_extra_1', factor: 1300, count: 1 }],
            },
          },
        ],
      },
    );
    expect(skillMaxFactor(astei)).toEqual({ factor: 1950 });
  });

  it('fallback tables : Σ < 990 comblée à 1000 (Caren S1), Σ ∈ [990, 1000) servie brute (Noa S2)', () => {
    expect(skillMaxFactor(skill('a', 'SKT_FIRST', [1500], [hit('C_Skill_1_1', 700)]))).toEqual({
      factor: 1500,
    });
    expect(skillMaxFactor(skill('b', 'SKT_SECOND', [2000], [hit('N_Skill_2_1', 333, 3)]))).toEqual({
      factor: 1998,
    });
  });

  it('plusieurs états (base + upgrade) : l’état le plus fort', () => {
    const sk = skill(
      's',
      'SKT_SECOND',
      [1500],
      [hit('X_Skill_2_1', 1000), hit('X_Skill_2_Upgrade_1', 600), hit('X_Skill_2_Upgrade_2', 600)],
    );
    expect(skillMaxFactor(sk)).toEqual({ factor: 1800 });
  });

  it('skill à DamageFactor 0 (soin/buff) → undefined ; chaîne irrésolue → facteur plein SIGNALÉ', () => {
    expect(skillMaxFactor(skill('h', 'SKT_SECOND', [0, 0, 0]))).toBeUndefined();
    expect(
      skillMaxFactor(skill('u', 'SKT_ULTIMATE', [1300], [], { hitsUnresolved: true })),
    ).toEqual({ factor: 1300, unresolvedHits: true });
  });
});

describe('bestSkillOf — max sur S1/S2/S3 + bursts', () => {
  const S1 = skill('1', 'SKT_FIRST', [1000, 1590], [hit('X_Skill_1_1', 1000)]);
  const S2 = skill(
    '2',
    'SKT_SECOND',
    [1000, 1410],
    [hit('X_Skill_2_1', 400), hit('X_Skill_2_2', 150, 4)],
    { burstAP: [1, 2, 3] },
  );
  const S3 = skill('3', 'SKT_ULTIMATE', [1000, 1670], [hit('X_Skill_3_1', 1000)]);
  const passive = skill('8', 'SKT_UNIQUE_PASSIVE', [9999], [hit('X_Skill_8_1', 1000)], {
    subType: 'PASSIVE',
  });
  const B3 = skill('21', 'SKT_BURST_3', [1000, 1646], [hit('X_Skill_7_1', 1000)]);
  const B3big = skill('21', 'SKT_BURST_3', [1000, 2392], [hit('X_Skill_7_1', 1000)]);

  it('le S3 gagne sur S1/S2 ; le passif (facteur énorme) est IGNORÉ', () => {
    expect(bestSkillOf(char(['1', '2', '3', '8']), { 1: S1, 2: S2, 3: S3, 8: passive })).toEqual({
      slot: 'S3',
      factor: 1670,
    });
  });

  it('un burst plus fort que tout gagne, rattaché au slot BURSTABLE (burstAP), avec son rang', () => {
    expect(bestSkillOf(char(['1', '2', '3', '21']), { 1: S1, 2: S2, 3: S3, 21: B3big })).toEqual({
      slot: 'S2',
      burst: 3,
      factor: 2392,
    });
  });

  it('burst SANS marqueur burstAP : omis (jamais un slot supposé) — comme le calculateur', () => {
    const S2noAP = { ...S2, burstAP: undefined };
    expect(
      bestSkillOf(char(['1', '2', '3', '21']), { 1: S1, 2: S2noAP, 3: S3, 21: B3big }),
    ).toEqual({ slot: 'S3', factor: 1670 });
  });

  it('égalité : le skill de base l’emporte sur son burst de même facteur (ordre S1, S2, S3, B1..B3)', () => {
    const B3tie = { ...B3, levels: S3.levels };
    expect(bestSkillOf(char(['1', '2', '3', '21']), { 1: S1, 2: S2, 3: S3, 21: B3tie })).toEqual({
      slot: 'S3',
      factor: 1670,
    });
  });

  it('kit sans dégâts dans S1/S2/S3 (ou skills inconnus) → undefined — le consommateur applique son repli', () => {
    const heal = skill('2', 'SKT_SECOND', [0]);
    expect(bestSkillOf(char(['2']), { 2: heal })).toBeUndefined();
    expect(bestSkillOf(char(['404']), {})).toBeUndefined();
  });

  it('le gagnant irrésolu porte unresolvedHits', () => {
    const S1u = skill('1', 'SKT_FIRST', [1800], [], { hitsUnresolved: true });
    expect(bestSkillOf(char(['1', '3']), { 1: S1u, 3: S3 })).toEqual({
      slot: 'S1',
      factor: 1800,
      unresolvedHits: true,
    });
  });
});
