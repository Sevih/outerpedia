/**
 * Générateur — VERSION DU JEU (`data/generated/game-version.json`).
 *
 * La version de ressources (`resVersion`) vit à la toute FIN du `manifest.dat`
 * des bundles, sous la forme `…,"version":"X.Y.Z"}`. On lit uniquement les 256
 * derniers octets pour éviter de parser un fichier multi-Mo.
 */
import { openSync, readSync, closeSync, statSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const MANIFEST = resolve('.gamedata/files/bundles/manifest.dat');

export interface GameVersion {
  resVersion: string;
}

/** Lit `"version":"X.Y.Z"` en fin de `manifest.dat` (256 derniers octets). */
export function buildGameVersion(): GameVersion | null {
  if (!existsSync(MANIFEST)) return null;
  const size = statSync(MANIFEST).size;
  const window = Math.min(size, 256);
  const buf = Buffer.alloc(window);
  const fd = openSync(MANIFEST, 'r');
  try {
    readSync(fd, buf, 0, window, size - window);
  } finally {
    closeSync(fd);
  }
  const m = buf.toString('utf-8').match(/"version"\s*:\s*"([^"]+)"\s*\}\s*$/);
  return m ? { resVersion: m[1] } : null;
}

// Exécution directe.
if (process.argv[1] && process.argv[1].endsWith('game-version.ts')) {
  console.log(JSON.stringify(buildGameVersion()));
}
