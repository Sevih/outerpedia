/**
 * Écriture de la couche curée — réservée à l'ADMIN local.
 *
 * Read-merge-write avec validation (contrat à dents) et clés triées pour des
 * diffs git stables. Une entrée vide supprime la clé (nettoyage).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { CharacterCurated } from '@contracts';
import { characterCuratedSchema } from '@datagen/curated/character';
import { validate } from '@datagen/extractor/core/validate';

const CURATED_PATH = resolve(process.cwd(), 'data/curated/characters.json');

function readAll(): Record<string, CharacterCurated> {
  try {
    return JSON.parse(readFileSync(CURATED_PATH, 'utf8')) as Record<string, CharacterCurated>;
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, CharacterCurated>): void {
  const sorted = Object.fromEntries(Object.entries(data).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(CURATED_PATH, JSON.stringify(sorted, null, 2) + '\n');
}

/**
 * Valide puis enregistre le curé d'un personnage. Renvoie les écarts de schéma
 * (vide = OK). Une entrée sans aucun champ supprime la clé.
 */
export function upsertCharacterCurated(id: string, curated: CharacterCurated): string[] {
  const issues = validate(curated, characterCuratedSchema, `curated[${id}]`);
  if (issues.length) return issues.map((i) => `${i.path} — ${i.message}`);

  const all = readAll();
  if (Object.keys(curated).length === 0) delete all[id];
  else all[id] = curated;
  writeAll(all);
  return [];
}
