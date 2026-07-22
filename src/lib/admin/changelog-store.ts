/**
 * Store du journal du site (page `/changelog`) — couche curée éditable, ADMIN local.
 *
 * Écrit `data/curated/changelog.json` au format canonique (`writeJson`) ; lu en
 * public par import statique (cf. `src/lib/data/changelog.ts`). L'historique a
 * été SEEDÉ une fois depuis le repo V2 (134 entrées mappées) ; le code d'import
 * est retiré depuis — V3 est la seule source de vérité (décision Sevih 22/07,
 * l'ancien `regenChangelogFromV2` vit dans git si besoin d'archéologie).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { writeJson } from '@datagen/lib/json';
import type { ChangelogEntry, ChangelogType } from '@/lib/data/changelog';

const CHANGELOG_PATH = resolve(process.cwd(), 'data/curated/changelog.json');

const TYPES: ChangelogType[] = ['guide', 'update', 'feature', 'character', 'news', 'fix'];

function readArray<T>(path: string): T[] {
  try {
    const data = JSON.parse(readFileSync(path, 'utf8'));
    return Array.isArray(data) ? (data as T[]) : [];
  } catch {
    return [];
  }
}

export const loadChangelog = (): ChangelogEntry[] => readArray<ChangelogEntry>(CHANGELOG_PATH);

/**
 * Valide puis écrit. Renvoie la liste des erreurs BLOQUANTES (vide = OK, écrit).
 * Règle minimale, comme les autres éditeurs : titre EN requis (les autres langues
 * sont un repli), type connu, date ISO.
 */
export async function saveChangelog(list: ChangelogEntry[]): Promise<string[]> {
  const errors: string[] = [];
  list.forEach((e, i) => {
    const n = `Entrée ${i + 1}`;
    if (!e.title?.en?.trim()) errors.push(`${n} : titre EN requis.`);
    if (!TYPES.includes(e.type)) errors.push(`${n} : type invalide (« ${e.type} »).`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date ?? ''))
      errors.push(`${n} : date invalide (attendu YYYY-MM-DD).`);
  });
  if (errors.length) return errors;
  await writeJson(CHANGELOG_PATH, list);
  return [];
}
