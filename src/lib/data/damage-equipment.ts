/**
 * Accès aux PIÈCES et groupes d'options du moteur de dégâts
 * (`data/generated/damage/equipment.json`). Import statique pour les resolvers
 * node (`preset-gear`) ; le client la charge à la demande via `damage-tables.ts`.
 */
import type { DamageEquipmentData } from '@/lib/damage/inputs';
import equipmentData from '@data/generated/damage/equipment.json';

const EQUIPMENT = equipmentData as unknown as DamageEquipmentData;

export function getDamageEquipment(): DamageEquipmentData {
  return EQUIPMENT;
}
