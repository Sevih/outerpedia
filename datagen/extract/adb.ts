/**
 * adb — helpers PARTAGÉS des scripts qui parlent à l'émulateur
 * (`pull-gamedata.ts`, `dump.ts`). Une seule vérité pour : le chemin de l'adb
 * LDPlayer (surchargeable via ADB_PATH), le package du jeu, l'exécution
 * capture/stream, le choix du device et le passage en root.
 */
import { execFileSync } from 'node:child_process';

export const ADB = process.env.ADB_PATH ?? 'C:\\LDPlayer\\LDPlayer9\\adb.exe';
export const PKG = 'com.smilegate.outerplane.stove.google';

/** adb qui renvoie sa sortie (parsing). maxBuffer large : les listings
 * récursifs du pull (`md5sum`/`ls -lR` sur tout `files/`) sont volumineux. */
export function capture(args: string[]): string {
  return execFileSync(ADB, args, { encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024 });
}

/** adb qui affiche sa sortie en direct (progression du pull). */
export function stream(args: string[]): void {
  execFileSync(ADB, args, { stdio: 'inherit' });
}

/** Choisit le device : l'émulateur en priorité, sinon le premier connecté. Lève si aucun. */
export function pickDevice(): string {
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

/** Passage en root (nécessaire pour lire les données du jeu). Idempotent :
 * déjà root ou root non requis → on continue sans bruit. */
export function ensureRoot(serial: string): void {
  try {
    stream(['-s', serial, 'root']);
    stream(['-s', serial, 'wait-for-device']);
  } catch {
    // déjà root ou root non requis — on continue
  }
}
