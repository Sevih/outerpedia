/** Accès à la table de l'OST (`data/generated/bgm_mapping.json`, une entrée par piste). */
import type { BgmTrack } from '@datagen/generators/bgm-mapping';
import bgmData from '@data/generated/bgm_mapping.json';

const TRACKS = bgmData as BgmTrack[];

export function getBgmTracks(): BgmTrack[] {
  return TRACKS;
}
