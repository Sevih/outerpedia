/**
 * Écriture de la curation d'AFFICHAGE des kits monstres
 * (`data/curated/monster-skills.json`) — réservée à l'ADMIN local.
 *
 * Read-merge-write : les clés de doc (`_doc*`, `_notes`) sont préservées, les
 * entrées de chaque section triées pour des diffs git stables. La sémantique
 * des trois gestes est documentée dans le fichier curé lui-même ; ici on ne
 * fait que fusionner un PATCH limité au kit édité :
 *   - `chipOwner` est GLOBAL par buff (kits jumeaux → liste de candidats) :
 *     poser un porteur pour CE kit préserve les candidats des autres kits
 *     (ceux qui ne sont pas dans `kitSkillIds`) ;
 *   - `chipHide`/`chipAdd` sont par skill : la liste envoyée REMPLACE celle du
 *     skill (vide = suppression de la clé).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { writeJson } from '@datagen/lib/json';

const CURATED_PATH = resolve(process.cwd(), 'data/curated/monster-skills.json');

interface CuratedFile {
  chipOwner?: Record<string, string | string[]>;
  chipAdd?: Record<string, string[]>;
  chipHide?: Record<string, string[]>;
  [doc: string]: unknown;
}

export interface KitCurationPatch {
  /** Skills du kit édité — contexte pour préserver les candidats jumeaux. */
  kitSkillIds: string[];
  /** buffId → skillId porteur du kit, ou null = retirer le choix pour CE kit. */
  chipOwner?: Record<string, string | null>;
  /** skillId → buffIds masqués sur la carte (liste complète ; vide = retirer). */
  chipHide?: Record<string, string[]>;
  /** skillId → réfs tooltip ajoutées en chips (liste complète ; vide = retirer). */
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
export function loadKitCurationSections(): Required<
  Pick<CuratedFile, 'chipOwner' | 'chipAdd' | 'chipHide'>
> {
  const f = readFile();
  return { chipOwner: f.chipOwner ?? {}, chipAdd: f.chipAdd ?? {}, chipHide: f.chipHide ?? {} };
}

const sorted = <T>(rec: Record<string, T>): Record<string, T> =>
  Object.fromEntries(Object.entries(rec).sort(([a], [b]) => a.localeCompare(b)));

/** Applique un patch de kit. Renvoie les erreurs de validation (vide = OK). */
export async function applyKitCuration(patch: KitCurationPatch): Promise<string[]> {
  const errors: string[] = [];
  const kit = new Set(patch.kitSkillIds ?? []);
  if (!kit.size) errors.push('kitSkillIds missing');
  for (const [buff, target] of Object.entries(patch.chipOwner ?? {})) {
    if (target !== null && !kit.has(target))
      errors.push(`chipOwner[${buff}] : ${target} is not a skill of the kit`);
  }
  for (const section of ['chipHide', 'chipAdd'] as const) {
    for (const [sid, list] of Object.entries(patch[section] ?? {})) {
      if (!kit.has(sid)) errors.push(`${section}[${sid}] : not a skill of the kit`);
      if (!Array.isArray(list) || list.some((v) => typeof v !== 'string' || !v.trim()))
        errors.push(`${section}[${sid}] : string list expected`);
    }
  }
  if (errors.length) return errors;

  const file = readFile();

  const owner = { ...(file.chipOwner ?? {}) };
  for (const [buff, target] of Object.entries(patch.chipOwner ?? {})) {
    const existing = owner[buff];
    // Candidats des AUTRES kits (jumeaux) : préservés tels quels.
    const others = (Array.isArray(existing) ? existing : existing ? [existing] : []).filter(
      (sid) => !kit.has(sid),
    );
    const next = target === null ? others : [...others, target];
    if (!next.length) delete owner[buff];
    else owner[buff] = next.length === 1 ? next[0] : next;
  }
  file.chipOwner = sorted(owner);

  for (const section of ['chipHide', 'chipAdd'] as const) {
    const rec = { ...(file[section] ?? {}) };
    for (const [sid, list] of Object.entries(patch[section] ?? {})) {
      const clean = [...new Set(list.map((v) => v.trim()).filter(Boolean))];
      if (!clean.length) delete rec[sid];
      else rec[sid] = clean;
    }
    file[section] = sorted(rec);
  }

  // Format CANONIQUE (`writeJson`) — sinon chaque édition reformate tout le fichier.
  await writeJson(CURATED_PATH, file);
  return [];
}
