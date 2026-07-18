/**
 * Écriture des RECOS D'ÉQUIPEMENT curées — réservée à l'ADMIN local.
 * Read-merge-write avec validation + clés triées (diffs git stables).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { GearBuild } from '@contracts';
import { validateGearBuilds } from '@datagen/curated/gear-reco';
import { writeJson } from '@datagen/lib/json';

const PATH = resolve(process.cwd(), 'data/curated/gear-reco.json');

function readAll(): Record<string, GearBuild[]> {
  try {
    return JSON.parse(readFileSync(PATH, 'utf8')) as Record<string, GearBuild[]>;
  } catch {
    return {};
  }
}

/** Valide puis enregistre les builds d'un perso. Liste vide → supprime la clé. */
export async function upsertGearReco(charId: string, builds: GearBuild[]): Promise<string[]> {
  const errors = validateGearBuilds(charId, builds);
  if (errors.length) return errors;
  const all = readAll();
  if (builds.length === 0) delete all[charId];
  else all[charId] = builds;
  const sorted = Object.fromEntries(
    Object.entries(all).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })),
  );
  // Format CANONIQUE (`writeJson`) — sinon chaque édition reformate tout le fichier.
  await writeJson(PATH, sorted);
  return [];
}
