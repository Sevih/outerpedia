/**
 * Accès à la table de CROISSANCE du moteur de dégâts
 * (`data/generated/damage/growth.json` : archive, transcendance, PV de guilde
 * et de titre). Import statique pour le wrapper serveur du calculateur ; le
 * client la charge à la demande via `damage-tables.ts`.
 */
import type { DamageGrowthData } from '@/lib/damage/inputs';
import growthData from '@data/generated/damage/growth.json';

const GROWTH = growthData as unknown as DamageGrowthData;

export function getDamageGrowth(): DamageGrowthData {
  return GROWTH;
}
