/**
 * readPngSize — lecture des dimensions par l'en-tête PNG (24 octets). Fichiers
 * réels dans un tmpdir (aucune dépendance `.gamedata`/`data/`, CI-safe).
 */
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { readPngSize } from './png';

const dir = mkdtempSync(join(tmpdir(), 'png-'));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

/** En-tête PNG de 24 octets : signature + IHDR (largeur/hauteur BE en 16/20). */
function pngHeader(w: number, h: number): Buffer {
  const buf = Buffer.alloc(24);
  Buffer.from('89504e470d0a1a0a', 'hex').copy(buf, 0); // signature
  buf.write('IHDR', 12, 'ascii'); // nom du chunk (offsets 8-11 = longueur, ignorée)
  buf.writeUInt32BE(w, 16);
  buf.writeUInt32BE(h, 20);
  return buf;
}

function write(name: string, data: Buffer | string): string {
  const p = join(dir, name);
  writeFileSync(p, data);
  return p;
}

describe('readPngSize', () => {
  it('lit largeur × hauteur d’un en-tête PNG valide', () => {
    expect(readPngSize(write('ok.png', pngHeader(2048, 1024)))).toEqual({ w: 2048, h: 1024 });
  });

  it('signature absente (pas un PNG) → null', () => {
    expect(readPngSize(write('pas-png.bin', Buffer.alloc(24, 0xff)))).toBeNull();
  });

  it('fichier illisible / inexistant → null', () => {
    expect(readPngSize(join(dir, 'inexistant.png'))).toBeNull();
  });
});
