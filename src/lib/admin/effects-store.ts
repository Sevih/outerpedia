/**
 * Écriture de la couche curée des EFFETS — réservée à l'ADMIN local.
 * Read-merge-write avec validation + clés triées (diffs git stables).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { EffectCurated } from '@contracts';
import { compactEffect, validateEffectCurated } from '@datagen/curated/effects';

const PATH = resolve(process.cwd(), 'data/curated/effects.json');

function readAll(): Record<string, EffectCurated> {
  try {
    return JSON.parse(readFileSync(PATH, 'utf8')) as Record<string, EffectCurated>;
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, EffectCurated>): void {
  // Tri stable pour ids numériques (tooltips) ET textuels (créations).
  const sorted = Object.fromEntries(
    Object.entries(data).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })),
  );
  writeFileSync(PATH, JSON.stringify(sorted, null, 2) + '\n');
}

/** Valide puis enregistre l'override d'un effet. Entrée vide → supprime la clé. */
export function upsertEffectCurated(id: string, curated: EffectCurated): string[] {
  const compact = compactEffect(curated);
  const errors = validateEffectCurated(id, compact);
  if (errors.length) return errors;
  const all = readAll();
  if (Object.keys(compact).length === 0) delete all[id];
  else all[id] = compact;
  writeAll(all);
  return [];
}
