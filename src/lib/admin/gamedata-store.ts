/**
 * Lecteur des tables BRUTES du jeu (`.gamedata/parsed/*.json`) — ADMIN local.
 *
 * Contrairement aux autres stores admin, celui-ci n'interprète RIEN : il sert la
 * donnée telle que le parser l'a produite (lignes de chaînes), et se contente de
 * la rendre lisible : recherche, pagination, résolution des clés de texte et
 * liens entre tables. C'est l'outil d'exploration qui précède l'écriture d'un
 * générateur `datagen` — pas une source pour le site.
 *
 * Toute la lecture passe par les primitives `datagen/lib/tables` (cache +
 * invalidation par mtime) : un `datagen:refresh` est vu sans redémarrer Next.
 */
import { statSync } from 'node:fs';
import {
  listTableNames,
  loadColumns,
  loadTable,
  tablePath,
  tablesStamp,
  type Row,
} from '@datagen/lib/tables';
import { loadTextIndex } from '@datagen/lib/text';
import type { LangDict } from '@contracts';

export type { Row };

/** Ligne du catalogue : bon marché (aucun parse de contenu). */
export interface TableInfo {
  name: string;
  bytes: number;
  mtimeMs: number;
}

/** Schéma EFFECTIF d'une table (cf. `describeTable`). */
export interface TableSchema {
  /** Nom interne déclaré par le parser (`CAdventureTemplet`), ≠ nom de fichier. */
  table: string;
  /** Colonnes de l'en-tête, puis les `_unknown_*` rencontrées dans les lignes. */
  columns: string[];
  /** Colonnes réellement renseignées par au moins une ligne. */
  filled: string[];
  rowCount: number;
}

/** Une page de résultats. */
export interface TablePage extends TableSchema {
  /** Lignes de la page, dans l'ordre du fichier (l'ordre du jeu porte du sens). */
  rows: Row[];
  /** Lignes correspondant au filtre (≠ `rowCount`, qui compte toute la table). */
  matched: number;
  page: number;
  pageSize: number;
  /** Clé de texte → anglais, pour les cellules de la page (si `resolve`). */
  texts: Record<string, string>;
  /** Colonne → table cible, pour les liens croisés (cf. `linkTargets`). */
  links: Record<string, string>;
}

export interface TableQuery {
  /** Recherche insensible à la casse (sous-chaîne). */
  q?: string;
  /** Restreint la recherche à une colonne (sinon : toutes). */
  col?: string;
  /**
   * Égalité stricte sur `col` au lieu de la sous-chaîne — c'est ce que veut un
   * lien croisé : `ID = 101` ne doit pas ramener `1011` et `2101`.
   */
  exact?: boolean;
  page?: number;
  pageSize?: number;
  /** Résoudre les cellules qui sont des clés de texte du jeu. */
  resolve?: boolean;
}

export const PAGE_SIZE = 50;

/** Un nom de table est un basename de fichier — jamais un chemin. */
export function isValidTableName(name: string): boolean {
  return /^[A-Za-z0-9_]+$/.test(name);
}

/** Catalogue des tables parsées, avec taille et date de la dernière extraction. */
export function listGameTables(): TableInfo[] {
  return listTableNames().map((name) => {
    try {
      const s = statSync(tablePath(name));
      return { name, bytes: s.size, mtimeMs: s.mtimeMs };
    } catch {
      return { name, bytes: 0, mtimeMs: 0 };
    }
  });
}

// Le schéma effectif demande un balayage complet des lignes (les tables font
// jusqu'à 18 Mo) : on le mémoïse par empreinte mtime, comme les autres dérivés.
const schemaCache = new Map<string, { stamp: string; schema: TableSchema }>();

/**
 * Schéma EFFECTIF : l'en-tête ne fait pas foi à lui seul. Les lignes sont
 * creuses (champs vides omis) et portent parfois des colonnes hors en-tête,
 * nommées `_unknown_N` par le parser — les masquer reviendrait à cacher
 * précisément la donnée qu'on vient explorer. On expose donc l'union
 * en-tête + colonnes rencontrées, et à part la liste de celles réellement
 * renseignées (les tables du jeu traînent beaucoup de colonnes mortes).
 */
export function describeTable(name: string): TableSchema {
  const stamp = tablesStamp([name]);
  const hit = schemaCache.get(name);
  if (hit && hit.stamp === stamp) return hit.schema;

  const rows = loadTable(name);
  const header = loadColumns(name);
  const known = new Set(header);
  const extras: string[] = [];
  const filled = new Set<string>();
  for (const row of rows) {
    for (const [k, v] of Object.entries(row)) {
      if (!known.has(k)) {
        known.add(k);
        extras.push(k);
      }
      if (v !== '') filled.add(k);
    }
  }
  const columns = [...header, ...extras];
  const schema: TableSchema = {
    table: name,
    columns,
    filled: columns.filter((c) => filled.has(c)),
    rowCount: rows.length,
  };
  schemaCache.set(name, { stamp, schema });
  return schema;
}

// --- Résolution des clés de texte ---------------------------------------------

// Les `Text*` volumineuses sont des DIALOGUES (scénario, voix) : rien ne les
// référence par clé depuis les tables de gameplay, et les charger coûterait
// ~50 Mo pour zéro résolution. On indexe les autres.
const TEXT_TABLES = () =>
  listTableNames().filter((n) => n.startsWith('Text') && !/^Text(Scenario|Voice)/.test(n));

let textCache: { stamp: string; index: Map<string, string> } | null = null;

/** Index unifié clé → anglais de toutes les tables de texte « de gameplay ». */
function textIndex(): Map<string, string> {
  const tables = TEXT_TABLES();
  const stamp = tablesStamp(tables);
  if (textCache && textCache.stamp === stamp) return textCache.index;

  const index = new Map<string, string>();
  for (const t of tables) {
    let entries: Map<string, LangDict>;
    try {
      entries = loadTextIndex(t);
    } catch {
      continue; // table absente / illisible : les autres restent utiles
    }
    // Premier arrivé gagne : une clé présente dans deux tables y a le même
    // texte, et on évite qu'une table tardive écrase par une chaîne vide.
    for (const [k, d] of entries) if (d.en && !index.has(k)) index.set(k, d.en);
  }
  textCache = { stamp, index };
  return index;
}

/**
 * Textes anglais des cellules d'une page. On tente TOUTE valeur non numérique :
 * un lookup de Map est gratuit, et il n'existe pas de motif fiable de clé
 * (`SYS_*`, `NAME_ITEM_*`, `Buff_*`… selon les tables). Une valeur sans entrée
 * n'était simplement pas une clé.
 */
function resolveCells(rows: Row[]): Record<string, string> {
  const index = textIndex();
  const out: Record<string, string> = {};
  for (const row of rows) {
    for (const v of Object.values(row)) {
      if (!v || v in out || /^-?[\d.,]+$/.test(v)) continue;
      const en = index.get(v);
      if (en) out[v] = en;
    }
  }
  return out;
}

// --- Liens croisés -------------------------------------------------------------

/**
 * Colonne → table cible, déduit du NOM de colonne. La colonne porte un RÔLE
 * devant l'entité (`ClearDungeonID`, `FirstRewardID`) : on retire `ID`, puis on
 * essaie les suffixes de mots du plus long au plus court (`ClearDungeon`, puis
 * `Dungeon`) et on garde le premier qui correspond à une table existante —
 * `<X>Templet` d'abord, `<X>` ensuite.
 *
 * Volontairement conservateur : sans table candidate sur disque, PAS de lien
 * (un faux lien coûte plus cher qu'un lien absent). Les `NameID`/`DescID` ne
 * désignent d'ailleurs pas des tables mais des clés de texte — ils tombent
 * naturellement dans ce trou, et c'est la résolution de texte qui les rend
 * lisibles. La cible se filtre sur sa clé primaire `ID`.
 */
/**
 * Table cible d'UNE colonne (pur, testable). Retire le suffixe `ID(s)`, puis
 * essaie les suffixes de mots du plus long au plus court (`ClearDungeon`, puis
 * `Dungeon`), en préférant `<X>Templet` à `<X>`. `undefined` si aucune table
 * candidate n'existe (conservateur), ou si la colonne n'est pas un `*ID`.
 */
export function linkTargetFor(col: string, tables: Set<string>): string | undefined {
  const base = col.replace(/I[Dd]s?$/, '');
  if (!base || base === col) return undefined; // seules les colonnes `*ID` désignent une table
  const words = base.match(/[A-Z][a-z0-9]*|[a-z0-9]+/g) ?? [];
  for (let i = 0; i < words.length; i++) {
    const cand = words.slice(i).join('');
    const target = [`${cand}Templet`, cand].find((t) => tables.has(t));
    if (target) return target;
  }
  return undefined;
}

export function linkTargets(columns: string[]): Record<string, string> {
  const tables = new Set(listTableNames());
  const out: Record<string, string> = {};
  for (const col of columns) {
    const target = linkTargetFor(col, tables);
    if (target) out[col] = target;
  }
  return out;
}

// --- Requête --------------------------------------------------------------------

/** Page filtrée d'une table. Recherche = sous-chaîne insensible à la casse. */
export function queryTable(name: string, query: TableQuery = {}): TablePage {
  const schema = describeTable(name);
  const {
    q = '',
    col = '',
    exact = false,
    page = 1,
    pageSize = PAGE_SIZE,
    resolve = false,
  } = query;

  const needle = q.trim().toLowerCase();
  const all = loadTable(name);
  const matches = !needle
    ? all
    : all.filter((row) => {
        if (!col) return Object.values(row).some((v) => v.toLowerCase().includes(needle));
        const cell = (row[col] ?? '').toLowerCase();
        return exact ? cell === needle : cell.includes(needle);
      });

  const pages = Math.max(1, Math.ceil(matches.length / pageSize));
  const current = Math.min(Math.max(1, page), pages);
  const rows = matches.slice((current - 1) * pageSize, current * pageSize);

  return {
    ...schema,
    rows,
    matched: matches.length,
    page: current,
    pageSize,
    texts: resolve ? resolveCells(rows) : {},
    links: linkTargets(schema.columns),
  };
}
