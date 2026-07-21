/**
 * pull-gamedata — synchronise le dossier `files` du jeu depuis une instance
 * LDPlayer (Android) vers `.gamedata/files/`, en INCRÉMENTAL et RÉCURSIF.
 *
 * Détection des changements (fiable) :
 *  - dossiers "content-addressed" (bundles) : le nom EST le hash du contenu, donc
 *    un fichier modifié change de nom → forcément re-tiré (signature = taille).
 *  - autres dossiers (il2cpp...) : signature = md5 du contenu → un changement à
 *    taille identique est quand même détecté (peu de fichiers → rapide).
 * On supprime aussi en local les fichiers qui n'existent plus côté jeu.
 *
 * Le transfert est INCRÉMENTAL POUR DE BON : les fichiers du diff partent par
 * lots dans un `tar` monté côté device (cf. `pullBatch`), jamais en re-tirant
 * le dossier. C'est ce qui rend le coût proportionnel au CHANGEMENT et non aux
 * 19 Go du miroir.
 *
 * Prérequis : LDPlayer lancé, Outerplane installé (idéalement à jour).
 *
 * Usage :
 *   pnpm datagen:pull            # bundles + il2cpp (par défaut)
 *   pnpm datagen:pull il2cpp     # un sous-dossier précis
 *
 * Le chemin de l'adb LDPlayer peut être surchargé via ADB_PATH.
 */
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { walkFiles } from '../lib/fs';
import { isMain } from '../lib/is-main';
import { ADB, PKG, capture, ensureRoot, pickDevice, stream } from './adb';

const REMOTE = `/sdcard/Android/data/${PKG}/files`;
const LOCAL = resolve('.gamedata/files');

// Sous-dossiers source réellement utiles (on ignore promos / cookies / cache).
const DEFAULT_SUBDIRS = ['bundles', 'il2cpp'];

// Dossiers dont les noms = hash de contenu : la comparaison par nom+taille suffit.
// Les autres sont comparés par md5 (contenu) pour ne rater aucun changement.
const CONTENT_ADDRESSED = new Set(['bundles']);

/**
 * Fichiers par lot du pull incrémental. Un lot = UN transfert (tar), donc le
 * découpage ne sert qu'à donner une progression lisible et à borner la perte
 * si ça coupe en route.
 */
const BATCH_FILES = 300;

/** Signatures distantes { chemin relatif → signature } (taille ou md5). */
function remoteSignatures(serial: string, baseDir: string, useHash: boolean): Map<string, string> {
  const map = new Map<string, string>();
  if (useHash) {
    // md5 récursif via toybox : "hash  ./chemin/relatif"
    const out = capture([
      '-s',
      serial,
      'shell',
      `cd ${baseDir} && find . -type f -exec md5sum {} +`,
    ]);
    for (const line of out.split(/\r?\n/)) {
      const m = line.match(/^([0-9a-f]{32})\s+\.\/(.+)$/);
      if (m) map.set(m[2], m[1]);
    }
    return map;
  }
  // taille récursive via ls -lR
  const out = capture(['-s', serial, 'shell', `ls -lR ${baseDir}`]);
  let curDir = '';
  for (const raw of out.split(/\r?\n/)) {
    const line = raw.trimEnd();
    if (!line) continue;
    if (line.endsWith(':')) {
      curDir = line.slice(0, -1);
      continue;
    }
    if (line.startsWith('total ')) continue;
    if (!line.startsWith('-')) continue;
    const parts = line.split(/\s+/);
    if (parts.length < 8) continue;
    const size = parts[4];
    const name = parts.slice(7).join(' ');
    const rel = `${curDir}/${name}`.slice(baseDir.length + 1);
    if (rel) map.set(rel, size);
  }
  return map;
}

/** Signatures locales { chemin relatif → signature } (taille ou md5), récursif. */
function localSignatures(baseDir: string, useHash: boolean): Map<string, string> {
  const map = new Map<string, string>();
  if (!existsSync(baseDir)) return map;
  // Parcours partagé (lib/fs) — les clés `rel` en `/` se comparent aux
  // listings Android de remoteSignatures.
  walkFiles(baseDir, (abs, rel) => {
    map.set(
      rel,
      useHash
        ? createHash('md5').update(readFileSync(abs)).digest('hex')
        : String(statSync(abs).size),
    );
  });
  return map;
}

/** `tar` utilisable des DEUX côtés (device toybox + hôte) ? Sinon repli. */
function tarAvailable(serial: string): boolean {
  try {
    if (spawnSync('tar', ['--version'], { stdio: 'ignore' }).status !== 0) return false;
    return capture(['-s', serial, 'shell', 'which tar']).trim().length > 0;
  } catch {
    return false;
  }
}

/** Liste des fichiers d'un lot, DÉPOSÉE sur le device (cf. `pullBatch`). */
const REMOTE_LIST = '/data/local/tmp/outerpedia-pull-list.txt';
const LOCAL_LIST = resolve('.gamedata/.pull-list.txt');

/**
 * Tire UN LOT de fichiers en un seul transfert : `tar` côté device empaquette,
 * `tar` local dépaquette, les octets passant en FLUX — rien n'est mis en
 * mémoire, quel que soit le poids du lot.
 *
 * La liste des chemins voyage par un FICHIER poussé sur le device, et non par
 * stdin : `adb exec-out` ne relaie PAS l'entrée standard (vérifié 2026-07-21 —
 * un `exec-out cat` alimenté par un pipe ne rend jamais la main), donc un
 * `tar -T -` attendrait indéfiniment. Le fichier lève du même coup toute limite
 * de longueur de ligne de commande : un lot peut porter autant de chemins qu'on
 * veut.
 *
 * `exec-out` (et pas `shell`) : le canal doit être BINAIRE — `adb shell`
 * traduit les fins de ligne et corromprait l'archive.
 */
function pullBatch(serial: string, remoteDir: string, localDir: string): Promise<void> {
  return new Promise((ok, ko) => {
    const src = spawn(
      ADB,
      ['-s', serial, 'exec-out', `cd '${remoteDir}' && tar cf - -T ${REMOTE_LIST}`],
      { stdio: ['ignore', 'pipe', 'inherit'] },
    );
    // Destination donnée par le `cwd` du process, PAS par `-C` : le tar GNU de
    // Git Bash lit le « C: » d'un chemin Windows comme un hôte distant
    // (« C:\Users\… : Cannot open ») — le cwd ne traverse aucun parseur.
    const dst = spawn('tar', ['xf', '-'], {
      cwd: localDir,
      stdio: ['pipe', 'inherit', 'inherit'],
    });
    src.stdout.pipe(dst.stdin);

    let pending = 2;
    const settle = (who: string, code: number | null) => {
      if (code !== 0) return ko(new Error(`${who} a échoué (code ${code})`));
      if (--pending === 0) ok();
    };
    src.on('error', ko);
    dst.on('error', ko);
    src.on('close', (c) => settle('tar (device)', c));
    dst.on('close', (c) => settle('tar (local)', c));
  });
}

/** Dépose la liste d'un lot sur le device (LF strict : toybox ne trime pas le CR). */
function pushList(serial: string, rels: string[]): void {
  writeFileSync(LOCAL_LIST, rels.join('\n') + '\n');
  capture(['-s', serial, 'push', LOCAL_LIST, REMOTE_LIST]);
}

export type PullResult = {
  /** Au moins un fichier a été tiré ou supprimé (→ il faut re-générer en aval). */
  changed: boolean;
  /** Un device adb exploitable a été trouvé (LDPlayer lancé). */
  devicePresent: boolean;
};

/**
 * Synchronise `.gamedata/files` depuis le device. Ne lève PAS si aucun device
 * n'est joignable (LDPlayer éteint, adb absent…) : renvoie
 * `{ changed: false, devicePresent: false }` pour que l'appelant (ex. `pnpm dev`
 * hors-ligne) puisse simplement sauter l'étape.
 */
export async function pull(subdirs: string[] = DEFAULT_SUBDIRS): Promise<PullResult> {
  let serial: string;
  try {
    serial = pickDevice();
  } catch {
    console.log('⚠ Aucun device adb (LDPlayer éteint ?) — pull ignoré.');
    return { changed: false, devicePresent: false };
  }
  console.log(`📱 Device : ${serial}`);
  ensureRoot(serial);

  let changed = false;
  for (const sub of subdirs) {
    const useHash = !CONTENT_ADDRESSED.has(sub);
    const remoteDir = `${REMOTE}/${sub}`;
    const localDir = join(LOCAL, sub);
    // GARDE-FOU : dossier distant absent → signatures distantes VIDES → la
    // sync prendrait ça pour « tout a disparu côté jeu » et PURGERAIT le
    // miroir local entier. On refuse explicitement à la place.
    // (`; true` : sans lui, un test négatif ferait sortir adb en code ≠ 0 et
    // execFileSync jetterait AVANT notre message — même piège que dump.ts.)
    if (
      !capture(['-s', serial, 'shell', `[ -d '${remoteDir}' ] && echo OK; true`]).includes('OK')
    ) {
      throw new Error(
        `dossier distant absent : ${remoteDir} — le jeu est-il installé (et lancé au moins ` +
          `une fois pour télécharger ses données) ?`,
      );
    }
    mkdirSync(localDir, { recursive: true });

    const remote = remoteSignatures(serial, remoteDir, useHash);
    const local = localSignatures(localDir, useHash);

    const toPull = [...remote].filter(([rel, sig]) => local.get(rel) !== sig).map(([rel]) => rel);
    const toDelete = [...local.keys()].filter((rel) => !remote.has(rel));

    if (toPull.length === 0 && toDelete.length === 0) {
      console.log(`✓ ${sub} : à jour (${remote.size} fichiers${useHash ? ', md5' : ''})`);
      continue;
    }
    changed = true;
    console.log(`↻ ${sub} : ${toPull.length} à tirer, ${toDelete.length} à supprimer`);

    if (local.size === 0) {
      // BOOTSTRAP seulement (miroir vide) : tout est à tirer de toute façon,
      // `adb pull` du dossier crée l'arborescence pour nous.
      stream(['-s', serial, 'pull', remoteDir, LOCAL]);
    } else if (toPull.length && tarAvailable(serial)) {
      // INCRÉMENTAL par lots (tar) : on ne transfère QUE le diff, en un
      // transfert par lot. L'ancien code basculait sur un `adb pull` du dossier
      // entier dès 1000 fichiers de diff — à 19 Go de bundles, cela retirait
      // 12 500 fichiers pour en corriger 2 000 (constat Sevih 2026-07-21), en
      // passant de longues minutes dans le seul « building file list ».
      const lots = Math.ceil(toPull.length / BATCH_FILES);
      for (let i = 0; i < lots; i++) {
        const batch = toPull.slice(i * BATCH_FILES, (i + 1) * BATCH_FILES);
        // tar recrée les sous-dossiers, mais pas la racine du lot.
        for (const rel of new Set(batch.map((r) => dirname(r)))) {
          if (rel !== '.') mkdirSync(join(localDir, rel), { recursive: true });
        }
        process.stdout.write(`  lot ${i + 1}/${lots} (${batch.length} fichiers)…\r`);
        pushList(serial, batch);
        await pullBatch(serial, remoteDir, localDir);
      }
      rmSync(LOCAL_LIST, { force: true });
      capture(['-s', serial, 'shell', `rm -f ${REMOTE_LIST}`]);
      process.stdout.write(`  ${toPull.length} fichier(s) tiré(s) en ${lots} lot(s).\n`);
    } else {
      // Repli : `tar` absent d'un des deux côtés → fichier par fichier.
      for (const rel of toPull) {
        const dest = join(localDir, rel);
        mkdirSync(dirname(dest), { recursive: true });
        stream(['-s', serial, 'pull', `${remoteDir}/${rel}`, dest]);
      }
    }

    for (const rel of toDelete) {
      rmSync(join(localDir, rel), { force: true });
    }
  }

  console.log('✅ Sync terminée.');
  return { changed, devicePresent: true };
}

// Exécution directe (`pnpm datagen:pull [sous-dossier…]`).
if (isMain(import.meta.url)) {
  const subdirs = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_SUBDIRS;
  pull(subdirs).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
