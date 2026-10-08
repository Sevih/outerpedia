import { describe, expect, it } from 'vitest';
import {
  effectKeysById,
  effectPairKey,
  newEffectId,
  pairEffects,
} from '@/lib/admin/effect-catalog';
import type { MergedEffect } from '@/lib/data/effects';
import { emptyDict } from '@datagen/lib/lang';

const effect = (id: string, en: string, over: Partial<MergedEffect> = {}): MergedEffect => ({
  id,
  name: en ? { en } : {},
  desc: emptyDict(),
  icon: '',
  isDebuff: false,
  origin: 'tooltip',
  tooltips: [],
  iconEditorial: false,
  irremovable: false,
  hidden: false,
  overridden: false,
  ...over,
});
const debuff = (id: string, en: string, over: Partial<MergedEffect> = {}) =>
  effect(id, en, { isDebuff: true, ...over });
const ids = (list: MergedEffect[]) => list.map((e) => e.id);

describe('effectPairKey — le concept, aux mots de direction près', () => {
  it('retire les mots de direction et la ponctuation', () => {
    expect(effectPairKey(effect('1', 'Increased Defense'))).toBe('defense');
    expect(effectPairKey(effect('2', 'Reduced Defense'))).toBe('defense');
    expect(effectPairKey(effect('3', 'Crit. Hit Chance Reduction'))).toBe('crit hit chance');
  });

  it('une variante irremovable a sa clé à elle, un effet sans nom n’en a pas', () => {
    expect(effectPairKey(effect('4', 'Increased Speed', { irremovable: true }))).toBe('speed|irr');
    expect(effectPairKey(effect('5', ''))).toBe('');
  });
});

describe('pairEffects — paires miroir, puis orphelins', () => {
  it('apparie un buff et son debuff, les irremovable entre eux', () => {
    const { pairs, orphanBuffs, orphanDebuffs } = pairEffects([
      effect('15', 'Increased Speed'),
      debuff('1026', 'Reduced Speed', { irremovable: true }),
      debuff('26', 'Reduced Speed'),
      effect('1015', 'Increased Speed', { irremovable: true }),
    ]);
    expect(pairs.map((p) => [p.buff.id, p.debuff.id])).toEqual([
      ['15', '26'],
      ['1015', '1026'],
    ]);
    expect(orphanBuffs).toEqual([]);
    expect(orphanDebuffs).toEqual([]);
  });

  it('l’excédent d’un côté et les clés à un seul côté partent aux orphelins, par nom', () => {
    const { pairs, orphanBuffs, orphanDebuffs } = pairEffects([
      effect('1', 'Increased Attack'),
      effect('2', 'Attack Increase'),
      debuff('3', 'Reduced Attack'),
      effect('4', 'Barrier'),
      debuff('5', 'Stun'),
      debuff('6', 'Burn'),
    ]);
    expect(pairs.map((p) => [p.buff.id, p.debuff.id])).toEqual([['1', '3']]);
    expect(ids(orphanBuffs)).toEqual(['2', '4']);
    expect(ids(orphanDebuffs)).toEqual(['6', '5']);
  });

  it('les effets sans nom ferment leur colonne', () => {
    const { orphanBuffs, orphanDebuffs } = pairEffects([
      effect('9', ''),
      debuff('8', ''),
      effect('1', 'Zeal'),
      debuff('2', 'Zap'),
    ]);
    expect(ids(orphanBuffs)).toEqual(['1', '9']);
    expect(ids(orphanDebuffs)).toEqual(['2', '8']);
  });
});

describe('effectKeysById — les clés éditoriales d’un effet', () => {
  it('réunit l’index généré des deux côtés et les clés curées', () => {
    const keys = effectKeysById({
      byKey: {
        buff: { 'BT_STAT|ST_SPEED': '15', INCREASED_SPEED: '15' },
        debuff: { 'BT_STAT|ST_SPEED': '26' },
      },
      curated: { '15': { keys: ['HASTE', 'INCREASED_SPEED'] }, UNCOUNTERABLE: { keys: ['X'] } },
    });
    expect([...(keys.get('15') ?? [])]).toEqual(['BT_STAT|ST_SPEED', 'INCREASED_SPEED', 'HASTE']);
    expect([...(keys.get('26') ?? [])]).toEqual(['BT_STAT|ST_SPEED']);
    expect([...(keys.get('UNCOUNTERABLE') ?? [])]).toEqual(['X']);
    expect(keys.get('7')).toBeUndefined();
  });
});

describe('newEffectId — l’id d’une création', () => {
  it('capitales, blancs en `_`, rien pour une saisie blanche', () => {
    expect(newEffectId('  uncounterable ')).toBe('UNCOUNTERABLE');
    expect(newEffectId('fixed  damage')).toBe('FIXED_DAMAGE');
    expect(newEffectId('BT_SEAL_COUNTER')).toBe('BT_SEAL_COUNTER');
    expect(newEffectId('   ')).toBe('');
  });
});
