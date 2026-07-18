/**
 * Écriture de la couche curée ÉQUIPEMENT (`data/curated/equipment.json`) —
 * réservée à l'ADMIN local. Aujourd'hui seul l'éditeur EE écrit ici : rang
 * éditorial (`rank`/`rank10`) + câblage d'affichage des chips de passifs
 * (`chipHide`/`chipAdd`), section `ee` keyée par id de PERSONNAGE.
 *
 * Read-merge-write : les autres sections (weapons/amulets/talismans/sets) et
 * les champs inconnus d'une entrée (`source`) sont PRÉSERVÉS ; la section `ee`
 * est triée pour des diffs git stables ; une entrée vidée supprime la clé.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  EMPTY_EQUIPMENT_CURATED,
  validateEquipmentCurated,
  type EquipmentCurated,
  type EquipmentCuratedEntry,
} from '@datagen/curated/equipment';
import { writeJson } from '@datagen/lib/json';

const CURATED_PATH = resolve(process.cwd(), 'data/curated/equipment.json');

/** Ce que l'éditeur EE envoie (état complet de l'entrée). */
export interface EeCuratedPatch {
  rank?: string;
  rank10?: string;
  chipHide?: string[];
  chipAdd?: string[];
}

function readAll(): EquipmentCurated {
  try {
    return {
      ...EMPTY_EQUIPMENT_CURATED,
      ...(JSON.parse(readFileSync(CURATED_PATH, 'utf8')) as EquipmentCurated),
    };
  } catch {
    return { ...EMPTY_EQUIPMENT_CURATED };
  }
}

/** Entrée curée EE d'un perso (vide si absente) — lecture fraîche du disque. */
export function loadEeCuratedEntry(characterId: string): EquipmentCuratedEntry {
  return readAll().ee[characterId] ?? {};
}

const cleanList = (l?: string[]): string[] => [
  ...new Set((l ?? []).map((v) => v.trim()).filter(Boolean)),
];

/**
 * Valide puis enregistre le curé EE d'un perso. Champs vides retirés ; entrée
 * sans aucun champ → clé supprimée. Renvoie les écarts de schéma (vide = OK).
 */
export async function upsertEeCurated(
  characterId: string,
  patch: EeCuratedPatch,
): Promise<string[]> {
  const all = readAll();
  // Merge sur l'existant : préserve un éventuel `source` (hors périmètre EE).
  const next: EquipmentCuratedEntry = { ...all.ee[characterId] };
  const rank = patch.rank?.trim();
  const rank10 = patch.rank10?.trim();
  const chipHide = cleanList(patch.chipHide);
  const chipAdd = cleanList(patch.chipAdd);
  if (rank) next.rank = rank;
  else delete next.rank;
  if (rank10) next.rank10 = rank10;
  else delete next.rank10;
  if (chipHide.length) next.chipHide = chipHide;
  else delete next.chipHide;
  if (chipAdd.length) next.chipAdd = chipAdd;
  else delete next.chipAdd;

  if (Object.keys(next).length === 0) delete all.ee[characterId];
  else all.ee[characterId] = next;

  const issues = validateEquipmentCurated(all);
  if (issues.length) return issues;

  // Section `ee` triée par id (diffs stables) ; autres sections intactes.
  all.ee = Object.fromEntries(
    Object.entries(all.ee).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })),
  );
  await writeJson(CURATED_PATH, all);
  return [];
}
