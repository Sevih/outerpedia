import { describe, expect, it } from 'vitest';
import { buffValuesAt, fillPlaceholders, getMaxLevel, resolvePlaceholders } from './buff';
import type { Row } from './tables';

// Buff per-mille (OAT_RATE) : Value 10 (lv1) → 20 (lv5), CreateRate 1000, 1 tour
const rateBuff: Row[] = [
  {
    BuffID: 'B_RATE',
    Level: '1',
    ApplyingType: 'OAT_RATE',
    StatType: 'ST_HP',
    Value: '10',
    CreateRate: '1000',
    TurnDuration: '1',
  },
  {
    BuffID: 'B_RATE',
    Level: '5',
    ApplyingType: 'OAT_RATE',
    StatType: 'ST_HP',
    Value: '20',
    CreateRate: '1000',
    TurnDuration: '1',
  },
];
// Buff plat (OAT_ADD) : Value 250
const flatBuff: Row[] = [
  {
    BuffID: 'B_FLAT',
    Level: '1',
    ApplyingType: 'OAT_ADD',
    StatType: 'ST_SPEED',
    Value: '250',
    CreateRate: '0',
    TurnDuration: '2',
  },
];

const index = new Map<string, Row[]>([
  ['B_RATE', rateBuff],
  ['B_FLAT', flatBuff],
]);

describe('getMaxLevel', () => {
  it('renvoie le niveau max, défaut 1', () => {
    expect(getMaxLevel(index, 'B_RATE')).toBe(5);
    expect(getMaxLevel(index, 'B_FLAT')).toBe(1);
    expect(getMaxLevel(index, 'INCONNU')).toBe(1);
  });
});

describe('resolvePlaceholders', () => {
  it('per-mille : Value/10 en %, Rate = CreateRate/10', () => {
    expect(resolvePlaceholders('+[Value] HP for [Turn] turn at [Rate]', index, 'B_RATE', 1)).toBe(
      '+1% HP for 1 turn at 100%',
    );
    expect(resolvePlaceholders('[Value]', index, 'B_RATE', 5)).toBe('2%');
  });

  it('plat : Value entier sans %', () => {
    expect(resolvePlaceholders('+[Value] Speed', index, 'B_FLAT', 1)).toBe('+250 Speed');
  });

  it('niveau manquant → closest non géré ici : exact requis', () => {
    // B_FLAT n'a que le niveau 1 : demander niveau 3 ne matche pas → placeholder gardé
    expect(resolvePlaceholders('[Value]', index, 'B_FLAT', 3)).toBe('?');
  });

  it('buff inconnu → ?', () => {
    expect(resolvePlaceholders('[Value]', index, 'INCONNU', 1)).toBe('?');
  });
});

describe('buffValuesAt', () => {
  it('extrait value (per-mille), rate, turn', () => {
    expect(buffValuesAt(index, 'B_RATE', 1)).toEqual({ value: '1%', rate: '100%', turn: '1' });
    // pas de CreateRate → pas de clé rate
    expect(buffValuesAt(index, 'B_FLAT', 1)).toEqual({ value: '250', turn: '2' });
  });
});

describe('fillPlaceholders', () => {
  it('remplit depuis un objet de valeurs (template + values), avec option couleur', () => {
    const v = { value: '2%' };
    expect(fillPlaceholders('deal [Value] dmg', v)).toBe('deal 2% dmg');
    expect(fillPlaceholders('deal [Value] dmg', v, true)).toBe(
      'deal <color=#28d9ed>2%</color> dmg',
    );
  });

  it('placeholder sans valeur → ?', () => {
    expect(fillPlaceholders('[Value] for [Turn]', { value: '5%' })).toBe('5% for ?');
  });
});
