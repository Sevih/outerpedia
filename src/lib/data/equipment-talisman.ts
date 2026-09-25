/**
 * Accès aux TALISMANS (`data/generated/equipment/talisman.json`, id → talisman).
 * Fichier brut, un module par JSON : les vues vivent dans `equipment.ts` /
 * `equipment-detail.ts` (serveur : `equipment.ts` lit aussi le disque) ; ce
 * module léger sert les lecteurs qui n'ont besoin que de la table.
 */
import type { SpecialItem } from '@contracts';
import rawData from '@data/generated/equipment/talisman.json';

const DATA = rawData as unknown as Record<string, SpecialItem>;

export function getEquipmentTalismans(): Record<string, SpecialItem> {
  return DATA;
}
