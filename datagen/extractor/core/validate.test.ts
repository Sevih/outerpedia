import { describe, expect, it } from 'vitest';
import { validate, type Schema } from './validate';

describe('validate — primitives', () => {
  it('accepte string/number/boolean conformes', () => {
    expect(validate('x', { kind: 'string' })).toEqual([]);
    expect(validate(3, { kind: 'number', int: true, min: 0 })).toEqual([]);
    expect(validate(true, { kind: 'boolean' })).toEqual([]);
  });

  it('signale les types erronés', () => {
    expect(validate(3, { kind: 'string' })).toHaveLength(1);
    expect(validate('3', { kind: 'number' })).toHaveLength(1);
    expect(validate(1.5, { kind: 'number', int: true })).toHaveLength(1);
    expect(validate(-1, { kind: 'number', min: 0 })).toHaveLength(1);
    expect(validate(Number.NaN, { kind: 'number' })).toHaveLength(1);
  });

  it('gère optional : absent OK si optionnel, écart sinon', () => {
    expect(validate(undefined, { kind: 'string', optional: true })).toEqual([]);
    expect(validate(undefined, { kind: 'string' })).toHaveLength(1);
    expect(validate(null, { kind: 'string' })).toHaveLength(1);
  });

  it('respecte enum', () => {
    const s: Schema = { kind: 'string', enum: ['a', 'b'] };
    expect(validate('a', s)).toEqual([]);
    expect(validate('c', s)).toHaveLength(1);
  });
});

describe('validate — langDict', () => {
  it('exige les 4 langues officielles en string', () => {
    expect(validate({ en: 'a', jp: 'b', kr: 'c', zh: 'd' }, { kind: 'langDict' })).toEqual([]);
    expect(validate({ en: 'a', jp: 'b', kr: 'c' }, { kind: 'langDict' })).toHaveLength(1); // zh manquant
  });
});

describe('validate — composites', () => {
  it('array : éléments + minItems', () => {
    const s: Schema = { kind: 'array', of: { kind: 'string' }, minItems: 1 };
    expect(validate(['a'], s)).toEqual([]);
    expect(validate([], s)).toHaveLength(1);
    expect(validate(['a', 2], s)).toHaveLength(1); // 2 n'est pas string
  });

  it('record : valeurs typées', () => {
    const s: Schema = { kind: 'record', of: { kind: 'number' } };
    expect(validate({ a: 1, b: 2 }, s)).toEqual([]);
    expect(validate({ a: 1, b: 'x' }, s)).toHaveLength(1);
  });

  it('object : champs + chemins traçables', () => {
    const s: Schema = {
      kind: 'object',
      fields: { id: { kind: 'string' }, n: { kind: 'number', optional: true } },
    };
    expect(validate({ id: 'x' }, s)).toEqual([]);
    const issues = validate({ id: 5 }, s, '$root');
    expect(issues).toHaveLength(1);
    expect(issues[0].path).toBe('$root.id');
  });
});
