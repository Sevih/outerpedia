/**
 * Accès aux SETS d'armure (`data/generated/equipment/sets.json`, id → set).
 * Fichier brut, un module par JSON : les vues vivent dans `equipment.ts` /
 * `equipment-detail.ts` (serveur : `equipment.ts` lit aussi le disque) ; ce
 * module léger sert les lecteurs qui n'ont besoin que de la table.
 */
import type { GameSet } from '@contracts';
import rawData from '@data/generated/equipment/sets.json';

const DATA = rawData as unknown as Record<string, GameSet>;

export function getEquipmentSets(): Record<string, GameSet> {
  return DATA;
}
