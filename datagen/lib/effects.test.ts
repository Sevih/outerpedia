import { describe, expect, it } from 'vitest';
import {
  classifyCategory,
  classifyFamily,
  resolveEffect,
  statSlug,
  type EffectFamily,
} from './effects';
import type { Row } from './tables';

describe('classifyFamily', () => {
  const cases: Array<[string, EffectFamily]> = [
    ['BT_STAT', 'stat'],
    ['BT_STAT_PREMIUM', 'stat'],
    ['BT_STAT_OWNER_LOST_HP_RATE', 'stat'],
    ['BT_DMG', 'damage'],
    ['BT_DMG_OWNER_STAT', 'damage'],
    ['BT_WG_DMG', 'damage'],
    ['BT_DMG_REDUCE', 'dmg_reduce'],
    ['BT_DMG_REDUCE_FINAL', 'dmg_reduce'],
    ['BT_SHARE_DMG', 'dmg_reduce'],
    ['BT_DOT_BURN', 'dot'],
    ['BT_GOLDEN_CURSE', 'dot'],
    ['BT_IMMEDIATELY_BLEED', 'dot'],
    ['BT_BURN_ENHANCE', 'dot'],
    ['BT_HEAL_BASED_CASTER', 'heal'],
    ['BT_WG_HEAL', 'heal'],
    ['BT_REVERSE_HEAL_BASED_TARGET', 'anti_heal'],
    ['BT_REDUCE_RECEIVE_HEAL', 'anti_heal'],
    ['BT_SEALED_RECEIVE_HEAL', 'anti_heal'],
    ['BT_SHIELD_BASED_CASTER', 'shield'],
    ['BT_INVINCIBLE', 'protect'],
    ['BT_IMMUNE', 'protect'],
    ['BT_STUN', 'cc'],
    ['BT_FREEZE', 'cc'],
    ['BT_SEALED', 'cc'],
    ['BT_AGGRO', 'cc'],
    ['BT_ACTION_GAUGE', 'gauge'],
    ['BT_AP_CHARGE', 'gauge'],
    ['BT_COOL3_CHARGE', 'cooldown'],
    ['BT_CP_CHARGE', 'resource'],
    ['BT_RESOURCE_CHARGE', 'resource'],
    ['BT_REMOVE_BUFF', 'cleanse'],
    ['BT_STEAL_BUFF', 'cleanse'],
    ['BT_EXTEND_DEBUFF', 'cleanse'],
    ['BT_RESURRECTION', 'revive'],
    ['BT_UNDEAD', 'revive'],
    ['BT_CALL_BACKUP', 'summon'],
    ['BT_SEAL_BT_CALL_BACKUP', 'summon'],
    ['BT_RUN_PASSIVE_SKILL_ON_TURN_END', 'trigger'],
    ['BT_SEAL_COUNTER', 'trigger'],
    ['BT_ADDITIVE_TURN', 'trigger'],
    ['BT_GROUP', 'group'],
    ['BT_NONE', 'special'],
    ['BT_FUTURE_UNKNOWN_TYPE', 'special'],
  ];
  for (const [type, family] of cases) {
    it(`${type} → ${family}`, () => {
      expect(classifyFamily(type)).toBe(family);
    });
  }
});

describe('classifyCategory', () => {
  it('CC prime sur tout (BuffCCType ≠ NONE)', () => {
    expect(classifyCategory({ BuffCCType: 'BLOCK_TURN', BuffDebuffType: 'DEBUFF' } as Row)).toBe(
      'cc',
    );
  });
  it('debuff via BuffDebuffType', () => {
    expect(
      classifyCategory({ BuffCCType: 'NONE', BuffDebuffType: 'DEBUFF_IGNORE_IMMUNE' } as Row),
    ).toBe('debuff');
  });
  it('debuff via IsDebuff', () => {
    expect(classifyCategory({ BuffDebuffType: 'BUFF', IsDebuff: 'True' } as Row)).toBe('debuff');
  });
  it('buff', () => {
    expect(classifyCategory({ BuffDebuffType: 'BUFF' } as Row)).toBe('buff');
  });
  it('neutral', () => {
    expect(classifyCategory({ BuffDebuffType: 'NEUTRAL' } as Row)).toBe('neutral');
  });
});

describe('statSlug', () => {
  it('strip ST_ et minuscule', () => {
    expect(statSlug('ST_CRITICAL_RATE')).toBe('critical_rate');
    expect(statSlug('ST_ATK')).toBe('atk');
  });
  it('ST_NONE / vide → null', () => {
    expect(statSlug('ST_NONE')).toBeNull();
    expect(statSlug(undefined)).toBeNull();
  });
});

describe('resolveEffect', () => {
  it('stat buff (ATK +30%) → famille/cat/stat/mode/value + réf tooltip', () => {
    const eff = resolveEffect({
      Type: 'BT_STAT',
      StatType: 'ST_ATK',
      ApplyingType: 'OAT_RATE',
      Value: '300',
      TargetType: 'ME',
      BuffDebuffType: 'BUFF',
      TurnDuration: '2',
      CreateRate: '1000',
      ToolTipID: '17',
    } as Row);
    expect(eff).toMatchObject({
      family: 'stat',
      category: 'buff',
      stat: 'atk',
      mode: 'up',
      value: '30%',
      turn: '2',
      target: 'me',
      tooltip: '17',
    });
    expect(eff.rate).toBeUndefined(); // 100% non émis
  });

  it('stat debuff (DEF -50%) → mode down, magnitude absolue', () => {
    const eff = resolveEffect({
      Type: 'BT_STAT',
      StatType: 'ST_DEF',
      ApplyingType: 'OAT_RATE',
      Value: '-500',
      TargetType: 'ENEMY',
      IsDebuff: 'True',
      BuffDebuffType: 'DEBUFF',
    } as Row);
    expect(eff).toMatchObject({ category: 'debuff', stat: 'def', mode: 'down', value: '50%' });
  });

  it('sans tooltip → label depuis CreateText (symbole strippé)', () => {
    const eff = resolveEffect({
      Type: 'BT_AP_CHARGE',
      StatType: 'ST_NONE',
      Value: '0',
      TargetType: 'ENEMY_TEAM',
      BuffDebuffType: 'BUFF',
      CreateText: '[DEBUFF]SYS_BUFF_CHARGE_CP',
    } as Row);
    expect(eff.tooltip).toBeUndefined();
    expect(eff.label).toBe('SYS_BUFF_CHARGE_CP');
    expect(eff.stat).toBeUndefined();
    expect(eff.target).toBe('enemy_team');
  });

  it('taux partiel émis (CreateRate 300 → 30%)', () => {
    const eff = resolveEffect({
      Type: 'BT_STUN',
      StatType: 'ST_NONE',
      Value: '0',
      BuffCCType: 'BLOCK_TURN',
      CreateRate: '300',
      TargetType: 'ENEMY',
    } as Row);
    expect(eff.category).toBe('cc');
    expect(eff.rate).toBe('30%');
  });
});
