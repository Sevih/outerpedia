/**
 * Primitive #1 — accès aux tables parsées et indexation.
 *
 * Toutes les tables du jeu sont parsées par `datagen:convert` en tableaux plats
 * de lignes (`Record<string, string>[]`) dans `.gamedata/parsed/<Table>.json`.
 * Ce module centralise leur chargement (avec cache) et les helpers d'indexation
 * réécrits une dizaine de fois dans la V2 (cf. audit de factorisation).
 */
import { readFileSync } from 'node:fs';
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

const tableCache = new Map<string, ParsedTable>();

function load(name: string): ParsedTable {
  let p = tableCache.get(name);
  if (!p) {
    p = JSON.parse(readFileSync(resolve(PARSED_DIR, `${name}.json`), 'utf8')) as ParsedTable;
    tableCache.set(name, p);
  }
  return p;
}

/** Charge les lignes d'une table parsée (`CharacterTemplet`, `TextSystem`, …), avec cache. */
export function loadTable(name: string): Row[] {
  return load(name).rows;
}

/** Schéma COMPLET d'une table (toutes les colonnes, même celles toujours vides). */
export function loadColumns(name: string): string[] {
  return load(name).columns;
}

/** Vide le cache de tables (utile entre deux générations ou en test). */
export function clearTableCache(): void {
  tableCache.clear();
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
