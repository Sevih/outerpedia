/**
 * Primitive #1 — accès aux tables parsées et indexation.
 *
 * Toutes les tables du jeu sont parsées par `datagen:convert` en tableaux plats
 * de lignes (`Record<string, string>[]`) dans `.gamedata/parsed/<Table>.json`.
 * Ce module centralise leur chargement (avec cache) et les helpers d'indexation
 * réécrits une dizaine de fois dans la V2 (cf. audit de factorisation).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

/** Une ligne de table : colonnes → valeurs (toujours des chaînes au sortir du parser). */
export type Row = Record<string, string>;

/** Fichier parsé auto-descriptif (sortie de `datagen:convert`). */
export interface ParsedTable {
  table: string; // nom interne de la table
  columns: string[]; // schéma COMPLET (depuis l'en-tête) — fait foi, pas row[0]
  rows: Row[]; // lignes creuses (champs vides omis)
}

/** Répertoire des tables parsées (sortie de `datagen:convert`). Surchargable pour les tests. */
const PARSED_DIR = resolve(process.env.DATAGEN_PARSED_DIR ?? '.gamedata/parsed');

/** Chemin sur disque d'une table parsée (pour `statSync` & co — pas pour lire soi-même). */
export function tablePath(name: string): string {
  return resolve(PARSED_DIR, `${name}.json`);
}

/**
 * Noms des tables disponibles sur disque (sans `.json`). Ne lit AUCUN contenu :
 * le catalogue reste bon marché même si les tables pèsent 140 Mo au total.
 * Répertoire absent (extraction jamais lancée) → liste vide.
 */
export function listTableNames(): string[] {
  try {
    return readdirSync(PARSED_DIR)
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.slice(0, -5))
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

const tableCache = new Map<string, { parsed: ParsedTable; mtimeMs: number }>();

function load(name: string): ParsedTable {
  const path = resolve(PARSED_DIR, `${name}.json`);
  // INVALIDATION PAR MTIME : l'admin Next est un processus long-running qui
  // lit les tables via ce cache — après un `datagen:refresh`, les fichiers
  // parsés changent sur disque et un cache purement mémoire servirait de la
  // donnée périmée jusqu'au redémarrage. Un `statSync` au hit (aucune lecture
  // de contenu) suffit à détecter le refresh et à recharger.
  const hit = tableCache.get(name);
  let mtimeMs: number;
  try {
    mtimeMs = statSync(path).mtimeMs;
  } catch (e) {
    // Un refresh concurrent RÉÉCRIT les fichiers parsés : pendant la fenêtre
    // où le fichier est absent/renommé, on sert la copie en cache plutôt que
    // de faire planter une requête admin en vol (avant l'invalidation mtime,
    // ce cas ne touchait jamais le disque). Sans copie → vraie erreur.
    if (hit) return hit.parsed;
    throw e;
  }
  if (hit && hit.mtimeMs === mtimeMs) return hit.parsed;
  const parsed = JSON.parse(readFileSync(path, 'utf8')) as ParsedTable;
  tableCache.set(name, { parsed, mtimeMs });
  return parsed;
}

/**
 * Empreinte de FRAÎCHEUR d'un jeu de tables (mtime concaténés) — pour les
 * caches DÉRIVÉS (glossaire d'effets, encounters) : un memo module survivrait
 * au refresh alors que `loadTable`, lui, recharge — le dérivé compare
 * l'empreinte de ses sources et se reconstruit quand elle a bougé.
 *
 * Ces vérifications arrivent en BOUCLE CHAUDE (une par résolution d'effet) →
 * re-stat au plus toutes les `ttlMs` : le refresh est un événement rare, 2 s
 * de staleness sont invisibles pour l'admin, et les hits restent sans syscall.
 * Un refresh réécrit TOUTES les tables d'un coup → une table sentinelle
 * (`TextSystem`) suffit à le détecter. Fichier absent → jeton stable.
 */
const stampCache = new Map<string, { stamp: string; at: number }>();
export function tablesStamp(names: string[], ttlMs = 2000): string {
  const key = names.join(',');
  const hit = stampCache.get(key);
  const now = Date.now();
  if (hit && now - hit.at < ttlMs) return hit.stamp;
  const stamp = names
    .map((n) => {
      try {
        return String(statSync(resolve(PARSED_DIR, `${n}.json`)).mtimeMs);
      } catch {
        return 'absent';
      }
    })
    .join('|');
  stampCache.set(key, { stamp, at: now });
  return stamp;
}

/** Empreinte mtime d'un fichier HORS tables (curé éditable seul) — même usage. */
export function fileStamp(path: string): string {
  try {
    return String(statSync(resolve(path)).mtimeMs);
  } catch {
    return 'absent';
  }
}

/** Charge les lignes d'une table parsée (`CharacterTemplet`, `TextSystem`, …), avec cache. */
export function loadTable(name: string): Row[] {
  return load(name).rows;
}

/** Schéma COMPLET d'une table (toutes les colonnes, même celles toujours vides). */
export function loadColumns(name: string): string[] {
  return load(name).columns;
}

/**
 * Installe un `.get` insensible à la casse sur une Map existante.
 *
 * Les `.bytes` ont des dérives de casse entre fichiers (p. ex. `_Lv1` dans une
 * table et `_LV1` dans une autre). On garde la map d'origine intacte
 * (`keys`/`values`/`entries`/`has` inchangés) et on retombe sur un index en
 * minuscules quand la casse exacte ne matche pas.
 */
export function withCaseInsensitiveGet<V>(m: Map<string, V>): Map<string, V> {
  const exactGet = m.get.bind(m);
  const lower = new Map<string, V>();
  for (const [k, v] of m) {
    const lk = k.toLowerCase();
    if (!lower.has(lk)) lower.set(lk, v);
  }
  m.get = (k: string) => exactGet(k) ?? lower.get(k.toLowerCase());
  return m;
}

/** Indexe des lignes par colonne clé (défaut `ID`). Lookup insensible à la casse. */
export function indexBy(rows: Row[], key = 'ID'): Map<string, Row> {
  const m = new Map<string, Row>();
  for (const r of rows) {
    const k = r[key];
    if (k) m.set(k, r);
  }
  return withCaseInsensitiveGet(m);
}

/** Regroupe des lignes par colonne clé (défaut `ID`). */
export function groupBy(rows: Row[], key = 'ID'): Map<string, Row[]> {
  const m = new Map<string, Row[]>();
  for (const r of rows) {
    const k = r[key];
    if (!k) continue;
    const bucket = m.get(k);
    if (bucket) bucket.push(r);
    else m.set(k, [r]);
  }
  return m;
}

/** Parse d'entier sûr : chaîne vide / nulle / invalide → 0. */
export function num(v: string | undefined | null): number {
  if (v == null || v === '') return 0;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : 0;
}

/** Parse de nombre décimal sûr : chaîne vide / nulle / invalide → 0. */
export function numf(v: string | undefined | null): number {
  if (v == null || v === '') return 0;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

/** Parse un booléen du jeu (`'True'`/`'TRUE'` → true ; tout le reste → false). */
export function bool(v: string | undefined | null): boolean {
  return v != null && /^true$/i.test(v);
}

/** Découpe une valeur CSV en jetons nettoyés (vide → `[]`). */
export function splitCsv(v: string | undefined | null): string[] {
  if (!v) return [];
  return v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
