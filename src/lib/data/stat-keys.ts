/**
 * VOCABULAIRE DES STATS du contrat solver (L6) — `data/generated/solver/stat-keys.json`,
 * émis par C26 depuis `datagen/lib/stat-keys.ts` : `{ [ST_*]: { [OAT_*]: { key,
 * percent, abbr } } }`, où `key` est la clé du contrat (champ de `StatBlock`),
 * `percent` la règle d'affichage du client et `abbr` l'abréviation du WIKI
 * (`statOptionView`, `null` quand `STAT_ABBR` ne connaît pas le slug).
 *
 * RÈGLE : toute table de clés de stats du wiki se DÉRIVE d'ici, ou se justifie
 * dans un test (`stat-keys.test.ts`) — une table recopiée à la main dérive en
 * silence au premier `ST_*` qui bouge.
 */
import { STEP_STAT_KEYS, type StepStatKey } from '@/lib/stat-compose';
import { slugEnum } from '@/../datagen/lib/enums';
import statKeysData from '@data/generated/solver/stat-keys.json';

type StatKeyLine = { key: string; percent: boolean; abbr: string | null };
const STAT_KEYS = statKeysData as unknown as Record<string, Record<string, StatKeyLine>>;

const STEP_KEYS = new Set<string>(STEP_STAT_KEYS);

function isStepKey(abbr: string | null): abbr is StepStatKey {
  return abbr !== null && STEP_KEYS.has(abbr);
}

/** Lignes `OAT_ADD` (valeur plate) du fichier, avec leur `ST_*`. */
function addLines(): [string, StatKeyLine][] {
  return Object.entries(STAT_KEYS).flatMap(([st, byAp]) =>
    byAp.OAT_ADD ? [[st, byAp.OAT_ADD] as [string, StatKeyLine]] : [],
  );
}

/** Clé du contrat (champ plat de `StatBlock`) → clé d'affichage de la fiche. */
export function contractKeyToAbbr(): Record<string, StepStatKey> {
  const out: Record<string, StepStatKey> = {};
  for (const [, line] of addLines()) if (isStepKey(line.abbr)) out[line.key] = line.abbr;
  return out;
}

/** Slug de stat (`slugEnum(ST_*)`, celui des bonus quirks/skill_8) → clé d'affichage. */
export function statSlugToAbbr(): Record<string, StepStatKey> {
  const out: Record<string, StepStatKey> = {};
  for (const [st, line] of addLines()) if (isStepKey(line.abbr)) out[slugEnum(st)] = line.abbr;
  return out;
}

/** Toutes les abréviations du fichier (`OAT_ADD` et `OAT_RATE`), `null` exclu. */
export function contractAbbrs(): Set<string> {
  const out = new Set<string>();
  for (const byAp of Object.values(STAT_KEYS))
    for (const line of Object.values(byAp)) if (line.abbr !== null) out.add(line.abbr);
  return out;
}

/** Slugs (`slugEnum(ST_*)`) dont la valeur plate n'est PAS un pourcentage au client. */
export function flatContractSlugs(): Set<string> {
  const out = new Set<string>();
  for (const [st, line] of addLines()) if (!line.percent) out.add(slugEnum(st));
  return out;
}
