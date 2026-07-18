/**
 * SOURCE DE VÉRITÉ des langues du SITE. Ajouter une langue = une entrée ici.
 *
 * `isOfficial: true`  = langue de jeu (le datagen produit ces données).
 * `isOfficial: false` = traduction communautaire (UI seulement, repli EN).
 *
 * Les langues `isOfficial` DOIVENT rester alignées avec `GAME_LANGS` de
 * `datagen/lib/lang.ts` (couche données). Ici on ajoute en plus le `fr`.
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
