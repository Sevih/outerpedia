/**
 * Générateur — VERSION DU JEU (`data/generated/game-version.json`).
 *
 * La version de ressources (`resVersion`) vit à la toute FIN du `manifest.dat`
 * des bundles, sous la forme `…,"version":"X.Y.Z"}`. On lit uniquement les 256
 * derniers octets pour éviter de parser un fichier multi-Mo.
 */
import { openSync, readSync, closeSync, statSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { isMain } from '../lib/is-main';

const MANIFEST = resolve('.gamedata/files/bundles/manifest.dat');

export interface GameVersion {
  resVersion: string;
}

/**
 * Extrait `X.Y.Z` du `…,"version":"X.Y.Z"}` en FIN de chaîne — pur, exporté
 * pour le test. Ancré sur la fin (`\}\s*$`) : c'est la version DU MANIFESTE,
 * pas un `"version"` qui traînerait plus haut dans la fenêtre lue. `null` si le
 * motif n'est pas en toute fin.
 */
export function parseResVersion(tail: string): string | null {
  const m = tail.match(/"version"\s*:\s*"([^"]+)"\s*\}\s*$/);
  return m ? m[1] : null;
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
  const resVersion = parseResVersion(buf.toString('utf-8'));
  return resVersion ? { resVersion } : null;
}

// Exécution directe.
if (isMain(import.meta.url)) {
  console.log(JSON.stringify(buildGameVersion()));
}
