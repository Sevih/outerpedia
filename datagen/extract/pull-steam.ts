/**
 * pull-steam — synchronise les données du CLIENT STEAM vers la racine gamedata,
 * en INCRÉMENTAL. Pendant Windows de `pull-gamedata.ts` (LDPlayer/adb) : même
 * arborescence en sortie, donc même aval.
 *
 *   <install>/OUTERPLANE_Data/StreamingAssets/bundles/   → <root>/files/bundles/
 *   <install>/OUTERPLANE_Data/Managed/Assembly-CSharp.dll → <root>/files/managed/
 *
 * Le second est le pendant de `files/il2cpp/Metadata/global-metadata.dat` côté
 * Android : le fichier que `refresh` suit pour dire « le CODE a changé ». Mono
 * n'a pas de metadata à part — le DLL EST le code.
 *
 * Détection des changements (même doctrine que le pull Android) :
 *  - bundles content-addressed (nom = 32 hexa = hash du contenu) : signature =
 *    taille — un fichier modifié change de nom, donc est forcément recopié ;
 *  - tout le reste (`manifest.dat`, `crc.txt`, le DLL) : signature = md5 du
 *    contenu — un changement à taille identique est quand même vu.
 * On supprime en local ce qui n'existe plus côté jeu, sous le même garde-fou
 * anti-purge (`massDeleteGuard`) : une source vide ou tronquée ne doit jamais
 * vider le miroir.
 *
 * Prérequis : le jeu Steam installé ET lancé au moins une fois depuis le dernier
 * patch (il se patche EN PLACE au lancement — `steam.ts`). Il peut tourner
 * pendant le pull : on ne fait que lire.
 *
 * Usage :
 *   pnpm datagen:pull                  # bundles + managed (racine .gamedata)
 */
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { walkFiles } from '../lib/fs';
import { isMain } from '../lib/is-main';
import { gamedata } from '../lib/paths';
import { massDeleteGuard, type PullResult } from './pull-gamedata';
import { findSteamInstall, type SteamInstall } from './steam';

const LOCAL = gamedata('files');

/** Un bundle content-addressed : son nom est le hash de son contenu. */
export const isContentAddressed = (rel: string): boolean => /^[0-9a-f]{32}$/.test(rel);

/** Signature d'un fichier : taille si content-addressed, md5 sinon. */
function signature(abs: string, rel: string): string {
  return isContentAddressed(rel)
    ? String(statSync(abs).size)
    : createHash('md5').update(readFileSync(abs)).digest('hex');
}

/** { chemin relatif (séparateur `/`) → signature } d'un dossier, récursif. */
function signatures(baseDir: string): Map<string, string> {
  const map = new Map<string, string>();
  if (!existsSync(baseDir)) return map;
  walkFiles(baseDir, (abs, rel) => map.set(rel, signature(abs, rel)));
  return map;
}

/**
 * Diff PUR entre source et miroir : ce qu'il faut copier (absent ou signature
 * différente) et ce qu'il faut supprimer (plus dans la source). Testable.
 */
export function syncPlan(
  source: Map<string, string>,
  local: Map<string, string>,
): { toCopy: string[]; toDelete: string[] } {
  const toCopy = [...source].filter(([rel, sig]) => local.get(rel) !== sig).map(([rel]) => rel);
  const toDelete = [...local.keys()].filter((rel) => !source.has(rel));
  return { toCopy, toDelete };
}

/** Miroir d'un dossier (ou d'un fichier seul) de la source vers `files/<sub>`. */
function syncDir(label: string, srcDir: string, sub: string, only?: string[]): boolean {
  const localDir = join(LOCAL, sub);
  mkdirSync(localDir, { recursive: true });

  const source = only
    ? new Map(only.map((rel) => [rel, signature(join(srcDir, rel), rel)]))
    : signatures(srcDir);
  if (source.size === 0) {
    throw new Error(
      `${label} : source vide (${srcDir}) — le jeu a-t-il été lancé au moins une fois ?`,
    );
  }
  const local = signatures(localDir);
  const { toCopy, toDelete } = syncPlan(source, local);

  if (toCopy.length === 0 && toDelete.length === 0) {
    console.log(`✓ ${label} : à jour (${source.size} fichiers)`);
    return false;
  }
  const refusal = massDeleteGuard({
    localSize: local.size,
    toDelete: toDelete.length,
    toPull: toCopy.length,
  });
  if (refusal) throw new Error(`${label} : ${refusal}`);
  console.log(`↻ ${label} : ${toCopy.length} à copier, ${toDelete.length} à supprimer`);

  let done = 0;
  for (const rel of toCopy) {
    const dest = join(localDir, rel);
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(join(srcDir, rel), dest);
    if (++done % 200 === 0 || done === toCopy.length) {
      process.stdout.write(`  ${done}/${toCopy.length} copié(s)…\r`);
    }
  }
  if (toCopy.length) process.stdout.write('\n');
  for (const rel of toDelete) rmSync(join(localDir, rel), { force: true });
  return true;
}

/**
 * Synchronise `files/` depuis le client Steam. Ne lève PAS si le jeu est
 * introuvable : `{ changed: false, devicePresent: false }`, pour que `refresh`
 * saute la source comme il saute LDPlayer éteint.
 */
export async function pull(install: SteamInstall | null = findSteamInstall()): Promise<PullResult> {
  if (!install) {
    console.log('⚠ OUTERPLANE (Steam) introuvable — pull ignoré.');
    return { changed: false, devicePresent: false };
  }
  console.log(`🎮 Steam : ${install.root}${install.buildId ? ` (build ${install.buildId})` : ''}`);

  let changed = false;
  changed = syncDir('bundles', install.bundlesDir, 'bundles') || changed;
  changed =
    syncDir('managed', dirname(install.assemblyDll), 'managed', ['Assembly-CSharp.dll']) || changed;

  console.log('✅ Sync terminée.');
  return { changed, devicePresent: true };
}

// Exécution directe (`pnpm datagen:pull`).
if (isMain(import.meta.url)) {
  pull().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
