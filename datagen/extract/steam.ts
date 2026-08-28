/**
 * steam — helpers PARTAGÉS des scripts qui lisent le client Steam
 * (`pull-steam.ts`, `dump-steam.ts`), pendant Windows de `adb.ts`.
 *
 * Une seule vérité pour : où est installé le jeu, et quelle version c'est.
 *
 * LOCALISATION, dans l'ordre :
 *   1. `OUTERPLANE_STEAM_DIR` (dossier `…/steamapps/common/OUTERPLANE`) — pour
 *      un install hors Steam ou une copie déposée à la main ;
 *   2. le registre (`HKCU\Software\Valve\Steam\SteamPath`), puis
 *      `steamapps/libraryfolders.vdf` (TOUTES les bibliothèques, pas seulement
 *      celle de l'install Steam) et l'`appmanifest_<appid>.acf` qui porte
 *      `installdir` et `buildid`.
 *
 * VERSIONS — il y en a deux, comme sur Android :
 *   - `buildId` : le build Steam (`appmanifest`), bouge à chaque dépôt Valve —
 *     c'est le signal « le client a changé » le moins cher ;
 *   - `resVersion` : la version des RESSOURCES (`manifest.dat`), la même notion
 *     que `generators/game-version.ts` ;
 *   - la version APPLICATIVE (« 1.4.15 », = `versionName` Android) n'est pas
 *     dans un fichier texte : c'est `PlayerSettings.bundleVersion` de
 *     `globalgamemanagers` — `dump-steam.ts` la lit via UnityPy.
 *
 * Le jeu se PATCHE EN PLACE dans `StreamingAssets/bundles` (constaté 2026-08-26 :
 * `Loxodon BundleUtil` y pose storable = readOnly ; 1 705 bundles réécrits au
 * premier lancement). Il n'y a donc qu'un dossier à lire, toujours à jour dès
 * que le jeu a été lancé.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

/** AppID Steam d'OUTERPLANE. */
export const STEAM_APPID = 4247320;

/** Ce que les scripts ont besoin de savoir de l'install. */
export type SteamInstall = {
  /** `…/steamapps/common/OUTERPLANE` */
  root: string;
  /** `…/OUTERPLANE_Data/StreamingAssets/bundles` — le miroir source. */
  bundlesDir: string;
  /** `…/OUTERPLANE_Data/Managed/Assembly-CSharp.dll` — le code du client (Mono). */
  assemblyDll: string;
  /** `…/OUTERPLANE_Data/globalgamemanagers` — PlayerSettings (colorSpace, bundleVersion). */
  globalGameManagers: string;
  /** `buildid` de l'appmanifest, ou null hors Steam (`OUTERPLANE_STEAM_DIR`). */
  buildId: string | null;
};

/**
 * Parse minimal du format KeyValues de Valve (`.vdf` / `.acf`) : `"clé" "valeur"`
 * et `"clé" { … }` imbriqués. PUR — testable sans Steam. Les valeurs sont des
 * chaînes ; les échappements `\\` et `\"` sont dépliés.
 */
export type KeyValues = { [key: string]: string | KeyValues };

export function parseKeyValues(text: string): KeyValues {
  const tokens = text.match(/"(?:\\.|[^"\\])*"|\{|\}/g) ?? [];
  const unquote = (t: string): string => t.slice(1, -1).replace(/\\(["\\])/g, '$1');
  let i = 0;
  const parseBlock = (): KeyValues => {
    const out: KeyValues = {};
    while (i < tokens.length) {
      const t = tokens[i++];
      if (t === '}') return out;
      if (t === '{') continue; // bloc sans clé : ignoré
      const key = unquote(t);
      const next = tokens[i++];
      if (next === '{') out[key] = parseBlock();
      else if (next !== undefined && next !== '}') out[key] = unquote(next);
    }
    return out;
  };
  return parseBlock();
}

/** Chemins des bibliothèques Steam listées dans `libraryfolders.vdf`. PUR. */
export function libraryPaths(vdf: string): string[] {
  const root = parseKeyValues(vdf);
  const folders = (root.libraryfolders ?? {}) as KeyValues;
  const out: string[] = [];
  for (const v of Object.values(folders)) {
    if (typeof v === 'object' && typeof v.path === 'string') out.push(v.path);
  }
  return out;
}

/** `installdir` + `buildid` d'un `appmanifest_<appid>.acf`. PUR. */
export function parseAppManifest(acf: string): { installdir: string; buildid: string } | null {
  const state = (parseKeyValues(acf).AppState ?? null) as KeyValues | null;
  if (!state || typeof state.installdir !== 'string') return null;
  return { installdir: state.installdir, buildid: String(state.buildid ?? '') };
}

/** `SteamPath` du registre utilisateur, ou null (Steam absent, pas Windows…). */
function steamPathFromRegistry(): string | null {
  try {
    const out = execFileSync('reg', ['query', 'HKCU\\Software\\Valve\\Steam', '/v', 'SteamPath'], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const m = /SteamPath\s+REG_SZ\s+(.+)$/m.exec(out);
    return m ? m[1].trim() : null;
  } catch {
    return null;
  }
}

/**
 * Racines Steam CANDIDATES, par ordre de préférence.
 *
 * Windows : le registre, sinon l'emplacement par défaut.
 * Linux   : pas de registre — Steam vit sous `~/.local/share/Steam`
 *           (`~/.steam/steam` et `~/.steam/root` y pointent selon les distributions),
 *           ou sous `~/.var/app/…` en Flatpak. On retient TOUTES celles qui existent :
 *           `findSteamInstall` balaiera ensuite leurs bibliothèques.
 *
 * Ne JAMAIS retomber sur le chemin Windows hors Windows : c'est ce qui masquait
 * l'install réelle et faisait échouer la détection sous Linux (constaté 28/08/2026,
 * jeu pourtant présent dans `~/.local/share/Steam/steamapps/common/OUTERPLANE`).
 */
function steamRoots(): string[] {
  const fromRegistry = steamPathFromRegistry();
  if (fromRegistry) return [fromRegistry];
  if (process.platform === 'win32') return ['C:\\Program Files (x86)\\Steam'];
  const home = homedir();
  return [
    join(home, '.local', 'share', 'Steam'),
    join(home, '.steam', 'steam'),
    join(home, '.steam', 'root'),
    join(home, '.var', 'app', 'com.valvesoftware.Steam', '.local', 'share', 'Steam'),
  ].filter((dir) => existsSync(dir));
}

function fromRoot(root: string, buildId: string | null): SteamInstall {
  const data = join(root, 'OUTERPLANE_Data');
  return {
    root,
    bundlesDir: join(data, 'StreamingAssets', 'bundles'),
    assemblyDll: join(data, 'Managed', 'Assembly-CSharp.dll'),
    globalGameManagers: join(data, 'globalgamemanagers'),
    buildId,
  };
}

/**
 * L'install Steam d'OUTERPLANE, ou `null` si introuvable (Steam absent, jeu non
 * installé). Ne lève pas : l'appelant (`refresh`) doit pouvoir sauter la source
 * comme il saute LDPlayer éteint.
 */
export function findSteamInstall(): SteamInstall | null {
  const override = process.env.OUTERPLANE_STEAM_DIR;
  if (override) {
    const root = resolve(override);
    return existsSync(join(root, 'OUTERPLANE_Data')) ? fromRoot(root, null) : null;
  }
  const libraries = new Set<string>();
  for (const steam of steamRoots()) {
    const vdf = join(steam, 'steamapps', 'libraryfolders.vdf');
    if (existsSync(vdf))
      for (const lib of libraryPaths(readFileSync(vdf, 'utf-8'))) libraries.add(lib);
    // La racine elle-même : une install sans `libraryfolders.vdf` reste valide.
    libraries.add(steam);
  }
  for (const lib of libraries) {
    const acf = join(lib, 'steamapps', `appmanifest_${STEAM_APPID}.acf`);
    if (!existsSync(acf)) continue;
    const app = parseAppManifest(readFileSync(acf, 'utf-8'));
    if (!app) continue;
    const root = join(lib, 'steamapps', 'common', app.installdir);
    if (existsSync(join(root, 'OUTERPLANE_Data'))) return fromRoot(root, app.buildid);
  }
  return null;
}

/** Comme `findSteamInstall`, mais lève avec un message actionnable. */
export function requireSteamInstall(): SteamInstall {
  const install = findSteamInstall();
  if (!install) {
    throw new Error(
      `OUTERPLANE (Steam, appid ${STEAM_APPID}) introuvable — jeu non installé ? ` +
        'Sinon : OUTERPLANE_STEAM_DIR=<…/steamapps/common/OUTERPLANE>.',
    );
  }
  return install;
}

/**
 * Version des RESSOURCES du client installé (`"version"` en fin de
 * `manifest.dat`), même lecture que `generators/game-version.ts` mais sur la
 * SOURCE, pas sur le miroir — c'est ce qui dit « le jeu a patché » avant de pull.
 */
export function installedResVersion(install: SteamInstall): string | null {
  const manifest = join(install.bundlesDir, 'manifest.dat');
  if (!existsSync(manifest)) return null;
  const text = readFileSync(manifest, 'utf-8');
  const m = /"version"\s*:\s*"([^"]+)"\s*\}\s*$/.exec(text.slice(-256));
  return m ? m[1] : null;
}
