/**
 * Accès aux POOLS d'options d'équipement (`data/generated/equipment/pools.json`, id → lignes).
 * Fichier brut, un module par JSON : les vues vivent dans `equipment.ts` /
 * `equipment-detail.ts` (serveur : `equipment.ts` lit aussi le disque) ; ce
 * module léger sert les lecteurs qui n'ont besoin que de la table.
 */
import type { Option } from '@contracts';
import rawData from '@data/generated/equipment/pools.json';

const DATA = rawData as unknown as Record<string, Option[]>;

export function getEquipmentPools(): Record<string, Option[]> {
  return DATA;
}
