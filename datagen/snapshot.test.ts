/**
 * snapshot — l'instantané des entrées de `datagen:build`. Racine gamedata et
 * pool éditorial FACTICES dans un tmpdir (aucune dépendance `.gamedata`/
 * `.editorial`, CI-safe).
 */
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { PNG_HEADER_BYTES, readPngSize } from './lib/png';
import { snapshot, SNAPSHOT_STAMP } from './snapshot';

const dir = mkdtempSync(join(tmpdir(), 'snapshot-'));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

/** Un PNG « entier » : en-tête valide suivi de 4 Ko de données. */
function png(w: number, h: number): Buffer {
  const buf = Buffer.alloc(4096, 0xab);
  Buffer.from('89504e470d0a1a0a', 'hex').copy(buf, 0);
  buf.write('IHDR', 12, 'ascii');
  buf.writeUInt32BE(w, 16);
  buf.writeUInt32BE(h, 20);
  return buf;
}

function write(path: string, data: Buffer | string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, data);
}

/** Racine gamedata + pool éditorial minimaux, sous `dir/<name>`. */
function fixture(name: string): { root: string; editorial: string } {
  const root = join(dir, name, 'gamedata');
  const editorial = join(dir, name, 'editorial');
  write(join(root, 'parsed/ItemTemplet.json'), '{"rows":[]}');
  write(join(root, 'parsed/notes.txt'), 'pas une table');
  write(join(root, 'apk/dumped/dump.cs'), '// dump');
  write(join(root, 'files/bundles/manifest.dat'), 'xxxx,"version":"1.7.5"}');
  write(join(root, 'files/bundles/gros.bundle'), Buffer.alloc(2048));
  write(join(root, 'extracted/audio/bgm/Lobby.mp3'), Buffer.alloc(512, 1));
  write(join(root, 'extracted/images/assets/sprite/TI_Item_Coin.png'), png(128, 128));
  write(join(root, 'extracted/images/assets/sprite/TI_Item_Coin.txt'), 'méta');
  write(join(root, 'extracted/wallpapers/Full/T_Event_BG_003.png'), png(2048, 1024));
  write(join(editorial, 'Full/T_Event_BG_003@1.png'), png(1920, 1080));
  write(join(editorial, 'Full/T_Event_BG_003@1.webp'), Buffer.alloc(64));
  write(join(editorial, 'Cutin/T_CutIn_2000035@1.webp'), Buffer.alloc(96, 7));
  write(join(editorial, 'Outerpedia/logo.png'), png(1000, 1353));
  write(join(editorial, 'Outerpedia/logo.webp'), Buffer.alloc(64));
  return { root, editorial };
}

describe('snapshot', () => {
  it('emporte les sources du build, les images réduites à leur en-tête', async () => {
    const src = fixture('base');
    const out = join(dir, 'base', 'out');
    const report = await snapshot(out, src);

    expect(report).toEqual({
      resVersion: '1.7.5',
      tables: 1,
      images: 1,
      wallpapers: 1,
      bgm: 1,
      editorial: 3,
      removed: 0,
    });
    expect(readFileSync(join(out, 'parsed/ItemTemplet.json'), 'utf8')).toBe('{"rows":[]}');
    expect(statSync(join(out, 'extracted/audio/bgm/Lobby.mp3')).size).toBe(512);

    const sprite = join(out, 'extracted/images/assets/sprite/TI_Item_Coin.png');
    expect(statSync(sprite).size).toBe(PNG_HEADER_BYTES);
    expect(readPngSize(sprite)).toEqual({ w: 128, h: 128 });
    expect(readPngSize(join(out, 'extracted/wallpapers/Full/T_Event_BG_003.png'))).toEqual({
      w: 2048,
      h: 1024,
    });
    expect(readPngSize(join(out, 'editorial/wallpapers/Full/T_Event_BG_003@1.png'))).toEqual({
      w: 1920,
      h: 1080,
    });
    expect(readPngSize(join(out, 'editorial/wallpapers/Outerpedia/logo.png'))).toEqual({
      w: 1000,
      h: 1353,
    });
    // Archive sans PNG : sharp la lira, elle part entière.
    expect(statSync(join(out, 'editorial/wallpapers/Cutin/T_CutIn_2000035@1.webp')).size).toBe(96);

    // Ce que le build ne lit pas reste sur la machine de datamine.
    expect(existsSync(join(out, 'parsed/notes.txt'))).toBe(false);
    expect(existsSync(join(out, 'files/bundles/gros.bundle'))).toBe(false);
    expect(existsSync(join(out, 'extracted/images/assets/sprite/TI_Item_Coin.txt'))).toBe(false);
    expect(existsSync(join(out, 'editorial/wallpapers/Full/T_Event_BG_003@1.webp'))).toBe(false);
    expect(existsSync(join(out, 'editorial/wallpapers/Outerpedia/logo.webp'))).toBe(false);

    // Le marqueur porte le résumé sans `removed` (propre au run, pas à l'instantané).
    expect(JSON.parse(readFileSync(join(out, SNAPSHOT_STAMP), 'utf8'))).toEqual({
      ...report,
      removed: undefined,
    });
  });

  it('retire de la destination ce qui a disparu de la source, sans toucher au reste', async () => {
    const src = fixture('purge');
    const out = join(dir, 'purge', 'out');
    write(join(src.root, 'parsed/OldTemplet.json'), '{}');
    await snapshot(out, src);
    write(join(out, 'README.md'), '# à moi');
    write(join(out, '.git/HEAD'), 'ref: refs/heads/main');

    rmSync(join(src.root, 'parsed/OldTemplet.json'));
    const report = await snapshot(out, src);

    expect(report.removed).toBe(1);
    expect(existsSync(join(out, 'parsed/OldTemplet.json'))).toBe(false);
    expect(existsSync(join(out, 'parsed/ItemTemplet.json'))).toBe(true);
    expect(existsSync(join(out, 'README.md'))).toBe(true);
    expect(existsSync(join(out, '.git/HEAD'))).toBe(true);
  });

  it('accepte un clone frais (seul `.git`), refuse un dossier étranger', async () => {
    const src = fixture('garde');
    const fresh = join(dir, 'garde', 'clone');
    write(join(fresh, '.git/HEAD'), 'ref: refs/heads/main');
    await expect(snapshot(fresh, src)).resolves.toMatchObject({ tables: 1 });

    const foreign = join(dir, 'garde', 'ailleurs');
    write(join(foreign, 'parsed/Precieux.json'), '{}');
    await expect(snapshot(foreign, src)).rejects.toThrow(/ni vide ni un instantané/);
    expect(existsSync(join(foreign, 'parsed/Precieux.json'))).toBe(true);
  });

  it('refuse la racine gamedata elle-même ou un dossier qui la recouvre', async () => {
    const src = fixture('racine');
    const sprite = join(src.root, 'extracted/images/assets/sprite/TI_Item_Coin.png');
    await expect(snapshot(src.root, src)).rejects.toThrow(/recouvre la racine gamedata/);
    await expect(snapshot(join(src.root, 'extracted'), src)).rejects.toThrow(/recouvre/);
    await expect(snapshot(join(dir, 'racine'), src)).rejects.toThrow(/recouvre/);
    expect(statSync(sprite).size).toBe(4096);
  });

  it('s’arrête sur une source absente plutôt que de livrer un instantané partiel', async () => {
    const src = fixture('trou');
    rmSync(join(src.root, 'extracted/wallpapers'), { recursive: true });
    const out = join(dir, 'trou', 'out');
    await expect(snapshot(out, src)).rejects.toThrow(/source absente .*wallpapers/);
    expect(existsSync(out)).toBe(false);
  });
});
