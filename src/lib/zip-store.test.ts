/**
 * Le zip STORE du téléchargement par sélection de l'OST : CRC-32 de référence,
 * structure relue octet par octet, et une archive acceptée par un lecteur
 * tiers (`python3 -m zipfile -t`, qui revérifie les CRC).
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildZip, crc32 } from './zip-store';

const bytes = (s: string) => new TextEncoder().encode(s) as Uint8Array<ArrayBuffer>;

interface ReadEntry {
  name: string;
  flags: number;
  method: number;
  crc: number;
  size: number;
  data: Uint8Array;
}

/** Lecteur minimal : fin de répertoire → répertoire central → en-têtes locaux. */
function readZip(buf: Uint8Array): ReadEntry[] {
  const v = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const dec = new TextDecoder();
  const eocd = buf.length - 22;
  expect(v.getUint32(eocd, true)).toBe(0x06054b50);
  const count = v.getUint16(eocd + 10, true);
  expect(v.getUint16(eocd + 8, true)).toBe(count);
  const cdSize = v.getUint32(eocd + 12, true);
  const cdOffset = v.getUint32(eocd + 16, true);
  expect(cdOffset + cdSize).toBe(eocd);

  const out: ReadEntry[] = [];
  let p = cdOffset;
  for (let i = 0; i < count; i++) {
    expect(v.getUint32(p, true)).toBe(0x02014b50);
    const flags = v.getUint16(p + 8, true);
    const method = v.getUint16(p + 10, true);
    const crc = v.getUint32(p + 16, true);
    const csize = v.getUint32(p + 20, true);
    const size = v.getUint32(p + 24, true);
    expect(csize).toBe(size);
    const nameLen = v.getUint16(p + 28, true);
    const extraLen = v.getUint16(p + 30, true);
    const commentLen = v.getUint16(p + 32, true);
    const localOffset = v.getUint32(p + 42, true);
    const name = dec.decode(buf.subarray(p + 46, p + 46 + nameLen));

    expect(v.getUint32(localOffset, true)).toBe(0x04034b50);
    expect(v.getUint16(localOffset + 6, true)).toBe(flags);
    expect(v.getUint32(localOffset + 14, true)).toBe(crc);
    expect(v.getUint32(localOffset + 22, true)).toBe(size);
    const localNameLen = v.getUint16(localOffset + 26, true);
    const localExtraLen = v.getUint16(localOffset + 28, true);
    expect(dec.decode(buf.subarray(localOffset + 30, localOffset + 30 + localNameLen))).toBe(name);
    const start = localOffset + 30 + localNameLen + localExtraLen;
    out.push({ name, flags, method, crc, size, data: buf.subarray(start, start + size) });
    p += 46 + nameLen + extraLen + commentLen;
  }
  expect(p).toBe(eocd);
  return out;
}

const SAMPLE = [
  { name: 'Battle_01.mp3', data: bytes('ID3 première piste') },
  { name: 'Thème — été.mp3', data: new Uint8Array(1000).map((_, i) => i % 251) },
];

describe('crc32', () => {
  it('valeur de contrôle standard', () => {
    expect(crc32(bytes('123456789'))).toBe(0xcbf43926);
    expect(crc32(new Uint8Array(0))).toBe(0);
  });
});

describe('buildZip', () => {
  it('deux entrées STORE relues : signatures, offsets, tailles, noms UTF-8', async () => {
    const zip = new Uint8Array(await buildZip(SAMPLE).arrayBuffer());
    const entries = readZip(zip);
    expect(entries.map((e) => e.name)).toEqual(SAMPLE.map((e) => e.name));
    entries.forEach((e, i) => {
      expect(e.method).toBe(0);
      expect(e.flags & 0x0800).toBe(0x0800);
      expect(e.size).toBe(SAMPLE[i].data.length);
      expect(e.crc).toBe(crc32(SAMPLE[i].data));
      expect([...e.data]).toEqual([...SAMPLE[i].data]);
    });
    // Rien d'autre que les morceaux attendus : en-têtes + données + répertoire + fin.
    const names = SAMPLE.reduce((n, e) => n + new TextEncoder().encode(e.name).length, 0);
    const data = SAMPLE.reduce((n, e) => n + e.data.length, 0);
    expect(zip.length).toBe(30 * 2 + 46 * 2 + names * 2 + data + 22);
  });

  it('archive vide valide (fin de répertoire seule)', async () => {
    const zip = new Uint8Array(await buildZip([]).arrayBuffer());
    expect(zip.length).toBe(22);
    expect(readZip(zip)).toEqual([]);
  });

  const hasPython = spawnSync('python3', ['--version']).status === 0;
  it.skipIf(!hasPython)('acceptée par python3 -m zipfile -t', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'zip-store-'));
    try {
      const file = join(dir, 'sample.zip');
      writeFileSync(file, new Uint8Array(await buildZip(SAMPLE).arrayBuffer()));
      const test = spawnSync('python3', ['-m', 'zipfile', '-t', file], { encoding: 'utf8' });
      expect(test.stderr).toBe('');
      expect(test.status).toBe(0);
      const list = spawnSync('python3', ['-m', 'zipfile', '-l', file], { encoding: 'utf8' });
      for (const e of SAMPLE) expect(list.stdout).toContain(e.name);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
