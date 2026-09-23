/**
 * Langues officielles du jeu — celles pour lesquelles les fichiers `.bytes`
 * contiennent réellement de la donnée.
 *
 * Six depuis le 2026-09-23 : le client a livré le français et l'espagnol
 * (colonnes `French` / `Spanish` des 15 tables `Text*`, remplies à 100 %). Le
 * `fr` était jusque-là une traduction d'UI communautaire hors de cette liste,
 * avec repli anglais sur le contenu de jeu ; il est désormais une langue de
 * données comme les autres. Les tables portent aussi un `China_Traditional`
 * que le site ne sert pas (pas de langue `zh-TW` côté site — à ajouter ici ET
 * dans `LANGUAGES` le jour où il y en aura une).
 *
 * Aligné par le TYPE sur les langues `isOfficial` de `src/lib/i18n/config.ts`
 * (`GameLang`) : une divergence ne compile pas.
 */
export const GAME_LANGS = ['en', 'jp', 'kr', 'zh', 'fr', 'es'] as const;

export type GameLang = (typeof GAME_LANGS)[number];

/** Langue de repli pour le contenu de jeu (anglais). */
export const DEFAULT_LANG: GameLang = 'en';

/** Colonne du fichier de données du jeu correspondant à chaque langue. */
export const LANG_COLUMNS: Record<GameLang, string> = {
  en: 'English',
  jp: 'Japanese',
  kr: 'Korean',
  zh: 'China_Simplified',
  fr: 'French',
  es: 'Spanish',
};

/** Texte localisé dans toutes les langues officielles (format « dict wiki »). */
export type LangDict = Record<GameLang, string>;

/**
 * Dict localisé vide (langues manquantes = chaîne vide → diffs propres).
 * DÉRIVÉ de `GAME_LANGS` : la forme littérale `{ en: '', jp: '', kr: '', zh: '' }`
 * était recopiée dans 3 générateurs et 17 fixtures de tests — chacune une
 * copie à oublier au passage à 6 langues.
 */
export function emptyDict(): LangDict {
  return Object.fromEntries(GAME_LANGS.map((l) => [l, ''])) as LangDict;
}

/** Dict dont toutes les langues portent la même valeur (id brut, clé de test…). */
export function uniformDict(value: string): LangDict {
  return Object.fromEntries(GAME_LANGS.map((l) => [l, value])) as LangDict;
}
