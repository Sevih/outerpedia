/**
 * Primitive #2 — résolution de texte localisé.
 *
 * Les tables `Text*` (`TextSystem`, `TextCharacter`, `TextSkill`, …) ont la même
 * forme : une colonne clé (`ID`) et une colonne par langue (`English`, …).
 * Ce module transforme ces lignes en « dict wiki » `{ en, jp, kr, zh }` et
 * fournit l'index clé → dict, réécrit ~6 fois dans la V2 (cf. audit).
 */
import { GAME_LANGS, LANG_COLUMNS, type LangDict } from './lang';
import { indexBy, loadTable, withCaseInsensitiveGet, type Row } from './tables';

/** Dict localisé vide (langues manquantes = chaîne vide → diffs propres). */
export function emptyDict(): LangDict {
  return { en: '', jp: '', kr: '', zh: '' };
}

/** Normalise un texte de jeu : trim + apostrophes courbes → droites. */
function clean(s: string | undefined): string {
  return (s ?? '').trim().replace(/[‘’]/g, "'");
}

/** Extrait les 4 langues d'une ligne (colonnes `English`/`Japanese`/…). `null` si ligne absente. */
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

/**
 * Construit l'index d'une table de textes :
 *   clé (colonne `keyCol`, défaut `ID`)  →  `{ en, jp, kr, zh }`
 * Lookup insensible à la casse (dérive `_Lv1` / `_LV1` entre fichiers).
 */
export function loadTextIndex(tableName: string, keyCol = 'ID'): Map<string, LangDict> {
  const byKey = indexBy(loadTable(tableName), keyCol);
  const out = new Map<string, LangDict>();
  for (const [k, row] of byKey) out.set(k, langDict(row));
  return withCaseInsensitiveGet(out);
}

/** Résout une clé de texte vers son dict localisé (clé absente ou vide → dict vide). */
export function resolveText(
  index: Map<string, LangDict>,
  key: string | undefined | null,
): LangDict {
  if (!key) return emptyDict();
  return index.get(key) ?? emptyDict();
}
