/**
 * Écriture des NOMS COURTS D'AFFICHAGE curés (par perso) — ADMIN local.
 * Standalone json (`Record<id, LocalizedText>`) : read-merge-write, clés triées
 * (diffs git stables), entrée sans aucune langue → supprime la clé. Lecture
 * canonique dans `@/lib/data/short-names` (pas de doublon).
 */
import { resolve } from 'node:path';
import type { LocalizedText } from '@contracts';
import { writeJson } from '@datagen/lib/json';
import { loadShortNames } from '@/lib/data/short-names';

const PATH = resolve(process.cwd(), 'data/curated/short-names.json');
const LANGS = ['en', 'jp', 'kr', 'zh', 'fr'] as const;

/** Ne garde que les langues renseignées (trim). */
function clean(name: LocalizedText): LocalizedText {
  const out: LocalizedText = {};
  for (const l of LANGS) {
    const v = name?.[l]?.trim();
    if (v) out[l] = v;
  }
  return out;
}

/** Enregistre le nom court d'un perso. Entrée vide → supprime la clé. Renvoie []. */
export async function upsertShortName(id: string, name: LocalizedText): Promise<string[]> {
  const compact = clean(name);
  const all = loadShortNames();
  if (Object.keys(compact).length === 0) delete all[id];
  else all[id] = compact;
  const sorted = Object.fromEntries(
    Object.entries(all).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })),
  );
  // Format CANONIQUE (`writeJson`) — sinon chaque édition reformate tout le fichier.
  await writeJson(PATH, sorted);
  return [];
}
