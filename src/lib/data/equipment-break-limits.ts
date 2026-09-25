/**
 * Accès aux PALIERS de breakthrough (`data/generated/equipment/breakLimits.json`, « étoile|grade » → facteurs).
 * Fichier brut, un module par JSON : les vues vivent dans `equipment.ts` /
 * `equipment-detail.ts` (serveur : `equipment.ts` lit aussi le disque) ; ce
 * module léger sert les lecteurs qui n'ont besoin que de la table.
 */
import type { BreakLimit } from '@contracts';
import rawData from '@data/generated/equipment/breakLimits.json';

const DATA = rawData as unknown as Record<string, BreakLimit>;

export function getBreakLimits(): Record<string, BreakLimit> {
  return DATA;
}
