import { describe, it, expect } from 'vitest';
import { parseBytes } from './bytes-parser';

// Helpers pour fabriquer un buffer .bytes synthétique (format .NET BinaryWriter).
function varint(n: number): Buffer {
  const out: number[] = [];
  do {
    let b = n & 0x7f;
    n >>>= 7;
    if (n) b |= 0x80;
    out.push(b);
  } while (n);
  return Buffer.from(out);
}
function str(s: string): Buffer {
  const body = Buffer.from(s, 'utf8');
  return Buffer.concat([varint(body.length), body]);
}
function u32(n: number): Buffer {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(n);
  return b;
}
function i32(n: number): Buffer {
  const b = Buffer.alloc(4);
  b.writeInt32LE(n);
  return b;
}

describe('parseBytes', () => {
  it('parse une table simple (colonnes + lignes)', () => {
    const buf = Buffer.concat([
      str('MyTemplet'), // nom de table
      u32(2), // 2 lignes
      u32(2), // 2 colonnes
      str('id'),
      str('name'),
      // ligne 1 : 2 champs
      u32(2),
      i32(0),
      str('5'),
      i32(1),
      str('Alpha'),
      // ligne 2 : 2 champs
      u32(2),
      i32(0),
      str('6'),
      i32(1),
      str('Bêta'), // UTF-8 multioctet
    ]);

    const result = parseBytes(buf);
    expect(result.table).toBe('MyTemplet');
    expect(result.columns).toEqual(['id', 'name']);
    expect(result.rows).toEqual([
      { id: '5', name: 'Alpha' },
      { id: '6', name: 'Bêta' },
    ]);
  });

  it('range les champs hors colonnes sous _unknown_N', () => {
    const buf = Buffer.concat([
      str('T'),
      u32(1),
      u32(1),
      str('id'),
      u32(2),
      i32(0),
      str('1'),
      i32(-1),
      str('extra'),
    ]);
    expect(parseBytes(buf).rows).toEqual([{ id: '1', _unknown_0: 'extra' }]);
  });

  it('lève une erreur si le buffer est incohérent', () => {
    const buf = Buffer.concat([str('T'), u32(1), u32(0), u32(0) /* ligne 0 champ, mais... */]);
    // Ici 1 ligne attendue avec 0 champ : pos == len → OK. On teste plutôt un buffer tronqué.
    const truncated = buf.subarray(0, buf.length - 1);
    expect(() => parseBytes(truncated)).toThrow();
  });
});
