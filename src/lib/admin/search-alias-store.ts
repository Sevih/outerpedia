/**
 * Écriture des ALIAS DE RECHERCHE curés (par perso) — réservée à l'ADMIN local.
 * Standalone json (`Record<id, string[]>`, PAS dans `CharacterCurated`) :
 * read-merge-write, clés triées (diffs git stables), liste vide → supprime la clé.
 * Lecture canonique dans `@/lib/data/search-aliases` (pas de doublon).
 */
import { resolve } from 'node:path';
import { writeJson } from '@datagen/lib/json';
import { loadSearchAliases } from '@/lib/data/search-aliases';

const PATH = resolve(process.cwd(), 'data/curated/search-aliases.json');

/** Nettoie une liste d'alias : trim, retire les vides, dédoublonne (insensible à la casse). */
function cleanAliases(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of list ?? []) {
    const v = (raw ?? '').trim();
    if (!v) continue;
    const k = v.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(v);
  }
  return out;
}

/** Enregistre les alias d'un perso. Liste vide → supprime la clé. Renvoie [] (rien de bloquant). */
export async function upsertSearchAliases(charId: string, aliases: string[]): Promise<string[]> {
  const compact = cleanAliases(aliases);
  const all = loadSearchAliases();
  if (compact.length === 0) delete all[charId];
  else all[charId] = compact;
  const sorted = Object.fromEntries(
    Object.entries(all).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })),
  );
  // Format CANONIQUE (`writeJson`) — sinon chaque édition reformate tout le fichier.
  await writeJson(PATH, sorted);
  return [];
}
