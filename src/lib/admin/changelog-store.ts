/**
 * Store du journal du site (page `/changelog`) — couche curée éditable, ADMIN local.
 *
 * Écrit `data/curated/changelog.json` au format canonique (`writeJson`) ; lu en
 * public par import statique (cf. `src/lib/data/changelog.ts`). Le « regen » est
 * un import PONCTUEL depuis le repo V2 voisin (comme les coupons) : il mappe les
 * 134 entrées historiques vers le format V3 et ÉCRASE la copie. Une fois seedé,
 * V3 est la source de vérité — le regen ne sert qu'à réamorcer.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { writeJson } from '@datagen/lib/json';
import { getAllCharacters, getCharacterBySlug, slugForId } from '@/lib/data/characters';
import type { ChangelogEntry, ChangelogLink, ChangelogType } from '@/lib/data/changelog';

const CHANGELOG_PATH = resolve(process.cwd(), 'data/curated/changelog.json');
// Repo V2 voisin (lecture seule, dev only). V2_DIR de .env.local, cf. .env.example.
const V2_ROOT = resolve(process.cwd(), process.env.V2_DIR ?? '../outerpedia-v2');
const V2_CHANGELOG = resolve(V2_ROOT, 'data', 'changelog.json');

const TYPES: ChangelogType[] = ['guide', 'update', 'feature', 'character', 'news', 'fix'];

function readArray<T>(path: string): T[] {
  try {
    const data = JSON.parse(readFileSync(path, 'utf8'));
    return Array.isArray(data) ? (data as T[]) : [];
  } catch {
    return [];
  }
}

/** Lecture stricte (regen) : jette si absent/invalide → on n'écrase pas à vide. */
function readArrayStrict<T>(path: string): T[] {
  const data = JSON.parse(readFileSync(path, 'utf8'));
  if (!Array.isArray(data)) throw new Error(`${path} : tableau attendu`);
  return data as T[];
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

// ─────────────────────────── Migration / regen V2 ───────────────────────────

/** Forme brute d'une entrée du changelog V2. */
interface V2Entry {
  date: string;
  type: string;
  title: Record<string, string>;
  content?: Record<string, string[]>;
  url?: string;
}

// Les types V2 réellement présents (guide/update/feature/character/news/fix)
// mappent 1:1 ; tout intrus retombe sur 'update'.
const V2_TYPE_MAP: Record<string, ChangelogType> = {
  guide: 'guide',
  update: 'update',
  feature: 'feature',
  character: 'character',
  news: 'news',
  fix: 'fix',
};
const TOOL_PREFIXES = ['/team-planner', '/tier-list', '/tools/', '/gear', '/damage'];

/**
 * Slug perso V2 → V3. Le V2 nomme un core-fusion `core-fusion-<base>` et pointe
 * en fait l'ENTITÉ FUSION, pas la base. On résout vers le perso dont
 * `originalCharacter` est la base (ex. core-fusion-epsilon → epsilon-2), sinon
 * on garde le slug nu.
 */
function normalizeCharacterSlug(slug: string): string {
  const m = slug.match(/^core-fusion-(.+)$/);
  if (!m) return slug;
  const base = getCharacterBySlug(m[1]);
  if (!base) return m[1];
  const fusion = getAllCharacters().find((c) => c.originalCharacter === base.id);
  return fusion ? (slugForId(fusion.id) ?? m[1]) : m[1];
}

/** URL interne V2 (sans préfixe de langue) → lien typé V3. */
function linkFromUrl(url?: string): ChangelogLink | undefined {
  const href = url?.trim();
  if (!href || !href.startsWith('/')) return undefined;
  const char = href.match(/^\/characters\/([^/?#]+)/);
  if (char) return { kind: 'character', slug: normalizeCharacterSlug(char[1]) };
  if (href.startsWith('/guides/')) return { kind: 'guide', href };
  if (TOOL_PREFIXES.some((p) => href.startsWith(p))) return { kind: 'tool', href };
  return { kind: 'page', href };
}

const stripBullet = (s: string): string => s.replace(/^\s*-\s+/, '');

function fromV2(e: V2Entry): ChangelogEntry {
  const content: Record<string, string[]> = {};
  for (const [lang, lines] of Object.entries(e.content ?? {})) {
    content[lang] = lines.map(stripBullet);
  }
  const link = linkFromUrl(e.url);
  let type = V2_TYPE_MAP[e.type] ?? 'update';
  // Une entrée « update » qui pointe une fiche perso est en fait une SORTIE de
  // perso (souvent core-fusion / variante alternative), mal typée en V2 → 'character'.
  // On ne touche pas aux autres types (une 'news' liée à un perso reste 'news').
  if (link?.kind === 'character' && type === 'update') type = 'character';
  return {
    date: e.date,
    type,
    title: e.title as ChangelogEntry['title'],
    content: content as ChangelogEntry['content'],
    ...(link && { link }),
  };
}

/**
 * Importe l'historique du changelog V2 (écrase la copie V3). Ordre newest-first
 * garanti par un tri décroissant sur la date.
 */
export async function regenChangelogFromV2(): Promise<ChangelogEntry[]> {
  const raw = readArrayStrict<V2Entry>(V2_CHANGELOG);
  const mapped = raw.map(fromV2).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  await writeJson(CHANGELOG_PATH, mapped);
  return mapped;
}
