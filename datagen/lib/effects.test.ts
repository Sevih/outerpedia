import { describe, expect, it } from 'vitest';
import {
  classifyCategory,
  classifyFamily,
  effectShape,
  resolveEffect,
  resolveKeyWinners,
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

describe('effectShape', () => {
  it('garde la structure, retire value/rate/turn (scalaires par niveau)', () => {
    const shape = effectShape({
      Type: 'BT_STAT',
      StatType: 'ST_ATK',
      ApplyingType: 'OAT_RATE',
      Value: '-300',
      CreateRate: '700',
      TurnDuration: '2',
      TargetType: 'ENEMY',
      BuffDebuffType: 'DEBUFF',
      IsDebuff: 'True',
      BuffID: '2000001_3_1',
    } as Row);
    expect(shape).toEqual({
      family: 'stat',
      category: 'debuff',
      type: 'BT_STAT',
      target: 'enemy',
      buff: '2000001_3_1',
      stat: 'atk',
      mode: 'down',
    });
    expect('value' in shape).toBe(false);
    expect('rate' in shape).toBe(false);
    expect('turn' in shape).toBe(false);
  });
});

describe('resolveKeyWinners — vote croisé (non-régression c9ce852)', () => {
  /** Vote synthétique : slot `side|clé` → effet → nombre de voix. */
  const votesOf = (entries: Array<[string, Array<[string, number]>]>) =>
    new Map(entries.map(([slot, m]) => [slot, new Map(m)]));

  it('le scénario Q18 : la clé volée par un tooltip fuité revient à la création curée', () => {
    // « Taunted » a son foyer en BT_AGGRO (10 voix) ; le buff composite du boss
    // Q18 fait fuiter son tooltip dans BT_SEALED_RESURRECTION (1 voix, seule).
    const votes = votesOf([
      ['debuff|BT_AGGRO', [['taunted', 10]]],
      ['debuff|BT_SEALED_RESURRECTION', [['taunted', 1]]],
    ]);
    const claims = new Map([['BT_SEALED_RESURRECTION', 'EXTINCTION']]);
    const byKey = resolveKeyWinners(votes, claims);
    // La clé volée est RÉASSIGNÉE à la création ; le foyer réel ne bouge pas.
    expect(byKey.debuff.get('BT_SEALED_RESURRECTION')).toBe('EXTINCTION');
    expect(byKey.debuff.get('BT_AGGRO')).toBe('taunted');
  });

  it('sans réclamation curée, le gagnant croisé reste (pas de trou dans byKey)', () => {
    const votes = votesOf([
      ['debuff|BT_AGGRO', [['taunted', 10]]],
      ['debuff|BT_SEALED_RESURRECTION', [['taunted', 1]]],
    ]);
    const byKey = resolveKeyWinners(votes, new Map());
    expect(byKey.debuff.get('BT_SEALED_RESURRECTION')).toBe('taunted');
  });

  it('pas de vol quand le vote n’est PAS croisé : la clé est le foyer du gagnant', () => {
    // L'effet gagne SON propre foyer — la création curée ne prime pas.
    const votes = votesOf([['buff|BT_COOL_CHARGE', [['cooldown_up', 3]]]]);
    const claims = new Map([['BT_COOL_CHARGE', 'CREATION_CUREE']]);
    const byKey = resolveKeyWinners(votes, claims);
    expect(byKey.buff.get('BT_COOL_CHARGE')).toBe('cooldown_up');
  });

  it('le gagnant d’un slot est l’effet MAJORITAIRE', () => {
    const votes = votesOf([
      [
        'buff|BT_STAT|ST_ATK',
        [
          ['atk_up', 7],
          ['autre', 2],
        ],
      ],
    ]);
    expect(resolveKeyWinners(votes, new Map()).buff.get('BT_STAT|ST_ATK')).toBe('atk_up');
  });

  it('déclinaison numérotée : BT_COOL2_CHARGE hérite de BT_COOL_CHARGE côté par côté', () => {
    const votes = votesOf([
      ['buff|BT_COOL_CHARGE', [['cool_buff', 5]]],
      ['debuff|BT_COOL_CHARGE', [['cool_debuff', 2]]],
      ['buff|BT_COOL2_CHARGE', [['cool2_specifique', 1]]],
    ]);
    const byKey = resolveKeyWinners(votes, new Map());
    // Côté buff : la résolution PROPRE de la clé numérotée n'est pas écrasée.
    expect(byKey.buff.get('BT_COOL2_CHARGE')).toBe('cool2_specifique');
    // Côté debuff : aucun vote → hérite de la forme sans chiffres.
    expect(byKey.debuff.get('BT_COOL2_CHARGE')).toBe('cool_debuff');
  });
});
