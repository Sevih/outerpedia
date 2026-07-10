/**
 * STATS — table de correspondance UNIQUE du domaine « stats » côté app.
 *
 * Deux espaces de clés coexistent dans la donnée générée :
 *  - slugs de stats de PERSONNAGE (datagen/extractor/specs/character.ts :
 *    `hp`, `buff_chance`, `effectiveness`…) ;
 *  - slugs de stats de BUFF (`ST_*` slugifié par datagen/lib/effects.ts :
 *    `atk`, `accuracy`, `resist`…).
 * Les deux convergent ici vers une ABRÉVIATION canonique (convention WIKI —
 * vérifié : le jeu n'a AUCUNE abréviation dans ses textes), qui est aussi le
 * token éditorial de `{S/…}` (parse-text).
 * Le nom complet localisé vient du JEU : glossaire `statNames` (SYS_STAT_*),
 * résolu par `statName()` — plus aucune traduction écrite main.
 *
 * Toute nouvelle correspondance de stat se déclare ICI, nulle part ailleurs.
 */
import type { LangDict } from '@contracts';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { PERCENT_STATS, RAW_FLAT_STATS } from '@/../datagen/lib/stats';
import glossariesData from '@data/generated/glossaries.json';

const GLOSSARIES = glossariesData as unknown as {
  statNames: Record<string, LangDict>;
  statDescs: Record<string, LangDict>;
};
const STAT_NAMES = GLOSSARIES.statNames;
const STAT_DESCS = GLOSSARIES.statDescs;

/** Slug de stat (perso OU buff) → abréviation canonique. */
export const STAT_ABBR: Record<string, string> = {
  // Stats de personnage (slugs de STAT_DEFS)
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
  // Stats des pools d'équipement (`ItemOptionTemplet`) non couvertes ci-dessus
  critical_dmg_rate: 'CHD',
  dmg_reduce_rate: 'DMG RED%',
  dmg_boost: 'DMG UP%',
  e_cri_dmg_reduce: 'CDMG RED%',
  // PAS de mapping pour `accuracy`/`avoid` : stats RETIRÉES du jeu (l'ancien
  // couple précision/esquive) — il n'en survit que les effets « Miss Rate »,
  // résolus par leur nom, jamais par abréviation de stat.
};

/**
 * Abréviation canonique (= token `{S/…}` éditorial) → slug du glossaire
 * `statNames` extrait du jeu. `pct` = variante % d'une stat flat : le jeu ne
 * la nomme pas séparément, on compose « Attack % ».
 */
const ABBR_TO_SLUG: Record<string, { slug: string; pct?: boolean }> = {
  ATK: { slug: 'atk' },
  'ATK%': { slug: 'atk', pct: true },
  DEF: { slug: 'def' },
  'DEF%': { slug: 'def', pct: true },
  HP: { slug: 'hp' },
  'HP%': { slug: 'hp', pct: true },
  SPD: { slug: 'speed' },
  CHC: { slug: 'critical_rate' },
  CHD: { slug: 'critical_dmg_rate' },
  EFF: { slug: 'buff_chance' },
  'EFF%': { slug: 'buff_chance', pct: true },
  RES: { slug: 'buff_resist' },
  'RES%': { slug: 'buff_resist', pct: true },
  PEN: { slug: 'pierce_power' },
  'PEN%': { slug: 'pierce_power_rate' },
  LS: { slug: 'vampiric' },
  'DMG UP%': { slug: 'dmg_boost' },
  'DMG RED%': { slug: 'dmg_reduce_rate' },
  'CDMG RED%': { slug: 'e_cri_dmg_reduce' },
};

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
 * Seules les stats à DOUBLE nature (flat + %) prennent le suffixe « % » sur
 * leur variante rate (ATK/ATK%…) ; les stats intrinsèquement % gardent leur
 * abréviation nue (CHD, CHC…), comme en jeu/V2.
 */
const PCT_SUFFIX = new Set(['atk', 'def', 'hp']);

/**
 * Vue d'affichage d'une option de stat des pools d'équipement : clé (abréviation,
 * suffixée « % » pour la variante rate des stats flat) + nature % (affichage et
 * échelle per-mille ÷10). EFF/RES en flat = valeurs brutes (cf. RAW_FLAT_STATS).
 */
export function statOptionView(
  stat: string,
  mode: 'flat' | 'rate' | 'none',
): { key: string; percent: boolean } {
  const percent = mode === 'rate' || (PERCENT_STATS.has(stat) && !RAW_FLAT_STATS.has(stat));
  const abbr = statAbbr(stat);
  return { key: percent && PCT_SUFFIX.has(stat) ? `${abbr}%` : abbr, percent };
}

/**
 * Nom complet localisé d'un slug ou d'une abréviation, depuis le glossaire
 * `statNames` EXTRAIT (« Counterattack Chance »…). Repli : abréviation.
 */
export function statName(slugOrAbbr: string, lang: Lang): string {
  const direct = STAT_NAMES[slugOrAbbr];
  if (direct) return lRec(direct, lang) || direct.en;
  const abbr = STAT_ABBR[slugOrAbbr] ?? slugOrAbbr;
  const entry = ABBR_TO_SLUG[abbr];
  const name = entry && STAT_NAMES[entry.slug];
  if (!name) return abbr;
  return `${lRec(name, lang) || name.en}${entry.pct ? ' %' : ''}`;
}

/**
 * Description OFFICIELLE d'une stat (`SYS_STAT_DESC_*`) — le jeu n'en fournit
 * que pour quelques-unes (DMG ±, pénétration…). `undefined` sinon.
 */
export function statDesc(slugOrAbbr: string, lang: Lang): string | undefined {
  const slug = STAT_DESCS[slugOrAbbr]
    ? slugOrAbbr
    : ABBR_TO_SLUG[STAT_ABBR[slugOrAbbr] ?? slugOrAbbr]?.slug;
  const d = slug ? STAT_DESCS[slug] : undefined;
  if (!d) return undefined;
  return (lRec(d, lang) || d.en).replace(/\\n/g, '\n');
}
