import { describe, expect, it } from 'vitest';
import {
  bool,
  groupBy,
  indexBy,
  num,
  numf,
  splitCsv,
  withCaseInsensitiveGet,
  type Row,
} from './tables';

const rows: Row[] = [
  { ID: 'A1', Name: 'Alpha', Group: 'G1' },
  { ID: 'A2', Name: 'Beta', Group: 'G1' },
  { ID: 'A3', Name: 'Gamma', Group: 'G2' },
  { Name: 'NoId', Group: 'G2' }, // ligne sans clé → ignorée
];

describe('indexBy', () => {
  it('indexe par la colonne ID par défaut', () => {
    const idx = indexBy(rows);
    expect(idx.get('A2')?.Name).toBe('Beta');
    expect(idx.size).toBe(3); // la ligne sans ID est exclue
  });

  it('indexe par une colonne arbitraire', () => {
    const idx = indexBy(rows, 'Name');
    expect(idx.get('Gamma')?.ID).toBe('A3');
  });

  it('lookup insensible à la casse', () => {
    const idx = indexBy(rows);
    expect(idx.get('a2')?.Name).toBe('Beta');
    // la casse exacte reste prioritaire et les clés gardent leur casse d'origine
    expect([...idx.keys()]).toContain('A2');
    expect([...idx.keys()]).not.toContain('a2');
  });
});

describe('withCaseInsensitiveGet', () => {
  it('préfère la correspondance exacte, retombe sur minuscules', () => {
    const m = withCaseInsensitiveGet(
      new Map([
        ['Foo', 1],
        ['foo', 2],
      ]),
    );
    expect(m.get('Foo')).toBe(1); // exact
    expect(m.get('foo')).toBe(2); // exact (l'autre casse)
    expect(m.get('FOO')).toBe(1); // repli minuscule → première entrée insérée ('Foo')
    expect(m.has('Foo')).toBe(true);
  });
});

describe('groupBy', () => {
  it('regroupe les lignes par clé', () => {
    const g = groupBy(rows, 'Group');
    expect(g.get('G1')?.map((r) => r.ID)).toEqual(['A1', 'A2']);
    expect(g.get('G2')?.length).toBe(2); // inclut la ligne sans ID (a un Group)
  });
});

describe('num', () => {
  it('parse les entiers, sinon 0', () => {
    expect(num('42')).toBe(42);
    expect(num('')).toBe(0);
    expect(num(undefined)).toBe(0);
    expect(num(null)).toBe(0);
    expect(num('abc')).toBe(0);
    expect(num('12px')).toBe(12); // parseInt tolère le suffixe
  });
});

describe('bool', () => {
  it('True/TRUE → true, sinon false', () => {
    expect(bool('True')).toBe(true);
    expect(bool('TRUE')).toBe(true);
    expect(bool('False')).toBe(false);
    expect(bool('FALSE')).toBe(false);
    expect(bool('')).toBe(false);
    expect(bool(undefined)).toBe(false);
  });
});

describe('numf', () => {
  it('parse les décimaux, sinon 0', () => {
    expect(numf('0.05')).toBe(0.05);
    expect(numf('3.5')).toBe(3.5);
    expect(numf('12')).toBe(12);
    expect(numf('')).toBe(0);
    expect(numf(undefined)).toBe(0);
    expect(numf('abc')).toBe(0);
  });
});

describe('splitCsv', () => {
  it('découpe, trim et filtre les vides', () => {
    expect(splitCsv('a, b ,c')).toEqual(['a', 'b', 'c']);
    expect(splitCsv('a,,b, ')).toEqual(['a', 'b']);
    expect(splitCsv('')).toEqual([]);
    expect(splitCsv(undefined)).toEqual([]);
  });
});
