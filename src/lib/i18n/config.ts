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

/** Langues non-défaut. */
export type SuffixLang = Exclude<Lang, typeof DEFAULT_LANG>;

/** Config d'une langue. */
export function getLangConfig(lang: Lang) {
  return LANGUAGES[lang];
}

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

/**
 * GameLang = langues officiellement fournies par le jeu (données extraites).
 * Sous-ensemble de `Lang` ; les traductions communautaires (fr) n'en font pas
 * partie. Doit correspondre à `GAME_LANGS` de `datagen/lib/lang.ts`.
 */
type OfficialLang = {
  [K in Lang]: (typeof LANGUAGES)[K]['isOfficial'] extends true ? K : never;
}[Lang];
export type GameLang = OfficialLang;

/** Langues de jeu, dans l'ordre de LANGUAGES. */
export const GAME_LANGS = LANGS.filter((l): l is GameLang => LANGUAGES[l].isOfficial);

/** Garde de type pour les langues de jeu. */
export function isGameLang(value: string): value is GameLang {
  return value in LANGUAGES && LANGUAGES[value as Lang].isOfficial;
}
