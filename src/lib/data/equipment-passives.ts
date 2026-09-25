/**
 * Accès aux PASSIFS d'équipement (`data/generated/equipment/passives.json`, id → passif).
 * Fichier brut, un module par JSON : les vues vivent dans `equipment.ts` /
 * `equipment-detail.ts` (serveur : `equipment.ts` lit aussi le disque) ; ce
 * module léger sert les lecteurs qui n'ont besoin que de la table.
 */
import type { Passive } from '@contracts';
import rawData from '@data/generated/equipment/passives.json';

const DATA = rawData as unknown as Record<string, Passive>;

export function getEquipmentPassives(): Record<string, Passive> {
  return DATA;
}
