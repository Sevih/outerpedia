/**
 * Accès aux ÉQUIPEMENTS EXCLUSIFS (`data/generated/equipment/ee.json`, id → EE).
 * Fichier brut, un module par JSON : les vues vivent dans `equipment.ts` /
 * `equipment-detail.ts` (serveur : `equipment.ts` lit aussi le disque) ; ce
 * module léger sert les lecteurs qui n'ont besoin que de la table.
 */
import type { ExclusiveItem } from '@contracts';
import rawData from '@data/generated/equipment/ee.json';

const DATA = rawData as unknown as Record<string, ExclusiveItem>;

export function getEquipmentEe(): Record<string, ExclusiveItem> {
  return DATA;
}
