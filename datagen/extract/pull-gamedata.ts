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
 * Prérequis : LDPlayer lancé, Outerplane installé (idéalement à jour).
 *
 * Usage :
 *   pnpm datagen:pull            # bundles + il2cpp (par défaut)
 *   pnpm datagen:pull il2cpp     # un sous-dossier précis
 *
 * Le chemin de l'adb LDPlayer peut être surchargé via ADB_PATH.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const ADB = process.env.ADB_PATH ?? 'C:\\LDPlayer\\LDPlayer9\\adb.exe';
const PKG = 'com.smilegate.outerplane.stove.google';
const REMOTE = `/sdcard/Android/data/${PKG}/files`;
const LOCAL = resolve('.gamedata/files');

// Sous-dossiers source réellement utiles (on ignore promos / cookies / cache).
const DEFAULT_SUBDIRS = ['bundles', 'il2cpp'];

// Dossiers dont les noms = hash de contenu : la comparaison par nom+taille suffit.
// Les autres sont comparés par md5 (contenu) pour ne rater aucun changement.
const CONTENT_ADDRESSED = new Set(['bundles']);

// Au-delà de ce nombre de fichiers à tirer, un pull complet du dossier (1 seul
// transfert) est plus rapide que des pulls fichier par fichier.
const FULL_PULL_THRESHOLD = 1000;

/** adb qui renvoie sa sortie (pour la parser). */
function capture(args: string[]): string {
  return execFileSync(ADB, args, { encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024 });
}

/** adb qui affiche sa sortie en direct (progression du pull). */
function stream(args: string[]): void {
  execFileSync(ADB, args, { stdio: 'inherit' });
}

/** Choisit le device : l'émulateur en priorité, sinon le premier connecté. */
function pickDevice(): string {
  const lines = capture(['devices'])
    .split(/\r?\n/)
    .slice(1)
    .map((l) => l.trim())
    .filter((l) => /\tdevice$/.test(l))
    .map((l) => l.split('\t')[0]);
  if (lines.length === 0) {
    throw new Error('Aucun device adb détecté. LDPlayer est-il bien lancé ?');
  }
  return lines.find((d) => d.startsWith('emulator-')) ?? lines[0];
}

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
  const walk = (dir: string, prefix: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      const abs = join(dir, entry.name);
      if (entry.isDirectory()) walk(abs, rel);
      else if (entry.isFile()) {
        map.set(
          rel,
          useHash
            ? createHash('md5').update(readFileSync(abs)).digest('hex')
            : String(statSync(abs).size),
        );
      }
    }
  };
  walk(baseDir, '');
  return map;
}

const subdirs = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_SUBDIRS;

const serial = pickDevice();
console.log(`📱 Device : ${serial}`);

// Passage en root (nécessaire pour lire les données du jeu). Idempotent.
try {
  stream(['-s', serial, 'root']);
  stream(['-s', serial, 'wait-for-device']);
} catch {
  // déjà root ou root non requis — on continue
}

for (const sub of subdirs) {
  const useHash = !CONTENT_ADDRESSED.has(sub);
  const remoteDir = `${REMOTE}/${sub}`;
  const localDir = join(LOCAL, sub);
  mkdirSync(localDir, { recursive: true });

  const remote = remoteSignatures(serial, remoteDir, useHash);
  const local = localSignatures(localDir, useHash);

  const toPull = [...remote].filter(([rel, sig]) => local.get(rel) !== sig).map(([rel]) => rel);
  const toDelete = [...local.keys()].filter((rel) => !remote.has(rel));

  if (toPull.length === 0 && toDelete.length === 0) {
    console.log(`✓ ${sub} : à jour (${remote.size} fichiers${useHash ? ', md5' : ''})`);
    continue;
  }
  console.log(`↻ ${sub} : ${toPull.length} à tirer, ${toDelete.length} à supprimer`);

  if (local.size === 0 || toPull.length > FULL_PULL_THRESHOLD) {
    // Premier pull (ou gros diff) → un seul transfert du dossier entier.
    stream(['-s', serial, 'pull', remoteDir, LOCAL]);
  } else {
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
