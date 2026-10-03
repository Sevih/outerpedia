/**
 * La règle « quelles stats pilotent les dégâts » sur les CAS QUI DIVERGEAIENT
 * entre damage-scaling et le solver (audit G11) — lignes recopiées des tables
 * du jeu, réduites aux colonnes lues. Une erreur ici passe tout le reste : le
 * calculateur demanderait une stat inutile, ou gear-solver en oublierait une.
 *
 * Tourne SANS `.gamedata` (tables fournies à la main).
 */
import { describe, expect, it } from 'vitest';
import type { BuffGroup } from './buff';
import { kitScaling, type KitScalingTables } from './kit-scaling';
import type { Row } from './tables';

/** Tables réduites : skill → CSV de buffs (un niveau), buffs → lignes. */
function tables(
  skills: Record<string, string>,
  buffRows: Row[],
  groups: Record<string, BuffGroup> = {},
): KitScalingTables {
  const buffs = new Map<string, Row[]>();
  for (const b of buffRows) buffs.set(b.BuffID, [...(buffs.get(b.BuffID) ?? []), b]);
  return {
    levelsBySkill: new Map(
      Object.entries(skills).map(([SkillID, BuffID]) => [
        SkillID,
        [{ SkillID, SkillLevel: '1', BuffID }],
      ]),
    ),
    buffs,
    groups: new Map(Object.entries(groups)),
  };
}

const ownerStat = (BuffID: string, StatType: string, Value: string, rest: Row = {}): Row => ({
  BuffID,
  Level: '1',
  Type: 'BT_DMG_OWNER_STAT',
  TargetType: 'ME',
  StatType,
  Value,
  ...rest,
});

const BACKUP = { CallerSkillType: 'SKT_BACKUP_AERIAL,SKT_BACKUP_GROUND' };

describe('kitScaling — les quatre divergences de G11', () => {
  it('Leo : la DEF ne sert que son attaque de soutien (Skill_10)', () => {
    const t = tables({ '4210': '2000042_backup_1_1' }, [
      ownerStat('2000042_backup_1_1', 'ST_DEF', '200', BACKUP),
    ]);
    expect(kitScaling({ ID: '2000042', Skill_9: '4209', Skill_10: '4210' }, t)).toEqual({
      bonus: [],
    });
  });

  it('Sterope : le HP ne sert que ses attaques de soutien (Skill_9 et Skill_10)', () => {
    const t = tables({ '5709': '2000057_backup_1_1', '5710': '2000057_backup_1_1' }, [
      ownerStat('2000057_backup_1_1', 'ST_HP', '20', BACKUP),
    ]);
    expect(kitScaling({ ID: '2000057', Skill_9: '5709', Skill_10: '5710' }, t)).toEqual({
      bonus: [],
    });
  });

  it('Tamara : la SPD ne sert que ses attaques de soutien (Skill_9 et Skill_10)', () => {
    const t = tables({ '6009': '2000060_backup_1_1', '6010': '2000060_backup_1_1' }, [
      ownerStat('2000060_backup_1_1', 'ST_SPEED', '1500', BACKUP),
    ]);
    expect(kitScaling({ ID: '2000060', Skill_9: '6009', Skill_10: '6010' }, t)).toEqual({
      bonus: [],
    });
  });

  it("Kuro : le « gold rate » posé sur l'équipe est un compteur de stacks, pas une stat", () => {
    const t = tables({ '7902': '2000079_2_8,2000079_2_9' }, [
      ownerStat('2000079_2_8', 'ST_GET_GOLD_RATE', '1000', { TargetType: 'MY_TEAM' }),
      {
        BuffID: '2000079_2_9',
        Level: '1',
        Type: 'BT_STAT',
        TargetType: 'MY_TEAM',
        StatType: 'ST_GET_GOLD_RATE',
        Value: '100',
      },
    ]);
    expect(kitScaling({ ID: '2000079', Skill_2: '7902' }, t)).toEqual({ bonus: [] });
  });
});

describe('kitScaling — ce qui compte', () => {
  it('une stat lue par le kit principal reste, même si le soutien la lit aussi', () => {
    const t = tables({ '301': 'main_spd', '310': 'backup_spd' }, [
      ownerStat('main_spd', 'ST_SPEED', '500'),
      ownerStat('backup_spd', 'ST_SPEED', '1500', BACKUP),
    ]);
    // Le ratio est celui du kit principal, pas le plus fort du soutien.
    expect(kitScaling({ ID: 'X', Skill_1: '301', Skill_10: '310' }, t)).toEqual({
      bonus: [{ stat: 'ST_SPEED', ratio: 0.5 }],
    });
  });

  it('swap et bonus des passifs : transcendance (8), classe (22), core (23)', () => {
    const t = tables({ '8': 'trans_eff', '22': 'class_swap', '23': 'core_def' }, [
      ownerStat('trans_eff', 'ST_BUFF_CHANCE', '300'),
      {
        BuffID: 'class_swap',
        Level: '1',
        Type: 'BT_SWAP_STAT_ATTACK',
        TargetType: 'ME',
        StatType: 'ST_HP',
      },
      ownerStat('core_def', 'ST_DEF', '100'),
    ]);
    expect(kitScaling({ ID: 'X', Skill_8: '8', Skill_22: '22', Skill_23: '23' }, t)).toEqual({
      attackStat: 'ST_HP',
      bonus: [
        { stat: 'ST_BUFF_CHANCE', ratio: 0.3 },
        { stat: 'ST_DEF', ratio: 0.1 },
      ],
    });
  });

  it('ratio = le plus haut des niveaux du buff ; une valeur nulle ne compte pas', () => {
    const t = tables({ '1': 'grow,zero' }, [
      ownerStat('grow', 'ST_HP', '20'),
      ownerStat('grow', 'ST_HP', '40', { Level: '5' }),
      ownerStat('zero', 'ST_DEF', '0'),
    ]);
    expect(kitScaling({ ID: 'X', Skill_1: '1' }, t)).toEqual({
      bonus: [{ stat: 'ST_HP', ratio: 0.04 }],
    });
  });

  it("l'enfant d'un groupe BT_GROUP compte comme un buff posé directement", () => {
    const t = tables(
      { '2': 'grp' },
      [
        { BuffID: 'grp', Level: '1', Type: 'BT_GROUP', TargetType: 'ME', Value: 'G1' },
        ownerStat('kid', 'ST_SPEED', '250'),
      ],
      { G1: { kids: ['kid'], all: true } },
    );
    expect(kitScaling({ ID: 'X', Skill_2: '2' }, t)).toEqual({
      bonus: [{ stat: 'ST_SPEED', ratio: 0.25 }],
    });
  });
});
