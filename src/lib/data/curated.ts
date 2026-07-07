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

/** Fusionne le curé sur un personnage extrait (overlay sous la clé `curated`). */
export function withCurated(c: Character): CuratedCharacter {
  return { ...c, curated: getCharacterCurated(c.id) };
}
