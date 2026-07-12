/**
 * Lecture de la couche CURÉE (`data/curated/characters.json`).
 *
 * Lue au système de fichiers (pas un import figé) pour que l'admin voie ses
 * écritures immédiatement. Le curé reste SÉPARÉ de l'extraction : on le fusionne
 * à la lecture (`withCurated`) plutôt que de le mélanger dans `data/generated`.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Character, CharacterCurated } from '@contracts';
import { sortTags } from './tags';

const CURATED_PATH = resolve(process.cwd(), 'data/curated/characters.json');

/** Charge tout le curé (clé = ID). Fichier absent/illisible → {} (dégradé propre). */
export function loadCuratedCharacters(): Record<string, CharacterCurated> {
  try {
    return JSON.parse(readFileSync(CURATED_PATH, 'utf8')) as Record<string, CharacterCurated>;
  } catch {
    return {};
  }
}

/** Curé d'un personnage (par id), `{}` si aucun. */
export function getCharacterCurated(id: string): CharacterCurated {
  return loadCuratedCharacters()[id] ?? {};
}

/** Personnage extrait + son contenu curé en surcouche (distinct, non aplati). */
export interface CuratedCharacter extends Character {
  curated: CharacterCurated;
}

/**
 * TOUTES les étiquettes d'un perso : celles DÉRIVÉES DU JEU (extraction) + la
 * seule humaine (`free`, curée), dans l'ordre canonique du vocabulaire.
 * Source unique — le site ne re-dérive plus aucun tag à la volée.
 *
 * `curated` se passe EN PARAMÈTRE sur les listes : le curé est relu du disque à
 * chaque appel (à dessein — l'admin doit voir ses écritures aussitôt), donc le
 * charger une fois pour tout le roster évite 122 lectures de fichier.
 * Prend un `Pick` et non un `Character` complet : les items allégés de liste
 * (`CharacterListItem`) passent tels quels.
 */
export function characterTags(
  c: Pick<Character, 'id' | 'tags'>,
  curated: Record<string, CharacterCurated> = loadCuratedCharacters(),
): string[] {
  return sortTags([...(c.tags ?? []), ...(curated[c.id]?.tags ?? [])]);
}

/** Fusionne le curé sur un personnage extrait (overlay sous la clé `curated`). */
export function withCurated(c: Character): CuratedCharacter {
  return { ...c, curated: getCharacterCurated(c.id) };
}
