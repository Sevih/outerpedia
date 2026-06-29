/**
 * Langues officielles du jeu — celles pour lesquelles les fichiers `.bytes`
 * contiennent réellement de la donnée.
 *
 * Le français de la V3 est une traduction d'UI communautaire, PAS une langue
 * de données de jeu : il n'a donc pas sa place ici. L'atelier `datagen` ne
 * connaît que ces 4 langues.
 *
 * À garder aligné avec les langues `isOfficial` de la future config i18n
 * (`src/lib/i18n`) quand elle sera portée depuis la V2.
 */
export const GAME_LANGS = ['en', 'jp', 'kr', 'zh'] as const;

export type GameLang = (typeof GAME_LANGS)[number];

/** Langue de repli pour le contenu de jeu (anglais). */
export const DEFAULT_LANG: GameLang = 'en';

/** Colonne du fichier de données du jeu correspondant à chaque langue. */
export const LANG_COLUMNS: Record<GameLang, string> = {
  en: 'English',
  jp: 'Japanese',
  kr: 'Korean',
  zh: 'China_Simplified',
};

/** Texte localisé dans les 4 langues officielles (format « dict wiki »). */
export type LangDict = Record<GameLang, string>;
