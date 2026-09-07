/**
 * Lecture de la couche CURÉE (`data/curated/characters.json`).
 *
 * Lue au système de fichiers (pas un import figé) pour que l'admin voie ses
 * écritures immédiatement. Le curé reste SÉPARÉ de l'extraction : on le fusionne
 * à la lecture (`withCurated`) plutôt que de le mélanger dans `data/generated`.
 */
import { loadCuratedJson } from '@/lib/data/disk';
import type { Character, CharacterCurated } from '@contracts';
import { sortTags } from './tags';

/** Charge tout le curé (clé = ID). Fichier absent → {} ; JSON cassé → LÈVE. */
export function loadCuratedCharacters(): Record<string, CharacterCurated> {
  return loadCuratedJson<Record<string, CharacterCurated>>('curated/characters.json', {});
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
 * chaque appel (pour que l'admin voie ses écritures aussitôt — un cache mtime
 * comme `disk.ts` rendrait le même service, cf. TODO G13), donc le
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
