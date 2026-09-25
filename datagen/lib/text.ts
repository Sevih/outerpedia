/**
 * Primitive #2 — résolution de texte localisé.
 *
 * Les tables `Text*` (`TextSystem`, `TextCharacter`, `TextSkill`, …) ont la même
 * forme : une colonne clé (`ID`) et une colonne par langue (`English`, …).
 * Ce module transforme ces lignes en « dict wiki » (une clé par `GAME_LANGS`) et
 * fournit l'index clé → dict, réécrit ~6 fois auparavant (cf. audit).
 */
import { GAME_LANGS, LANG_COLUMNS, emptyDict, type LangDict } from './lang';
import { indexBy, loadTable, tablesStamp, withCaseInsensitiveGet, type Row } from './tables';

// `emptyDict` vit dans `lang.ts` (module pur, importable des tests du site sans
// tirer `tables.ts` et `node:fs`) ; ré-exporté ici pour ses consommateurs historiques.
export { emptyDict, uniformDict } from './lang';

/** Normalise un texte de jeu : trim + apostrophes courbes → droites. */
function clean(s: string | undefined): string {
  return (s ?? '').trim().replace(/[‘’]/g, "'");
}

/** Extrait toutes les langues du jeu d'une ligne (colonnes `English`/`Japanese`/…). `null` si ligne absente. */
export function getLangTexts(row: Row | undefined): LangDict | null {
  if (!row) return null;
  const out = emptyDict();
  for (const lang of GAME_LANGS) out[lang] = clean(row[LANG_COLUMNS[lang]]);
  return out;
}

/** Comme `getLangTexts` mais renvoie toujours un dict (ligne absente → dict vide). */
export function langDict(row: Row | undefined): LangDict {
  return getLangTexts(row) ?? emptyDict();
}

/** Vrai si au moins une langue du dict est non vide (donnée présente). */
export function hasText(d: LangDict): boolean {
  return GAME_LANGS.some((l) => d[l] !== '');
}

// Mémoïsé par table (et colonne clé) sur la mtime du fichier parsé : un build
// appelle `loadTextIndex('TextSystem')` depuis une quinzaine de générateurs, et
// chacun ré-indexait la table entière. L'empreinte suit le refresh .gamedata
// dans le process admin long-running (modèle `curatedKeyCache`). Index et dicts
// sont PARTAGÉS entre appelants : en lecture seule (copier avant de modifier).
const textIndexCache = new Map<string, { index: Map<string, LangDict>; stamp: string }>();

/**
 * Construit l'index d'une table de textes :
 *   clé (colonne `keyCol`, défaut `ID`)  →  `LangDict`
 * Lookup insensible à la casse (dérive `_Lv1` / `_LV1` entre fichiers).
 */
export function loadTextIndex(tableName: string, keyCol = 'ID'): Map<string, LangDict> {
  const cacheKey = `${tableName}|${keyCol}`;
  const stamp = tablesStamp([tableName]);
  const hit = textIndexCache.get(cacheKey);
  if (hit && hit.stamp === stamp) return hit.index;
  const byKey = indexBy(loadTable(tableName), keyCol);
  const out = new Map<string, LangDict>();
  for (const [k, row] of byKey) out.set(k, langDict(row));
  const index = withCaseInsensitiveGet(out);
  textIndexCache.set(cacheKey, { index, stamp });
  return index;
}

/** Résout une clé de texte vers son dict localisé (clé absente ou vide → dict vide). */
export function resolveText(
  index: Map<string, LangDict>,
  key: string | undefined | null,
): LangDict {
  if (!key) return emptyDict();
  return index.get(key) ?? emptyDict();
}
