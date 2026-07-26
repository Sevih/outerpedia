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
import { readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
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
    // BOM UTF-8 toléré : sous Windows, un outil PowerShell (`Set-Content`,
    // `Out-File`) qui réécrit un curé le préfixe volontiers de U+FEFF —
    // `JSON.parse` le refuse (vécu : `equipment.json`, 21/07/2026).
    return JSON.parse(raw.replace(/^﻿/, '')) as T;
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

/**
 * Écrit un JSON au format canonique, de façon ATOMIQUE. `path` est absolu ou
 * relatif au cwd.
 *
 * On formate AVANT d'ouvrir la fenêtre d'écriture, puis on écrit à côté et on
 * RENOMME (atomique sur le même FS — MoveFileEx sous Windows écrase la cible).
 * Sinon `writeFileSync` tronque-puis-écrit : une interruption (Ctrl-C, crash,
 * redémarrage du serveur dev) laisserait un JSON tronqué que `readCuratedJson`
 * refuse ensuite (il LÈVE, cf. plus bas) → `pnpm dev` et le build BLOQUÉS
 * jusqu'à réparation manuelle. Ce seul point couvre les ~53 sites d'écriture des
 * stores curés (audit F1, socle partagé admin ↔ datagen).
 *
 * Le temporaire porte un nom UNIQUE par appel (pid + séquence) là où un nom fixe
 * (`<path>.tmp`) suffisait presque. Ce que ça change EXACTEMENT — mesuré, pas
 * supposé :
 *   - DANS un même processus, un nom fixe était déjà sans risque : `writeFileSync`
 *     et `renameSync` sont synchrones et rien ne les sépare, donc le bloc va au
 *     bout sans rendre la main. Deux requêtes admin simultanées ne peuvent PAS
 *     s'entrelacer ici (vérifié : la suite passe à l'identique avec un nom fixe).
 *   - ENTRE PROCESSUS, si : le serveur dev qui enregistre un curé pendant qu'une
 *     CLI datagen réécrit le même fichier visaient le même `<path>.tmp`. Là les
 *     écritures sont réellement concurrentes (ordonnancées par l'OS) : octets
 *     entrelacés dans le temporaire, puis chacun renomme — la cible peut recevoir
 *     un mélange, et le second rename peut lever ENOENT. Le `pid` supprime la
 *     collision.
 *   - La séquence, elle, est une défense en profondeur : si un refactor
 *     introduisait un `await` entre l'écriture et le rename, le cas intra-processus
 *     redeviendrait possible — le nom resterait unique.
 *
 * (Deux écritures concurrentes restent une mise à jour PERDUE pour l'une d'elles :
 * c'est le read-merge-write des stores, un sujet distinct — audit F7.)
 */
let tmpSeq = 0;

export async function writeJson(path: string, data: unknown): Promise<void> {
  const body = await formatJson(data);
  const tmp = `${path}.${process.pid}.${++tmpSeq}.tmp`;
  try {
    writeFileSync(tmp, body);
    renameSync(tmp, path);
  } catch (e) {
    // Un temporaire ne doit jamais survivre à un échec : il traînerait à côté du
    // curé, visible en `git status`, et sans le moindre indice sur son origine.
    rmSync(tmp, { force: true });
    throw e;
  }
}
