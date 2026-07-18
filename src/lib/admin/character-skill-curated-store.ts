/**
 * Écriture de la curation d'AFFICHAGE des kits PERSOS
 * (`data/curated/character-skills.json`) — réservée à l'ADMIN local.
 *
 * Read-merge-write : la clé de doc (`_doc`) est préservée, les entrées de
 * chaque section triées pour des diffs git stables. Deux gestes LOCAUX à une
 * carte (pas de `chipOwner` comme chez les monstres : le routage perso est
 * déterministe) — `chipHide` et `chipAdd`, tous deux par cardId. Le patch est
 * limité aux cartes du perso édité : la liste envoyée pour une carte REMPLACE
 * celle du fichier (vide = suppression de la clé).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { writeJson } from '@datagen/lib/json';

const CURATED_PATH = resolve(process.cwd(), 'data/curated/character-skills.json');

interface CuratedFile {
  chipHide?: Record<string, string[]>;
  chipAdd?: Record<string, string[]>;
  [doc: string]: unknown;
}

export interface CharacterKitPatch {
  /** Cartes du perso édité — contexte de validation (chaque clé doit en être). */
  cardIds: string[];
  /** cardId → refs (tooltip/label) masquées (liste complète ; vide = retirer). */
  chipHide?: Record<string, string[]>;
  /** cardId → réfs tooltip ajoutées en chips (liste complète ; vide = retirer). */
  chipAdd?: Record<string, string[]>;
}

function readFile(): CuratedFile {
  try {
    return JSON.parse(readFileSync(CURATED_PATH, 'utf8')) as CuratedFile;
  } catch {
    return {};
  }
}

/** Sections de curation, lues FRAÎCHES du disque (l'éditeur vient d'écrire). */
export function loadCharacterKitSections(): Required<Pick<CuratedFile, 'chipHide' | 'chipAdd'>> {
  const f = readFile();
  return { chipHide: f.chipHide ?? {}, chipAdd: f.chipAdd ?? {} };
}

const sorted = <T>(rec: Record<string, T>): Record<string, T> =>
  Object.fromEntries(Object.entries(rec).sort(([a], [b]) => a.localeCompare(b)));

/** Applique un patch de kit perso. Renvoie les erreurs de validation (vide = OK). */
export async function applyCharacterKitCuration(patch: CharacterKitPatch): Promise<string[]> {
  const errors: string[] = [];
  const cards = new Set(patch.cardIds ?? []);
  if (!cards.size) errors.push('cardIds manquant');
  for (const section of ['chipHide', 'chipAdd'] as const) {
    for (const [cid, list] of Object.entries(patch[section] ?? {})) {
      if (!cards.has(cid)) errors.push(`${section}[${cid}] : pas une carte du perso`);
      if (!Array.isArray(list) || list.some((v) => typeof v !== 'string' || !v.trim()))
        errors.push(`${section}[${cid}] : liste de chaînes attendue`);
    }
  }
  if (errors.length) return errors;

  const file = readFile();
  for (const section of ['chipHide', 'chipAdd'] as const) {
    const rec = { ...(file[section] ?? {}) };
    for (const [cid, list] of Object.entries(patch[section] ?? {})) {
      const clean = [...new Set(list.map((v) => v.trim()).filter(Boolean))];
      if (!clean.length) delete rec[cid];
      else rec[cid] = clean;
    }
    file[section] = sorted(rec);
  }

  // Format CANONIQUE (`writeJson`) — sinon chaque édition reformate tout le fichier.
  await writeJson(CURATED_PATH, file);
  return [];
}
