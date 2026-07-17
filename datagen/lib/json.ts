/**
 * SÉRIALISEUR CANONIQUE du corpus `data/` — source unique de vérité du format.
 *
 * Tout ce qui atterrit dans `data/` (extrait, validé, curé) DOIT passer par ici.
 * Sinon deux écrivains produisent deux formats pour la même donnée, et :
 *   - `datagen:promote` compare les octets → tous les fichiers sortent
 *     « différent · reformatage seul » et l'écran de revue devient inutilisable ;
 *   - le hook pre-commit (`prettier --write`) réécrit derrière → diff git géant
 *     pour zéro changement de contenu.
 *
 * Le format canonique est PRETTIER APPLIQUÉ À `JSON.stringify(data, null, 2)`,
 * avec la config du projet (printWidth 100). Attention : prettier n'est PAS
 * canonique sur du JSON — il PRÉSERVE l'expansion des objets de son entrée.
 * `format(JSON.stringify(data))` (compact) et `format(JSON.stringify(data,null,2))`
 * (indenté) sont donc DEUX formats stables et distincts, tous deux acceptés par
 * `prettier --check`. On retient l'indenté : un champ par ligne → le diff git
 * d'une entité se lit ligne à ligne, ce que la revue de `promote` demande.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { format, resolveConfig, type Options } from 'prettier';

/**
 * LECTEUR des JSON curés/éditoriaux (`data/curated/*`, `data/editorial/*`) —
 * pendant lecture de `writeJson`, et seul idiome autorisé pour ces fichiers.
 *
 * Deux cas que les anciens `try { parse } catch { vide }` confondaient :
 *   - fichier ABSENT (ENOENT) → `undefined` : pas de curation, cas normal,
 *     l'appelant continue avec son défaut ;
 *   - JSON CASSÉ (virgule traînante d'une édition main, conflit git, fichier
 *     tronqué) → THROW nommant le fichier : c'est une erreur humaine à corriger
 *     sur-le-champ — jamais un état « sans curation » à servir en silence
 *     (`pnpm dev` auto-applique le promote : la donnée décurée partait en
 *     `data/generated/` sans un mot).
 *
 * `path` relatif à la racine du repo (cwd) — il sert tel quel dans le message.
 */
export function readCuratedJson<T>(path: string): T | undefined {
  let raw: string;
  try {
    raw = readFileSync(resolve(path), 'utf8');
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw e;
  }
  try {
    return JSON.parse(raw) as T;
  } catch (e) {
    throw new Error(`${path} : JSON invalide — ${(e as Error).message}`);
  }
}

/** Config prettier du projet, résolue une fois (I/O disque sinon par fichier). */
let cached: Options | null | undefined;
async function config(): Promise<Options> {
  cached ??= await resolveConfig('data/generated/x.json', { editorconfig: true });
  return { ...cached, parser: 'json' };
}

/** La donnée telle qu'elle sera écrite sur disque (octet à octet). */
export async function formatJson(data: unknown): Promise<string> {
  return format(JSON.stringify(data, null, 2) + '\n', await config());
}

/** Écrit un JSON au format canonique. `path` est absolu ou relatif au cwd. */
export async function writeJson(path: string, data: unknown): Promise<void> {
  writeFileSync(path, await formatJson(data));
}
