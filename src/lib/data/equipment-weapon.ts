/**
 * Accès aux ARMES (`data/generated/equipment/weapon.json`, id → arme).
 * Fichier brut, un module par JSON : les vues vivent dans `equipment.ts` /
 * `equipment-detail.ts` (serveur : `equipment.ts` lit aussi le disque) ; ce
 * module léger sert les lecteurs qui n'ont besoin que de la table.
 */
import type { GearItem } from '@contracts';
import rawData from '@data/generated/equipment/weapon.json';

const DATA = rawData as unknown as Record<string, GearItem>;

export function getEquipmentWeapons(): Record<string, GearItem> {
  return DATA;
}
