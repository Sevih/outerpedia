/**
 * Versions archivées de wallpapers (`wallpaper-versions.ts`) : le nommage `@n`,
 * la numérotation dans un pool temporaire, et le seuil VISUEL qui distingue un
 * ré-encodage d'un vrai remplacement (images synthétiques via sharp).
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  archiveSuperseded,
  isArchivedVersion,
  looksDifferent,
  nextVersion,
  parseVersion,
  visualDistance,
} from './wallpaper-versions';

let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'wp-versions-'));
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

describe('nommage @n', () => {
  it('reconnaît et décompose un stem archivé', () => {
    expect(isArchivedVersion('T_CutIn_2000035@1')).toBe(true);
    expect(isArchivedVersion('T_CutIn_2000035')).toBe(false);
    expect(parseVersion('IMG_2000035@12')).toEqual({ base: 'IMG_2000035', n: 12 });
    expect(parseVersion('IMG_2000035')).toBeNull();
  });

  it('numérote à la suite des versions déjà archivées de la catégorie', () => {
    expect(nextVersion('Cutin', 'T_CutIn_1', root)).toBe(1);
    mkdirSync(join(root, 'Cutin'), { recursive: true });
    writeFileSync(join(root, 'Cutin', 'T_CutIn_1@1.png'), '');
    writeFileSync(join(root, 'Cutin', 'T_CutIn_1@1.webp'), '');
    writeFileSync(join(root, 'Cutin', 'T_CutIn_1@3.png'), '');
    writeFileSync(join(root, 'Cutin', 'T_CutIn_10@7.png'), ''); // autre base
    expect(nextVersion('Cutin', 'T_CutIn_1', root)).toBe(4);
    expect(nextVersion('Cutin', 'T_CutIn_2', root)).toBe(1);
  });

  it('archiveSuperseded copie chaque fichier sous le stem versionné, extension conservée', () => {
    const src = join(root, 'src');
    mkdirSync(src);
    writeFileSync(join(src, 'A.png'), 'png');
    writeFileSync(join(src, 'A.webp'), 'webp');
    const stem = archiveSuperseded('Banner', 'A', [join(src, 'A.png'), join(src, 'A.webp')], root);
    expect(stem).toBe('A@1');
    expect(nextVersion('Banner', 'A', root)).toBe(2);
  });
});

describe('seuil visuel', () => {
  const solid = (p: string, rgb: [number, number, number], w = 96, h = 64) =>
    sharp({
      create: { width: w, height: h, channels: 3, background: { r: rgb[0], g: rgb[1], b: rgb[2] } },
    })
      .png()
      .toFile(p);

  it('un ré-encodage (même image, autre format/qualité) passe SOUS le seuil', async () => {
    const a = join(root, 'a.png');
    const b = join(root, 'b.webp');
    await solid(a, [120, 80, 200]);
    await sharp(a).webp({ quality: 60 }).toFile(b);
    expect(await visualDistance(a, b)).toBeLessThan(2);
    expect(await looksDifferent(a, b)).toBe(false);
  });

  it('une image franchement différente ou de dimensions différentes est détectée', async () => {
    const a = join(root, 'a.png');
    const b = join(root, 'b.png');
    const c = join(root, 'c.png');
    await solid(a, [120, 80, 200]);
    await solid(b, [20, 220, 40]);
    await solid(c, [120, 80, 200], 97, 64);
    expect(await looksDifferent(a, b)).toBe(true);
    expect(await visualDistance(a, c)).toBe(Infinity);
  });
});
