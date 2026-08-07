import type { GameLang } from '@contracts';

/**
 * SOURCE DE VÉRITÉ des langues du SITE. Ajouter une langue = une entrée ici.
 *
 * `isOfficial: true`  = langue de jeu (le datagen produit ces données).
 * `isOfficial: false` = traduction communautaire (UI seulement, repli EN).
 *
 * Les langues `isOfficial` restent alignées avec `GAME_LANGS` de
 * `datagen/lib/lang.ts` (couche données) — c'est désormais le TYPE qui le tient,
 * cf. `GAME_LANGS` plus bas, et non plus la discipline. Ici on ajoute le `fr`.
 *
 * `import type` : effacé à la compilation, ce fichier reste client-safe (il ne
 * tire rien de `datagen` dans le bundle).
 */
export const LANGUAGES = {
  en: { label: 'English', abbrev: 'EN', flag: 'gb', subdomain: '', htmlLang: 'en', isDefault: true, isOfficial: true }, // prettier-ignore
  jp: { label: '日本語', abbrev: 'JP', flag: 'jp', subdomain: 'jp', htmlLang: 'ja', isDefault: false, isOfficial: true }, // prettier-ignore
  kr: { label: '한국어', abbrev: 'KR', flag: 'kr', subdomain: 'kr', htmlLang: 'ko', isDefault: false, isOfficial: true }, // prettier-ignore
  zh: { label: '中文', abbrev: 'ZH', flag: 'cn', subdomain: 'zh', htmlLang: 'zh', isDefault: false, isOfficial: true }, // prettier-ignore
  fr: { label: 'Français', abbrev: 'FR', flag: 'fr', subdomain: 'fr', htmlLang: 'fr', isDefault: false, isOfficial: false }, // prettier-ignore
} as const;

/** Toutes les clés de langue. */
export type Lang = keyof typeof LANGUAGES;

/** Tableau de toutes les langues. */
export const LANGS = Object.keys(LANGUAGES) as Lang[];

type DefaultLang = {
  [K in Lang]: (typeof LANGUAGES)[K]['isDefault'] extends true ? K : never;
}[Lang];

/** Langue de JEU — le sous-ensemble `isOfficial` (même idiome que `DefaultLang`). */
export type GameLangKey = {
  [K in Lang]: (typeof LANGUAGES)[K]['isOfficial'] extends true ? K : never;
}[Lang];

/**
 * Langues de JEU (celles pour lesquelles le datagen produit de la donnée) —
 * DÉRIVÉES de `LANGUAGES`, jamais réécrites en littéral.
 *
 * Une première version de cette constante avait été retirée d'ici « faute de
 * consommateur ». C'était inexact : `ItemCuratedEditor` la réimplémentait en dur
 * (`['en','jp','kr','zh']`), comme 7 autres écrans admin recopiaient la liste
 * des 5 langues du site. Trois choses portaient le même nom `LANGS` selon le
 * fichier — et comme ce sont toutes des listes de codes langue, confondre les
 * deux COMPILE : un éditeur de `LangDict` se serait mis à écrire une clé `fr`
 * hors contrat, sans une erreur. D'où deux noms distincts (audit du 07/08).
 *
 * L'annotation `readonly GameLang[]` n'est pas décorative : elle transforme en
 * ERREUR DE COMPILATION l'alignement que ce fichier et `datagen/lib/lang.ts` se
 * renvoyaient mutuellement en commentaire. Marquer une nouvelle langue
 * `isOfficial: true` sans l'ajouter à `GAME_LANGS` côté datagen ne passe plus.
 */
export const GAME_LANGS: readonly GameLang[] = LANGS.filter(
  (l) => LANGUAGES[l].isOfficial,
) as GameLangKey[];

/** Langue par défaut (repli). */
export const DEFAULT_LANG = (Object.entries(LANGUAGES).find(([, v]) => v.isDefault)?.[0] ??
  'en') as DefaultLang;

/** Garde de type. */
export function isValidLang(value: string): value is Lang {
  return value in LANGUAGES;
}

/**
 * Normalise un param de route BRUT (non fiable) vers une `Lang` valide, repli
 * sur la langue par défaut. Remplace le motif copié dans chaque page
 * (`(isValidLang(raw) ? raw : 'en') as Lang`) — plus de littéral `'en'` en dur
 * ni de cast.
 */
export function normalizeLang(raw: string): Lang {
  return isValidLang(raw) ? raw : DEFAULT_LANG;
}

// NB : la notion « langue de jeu » (sous-ensemble officiel, hors traductions
// communautaires) vit CÔTÉ DONNÉES dans `datagen/lib/lang.ts` (`GameLang`/
// `GAME_LANGS`) — la copie côté site avait été ajoutée ici mais aucun rendu ne
// la consommait ; retirée (l'alignement `isOfficial` ↔ `GAME_LANGS` reste
// documenté sur `LANGUAGES` en tête de fichier).
