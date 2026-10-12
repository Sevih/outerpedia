/**
 * Contrat de `gear-sheet` — la fiche d'une entité d'équipement lue du build
 * FRAIS : une famille par l'id d'un de ses membres, ses mains (pools roulés
 * seuls), ses passifs résolus, ses variantes par classe ; un EE ; un set avec
 * ses pièces et ses bonus. Et le pont cible ↔ kind d'intégration.
 */
import { describe, expect, it } from 'vitest';
import type { EquipmentData } from '@datagen/generators/equipment';
import {
  GEAR_TARGETS,
  familyOf,
  gearSheet,
  isGearTarget,
  resolveFreshPassives,
} from './gear-sheet';

const name = (en: string) => ({ en }) as EquipmentData['weapon'][string]['name'];

const FRESH = {
  weapon: {
    '1001': {
      name: name('Steel Sword'),
      grade: 'rare',
      star: 5,
      icon: 'TI_W_1001',
      craftable: false,
      classLimit: null,
      main: ['p_atk'],
      sub: null,
      passives: [{ id: 'pa', level: 1, isAdd: false }],
      breakLimit: null,
    },
    '1002': {
      name: name('Steel Sword'),
      grade: 'unique',
      star: 6,
      icon: 'TI_W_1002',
      craftable: true,
      classLimit: 'striker',
      main: ['p_atk', 'p_roll'],
      sub: 'p_sub',
      passives: [{ id: 'pa', level: 1, isAdd: false }],
      breakLimit: 'b1',
    },
    '1003': {
      name: name('Steel Sword'),
      grade: 'unique',
      star: 6,
      icon: 'TI_W_1003',
      craftable: true,
      classLimit: 'mage',
      main: ['p_atk', 'p_roll_mage'],
      sub: 'p_sub',
      passives: [{ id: 'pb', level: 1, isAdd: false }],
      breakLimit: 'b1',
    },
  },
  accessory: {},
  helmet: {
    h1: {
      name: name('Hat'),
      grade: 'rare',
      star: 5,
      icon: 'TI_H1',
      craftable: false,
      main: [],
      sub: null,
      breakLimit: null,
      set: 's1',
    },
    h2: {
      name: name('Hat'),
      grade: 'unique',
      star: 6,
      icon: 'TI_H2',
      craftable: false,
      main: [],
      sub: null,
      breakLimit: null,
      set: 's1',
    },
  },
  armor: {},
  gloves: {
    g1: {
      name: name('Gloves'),
      grade: 'unique',
      star: 5,
      icon: 'TI_G1',
      craftable: false,
      main: [],
      sub: null,
      breakLimit: null,
      set: 's1',
    },
  },
  shoes: {},
  talisman: {
    t1: {
      name: name('Charm'),
      grade: 'unique',
      star: 5,
      icon: 'TI_T1',
      craftable: false,
      options: ['p_roll'],
      passives: [
        { id: 'pa', level: 1, isAdd: false },
        { id: 'pc', level: 10, isAdd: true },
      ],
      mode: 'AP',
    },
  },
  ee: {
    e1: {
      name: name('Blade of Aer'),
      grade: 'unique',
      star: 5,
      icon: 'TI_Equipment_EX_2000001',
      craftable: false,
      options: ['p_roll', 'p_ee'],
      passives: [{ id: 'pc', level: 1, isAdd: false }],
      character: '2000001',
      trustLevel: 3,
    },
  },
  families: {
    weapon: [
      {
        id: '1001',
        topId: '1002',
        ids: ['1001', '1002', '1003'],
        stars: [5, 6],
        classLimits: ['striker', 'mage'],
        wiki: true,
      },
    ],
    accessory: [],
    talisman: [{ id: 't1', topId: 't1', ids: ['t1'], stars: [5], classLimits: [], wiki: true }],
  },
  pools: {
    p_atk: [{ stat: 'atk', mode: 'flat', value: 100, weight: 100 }],
    p_roll: [
      { stat: 'atk', mode: 'rate', value: 10, weight: 50 },
      { stat: 'critical_rate', mode: 'rate', value: 5, weight: 50 },
    ],
    p_roll_mage: [
      { stat: 'speed', mode: 'flat', value: 10, weight: 50 },
      { stat: 'effectiveness', mode: 'rate', value: 5, weight: 50 },
    ],
    p_sub: [{ stat: 'def', mode: 'flat', value: 1, weight: 100 }],
    p_ee: [{ stat: 'hit_ap', mode: 'none', value: 0, weight: 100 }],
  },
  passives: {
    pa: {
      name: name('Fury'),
      desc: name('ATK +[Value] for [Turn] turns'),
      values: [
        { value: '10%', turn: '2' },
        { value: '20%', turn: '2' },
      ],
      levels: [1, 5],
      icon: 'IC_pa',
      buff: 'B_pa',
      effects: [{ family: 'stat', category: 'buff', stat: 'atk' }],
    },
    pb: {
      name: name('Wisdom'),
      desc: name('EFF +[Value]'),
      values: [{ value: '5%' }],
      levels: [1],
      icon: 'IC_pb',
      buff: 'B_pb',
    },
    pc: {
      name: name('Charge'),
      desc: name('Gain [Value] AP'),
      values: [],
      levels: [],
      icon: 'IC_pc',
      buff: 'B_pc',
      effects: [{ family: 'ap', category: 'buff' }],
    },
  },
  breakLimits: {},
  sets: {
    s1: {
      name: name('Vigor Set'),
      icon: 'TI_Icon_Set_Vigor',
      tiers: [
        { '2p': { stat: 'hp', value: '15%' }, '4p': null },
        { '2p': { stat: 'hp', value: '20%' }, '4p': { desc: name('Heals 5% at turn start') } },
      ],
    },
  },
  grades: {},
  classes: {},
  statNames: { hp: name('Max HP') },
  statDescs: {},
} as unknown as EquipmentData;

describe('GEAR_TARGETS — le pont cible de revue ↔ intégration', () => {
  it('amulet intègre en accessory, les familles ont leur clé, EE et set n’en ont pas', () => {
    expect(GEAR_TARGETS.amulet).toEqual({
      kind: 'accessory',
      slot: 'accessory',
      familyKey: 'accessory',
      adminPath: 'amulets',
    });
    expect(GEAR_TARGETS.weapon.kind).toBe('weapon');
    expect(GEAR_TARGETS.ee.familyKey).toBeNull();
    expect(GEAR_TARGETS.set).toMatchObject({ kind: 'set', slot: 'sets', familyKey: null });
    expect(isGearTarget('talisman')).toBe(true);
    expect(isGearTarget('armor')).toBe(false);
    expect(isGearTarget('character')).toBe(false);
  });
});

describe('gearSheet — une famille', () => {
  it('se trouve par l’id de la famille ou d’un membre, porte la tête, les mains roulées, les variantes par classe', () => {
    const sheet = gearSheet(FRESH, 'weapon', '1003');
    expect(sheet).toBeDefined();
    expect(familyOf(FRESH.families.weapon, '1002')?.id).toBe('1001');
    expect(sheet).toMatchObject({
      kind: 'family',
      id: '1001',
      name: { en: 'Steel Sword' },
      icon: 'TI_W_1002',
      grade: 'unique',
      stars: [5, 6],
      classLimits: ['striker', 'mage'],
      members: ['1001', '1002', '1003'],
      effects: ['stat/buff atk'],
    });
    // Les mains : l'union des pools ROULÉS des membres au palier max, l'ATK
    // flat de base d'une arme écartée.
    expect(sheet?.mainStats).toEqual(['ATK%', 'CHC%', 'SPD', 'EFF%']);
    expect(sheet?.passives).toEqual([
      {
        level: 1,
        isAdd: false,
        name: 'Fury',
        icon: 'IC_pa',
        first: 'ATK +<color=#28d9ed>10%</color> for <color=#28d9ed>2</color> turns',
        last: 'ATK +<color=#28d9ed>20%</color> for <color=#28d9ed>2</color> turns',
        levels: 2,
      },
    ]);
    expect(
      sheet?.classVariants?.map((v) => [
        v.classLimit,
        v.id,
        v.icon,
        v.mainStats,
        v.passives[0].name,
      ]),
    ).toEqual([
      ['striker', '1002', 'TI_W_1002', ['ATK%', 'CHC%'], 'Fury'],
      ['mage', '1003', 'TI_W_1003', ['SPD', 'EFF%'], 'Wisdom'],
    ]);
    expect(sheet?.mode).toBeUndefined();
  });

  it('un talisman porte son type de points ; une famille inconnue n’a pas de fiche', () => {
    const t = gearSheet(FRESH, 'talisman', 't1');
    expect(t).toMatchObject({ kind: 'family', id: 't1', mode: 'AP', mainStats: ['ATK%', 'CHC%'] });
    expect(t).not.toHaveProperty('classVariants');
    expect(t?.passives.map((p) => [p.level, p.isAdd, p.name, p.first, p.levels])).toEqual([
      [1, false, 'Fury', 'ATK +<color=#28d9ed>10%</color> for <color=#28d9ed>2</color> turns', 2],
      [10, true, 'Charge', 'Gain [Value] AP', 0],
    ]);
    expect(gearSheet(FRESH, 'weapon', '9999')).toBeUndefined();
    expect(gearSheet(FRESH, 'amulet', '1001')).toBeUndefined();
  });
});

describe('gearSheet — un EE, un set', () => {
  it('l’EE : son perso, sa confiance, ses mains sans l’option interne, son passif', () => {
    expect(gearSheet(FRESH, 'ee', 'e1')).toEqual({
      kind: 'ee',
      id: 'e1',
      name: { en: 'Blade of Aer' },
      icon: 'TI_Equipment_EX_2000001',
      grade: 'unique',
      stars: [5],
      classLimits: [],
      mainStats: ['ATK%', 'CHC%'],
      passives: [
        {
          level: 1,
          isAdd: false,
          name: 'Charge',
          icon: 'IC_pc',
          first: 'Gain [Value] AP',
          levels: 0,
        },
      ],
      effects: ['ap/buff'],
      members: ['e1'],
      characterId: '2000001',
      trustLevel: 3,
    });
    expect(gearSheet(FRESH, 'ee', 'nope')).toBeUndefined();
  });

  it('le set : la meilleure pièce par slot, les bonus nommés par la stat officielle ou la description', () => {
    expect(gearSheet(FRESH, 'set', 's1')).toMatchObject({
      kind: 'set',
      id: 's1',
      name: { en: 'Vigor Set' },
      icon: 'TI_Icon_Set_Vigor',
      pieces: [
        { slot: 'helmet', icon: 'TI_H2' },
        { slot: 'gloves', icon: 'TI_G1' },
      ],
      tiers: [{ p2: 'Max HP +15%' }, { p2: 'Max HP +20%', p4: 'Heals 5% at turn start' }],
    });
    expect(gearSheet(FRESH, 'set', 'nope')).toBeUndefined();
  });
});

describe('resolveFreshPassives', () => {
  it('ignore une ref sans passif ; sans valeur, le template tel quel', () => {
    expect(resolveFreshPassives([{ id: 'zz', level: 1, isAdd: false }], FRESH.passives)).toEqual(
      [],
    );
    expect(resolveFreshPassives([{ id: 'pb', level: 1, isAdd: false }], FRESH.passives)).toEqual([
      {
        level: 1,
        isAdd: false,
        name: 'Wisdom',
        icon: 'IC_pb',
        first: 'EFF +<color=#28d9ed>5%</color>',
        levels: 1,
      },
    ]);
  });
});
