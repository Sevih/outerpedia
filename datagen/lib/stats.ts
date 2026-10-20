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

/**
 * `STAT_TYPE` du client → slug CANONIQUE de stat : la table UNIQUE (A74), relevée
 * sur les 26 colonnes de `STAT_DEFS` (`specs/character.ts`, qui en dérive ses
 * slugs), lue aussi par les passifs de fiche des monstres (`specs/monster.ts`) et
 * les options de rang des boss (`generators/encounters.ts`). C'est l'espace des
 * clés de `statScales`. Les effets de buff, eux, gardent le slug MÉCANIQUE de
 * `statSlug` (`ST_DMG_BOOST` → `dmg_boost`) : les deux espaces ne sont pas
 * encore unifiés.
 */
export const STAT_TYPE_SLUGS: Readonly<Record<string, string>> = {
  ST_HP: 'hp',
  ST_ATK: 'atk',
  ST_DEF: 'def',
  ST_SPEED: 'speed',
  ST_WG: 'guard',
  ST_CRITICAL_RATE: 'critical_rate',
  ST_CRITICAL_DMG_RATE: 'critical_dmg',
  ST_DMG_REDUCE_RATE: 'dmg_reduce',
  ST_DMG_BOOST: 'damage_boost',
  ST_PIERCE_POWER: 'pierce_power',
  ST_PIERCE_POWER_RATE: 'pierce_power_rate',
  ST_VAMPIRIC: 'vampiric',
  ST_HIT_HP_RECOVERY: 'hit_hp_recovery',
  ST_ACCURACY: 'effectiveness',
  ST_AVOID: 'resilience',
  ST_BUFF_CHANCE: 'buff_chance',
  ST_BUFF_RESIST: 'buff_resist',
  ST_COUNTER_RATE: 'counter_rate',
  ST_E_CRI_DMG_REDUCE: 'enemy_critical_dmg_reduce',
  ST_HIT_AP: 'hit_bp',
  ST_ENTER_AP: 'enter_bp',
  ST_KILL_AP: 'kill_bp',
  ST_GET_GOLD_RATE: 'get_gold_rate',
  ST_GET_CHARACTER_EXP_RATE: 'get_char_exp_rate',
  ST_AVOID_ADD_CAP: 'avoid_add_cap',
  ST_AVOID_SUBTRACT_CAP: 'avoid_subtract_cap',
};

/**
 * Slug canonique d'une `STAT_TYPE` (`ST_DMG_BOOST` → `damage_boost`), `null` si
 * aucune. Un `ST_*` absent de la table retombe sur le slug mécanique (préfixe
 * retiré, minuscules) avec un avertissement qui le nomme : un nouveau type du
 * client se voit au build au lieu de passer en silence.
 */
export function canonicalStatSlug(statType: string | undefined): string | null {
  if (!statType || statType === 'ST_NONE') return null;
  const slug = STAT_TYPE_SLUGS[statType];
  if (slug) return slug;
  console.warn(`⚠ STAT_TYPE hors de STAT_TYPE_SLUGS : ${statType} (slug mécanique)`);
  return statType.replace(/^ST_/, '').toLowerCase();
}

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
