/**
 * NOMS ET DESCRIPTIONS localisés des stats — la moitié « donnée de jeu » du
 * domaine stats, séparée de `@/lib/stats` qui n'en garde que les tables PURES
 * (abréviations, sprites d'icônes).
 *
 * Pourquoi deux modules : `glossaries.json` pèse 1,8 Mo, et un module qui
 * l'importe entraîne ce poids dans le bundle NAVIGATEUR dès qu'un composant
 * `use client` le touche — même pour n'y lire qu'une constante. C'était le cas
 * de 13 composants client (fiches perso, équipement, tier list, outils) qui ne
 * voulaient QUE `STAT_ICON` ou `statAbbr` (audit du 2026-07-22). La frontière
 * est donc posée sur la DÉPENDANCE À LA DONNÉE, pas sur le thème :
 *
 *   `@/lib/stats`            tables pures, sans import de donnée → client OK
 *   `@/lib/data/stat-glossary`  adossé au glossaire extrait → SERVEUR seulement
 *
 * Corollaire : ne jamais réimporter un JSON de `data/` dans `@/lib/stats`.
 */
import type { LangDict } from '@contracts';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { STAT_ABBR } from '@/lib/stats';
import glossariesData from '@data/generated/glossaries.json';

const GLOSSARIES = glossariesData as unknown as {
  statNames: Record<string, LangDict>;
  statDescs: Record<string, LangDict>;
};
const STAT_NAMES = GLOSSARIES.statNames;
const STAT_DESCS = GLOSSARIES.statDescs;

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
