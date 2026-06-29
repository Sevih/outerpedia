/**
 * pull-gamedata — récupère le dossier `files` du jeu depuis une instance
 * LDPlayer (Android) via adb, vers `.gamedata/files/`.
 *
 * Prérequis : LDPlayer lancé, Outerplane installé (idéalement à jour).
 *
 * Usage :
 *   pnpm datagen:pull            # tire les dossiers par défaut (bundles + il2cpp)
 *   pnpm datagen:pull il2cpp     # tire uniquement ce(s) sous-dossier(s)
 *
 * Le chemin de l'adb LDPlayer peut être surchargé via la variable ADB_PATH.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const ADB = process.env.ADB_PATH ?? 'C:\\LDPlayer\\LDPlayer9\\adb.exe';
const PKG = 'com.smilegate.outerplane.stove.google';
const REMOTE = `/sdcard/Android/data/${PKG}/files`;
const LOCAL = resolve('.gamedata/files');

// Sous-dossiers source réellement utiles (on ignore promos / cookies / cache).
const DEFAULT_SUBDIRS = ['bundles', 'il2cpp'];

/** adb qui renvoie sa sortie (pour la parser). */
function capture(args: string[]): string {
  return execFileSync(ADB, args, { encoding: 'utf-8' });
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

mkdirSync(LOCAL, { recursive: true });
for (const sub of subdirs) {
  console.log(`⬇️  pull ${sub} → ${LOCAL}`);
  stream(['-s', serial, 'pull', `${REMOTE}/${sub}`, LOCAL]);
}
console.log('✅ Pull terminé.');
