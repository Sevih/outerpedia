/**
 * STATS — table de correspondance UNIQUE du domaine « stats » côté app.
 *
 * Un seul espace de clés dans la donnée générée depuis C27 : le slug de
 * `STAT_TYPE_SLUGS` (datagen/lib/stats.ts, `statSlug`), que portent fiches,
 * effets de buff, pools, sets et glossaire (`hp`, `damage_boost`, `hit_bp`…).
 * L'ancien slug mécanique des buffs (`dmg_boost`…) ne se lit plus que par
 * `currentStatSlug` (données figées, liens `?z=`).
 * Ce slug converge ici vers une ABRÉVIATION canonique (convention WIKI —
 * vérifié : le jeu n'a AUCUNE abréviation dans ses textes), qui est aussi le
 * token éditorial de `{S/…}` (parse-text).
 * Le nom complet localisé vient du JEU : glossaire `statNames` (SYS_STAT_*),
 * résolu par `statName()` — plus aucune traduction écrite main.
 *
 * Toute nouvelle correspondance de stat se déclare ICI, nulle part ailleurs.
 */
import { PERCENT_STAT_SLUGS, STAT_TYPE_SLUGS } from '@/../datagen/lib/stats';

/** Slug de stat → abréviation canonique. */
export const STAT_ABBR: Record<string, string> = {
  hp: 'HP',
  atk: 'ATK',
  def: 'DEF',
  speed: 'SPD',
  guard: 'WG',
  critical_rate: 'CHC',
  critical_dmg: 'CHD',
  effectiveness: 'EFF',
  resilience: 'RES',
  buff_chance: 'EFF',
  buff_resist: 'RES',
  dmg_reduce: 'DMG RED%',
  damage_boost: 'DMG UP%',
  vampiric: 'LS',
  pierce_power: 'PEN',
  pierce_power_rate: 'PEN%',
  enemy_critical_dmg_reduce: 'CDMG RED%',
  // `effectiveness`/`resilience` sont les slugs de `ST_ACCURACY`/`ST_AVOID`,
  // stats RETIRÉES du jeu (l'ancien couple précision/esquive) : leurs effets
  // de buff (« Miss Rate »…) se nomment par leur statut, jamais par cette
  // abréviation, qui ne sert qu'aux colonnes de fiche.
};

/**
 * Slug MÉCANIQUE d'avant C27 (`ST_X` → `x`) → slug de stat, pour les seules
 * entrées qui diffèrent (`dmg_boost` → `damage_boost`, `hit_ap` → `hit_bp`…),
 * DÉRIVÉ de `STAT_TYPE_SLUGS`. Table de COMPATIBILITÉ en lecture : les archives
 * de boss épinglés (données figées) et les liens `?z=` du calculateur portent
 * encore l'ancien slug ; rien de neuf ne l'émet.
 */
export const LEGACY_STAT_SLUGS: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(STAT_TYPE_SLUGS)
    .map(([st, slug]) => [st.replace(/^ST_/, '').toLowerCase(), slug])
    .filter(([legacy, slug]) => legacy !== slug),
);

/** Slug de stat à jour : l'ancien slug mécanique traduit, tout autre inchangé. */
export function currentStatSlug(slug: string): string {
  return LEGACY_STAT_SLUGS[slug] ?? slug;
}

/** Abréviation canonique → sprite d'icône de stat du jeu (`CM_Stat_Icon_*`). */
export const STAT_ICON: Record<string, string> = {
  ATK: 'CM_Stat_Icon_ATK',
  'ATK%': 'CM_Stat_Icon_ATK',
  DEF: 'CM_Stat_Icon_DEF',
  'DEF%': 'CM_Stat_Icon_DEF',
  HP: 'CM_Stat_Icon_HP',
  'HP%': 'CM_Stat_Icon_HP',
  SPD: 'CM_Stat_Icon_SPEED',
  CHC: 'CM_Stat_Icon_CRITICAL',
  CHD: 'CM_Stat_Icon_CRITICAL_DMG',
  EFF: 'CM_Stat_Icon_CHANCE',
  'EFF%': 'CM_Stat_Icon_CHANCE',
  RES: 'CM_Stat_Icon_RESIST',
  'RES%': 'CM_Stat_Icon_RESIST',
  PEN: 'CM_Stat_Icon_PIERCE_POWER',
  'PEN%': 'CM_Stat_Icon_PIERCE_POWER',
  LS: 'CM_Stat_Icon_VAMPIRIC',
  'DMG UP%': 'CM_Stat_Icon_DMG_INCREASE',
  'DMG RED%': 'CM_Stat_Icon_ENEMY_DMG_REDUCE',
  'CDMG RED%': 'CM_Stat_Icon_ENEMY_CRITICAL_DMG_REDUCE',
};

/** Abréviation d'un slug de stat (repli : slug en capitales). */
export function statAbbr(slug: string): string {
  return STAT_ABBR[slug] ?? slug.toUpperCase();
}

/**
 * Sprite d'icône d'un slug de stat, `undefined` si le jeu n'en a pas.
 *
 * Il en manque une, et une seule : la WG (`guard`). Le jeu ne lui donne pas de
 * `CM_Stat_Icon_*` — elle n'apparaît qu'en jauge de combat (`IG_GaugeTitle_WG`),
 * ce qui n'est pas une icône de stat. On ne lui en invente donc pas : l'appelant
 * retombe sur l'abréviation.
 */
export function statIconSprite(slug: string): string | undefined {
  return STAT_ICON[statAbbr(slug)];
}

/**
 * Seules les stats à DOUBLE nature (flat + %) prennent le suffixe « % » sur
 * leur variante rate (ATK/ATK%, EFF/EFF%…) ; les stats intrinsèquement % gardent
 * leur abréviation nue (CHD, CHC…), comme en jeu. EFF et RES existent dans les
 * pools en plat ET en % : le libellé les distingue partout (décision de Sevih,
 * 15/10/2026).
 */
const PCT_SUFFIX = new Set(['atk', 'def', 'hp', 'buff_chance', 'buff_resist']);

/**
 * Vue d'affichage d'une option de stat des pools d'équipement : clé (abréviation,
 * suffixée « % » pour la variante rate des stats flat) + nature % (affichage et
 * échelle per-mille ÷10) : variante rate, ou stat de la liste du client
 * (`IsPercentStat`, cf. PERCENT_STAT_TYPES). EFF/RES en flat n'y sont pas :
 * valeurs brutes.
 */
export function statOptionView(
  stat: string,
  mode: 'flat' | 'rate' | 'none',
): { key: string; percent: boolean } {
  const percent = mode === 'rate' || PERCENT_STAT_SLUGS.has(stat);
  const abbr = statAbbr(stat);
  return { key: percent && PCT_SUFFIX.has(stat) ? `${abbr}%` : abbr, percent };
}

// `statName` / `statDesc` vivent dans `@/lib/data/stat-glossary` : ils lisent le
// glossaire extrait (1,8 Mo), que ce module ne doit PAS entraîner — il est lu
// par des composants `use client` qui n'en veulent que les tables pures.
