/**
 * Accès lecture aux personnages (donnée d'extraction committée).
 *
 * Cast unique du JSON importé (la justesse est garantie par l'extracteur typé +
 * les contrats ; un import JSON élargit les unions).
 */
import charactersData from '@data/generated/characters.json';
import type { Character, CharactersFile, LangDict } from '@contracts';

const CHARACTERS = charactersData as unknown as CharactersFile;

/** Item allégé pour les listes (admin/grilles). */
export interface CharacterListItem {
  id: string;
  name: LangDict;
  element: string;
  class: string;
  rarity: number;
  icon: string;
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

/** Items allégés, triés par rareté décroissante puis nom EN. */
export function getCharacterListItems(): CharacterListItem[] {
  return Object.values(CHARACTERS)
    .map((c) => ({
      id: c.id,
      name: c.name,
      element: c.element,
      class: c.class,
      rarity: c.rarity,
      icon: c.icon,
      isFusion: Boolean(c.originalCharacter),
    }))
    .sort((a, b) => b.rarity - a.rarity || a.name.en.localeCompare(b.name.en));
}
