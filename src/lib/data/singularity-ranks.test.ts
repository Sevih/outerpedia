/**
 * L'échelle des rangs de Dimensional Singularity (`buildRankLadder`) : ce
 * qu'une ligne annonce comme CHANGEMENT est ce qui apparaît à ce rang, pas la
 * liste entière des passifs (relue à chaque ligne, elle noierait les 34 rangs).
 * Fixture : les cinq derniers rangs de `SingularityGradeTemplet` au patch du
 * 20/11/2026 (seuils, niveaux, options et récompenses de la table).
 */
import { describe, expect, it } from 'vitest';
import type { DungeonRank } from '@contracts';
import { buildRankLadder } from './singularity-ranks';
import type { SingularityExBuff } from './singularity';

const BASE = ['Normal_1_1', 'Normal_1_2', 'Pasive_S_1', 'Dmg_up_sss'];
const LATE_RANKS: DungeonRank[] = [
  {
    name: 'SSS++',
    level: 200,
    damage: { min: 3600001, max: 5000000 },
    options: BASE,
    reward: '8200030',
  },
  {
    name: 'EX',
    level: 200,
    damage: { min: 5000001, max: 10000000 },
    options: [...BASE, 'dot1'],
    reward: '8200031',
  },
  {
    name: 'EX+',
    level: 200,
    damage: { min: 10000001, max: 15000000 },
    options: [...BASE, 'dot2'],
    reward: '8200032',
  },
  {
    name: 'EX++',
    level: 200,
    damage: { min: 15000001, max: 20000000 },
    options: [...BASE, 'dot3'],
    reward: '8200033',
  },
  {
    name: 'EX+++',
    level: 200,
    damage: { min: 20000001, max: 30000000 },
    options: [...BASE, 'dot3'],
    reward: '8200034',
  },
];

/** Libellés comme les rendrait `rankOptionLabel` (les deux réductions élémentaires se confondent). */
const LABELS: Record<string, string> = {
  Normal_1_1: 'Final DMG Reduction 70%',
  Normal_1_2: 'Final DMG Reduction 70%',
  Pasive_S_1: 'Increased Penetration +30%',
  Dmg_up_sss: 'DMG Increase +300%',
  dot1: 'DoT DMG Taken -20%',
  dot2: 'DoT DMG Taken -30%',
  dot3: 'DoT DMG Taken -50%',
};
const label = (id: string) => LABELS[id];

const EX_BUFFS: SingularityExBuff[] = [
  { rank: 'EX', desc: { en: "All Fire allies' Damage +200%" }, option: 'fire', value: 2000 },
  { rank: 'EX', desc: { en: "All Mage allies' Damage +200%" }, option: 'mage', value: 2000 },
];

describe('buildRankLadder', () => {
  const ladder = buildRankLadder(LATE_RANKS, label, EX_BUFFS);

  it('une ligne par rang, seuil = MinDamage de la table', () => {
    expect(ladder.rows.map((r) => [r.name, r.minDamage])).toEqual([
      ['SSS++', 3600001],
      ['EX', 5000001],
      ['EX+', 10000001],
      ['EX++', 15000001],
      ['EX+++', 20000001],
    ]);
  });

  it('les changements sont ce qui apparaît au rang, dédupliqué ; rien quand rien ne change', () => {
    // Premier rang : tout est nouveau, et les deux réductions élémentaires
    // (même libellé) ne font qu'une ligne.
    expect(ladder.rows[0].changes).toEqual([
      'Final DMG Reduction 70%',
      'Increased Penetration +30%',
      'DMG Increase +300%',
    ]);
    expect(ladder.rows.slice(1).map((r) => r.changes)).toEqual([
      ['DoT DMG Taken -20%'],
      ['DoT DMG Taken -30%'],
      ['DoT DMG Taken -50%'],
      [],
    ]);
  });

  it('le buff EX s’active à son rang, avec son bonus en % quand tous les créneaux le partagent', () => {
    expect(ladder.rows.filter((r) => r.exBuff).map((r) => r.name)).toEqual(['EX']);
    expect(ladder.exBuffPercent).toBe(200);
    const mixed = buildRankLadder(LATE_RANKS, label, [
      EX_BUFFS[0],
      { ...EX_BUFFS[1], value: 1500 },
    ]);
    expect(mixed.exBuffPercent).toBeUndefined();
  });

  it('une donnée d’avant le patch (ni récompense ni buff EX) reste rendable', () => {
    const old = buildRankLadder(
      LATE_RANKS.slice(0, 1).map((r) => ({ ...r, reward: undefined })),
      label,
      [],
    );
    expect(old.rows).toHaveLength(1);
    expect(old.rows[0].reward).toBeUndefined();
    expect(old.exBuffPercent).toBeUndefined();
  });
});
