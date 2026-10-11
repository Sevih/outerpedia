/**
 * La RÈGLE DE DATATION des guides (`meta.updated`), partagée par
 * `scripts/stamp-guides.ts` — le hook pre-commit `stamp-guides` en `--staged`,
 * et `pnpm commit` — et par quick (section « Guides », lot F18), qui committe
 * les `.json` d'un guide en `--no-verify` et doit donc re-dater lui-même AVANT
 * son commit. Deux écrivains, une règle : ce module la porte, le script et
 * quick l'appellent.
 *
 * Modèle (décidé avec Sevih) : si un fichier PERTINENT du guide change,
 * `updated = aujourd'hui`. « Pertinent » = les fichiers partagés du guide
 * (meta/strings/index/notes…) + la DERNIÈRE version ; les archives de versions
 * (`versions/<plus ancienne>/`) ne comptent pas — corriger un vieux guide
 * versionné ne le fait pas remonter en « à jour ».
 *
 * Aucun git ici : à l'appelant de dire quels fichiers ont bougé (le script lit
 * `git status` ou l'index, quick lit `git status` du dossier du guide).
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { format as prettierFormat, resolveConfig } from 'prettier';
import { writeTextAtomic } from '@datagen/lib/json';

/** Le dossier des guides, relatif au dépôt. */
export const GUIDES_CONTENTS_SUBDIR = 'src/app/[lang]/guides/_contents';
export const STAMP_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const VERSION_DIR_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * La date d'aujourd'hui, LOCALE, pas UTC : un `pnpm commit` entre 0 h et 2 h
 * (Paris) datait le guide de la veille. `sv-SE` formate nativement en
 * `YYYY-MM-DD`.
 */
export function todayLocal(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE').format(now).slice(0, 10);
}

/** Dossiers de versions d'un guide, triés (le plus récent d'abord). */
export function versionKeys(dir: string): string[] {
  const vdir = resolve(dir, 'versions');
  if (!existsSync(vdir)) return [];
  return readdirSync(vdir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && VERSION_DIR_RE.test(e.name))
    .map((e) => e.name)
    .sort((a, b) => b.localeCompare(a));
}

/**
 * Les préfixes d'ARCHIVE d'un guide — `<base>versions/<clé>/` pour chaque
 * version sauf la plus récente. `base` : le dossier du guide, relatif au
 * dépôt, en POSIX, avec son `/` final ; `keys` : ses versions, la plus récente
 * en tête (`versionKeys`).
 */
export function archivePrefixes(base: string, keys: readonly string[]): string[] {
  return keys.slice(1).map((k) => `${base}versions/${k}/`);
}

/**
 * Un fichier changé est-il PERTINENT pour ce guide ? Oui s'il est dans le
 * dossier du guide (`base`) MAIS pas dans une archive de version (`archives`,
 * cf. `archivePrefixes`), et si `ignore` ne l'écarte pas — le script y met le
 * `meta.json` dont seul le champ `updated` bouge (anti-boucle).
 */
export function hasRelevantChange(
  base: string,
  changed: Iterable<string>,
  archives: readonly string[],
  ignore: (file: string) => boolean = () => false,
): boolean {
  for (const f of changed) {
    if (!f.startsWith(base)) continue;
    if (archives.some((a) => f.startsWith(a))) continue; // archive → ignoré
    if (ignore(f)) continue;
    return true;
  }
  return false;
}

/**
 * Sérialise un objet EXACTEMENT comme prettier — via l'API, pas le CLI (qui
 * traiterait les `[lang]` du chemin comme un motif glob et ne matcherait pas le
 * fichier). Nécessaire : le stamp écrivait du `JSON.stringify`, qui ÉCLATE les
 * tableaux courts que prettier garde INLINE (`"dungeons": ["100805"]`) → meta
 * committé non-prettier (le commit maison saute les hooks via `--no-verify`) et
 * diff parasite au `format:check` du commit suivant. `resolveConfig` reprend le
 * `printWidth` du repo (seuil d'inline des tableaux).
 */
export async function toPrettierJson(obj: unknown, filepath: string): Promise<string> {
  const config = await resolveConfig(filepath);
  return prettierFormat(JSON.stringify(obj, null, 2), { ...config, filepath, parser: 'json' });
}

/**
 * Lit/écrit meta.json en préservant l'ordre des clés (`updated` déjà présent
 * reste à sa place ; sinon inséré après `author`). Sortie prettier-canonique.
 * Rend `false` quand le meta porte déjà cette date : rien n'est écrit.
 */
export async function stampMeta(metaPath: string, date: string): Promise<boolean> {
  const raw = readFileSync(metaPath, 'utf8');
  const meta = JSON.parse(raw) as Record<string, unknown>;
  if (meta.updated === date) return false;
  let out: Record<string, unknown> = meta;
  if ('updated' in meta) {
    meta.updated = date;
  } else {
    // Insère `updated` juste après `author` (lisibilité des diffs).
    out = {};
    for (const [k, v] of Object.entries(meta)) {
      out[k] = v;
      if (k === 'author') out.updated = date;
    }
    if (!('updated' in out)) out.updated = date;
  }
  writeTextAtomic(metaPath, await toPrettierJson(out, metaPath));
  return true;
}
