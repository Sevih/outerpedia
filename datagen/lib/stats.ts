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
 * Échelles confirmées par une logique éprouvée (sets : Crit +15%,
 * Counter +12%, Bursting AP +25…).
 */
import { slugEnum } from './enums';

/**
 * Stats que le client affiche en POURCENT quel que soit l'`ApplyingType` :
 * la liste de `CUtilUI.IsPercentStat` (13 `ST_*`, recopiée telle quelle).
 * Hors liste, une valeur `OAT_ADD` est brute — EFF/RES plats (« EFF 21 ») le
 * sont parce que le client ne les classe pas en %, pas par une exception.
 */
export const PERCENT_STAT_TYPES: ReadonlySet<string> = new Set([
  'ST_DMG_REDUCE_RATE',
  'ST_CRITICAL_RATE',
  'ST_CRITICAL_DMG_RATE',
  'ST_PIERCE_POWER_RATE',
  'ST_VAMPIRIC',
  'ST_HIT_HP_RECOVERY',
  'ST_GET_GOLD_RATE',
  'ST_GET_CHARACTER_EXP_RATE',
  'ST_COUNTER_RATE',
  'ST_AVOID_ADD_CAP',
  'ST_AVOID_SUBTRACT_CAP',
  'ST_DMG_BOOST',
  'ST_E_CRI_DMG_REDUCE',
]);

/** La même liste en slugs (`slugEnum`), la forme que portent les données. */
export const PERCENT_STAT_SLUGS: ReadonlySet<string> = new Set(
  [...PERCENT_STAT_TYPES].map((t) => slugEnum(t)),
);

/** Formate une valeur de stat selon son type d'application et sa nature : la
 *  règle de `CUtilUI.GetStatValue` (`OAT_RATE` ou stat de la liste → valeur/10
 *  en %, sinon la valeur). */
export function formatStatValue(applyingType: string, value: number, stat?: string): string {
  if (applyingType === 'OAT_RATE' || (stat && PERCENT_STAT_SLUGS.has(stat)))
    return `${value / 10}%`;
  return String(value);
}
