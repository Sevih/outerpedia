/**
 * Vocabulaire des stats du contrat solver (L6) : la table `ST_*` / `OAT_*` →
 * clé du contrat que `buildSolver` émet en `solver/stat-keys.json`, avec la
 * nature « % » et l'abréviation du wiki de chaque paire.
 *
 * Les clés existantes sont les champs que `applyStatBonus`
 * (`generators/solver-ingredients.ts`) remplit — `StatBlock`, plus `spdPct`
 * (vitesse en taux, `corePassiveByFusion`) ; les cinq autres (`cdmgRed`,
 * `lifesteal`, `counter`, `enterAp`, `avoid`) nomment des paires que les
 * fichiers du contrat portent sans qu'aucun bloc ne les reçoive. Un test
 * croisé tient la table contre `applyStatBonus`.
 *
 * Une ligne par paire que les fichiers émis portent, dans l'ordre du
 * `STAT_TYPE` du client. GARDE : `buildSolver` jette sur toute paire émise
 * sans ligne ici (`missingStatKeys`) — un `ST_*` nouveau casse au
 * `datagen:build` du patch au lieu d'entrer non traduit. Ajouter sa ligne est
 * un AJOUT : `SOLVER_SCHEMA` inchangé. Une ligne qu'aucun fichier ne porte est
 * permise.
 */
import { statOptionView, STAT_ABBR } from '../../src/lib/stats';
import { PERCENT_STAT_TYPES, statSlug } from './stats';

/** `ST_*` → `OAT_*` → clé du contrat. */
export const STAT_KEYS: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  ST_HP: { OAT_ADD: 'hp', OAT_RATE: 'hpPct' },
  ST_SPEED: { OAT_ADD: 'spd', OAT_RATE: 'spdPct' },
  ST_ATK: { OAT_ADD: 'atk', OAT_RATE: 'atkPct' },
  ST_DEF: { OAT_ADD: 'def', OAT_RATE: 'defPct' },
  ST_DMG_REDUCE_RATE: { OAT_ADD: 'dmgRed', OAT_RATE: 'dmgRed' },
  ST_CRITICAL_RATE: { OAT_ADD: 'chc' },
  ST_CRITICAL_DMG_RATE: { OAT_ADD: 'chd' },
  ST_PIERCE_POWER_RATE: { OAT_ADD: 'pen' },
  ST_VAMPIRIC: { OAT_ADD: 'lifesteal' },
  ST_AVOID: { OAT_ADD: 'avoid' },
  ST_BUFF_CHANCE: { OAT_ADD: 'eff', OAT_RATE: 'effRate' },
  ST_BUFF_RESIST: { OAT_ADD: 'res', OAT_RATE: 'resRate' },
  ST_ENTER_AP: { OAT_ADD: 'enterAp' },
  ST_COUNTER_RATE: { OAT_ADD: 'counter' },
  ST_DMG_BOOST: { OAT_ADD: 'dmgInc', OAT_RATE: 'dmgInc' },
  ST_E_CRI_DMG_REDUCE: { OAT_ADD: 'cdmgRed' },
};

/** Ligne émise d'une paire. */
export interface StatKeyLine {
  key: string;
  /** Règle de `formatStatValue` (`CUtilUI.GetStatValue`) : `OAT_RATE`, ou stat de `PERCENT_STAT_TYPES`. */
  percent: boolean;
  /** Abréviation du wiki (`statOptionView`), `null` quand `STAT_ABBR` ne connaît pas le slug. */
  abbr: string | null;
}

/**
 * `ST_*` sans abréviation dans le contrat, quoi que dise `STAT_ABBR` : l'évasion
 * (`ST_AVOID`, stat retirée du jeu) a pour slug `resilience`, que la colonne de
 * fiche abrège RES ; le contrat l'a toujours émise à `null` et sa forme ne
 * change pas sans un lot G qui bumpe le `schema` (C27).
 */
const NO_ABBR = new Set(['ST_AVOID']);

/** Ligne d'une paire, `undefined` hors table. */
export function statKeyLine(st: string, ap: string): StatKeyLine | undefined {
  const key = STAT_KEYS[st]?.[ap];
  if (key === undefined) return undefined;
  const slug = NO_ABBR.has(st) ? undefined : statSlug(st);
  return {
    key,
    percent: ap === 'OAT_RATE' || PERCENT_STAT_TYPES.has(st),
    abbr:
      slug && slug in STAT_ABBR
        ? statOptionView(slug, ap === 'OAT_RATE' ? 'rate' : 'flat').key
        : null,
  };
}

/** Le fichier `stat-keys.json` : `{ [ST_*]: { [OAT_*]: StatKeyLine } }`. */
export function statKeysFile(): Record<string, Record<string, StatKeyLine>> {
  const out: Record<string, Record<string, StatKeyLine>> = {};
  for (const [st, byAp] of Object.entries(STAT_KEYS)) {
    out[st] = {};
    for (const ap of Object.keys(byAp)) out[st][ap] = statKeyLine(st, ap)!;
  }
  return out;
}

/** Paire sans ligne dans la table, et le fichier qui la porte. */
export interface MissingStatKey {
  st: string;
  ap: string | undefined;
  file: string;
}

/**
 * Paires (`st`/`ap`, ou `stat`/`apply` de `trust-buffs.json`) portées par des
 * fichiers du contrat sans ligne dans la table — une par paire et par fichier.
 * Un `stat` sans `apply` (`dmgSec` de `characters.json`) n'est pas une paire.
 */
export function missingStatKeys(files: Iterable<[string, unknown]>): MissingStatKey[] {
  const out: MissingStatKey[] = [];
  const seen = new Set<string>();
  const check = (file: string, st: string, ap: unknown): void => {
    const a = typeof ap === 'string' ? ap : undefined;
    const id = `${file} ${st} ${a}`;
    if (seen.has(id)) return;
    seen.add(id);
    if (a === undefined || STAT_KEYS[st]?.[a] === undefined) out.push({ st, ap: a, file });
  };
  const walk = (file: string, v: unknown): void => {
    if (Array.isArray(v)) {
      for (const x of v) walk(file, x);
      return;
    }
    if (!v || typeof v !== 'object') return;
    const o = v as Record<string, unknown>;
    if (typeof o.st === 'string') check(file, o.st, o.ap);
    if (typeof o.stat === 'string' && 'apply' in o) check(file, o.stat, o.apply);
    for (const x of Object.values(o)) walk(file, x);
  };
  for (const [file, data] of files) walk(file, data);
  return out;
}
