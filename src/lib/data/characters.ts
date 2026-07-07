/**
 * Accès lecture aux personnages (donnée d'extraction committée).
 *
 * Cast unique du JSON importé (la justesse est garantie par l'extracteur typé +
 * les contrats ; un import JSON élargit les unions).
 */
import charactersData from '@data/generated/characters.json';
import slugToIdData from '@data/generated/characters-slug-to-id.json';
import glossariesData from '@data/generated/glossaries.json';
import type { Character, CharactersFile, Glossaries, LangDict } from '@contracts';

const CHARACTERS = charactersData as unknown as CharactersFile;
const FUSION_TITLE = (glossariesData as unknown as Glossaries).fusionTitle;
const SLUG_TO_ID = slugToIdData as Record<string, string>;
const ID_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(SLUG_TO_ID).map(([slug, id]) => [id, slug]),
);

/** Forme minimale pour calculer un nom affichable. */
type Named = {
  name: LangDict;
  nickname?: LangDict;
  showNickName?: boolean;
  originalCharacter?: string;
};

/**
 * Nom AFFICHABLE — source unique. Préfixes : « Core Fusion » (libellé du jeu)
 * pour les entités core-fusion (c'est leur nom complet), sinon le surnom quand
 * le perso l'inclut (`showNickName`), ex. « Monad Iota ».
 */
export function characterDisplayName(c: Named, lang: string = 'en'): string {
  const prefix = characterNamePrefix(c, lang);
  const base = ((c.name as Record<string, string>)[lang] ?? c.name.en) as string;
  return prefix ? `${prefix} ${base}` : base;
}

/** Préfixe de titre seul (« Core Fusion » / surnom), null sinon. */
export function characterNamePrefix(c: Named, lang: string = 'en'): string | null {
  const pick = (d: LangDict) => (d as Record<string, string>)[lang] ?? d.en;
  if (c.originalCharacter) return pick(FUSION_TITLE);
  if (c.showNickName && c.nickname) return pick(c.nickname);
  return null;
}

/** Item allégé pour les listes (admin/grilles). */
export interface CharacterListItem {
  id: string;
  name: LangDict;
  nickname?: LangDict;
  showNickName?: boolean;
  element: string;
  class: string;
  subClass?: string;
  chainType?: string;
  rarity: number;
  icon: string;
  /** Id de la base d'origine — présent = entité core-fusion (préfixe le nom). */
  originalCharacter?: string;
  /** Entité de type core-fusion (a une base d'origine). */
  isFusion: boolean;
}

export function getAllCharacters(): Character[] {
  return Object.values(CHARACTERS);
}

export function getCharacter(id: string): Character | undefined {
  return CHARACTERS[id];
}

export function listCharacterIds(): string[] {
  return Object.keys(CHARACTERS);
}

/** Tous les slugs connus (pour `generateStaticParams`). */
export function listCharacterSlugs(): string[] {
  return Object.keys(SLUG_TO_ID);
}

/** slug → id (undefined si inconnu). */
export function resolveSlug(slug: string): string | undefined {
  return SLUG_TO_ID[slug];
}

/** id → slug (pour construire les hrefs). */
export function slugForId(id: string): string | undefined {
  return ID_TO_SLUG[id];
}

/** Personnage par slug (undefined si inconnu). */
export function getCharacterBySlug(slug: string): Character | undefined {
  const id = SLUG_TO_ID[slug];
  return id ? CHARACTERS[id] : undefined;
}

/** Items allégés, triés par rareté décroissante puis nom EN. */
export function getCharacterListItems(): CharacterListItem[] {
  return Object.values(CHARACTERS)
    .map((c) => ({
      id: c.id,
      name: c.name,
      nickname: c.nickname,
      showNickName: c.showNickName,
      element: c.element,
      class: c.class,
      subClass: c.subClass,
      chainType: c.chainType,
      rarity: c.rarity,
      icon: c.icon,
      originalCharacter: c.originalCharacter,
      isFusion: Boolean(c.originalCharacter),
    }))
    .sort((a, b) => b.rarity - a.rarity || a.name.en.localeCompare(b.name.en));
}
