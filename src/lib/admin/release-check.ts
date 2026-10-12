/**
 * Le REFUS « date de sortie manquante » d'une intégration de perso, rendu
 * AVANT d'écrire et sans lever : `integrateCharacter` dérive les dates du
 * validé une fois le perso dedans (`releasesFor`), et `releasesForRoster` LÈVE
 * quand un perso n'a de date d'aucune source — la garde du générateur. Ici la
 * même dérivation dit QUI manque, pour que l'écran le montre et refuse le
 * geste sans qu'une exception serve de message.
 *
 * `missingReleases` est pur (le roster, les dates lues des notes, le curé) ;
 * `missingReleaseDates` lit les notes et le curé du dépôt.
 */
import type { Character } from '@datagen/extractor/specs/character';
import {
  buildRoster,
  composeReleases,
  extractHits,
  loadUpdateNotes,
  type ReleaseHit,
} from '@datagen/generators/character-release';
import { readCuratedJson } from '@datagen/lib/json';

/** Le curé des dates de sortie, relatif au dépôt. */
export const RELEASE_CURATED_PATH = 'data/curated/character-release.json';

/** Un perso sans date : son id (la clé à ajouter au curé) et son libellé officiel. */
export interface MissingRelease {
  id: string;
  label: string;
}

/** Les persos de `characters` qu'aucune source ne date : ni les notes, ni le curé. */
export function missingReleases(
  characters: Record<string, Character>,
  hits: ReleaseHit[],
  curated: Record<string, string>,
): MissingRelease[] {
  const roster = buildRoster(characters);
  const { releases } = composeReleases(hits, roster, curated);
  return roster.filter((r) => !releases[r.id]).map(({ id, label }) => ({ id, label }));
}

/** Même contrôle, sur les notes archivées et le curé du dépôt. */
export function missingReleaseDates(characters: Record<string, Character>): MissingRelease[] {
  const curated =
    readCuratedJson<{ releases?: Record<string, string> }>(RELEASE_CURATED_PATH)?.releases ?? {};
  return missingReleases(characters, extractHits(loadUpdateNotes()), curated);
}
