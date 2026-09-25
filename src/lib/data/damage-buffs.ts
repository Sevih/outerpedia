/**
 * Accès aux BUFFS du moteur de dégâts (`data/generated/damage/buffs.json`) en
 * import statique. Le wrapper serveur du calculateur le lit au DISQUE (fichier
 * réécrit par l'admin) ; le client le charge à la demande via `damage-tables.ts`.
 */
import type { DamageBuffsData } from '@/lib/damage/inputs';
import buffsData from '@data/generated/damage/buffs.json';

const BUFFS = buffsData as unknown as DamageBuffsData;

export function getDamageBuffs(): DamageBuffsData {
  return BUFFS;
}
