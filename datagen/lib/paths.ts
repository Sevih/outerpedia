/**
 * paths — la RACINE de l'aire de travail brute (`.gamedata/` par défaut), en un
 * seul endroit.
 *
 * Deux sources de jeu coexistent depuis le 2026-08-26 : l'Android (LDPlayer,
 * `pull-gamedata.ts`) et le client Steam (`pull-steam.ts`). Elles produisent
 * EXACTEMENT la même arborescence (`files/bundles`, `apk/dumped`, `extracted`,
 * `parsed`…), donc tout l'aval (extract, convert, build, scripts python, admin)
 * tourne tel quel sur l'une ou l'autre — à condition de ne jamais coder
 * `.gamedata` en dur. C'est ce module qui porte la racine :
 *
 *   GAMEDATA_ROOT=.gamedata-steam pnpm datagen:extract
 *
 * `refresh.ts --source steam` pose la variable pour les étapes qu'il lance ; les
 * scripts python la lisent de la même façon (`os.environ['GAMEDATA_ROOT']`).
 * La bascule Android → Steam se fera en changeant `DEFAULT_GAMEDATA_ROOT`,
 * rien d'autre.
 *
 * `gamedata()` relit l'environnement À CHAQUE APPEL (pas de constante figée à
 * l'import) : `refresh.ts` choisit la source en tête de process, puis importe
 * dynamiquement les modules qui figent leurs chemins à l'import
 * (`const X = gamedata('…')`). Un module importé AVANT que la variable soit
 * posée garderait la racine par défaut — d'où l'import dynamique là-bas.
 *
 * `.gamedata/tools/` fait exception : l'outillage (AssetStudio, Il2CppDumper,
 * ilspycmd, ffmpeg) n'est pas de la donnée de jeu, il est PARTAGÉ entre les
 * sources — cf. `TOOLS_DIR`.
 */
import { resolve } from 'node:path';

/** Racine par défaut — à changer pour basculer la source principale. */
export const DEFAULT_GAMEDATA_ROOT = '.gamedata';
/** Racine que `refresh --source steam` pose quand `GAMEDATA_ROOT` n'est pas donnée. */
export const STEAM_GAMEDATA_ROOT = '.gamedata-steam';

/** Racine ABSOLUE de l'aire de travail courante (env `GAMEDATA_ROOT`, sinon le défaut). */
export function gamedataRoot(): string {
  return resolve(process.env.GAMEDATA_ROOT ?? DEFAULT_GAMEDATA_ROOT);
}

/** Chemin absolu sous la racine : `gamedata('files/bundles')`. */
export function gamedata(...segments: string[]): string {
  return resolve(gamedataRoot(), ...segments);
}

/** Outillage tiers, partagé entre sources (jamais sous une racine alternative). */
export const TOOLS_DIR = resolve(DEFAULT_GAMEDATA_ROOT, 'tools');
