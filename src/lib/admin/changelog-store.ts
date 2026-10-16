/**
 * Store du journal du site (page `/changelog`) — couche curée éditable, ADMIN local.
 *
 * Écrit `data/curated/changelog.json` au format canonique (`writeJson`) ; lu en
 * public par import statique (cf. `src/lib/data/changelog.ts`). L'historique a
 * été SEEDÉ une fois depuis l'ancien repo (134 entrées mappées) ; le code d'import
 * est retiré depuis — ce repo est la seule source de vérité (décision Sevih
 * 22/07 ; la fonction d'import retirée vit dans git si besoin d'archéologie).
 */
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { writeJson } from '@datagen/lib/json';
import type { ChangelogEntry, ChangelogType, UnsavedChangelogEntry } from '@/lib/data/changelog';

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

/** Forme d'un id d'entrée : 8 caractères hexadécimaux (`randomBytes(4)`). */
export const CHANGELOG_ID_RE = /^[0-9a-f]{8}$/;

/**
 * Attribue un id aux entrées qui n'en ont pas — tiré au hasard, unique dans la
 * liste, posé en PREMIÈRE clé — et rend les autres telles quelles : un id posé
 * n'est jamais recalculé. Suppose des ids existants déjà bien formés et uniques
 * (`saveChangelog` le vérifie avant).
 */
export function assignChangelogIds(list: UnsavedChangelogEntry[]): ChangelogEntry[] {
  const taken = new Set(list.flatMap((e) => (e.id ? [e.id] : [])));
  return list.map((e) => {
    if (e.id) return e as ChangelogEntry;
    let id: string;
    do id = randomBytes(4).toString('hex');
    while (taken.has(id));
    taken.add(id);
    return { id, ...e };
  });
}

/**
 * Valide puis écrit. Renvoie la liste des erreurs BLOQUANTES (vide = OK, écrit).
 * Règle minimale, comme les autres éditeurs : titre EN requis (les autres langues
 * sont un repli), type connu, date ISO ; un id présent est bien formé et unique.
 * Les entrées sans id en reçoivent un (`assignChangelogIds`) à l'écriture.
 */
export async function saveChangelog(list: UnsavedChangelogEntry[]): Promise<string[]> {
  const errors: string[] = [];
  const seen = new Set<string>();
  list.forEach((e, i) => {
    const n = `Entrée ${i + 1}`;
    if (e.id !== undefined) {
      if (typeof e.id !== 'string' || !CHANGELOG_ID_RE.test(e.id))
        errors.push(`${n} : id invalide (« ${e.id} », attendu 8 caractères hexadécimaux).`);
      else if (seen.has(e.id)) errors.push(`${n} : id en double (« ${e.id} »).`);
      else seen.add(e.id);
    }
    if (!e.title?.en?.trim()) errors.push(`${n} : titre EN requis.`);
    if (!TYPES.includes(e.type)) errors.push(`${n} : type invalide (« ${e.type} »).`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date ?? ''))
      errors.push(`${n} : date invalide (attendu YYYY-MM-DD).`);
  });
  if (errors.length) return errors;
  await writeJson(CHANGELOG_PATH, assignChangelogIds(list));
  return [];
}
