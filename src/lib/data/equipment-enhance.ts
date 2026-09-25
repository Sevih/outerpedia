/**
 * Accès aux RÈGLES d'enchantement (`data/generated/equipment/enhance.json` : ascension, exemples).
 * Fichier brut, un module par JSON : les vues vivent dans `equipment.ts` /
 * `equipment-detail.ts` (serveur : `equipment.ts` lit aussi le disque) ; ce
 * module léger sert les lecteurs qui n'ont besoin que de la table.
 */
import type { EnhanceRules } from '@contracts';
import rawData from '@data/generated/equipment/enhance.json';

const DATA = rawData as unknown as EnhanceRules;

export function getEnhanceRules(): EnhanceRules {
  return DATA;
}
