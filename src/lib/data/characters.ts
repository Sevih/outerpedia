/**
 * Accès lecture aux personnages (donnée d'extraction committée).
 *
 * Cast unique du JSON importé (la justesse est garantie par l'extracteur typé +
 * les contrats ; un import JSON élargit les unions).
 */
import charactersData from '@data/generated/characters.json';
import slugToIdData from '@data/generated/characters-slug-to-id.json';
import glossariesData from '@data/generated/glossaries.json';
import type { Character, CharactersFile, CharacterTag, Glossaries, LangDict } from '@contracts';
import type { Lang } from '@/lib/i18n/config';
import { localePath } from '@/lib/navigation';

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
  /** Type de cadeau préféré (present_0X — cf. glossaries.gifts). */
  gift?: string;
  rarity: number;
  icon: string;
  /** Id de la base d'origine — présent = entité core-fusion (préfixe le nom). */
  originalCharacter?: string;
  /** Entité de type core-fusion (a une base d'origine). */
  isFusion: boolean;
  /** Étiquettes dérivées du jeu (le curé — `free` — se fusionne à la lecture). */
  tags?: CharacterTag[];
}

export function getAllCharacters(): Character[] {
  return Object.values(CHARACTERS);
}

// Index par NOM D'AFFICHAGE EN — la clé du contenu éditorial (parse-text,
// guides : listes de persos par nom). Construit au premier usage.
let byDisplayName: Map<string, Character> | undefined;

/** Personnage par nom d'affichage EN (insensible à la casse), undefined sinon. */
export function findCharacterByName(name: string): Character | undefined {
  if (!byDisplayName) {
    byDisplayName = new Map();
    for (const c of Object.values(CHARACTERS)) {
      byDisplayName.set(characterDisplayName(c, 'en').toLowerCase(), c);
    }
  }
  return byDisplayName.get(name.trim().toLowerCase());
}

export function getCharacter(id: string): Character | undefined {
  return CHARACTERS[id];
}

/** Un perso de guide RÉSOLU : le record, son nom d'affichage, son lien de fiche. */
export interface GuideCharacter {
  character: Character;
  name: string;
  /** Lien vers la fiche (absent si le perso n'a pas de slug public). */
  href?: string;
}

/**
 * Résout un perso désigné par son NOM ÉDITORIAL EN vers son identité d'affichage
 * et son lien de fiche — ou JETTE (build SSG cassé) si le nom est inconnu. `where`
 * nomme le composant appelant dans le message d'erreur.
 *
 * Source UNIQUE du bloc « findCharacterByName → throw → slug → name → href » que
 * recopiaient tous les composants de guide listant des persos (TurnOrder,
 * BuildRequirements, RecommendedCharacters).
 */
export function resolveGuideCharacter(name: string, lang: Lang, where: string): GuideCharacter {
  const c = findCharacterByName(name);
  if (!c) throw new Error(`${where} : personnage inconnu « ${name} »`);
  const slug = slugForId(c.id);
  return {
    character: c,
    name: characterDisplayName(c, lang),
    href: slug ? localePath(lang, `/characters/${slug}`) : undefined,
  };
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
      gift: c.gift,
      rarity: c.rarity,
      icon: c.icon,
      originalCharacter: c.originalCharacter,
      isFusion: Boolean(c.originalCharacter),
      tags: c.tags,
    }))
    .sort((a, b) => b.rarity - a.rarity || a.name.en.localeCompare(b.name.en));
}
