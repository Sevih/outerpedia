/**
 * INSTANTANÉ des entrées de `datagen:build` (`pnpm datagen:snapshot <dossier>`).
 *
 * `.gamedata/` pèse 22 Go et ne quitte pas la machine de datamine ; le build,
 * lui, n'en lit qu'une fraction. Ce module recopie CETTE fraction dans un
 * dossier à part (le clone du dépôt privé `outerpedia-gamedata`), sous la même
 * arborescence : une machine sans datamine — une session cloud — lance alors
 * `GAMEDATA_ROOT=<dossier> pnpm datagen:build` et retrouve `data/extracted/`
 * à l'identique (constat du 09/10/2026 : 65 fichiers sur 65).
 *
 * Ce que le build lit, donc ce que l'instantané emporte :
 *   - ENTIERS : `parsed/` (les tables), `apk/dumped/dump.cs`,
 *     `files/bundles/manifest.dat`, `extracted/audio/bgm/*.mp3` (le mapping
 *     de l'OST mesure leur taille et leur durée par ffprobe) ;
 *   - EN-TÊTE SEUL (`PNG_HEADER_BYTES`) : les PNG de `extracted/images` et de
 *     `extracted/wallpapers`. Les générateurs n'en lisent que le NOM
 *     (`buildImageIndex`, l'index d'icônes de `goods`) et les dimensions
 *     (`readPngSize`) : 2,4 Go tiennent en ~350 Ko ;
 *   - les PNG de `.editorial/wallpapers` (en-tête aussi), rangés sous
 *     `editorial/` : `wallpapers.ts` y lit la catégorie Outerpedia et les
 *     versions archivées `@n`. Ce pool vit HORS de la racine gamedata : à
 *     recopier dans `.editorial/wallpapers/` du clone d'outerpedia.
 *
 * Un générateur qui se met à lire autre chose sous `.gamedata/` doit l'ajouter
 * ICI, sinon le build de l'instantané diverge en silence de celui de la machine
 * outillée. L'extraction (bundles → tables) et la collecte d'images ne sont pas
 * couvertes : elles restent locales.
 *
 * Le module remplit le dossier, rien de plus : ni commit ni push.
 */
import {
  closeSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  openSync,
  readdirSync,
  readSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { buildGameVersion } from './generators/game-version';
import { walkFiles } from './lib/fs';
import { isMain } from './lib/is-main';
import { writeJson } from './lib/json';
import { gamedataRoot } from './lib/paths';
import { PNG_HEADER_BYTES } from './lib/png';

/** Marqueur d'un dossier d'instantané (et son résumé) — cf. `assertDestination`. */
export const SNAPSHOT_STAMP = 'snapshot.json';

/**
 * Sous-arbres de la destination que l'instantané POSSÈDE : un fichier qui s'y
 * trouve sans avoir été écrit par ce run est retiré (table disparue du jeu,
 * sprite renommé). Le reste du dossier (`.git`, un README) n'est jamais touché.
 */
const OWNED = ['parsed', 'apk', 'files', 'extracted', 'editorial'];

export interface SnapshotOptions {
  /** Racine gamedata lue (défaut : `GAMEDATA_ROOT`, sinon `.gamedata`). */
  root?: string;
  /** Pool éditorial des wallpapers (défaut : `.editorial/wallpapers`). */
  editorial?: string;
}

/** Le résumé écrit dans `snapshot.json` : déterministe, donc sans diff à vide. */
export interface SnapshotStamp {
  resVersion: string | null;
  tables: number;
  images: number;
  wallpapers: number;
  bgm: number;
  editorial: number;
}

export interface SnapshotReport extends SnapshotStamp {
  /** Fichiers périmés retirés de la destination par ce run. */
  removed: number;
}

/** Les `PNG_HEADER_BYTES` premiers octets d'un fichier (moins s'il est plus court). */
function readHead(path: string): Buffer {
  const buf = Buffer.alloc(PNG_HEADER_BYTES);
  const fd = openSync(path, 'r');
  try {
    return buf.subarray(0, readSync(fd, buf, 0, PNG_HEADER_BYTES, 0));
  } finally {
    closeSync(fd);
  }
}

const real = (p: string): string => (existsSync(p) ? realpathSync(p) : p);
const within = (a: string, b: string): boolean => a === b || a.startsWith(b + sep);

/**
 * Refuse une destination qui n'est pas un dossier d'instantané. L'écriture
 * TRONQUE les images et la purge efface ce qu'elle n'a pas écrit : pointée sur
 * `.gamedata/` elle détruirait le pool extrait. Acceptés : un dossier absent,
 * vide (`.git` mis à part — le clone frais), ou déjà marqué `snapshot.json`.
 */
function assertDestination(out: string, root: string): void {
  if (within(real(out), real(root)) || within(real(root), real(out))) {
    throw new Error(`destination refusée : ${out} recouvre la racine gamedata (${root}).`);
  }
  if (!existsSync(out)) return;
  const entries = readdirSync(out).filter((e) => e !== '.git');
  if (entries.length > 0 && !entries.includes(SNAPSHOT_STAMP)) {
    throw new Error(
      `destination refusée : ${out} n'est ni vide ni un instantané (${SNAPSHOT_STAMP} absent).`,
    );
  }
}

/** Recopie dans `dest` les entrées de `datagen:build` et purge ce qui a disparu. */
export async function snapshot(dest: string, opts: SnapshotOptions = {}): Promise<SnapshotReport> {
  const root = resolve(opts.root ?? gamedataRoot());
  const editorial = resolve(opts.editorial ?? '.editorial/wallpapers');
  const out = resolve(dest);
  assertDestination(out, root);

  // Une source absente ARRÊTE tout : un instantané partiel donnerait un build
  // qui passe avec des sorties amputées (wallpapers vides, icônes à blanc).
  const need = (path: string, hint: string): string => {
    if (!existsSync(path)) throw new Error(`source absente : ${path} — ${hint}`);
    return path;
  };
  const parsed = need(join(root, 'parsed'), '`pnpm datagen:convert`.');
  const dump = need(join(root, 'apk/dumped/dump.cs'), '`pnpm datagen:dump`.');
  const manifest = need(join(root, 'files/bundles/manifest.dat'), '`pnpm datagen:pull`.');
  const bgmDir = need(join(root, 'extracted/audio/bgm'), '`pnpm datagen:extract-audio`.');
  const images = need(join(root, 'extracted/images'), '`pnpm datagen:extract`.');
  const pool = need(join(root, 'extracted/wallpapers'), '`pnpm datagen:extract-wallpapers`.');
  need(editorial, '`pnpm editorial:pull`.');

  const written = new Set<string>();
  const put = (rel: string, src: string, headOnly = false): void => {
    const target = join(out, rel);
    mkdirSync(dirname(target), { recursive: true });
    if (headOnly) writeFileSync(target, readHead(src));
    else copyFileSync(src, target);
    written.add(rel);
  };
  /**
   * Dépose l'en-tête de chaque PNG de `dir` (récursif). Une version archivée
   * `@n` qui n'existe qu'en `.webp` part ENTIÈRE : `wallpapers.ts` l'ouvre
   * alors avec sharp, qui a besoin du fichier complet.
   */
  const putHeads = (dir: string, prefix: string): number => {
    let n = 0;
    walkFiles(dir, (abs, rel) => {
      if (/\.png$/i.test(rel)) put(`${prefix}/${rel}`, abs, true);
      else if (/@[^/]*\.webp$/i.test(rel) && !existsSync(abs.replace(/\.webp$/i, '.png')))
        put(`${prefix}/${rel}`, abs);
      else return;
      n++;
    });
    return n;
  };

  const tables = readdirSync(parsed).filter((f) => f.endsWith('.json'));
  for (const f of tables) put(`parsed/${f}`, join(parsed, f));
  put('apk/dumped/dump.cs', dump);
  // Le tampon du dump n'est pas lu par le build (`damage:check` le compare) :
  // il suit quand il existe, pour que l'instantané dise de quel client il vient.
  const dumpStamp = join(root, 'apk/dumped/.dump-stamp.json');
  if (existsSync(dumpStamp)) put('apk/dumped/.dump-stamp.json', dumpStamp);
  put('files/bundles/manifest.dat', manifest);
  const bgm = readdirSync(bgmDir).filter((f) => f.toLowerCase().endsWith('.mp3'));
  for (const f of bgm) put(`extracted/audio/bgm/${f}`, join(bgmDir, f));

  const stamp: SnapshotStamp = {
    resVersion: buildGameVersion(manifest)?.resVersion ?? null,
    tables: tables.length,
    images: putHeads(images, 'extracted/images'),
    wallpapers: putHeads(pool, 'extracted/wallpapers'),
    bgm: bgm.length,
    editorial: putHeads(editorial, 'editorial/wallpapers'),
  };

  const stale: string[] = [];
  for (const top of OWNED) {
    const dir = join(out, top);
    if (!existsSync(dir)) continue;
    walkFiles(dir, (abs, rel) => {
      if (!written.has(`${top}/${rel}`)) stale.push(abs);
    });
  }
  for (const abs of stale) rmSync(abs);

  await writeJson(join(out, SNAPSHOT_STAMP), stamp);
  return { ...stamp, removed: stale.length };
}

if (isMain(import.meta.url)) {
  const dest = process.argv[2];
  if (!dest) {
    console.error('Usage : pnpm datagen:snapshot <dossier> (le clone de outerpedia-gamedata)');
    process.exit(1);
  }
  snapshot(dest)
    .then((r) => {
      console.log(
        `instantané ${r.resVersion ?? '(version inconnue)'} → ${resolve(dest)}\n` +
          `  ${r.tables} tables, ${r.bgm} mp3, ${r.images} images et ${r.wallpapers} wallpapers ` +
          `(en-têtes), ${r.editorial} wallpapers éditoriaux — ${r.removed} fichier(s) périmé(s) retiré(s)`,
      );
    })
    .catch((e) => {
      console.error(`\n\x1b[31mErreur : ${e?.message ?? e}\x1b[0m`);
      process.exit(1);
    });
}
