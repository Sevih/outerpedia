/**
 * Écriture des RECOS D'ÉQUIPEMENT curées — réservée à l'ADMIN local.
 * Read-merge-write avec validation + clés triées (diffs git stables).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { GearBuild } from '@contracts';
import { validateGearBuilds } from '@datagen/curated/gear-reco';
import { writeJson } from '@datagen/lib/json';
import { loadGearPresets } from '@/lib/data/gear-reco';
import { collapseBuild } from '@/lib/admin/gear-preset-resolve';

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
  // L'éditeur envoie des PIÈCES (presets dépliés) → on recompresse vers `$preset`
  // là où elles matchent (JSON compact, pas de diff géant).
  const presets = loadGearPresets();
  const compact = builds.map((b) => collapseBuild(b, presets));
  const errors = validateGearBuilds(charId, compact);
  if (errors.length) return errors;
  const all = readAll();
  if (compact.length === 0) delete all[charId];
  else all[charId] = compact;
  const sorted = Object.fromEntries(
    Object.entries(all).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })),
  );
  // Format CANONIQUE (`writeJson`) — sinon chaque édition reformate tout le fichier.
  await writeJson(PATH, sorted);
  return [];
}
