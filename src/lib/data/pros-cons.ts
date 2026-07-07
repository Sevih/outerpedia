/**
 * Forces & faiblesses par personnage — contenu ÉDITORIAL écrit par un joueur
 * (pas une extraction). Source de vérité : la couche CURÉE
 * (`data/curated/characters.json`, éditée via /admin/editorial) ; repli sur
 * l'oracle V2 (`data/legacy/pros-cons.json`) tant qu'un perso n'a pas été
 * migré. Les textes portent des tags inline `{B/…}` résolus par parse-text.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getCharacterCurated } from '@/lib/data/curated';

export interface ProsCons {
  pros: Array<Record<string, string>>;
  cons: Array<Record<string, string>>;
}

let cache: Record<string, ProsCons> | null = null;

function loadLegacy(): Record<string, ProsCons> {
  if (!cache) {
    try {
      cache = JSON.parse(
        readFileSync(resolve(process.cwd(), 'data/legacy/pros-cons.json'), 'utf8'),
      ) as Record<string, ProsCons>;
    } catch {
      cache = {};
    }
  }
  return cache;
}

/** Pros/cons d'un perso, `null` si aucun (tous les persos n'en ont pas). */
export function getCharacterProsCons(id: string): ProsCons | null {
  const curated = getCharacterCurated(id).prosCons;
  if (curated && (curated.pros?.length || curated.cons?.length)) {
    return { pros: curated.pros ?? [], cons: curated.cons ?? [] };
  }
  const entry = loadLegacy()[id];
  if (!entry || (!entry.pros?.length && !entry.cons?.length)) return null;
  return { pros: entry.pros ?? [], cons: entry.cons ?? [] };
}
