/**
 * Primitive #3 (amorce) — décodage des valeurs de stat.
 *
 * Les valeurs de stat du jeu se lisent selon leur `ApplyingType` :
 *   - OAT_RATE : per-mille (×10) → pourcentage (300 → 30%)
 *   - OAT_ADD  : dépend de la NATURE de la stat — les stats en pourcentage
 *     (crit, counter, lifesteal…) restent per-mille (150 → 15%), seules les
 *     stats à valeur absolue (ATK/HP plats, compteurs AP/BP) sont brutes.
 *     (`OAT_*` décrit l'APPLICATION additive/multiplicative, pas l'affichage.)
 *
 * Échelles confirmées par la logique éprouvée de la V2 (sets : Crit +15%,
 * Counter +12%, Bursting AP +25…).
 */

/** Stats de nature POURCENT : valeurs per-mille quel que soit l'ApplyingType. */
export const PERCENT_STATS = new Set([
  'critical_rate',
  'critical_dmg',
  'critical_dmg_rate',
  'counter_rate',
  'vampiric',
  'e_cri_dmg_reduce',
  'enemy_critical_dmg_reduce',
  'pierce_power_rate',
  'buff_chance',
  'buff_resist',
  'effectiveness',
  'resilience',
  'dmg_reduce',
  'dmg_reduce_rate',
  'dmg_boost',
  'damage_boost',
  'get_gold_rate',
  'avoid_add_cap',
  'avoid_subtract_cap',
]);

/**
 * Stats % dont les valeurs FLAT des pools d'équipement (`ItemOptionTemplet`,
 * OAT_ADD) sont BRUTES et sans signe % : EFF/RES en main stat d'accessoire
 * (« EFF 21 », oracle V2 `percent:false`). Leurs valeurs de SET
 * (`ItemSpecialOptionTemplet`) restent per-mille (180 → 18 %) — deux échelles
 * selon le contexte, confirmées ligne à ligne contre la V2.
 */
export const RAW_FLAT_STATS = new Set(['buff_chance', 'buff_resist']);

/** Formate une valeur de stat selon son type d'application et sa nature. */
export function formatStatValue(applyingType: string, value: number, stat?: string): string {
  if (applyingType === 'OAT_RATE' || (stat && PERCENT_STATS.has(stat))) return `${value / 10}%`;
  return String(value);
}
