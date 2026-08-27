/**
 * bundle-manifest — lire `files/bundles/manifest.dat` pour CIBLER les bundles
 * au lieu de scanner le dossier entier.
 *
 * Le jeu livre 6 000 bundles (19 Go) ; les `.bytes` (templates + textes) en
 * occupent 257 (35 Mo), les images UI ~1 100 (1,2 Go). Le manifeste dit pour
 * chaque bundle ses `assets` (chemins déclarés) et ses `dependencies` (noms de
 * bundles) — de quoi désigner exactement les fichiers qu'une extraction doit
 * ouvrir. Les scripts python (face-layout, sprite-rect, portrait-fx,
 * anim-events) le faisaient déjà pour LEUR bundle ; `extract.ts` passait tout
 * le dossier à AssetStudio, qui filtrait après ouverture (mesuré le 27/08/2026).
 *
 * Deux règles pour que la sélection soit ÉQUIVALENTE au scan complet :
 *  - le prédicat de sélection est le même que le filtre AssetStudio (les
 *    `container` qu'il compare sont les chemins d'assets déclarés du bundle,
 *    tels quels dans le manifeste) ;
 *  - on ferme sur les `dependencies` : un sprite d'un prefab UI vit dans un
 *    atlas d'un AUTRE bundle, sans lequel l'export échoue (« sprite introuvable »).
 *
 * Tout est pur (manifeste en entrée, noms de fichiers en sortie) sauf
 * `readManifest` ; testé dans bundle-manifest.test.ts.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { gamedata } from './paths';

export type BundleInfo = {
  name: string;
  folder: string;
  /** Nom du fichier sur disque (32 hexa = hash du contenu, tourne à chaque patch). */
  filename: string;
  fileSize: number;
  /** Chemins d'assets déclarés (`Assets/Editor/Resources/…`). */
  assets: string[];
  /** Noms (`name`) des bundles dont celui-ci dépend. */
  dependencies: string[];
};

export const manifestPath = (): string => gamedata('files/bundles/manifest.dat');

export function readManifest(path = manifestPath()): BundleInfo[] {
  if (!existsSync(path)) throw new Error(`manifeste des bundles introuvable : ${path}`);
  const json = JSON.parse(readFileSync(path, 'utf8')) as { bundleInfos?: unknown };
  if (!Array.isArray(json.bundleInfos)) throw new Error(`${path} : pas de \`bundleInfos\``);
  return json.bundleInfos as BundleInfo[];
}

/** Nom d'asset au sens AssetStudio (`--filter-by-name`) : nom de fichier sans extension. */
export const assetName = (path: string): string => basename(path, extname(path));

/**
 * Une CIBLE d'extraction : ce qu'AssetStudio garde (ses filtres) ET, exprimé
 * avec les mêmes regex, le bundle qui peut le contenir. Un bundle est retenu
 * dès qu'UN de ses assets déclarés passe `name` et `container`.
 */
export type ExtractTarget = {
  /** Regex sur le nom d'asset (`--filter-by-name`). */
  name: RegExp;
  /** Regex sur le chemin d'asset (`--filter-by-container`) ; absent = tous. */
  container?: RegExp;
};

/** Les bundles qu'une cible peut toucher, AVANT fermeture des dépendances. */
export function selectBundles(infos: BundleInfo[], target: ExtractTarget): BundleInfo[] {
  return infos.filter((b) =>
    b.assets.some(
      (a) => target.name.test(assetName(a)) && (!target.container || target.container.test(a)),
    ),
  );
}

/** Fermeture transitive sur `dependencies` (ordre du manifeste, sans doublon). */
export function closeOverDependencies(infos: BundleInfo[], selected: BundleInfo[]): BundleInfo[] {
  const byName = new Map(infos.map((b) => [b.name, b]));
  const out = new Map<string, BundleInfo>();
  const stack = [...selected];
  while (stack.length) {
    const b = stack.pop()!;
    if (out.has(b.name)) continue;
    out.set(b.name, b);
    for (const dep of b.dependencies ?? []) {
      const d = byName.get(dep);
      if (d) stack.push(d);
      // Une dépendance absente du manifeste n'est pas sur disque non plus :
      // rien à ouvrir, AssetStudio se comportait déjà ainsi sur le scan complet.
    }
  }
  return infos.filter((b) => out.has(b.name));
}

/** Sélection + fermeture, en un appel. */
export function bundlesFor(infos: BundleInfo[], target: ExtractTarget): BundleInfo[] {
  return closeOverDependencies(infos, selectBundles(infos, target));
}

/**
 * Empreinte d'un jeu de bundles : md5 de `filename:fileSize` triés. Les noms
 * sont content-addressed, donc un contenu qui change change le nom — pas
 * besoin de lire les fichiers. C'est ce que `extract` compare pour savoir si
 * une cible a quelque chose de neuf à extraire.
 */
export function bundlesSignature(bundles: BundleInfo[]): string {
  const parts = bundles.map((b) => `${b.filename}:${b.fileSize}`).sort();
  return createHash('md5').update(parts.join('\n')).digest('hex');
}

/** Chemins absolus des bundles, en vérifiant qu'ils sont bien sur disque. */
export function bundlePaths(bundles: BundleInfo[], dir = gamedata('files/bundles')): string[] {
  const missing: string[] = [];
  const paths = bundles.map((b) => {
    const p = join(dir, b.filename);
    if (!existsSync(p) || statSync(p).size !== b.fileSize) missing.push(b.name);
    return p;
  });
  if (missing.length) {
    throw new Error(
      `${missing.length} bundle(s) du manifeste absent(s) ou tronqué(s) sur disque ` +
        `(${missing.slice(0, 3).join(', ')}${missing.length > 3 ? ', …' : ''}) — relancer le pull.`,
    );
  }
  return paths;
}
