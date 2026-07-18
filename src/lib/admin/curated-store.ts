/**
 * Écriture de la couche curée — réservée à l'ADMIN local.
 *
 * Read-merge-write avec validation (contrat à dents) et clés triées pour des
 * diffs git stables. Une entrée vide supprime la clé (nettoyage).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { CharacterCurated } from '@contracts';
import { characterCuratedSchema } from '@datagen/curated/character';
import { validate } from '@datagen/extractor/core/validate';
import { writeJson } from '@datagen/lib/json';

const CURATED_PATH = resolve(process.cwd(), 'data/curated/characters.json');

function readAll(): Record<string, CharacterCurated> {
  try {
    return JSON.parse(readFileSync(CURATED_PATH, 'utf8')) as Record<string, CharacterCurated>;
  } catch {
    return {};
  }
}

// Format CANONIQUE (`writeJson`) — sinon les tableaux courts (`tags`, `videos`…)
// s'éclatent et chaque édition reformate tout le fichier (diff git géant).
function writeAll(data: Record<string, CharacterCurated>): Promise<void> {
  const sorted = Object.fromEntries(Object.entries(data).sort(([a], [b]) => a.localeCompare(b)));
  return writeJson(CURATED_PATH, sorted);
}

/**
 * Valide puis enregistre le curé d'un personnage. Renvoie les écarts de schéma
 * (vide = OK). Une entrée sans aucun champ supprime la clé.
 */
export async function upsertCharacterCurated(
  id: string,
  curated: CharacterCurated,
): Promise<string[]> {
  const issues = validate(curated, characterCuratedSchema, `curated[${id}]`);
  if (issues.length) return issues.map((i) => `${i.path} — ${i.message}`);

  const all = readAll();
  if (Object.keys(curated).length === 0) delete all[id];
  else all[id] = curated;
  await writeAll(all);
  return [];
}
