/**
 * game-client — lecteur de `data/curated/game-client.json`, la référence
 * COMMUNE du client Steam (où est le jeu, quelle version le wiki a lue, quel
 * BepInEx les outils voisins posent). outerpedia en est la source : gear-solver
 * et outerplane-tweaks le recopient à leur build (cf. son `_doc`).
 *
 * Ici : `steam.ts` lit le bloc `steam`, `dump-steam.ts` réécrit le bloc
 * `client` quand le dump lit un autre client (`nextGameClient`, PUR).
 */
import { readCuratedJson } from '../lib/json';

/** Chemin du curé, relatif à la racine du repo (cwd des scripts). */
export const GAME_CLIENT_PATH = 'data/curated/game-client.json';

export type GameClientSteam = {
  appId: number;
  installDir: string;
  dataDir: string;
  exe: string;
  registry: { key: string; value: string };
  /** `linux` : relatif au dossier personnel. */
  roots: { windows: string[]; linux: string[] };
};

export type GameClientClient = {
  version: string;
  buildId: string;
  /** `YYYY-MM-DD`, date locale du dump. */
  dumpedAt: string;
};

export type GameClientBepinex = {
  version: string;
  asset: string;
  url: string;
  sha256: string;
};

/** Le fichier entier, clés `_doc*` comprises (elles traversent la réécriture). */
export type GameClientFile = {
  steam: GameClientSteam;
  client: GameClientClient;
  bepinex: GameClientBepinex;
  [meta: `_${string}`]: string;
};

/** Le curé, ou une erreur nommant le fichier : sans lui, rien ne sait où est le jeu. */
export function readGameClient(): GameClientFile {
  const file = readCuratedJson<GameClientFile>(GAME_CLIENT_PATH);
  if (!file) throw new Error(`${GAME_CLIENT_PATH} introuvable (lancer depuis la racine du repo).`);
  return file;
}

/**
 * Le contenu à réécrire après un dump, ou `null` s'il n'y a rien à écrire. PUR.
 *
 * `null` quand la version est `'inconnue'` (UnityPy absent : jamais devinée),
 * quand le build manque (install hors Steam, `OUTERPLANE_STEAM_DIR`) ou quand
 * version et build sont ceux du fichier — la date seule ne justifie pas un
 * diff à committer. Sinon : le bloc `client` SEUL change, le reste est rendu
 * tel quel.
 */
export function nextGameClient(
  file: GameClientFile,
  version: string,
  buildId: string | null,
  dumpedAt: string,
): GameClientFile | null {
  if (version === 'inconnue' || !buildId) return null;
  if (file.client.version === version && file.client.buildId === buildId) return null;
  return { ...file, client: { version, buildId, dumpedAt } };
}
