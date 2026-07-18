/**
 * Forces & faiblesses par personnage — contenu ÉDITORIAL écrit par un joueur
 * (pas une extraction). Source de vérité : la couche CURÉE
 * (`data/curated/characters.json`, éditée via /admin/editorial). Les textes
 * portent des tags inline `{B/…}` résolus par parse-text.
 */
import { getCharacterCurated } from '@/lib/data/curated';

export interface ProsCons {
  pros: Array<Record<string, string>>;
  cons: Array<Record<string, string>>;
}

/** Pros/cons d'un perso, `null` si aucun (tous les persos n'en ont pas). */
export function getCharacterProsCons(id: string): ProsCons | null {
  const curated = getCharacterCurated(id).prosCons;
  if (curated && (curated.pros?.length || curated.cons?.length)) {
    return { pros: curated.pros ?? [], cons: curated.cons ?? [] };
  }
  return null;
}
