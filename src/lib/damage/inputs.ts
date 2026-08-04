/**
 * AMONT PUR du moteur — du CONTRAT de l'UI (`debugState`, harnais § 1) aux
 * entrées de `report.ts`, importable côté node (harnais § 4 : le test des
 * fixtures rejoue un scénario SANS UI par ce même chemin).
 *
 * Étapes couvertes (report-inputs § 2) :
 *  - fiche saisie → stats de COMBAT par stat (identité § 16.1 via
 *    `sheetToCombatStat` : base au niveau, terme Codex, canaux de buffs) ;
 *  - affinité (Trust) : les buffs plats `trust_level_*` de buffs.json sont
 *    RÉSOLUS (jamais codés en dur) et versés au canal `buffValue` ;
 *  - chips de scénario → `ActiveBuff` via le catalogue FX (magnitudes
 *    STANDARD du jeu, doublement sourcées : desc officielle du glossaire +
 *    valeur dominante des occurrences réelles de buffs.json — cf. FX_CATALOG) ;
 *    un chip SANS magnitude standard (« certain percentage ») n'est JAMAIS
 *    deviné : il est remonté dans `unresolvedFx` et contribue 0 ;
 *  - kit → lignes de rapport : S1/S2/S3 (SKT_FIRST/SECOND/ULTIMATE), les
 *    états burst (SKT_BURST_1..3) rattachés au S2 en SOUS-LIGNES avec LEUR
 *    `skillFactor` et LEURS chaînes (vérifié : 372/372 bursts ont le même
 *    nombre de niveaux que leur S2 — le niveau saisi s'applique 1:1).
 *
 * HORS périmètre v1 (documenté, jamais comblé en douce) : passifs
 * d'équipement § 15 (sets/EE/arme/accessoire/talisman — chantier chips→kits),
 * lignes DOT (liaison buffIds → templets de buff), immunités de cible.
 */

import { collectStatChannels, type ActiveBuff } from './aggregate';
import { calcBaseStat } from './formula';
import {
  buildSkillReport,
  groupHitsByChain,
  type ReportScenario,
  type SkillReport,
  type SkillReportOptions,
} from './report';
import { sheetToCombatStat } from './sheet';
import { Element } from './types';

// ── Types structurels des JSON `data/generated/damage/` ─────────────────────
// (miroirs minimaux — la vérité est produite par datagen/damage/*)

export interface DataStatPair {
  min: number;
  max: number;
}

export interface DataSkillLevel {
  level: number;
  damageFactor: number;
  wgReduce: number;
  buffIds: string[];
}

export interface DataHit {
  id: string;
  chain: string;
  hit: number;
  damageFactor: number;
  maxHitCount: number;
}

export interface DataSkill {
  id: string;
  type: string;
  rangeType: string;
  levels: DataSkillLevel[];
  hits: DataHit[];
  hitsUnresolved?: boolean;
}

export interface DataCharacter {
  id: string;
  element: string;
  baseStats: Record<string, DataStatPair>;
  skills: { slot: number; id: string }[];
}

export interface DamageCharactersData {
  characters: Record<string, DataCharacter>;
  skills: Record<string, DataSkill>;
}

export interface DamageGrowthData {
  archive: { level: number; atkRate: number; defRate: number; hpRate: number }[];
  maxLevelSteps: {
    basicStar: number;
    element: string;
    requireLevel: number;
    maxLevel: number;
    modifierAfter100: number;
  }[];
}

export interface DataBuffLevel {
  level: number;
  type: string;
  stat?: string;
  applyingType?: string;
  value?: number;
}

export interface DamageBuffsData {
  buffs: Record<string, DataBuffLevel[]>;
}

export interface DamageData {
  characters: DamageCharactersData;
  growth: DamageGrowthData;
  buffs: DamageBuffsData;
}

// ── Référentiels ─────────────────────────────────────────────────────────────

/** `CET_*` (données) et slugs UI → enum du moteur. */
const ELEMENT_BY_KEY: Record<string, Element> = {
  CET_EARTH: Element.Earth,
  CET_WATER: Element.Water,
  CET_FIRE: Element.Fire,
  CET_LIGHT: Element.Light,
  CET_DARK: Element.Dark,
  earth: Element.Earth,
  water: Element.Water,
  fire: Element.Fire,
  light: Element.Light,
  dark: Element.Dark,
};

export function elementOf(key: string): Element | undefined {
  return ELEMENT_BY_KEY[key];
}

/** Slug de fiche UI → enum `ST_*` et clé de `baseStats` (characters.json). */
const SHEET_STAT_MAP: Record<string, { st: string; base?: string }> = {
  atk: { st: 'ST_ATK', base: 'Atk' },
  def: { st: 'ST_DEF', base: 'Def' },
  hp: { st: 'ST_HP', base: 'HP' },
  speed: { st: 'ST_SPEED', base: 'Speed' },
  critical_rate: { st: 'ST_CRITICAL_RATE', base: 'CriticalRate' },
  critical_dmg: { st: 'ST_CRITICAL_DMG_RATE', base: 'CriticalDMGRate' },
  pierce_power_rate: { st: 'ST_PIERCE_POWER_RATE' },
  dmg_boost: { st: 'ST_DMG_BOOST' },
  buff_chance: { st: 'ST_BUFF_CHANCE', base: 'BuffChance' },
};

/** Taux Codex par stat (‰ CUMULÉS au niveau du compte) — seuls ATK/DEF/HP. */
function archiveRateFor(slug: string, codexLevel: number, growth: DamageGrowthData): number {
  if (codexLevel < 1) return 0;
  const row = growth.archive.find((r) => r.level === codexLevel);
  if (!row) return 0;
  if (slug === 'atk') return row.atkRate;
  if (slug === 'def') return row.defRate;
  if (slug === 'hp') return row.hpRate;
  return 0;
}

/** Palier post-100 applicable au niveau donné (spec § 3.2) — 0 sinon. */
export function modifierAfter100For(
  char: Pick<DataCharacter, 'element'> & { basicStar?: number },
  level: number,
  growth: DamageGrowthData,
): number {
  if (level <= 100) return 0;
  const step = growth.maxLevelSteps.find(
    (s) =>
      s.element === char.element &&
      (char.basicStar === undefined || s.basicStar === char.basicStar) &&
      s.requireLevel < level &&
      level <= s.maxLevel,
  );
  return step?.modifierAfter100 ?? 0;
}

// ── Catalogue des chips de scénario (magnitudes STANDARD du jeu) ─────────────

/**
 * Chaque entrée est doublement sourcée (04/08/2026) : la desc OFFICIELLE du
 * glossaire du jeu (« Increases Attack by 30%. ») et la valeur DOMINANTE des
 * occurrences réelles de buffs.json (ex. ST_ATK OAT_RATE : 300 ‰ sur 183/244
 * lignes). `null` = magnitude non standardisée par le jeu (« a certain
 * percentage ») : le chip est remonté `unresolvedFx`, contribution 0.
 */
export const FX_CATALOG: Record<string, ActiveBuff | null> = {
  // Attaquant — buffs.
  atk: { type: 'BT_STAT', stat: 'ST_ATK', applyingType: 'OAT_RATE', value: 300 },
  def: { type: 'BT_STAT', stat: 'ST_DEF', applyingType: 'OAT_RATE', value: 500 },
  chd: { type: 'BT_STAT', stat: 'ST_CRITICAL_DMG_RATE', applyingType: 'OAT_ADD', value: 500 },
  pen: { type: 'BT_STAT', stat: 'ST_PIERCE_POWER_RATE', applyingType: 'OAT_ADD', value: 300 },
  spd: { type: 'BT_STAT', stat: 'ST_SPEED', applyingType: 'OAT_RATE', value: 300 },
  eff: { type: 'BT_STAT', stat: 'ST_BUFF_CHANCE', applyingType: 'OAT_RATE', value: 1000 },
  // Attaquant — débuffs (miroir).
  atk_down: { type: 'BT_STAT', stat: 'ST_ATK', applyingType: 'OAT_RATE', value: -300 },
  def_down: { type: 'BT_STAT', stat: 'ST_DEF', applyingType: 'OAT_RATE', value: -500 },
  chd_down: { type: 'BT_STAT', stat: 'ST_CRITICAL_DMG_RATE', applyingType: 'OAT_ADD', value: -500 },
  pen_down: { type: 'BT_STAT', stat: 'ST_PIERCE_POWER_RATE', applyingType: 'OAT_ADD', value: -300 },
  spd_down: { type: 'BT_STAT', stat: 'ST_SPEED', applyingType: 'OAT_RATE', value: -300 },
  eff_down: { type: 'BT_STAT', stat: 'ST_BUFF_CHANCE', applyingType: 'OAT_RATE', value: -1000 },
  // Cible.
  t_def: { type: 'BT_STAT', stat: 'ST_DEF', applyingType: 'OAT_RATE', value: 500 },
  t_def_down: { type: 'BT_STAT', stat: 'ST_DEF', applyingType: 'OAT_RATE', value: -500 },
  t_res: { type: 'BT_STAT', stat: 'ST_BUFF_RESIST', applyingType: 'OAT_RATE', value: 1000 },
  t_res_down: { type: 'BT_STAT', stat: 'ST_BUFF_RESIST', applyingType: 'OAT_RATE', value: -1000 },
  t_marked: { type: 'BT_MARKING' },
  // Magnitude non standardisée par le jeu — jamais devinée.
  t_dmg_red: null,
  t_dmg_taken: null,
};

/** Chips → buffs actifs ; les clés sans magnitude standard partent en `unresolved`. */
export function resolveFx(keys: string[]): { buffs: ActiveBuff[]; unresolved: string[] } {
  const buffs: ActiveBuff[] = [];
  const unresolved: string[] = [];
  for (const key of keys) {
    const entry = FX_CATALOG[key];
    if (entry) buffs.push(entry);
    else unresolved.push(key);
  }
  return { buffs, unresolved };
}

/**
 * Buffs plats d'affinité (Trust) au palier donné : les `trust_level_{STAT}_{i}`
 * de buffs.json pour i ≤ palier — résolus depuis la DONNÉE (report-inputs
 * § 3.1 : +60 ATK / +40 DEF / +300 HP par palier, vérifié binaire 27/07).
 */
export function trustBuffs(tier: number, buffs: DamageBuffsData): ActiveBuff[] {
  const out: ActiveBuff[] = [];
  for (const stat of ['ATK', 'DEF', 'HP']) {
    for (let i = 1; i <= tier; i++) {
      const levels = buffs.buffs[`trust_level_${stat}_${i}`];
      const l = levels?.[0];
      if (l?.type === 'BT_STAT' && l.stat && l.value !== undefined) {
        out.push({ type: l.type, stat: l.stat, applyingType: l.applyingType, value: l.value });
      }
    }
  }
  return out;
}

// ── Entrées (miroir typé du `debugState` de l'UI) ───────────────────────────

export interface AttackerBuildInput {
  id: string;
  /** Niveau 1..120 (slider UI). */
  level: number;
  /** Palier d'affinité 0..5 (dérivé du niveau 0..100 côté UI). */
  affinityTier: number;
  /** Niveau du Codex du COMPTE (0..11). */
  codexLevel: number;
  /** Niveaux de skill par slot. */
  skillLevels: Partial<Record<'S1' | 'S2' | 'S3', number>>;
  /** Fiche SAISIE, par slug UI (`atk`, `critical_dmg`…) — champs absents = 0. */
  sheet: Record<string, number>;
  /** PV actuels en % (défaut 100). */
  hpPct?: number;
  /** Chips de scénario actifs (clés du catalogue FX). */
  fx?: string[];
}

export interface TargetBuildInput {
  /** Élément (`CET_*` ou slug UI). */
  element: string;
  /** Stats défensives effectives (preset résolu par l'UI, ou saisie manuelle). */
  stats: { hp?: number; def?: number; dmgRed?: number; cdmgRed?: number };
  /** Cible boss (presets : toujours vrai). */
  boss?: boolean;
  /** PV actuels en % (défaut 100). */
  hpPct?: number;
  /** Chips de scénario actifs côté cible. */
  fx?: string[];
}

export interface BuildReportOptions extends SkillReportOptions {
  /** Cibles touchées (décroissance § 7 — réservé ; 1 par défaut). */
  targetsHit?: number;
}

/** Une ligne de rapport par source de skill (S2 et ses bursts séparés). */
export interface SlotReport {
  slot: 'S1' | 'S2' | 'S3';
  skillId: string;
  /** État burst (1..3) — sous-ligne du S2, décision report-inputs § 5.4. */
  burst?: number;
  /** Niveau de skill réellement appliqué (clampé au max du skill). */
  skillLevel: number;
  /** Chaînes de hits irrésolues (§ 12.4) — la ligne n'a pas de dégâts. */
  hitsUnresolved?: boolean;
  report: SkillReport;
}

export interface DamageReportResult {
  /** Stats de COMBAT reconstruites (par slug UI saisi) — § 16.1. */
  combatStats: Record<string, number>;
  slots: SlotReport[];
  /** Chips actifs SANS magnitude standard — contribution 0, à afficher. */
  unresolvedFx: string[];
}

// ── Construction ─────────────────────────────────────────────────────────────

const SLOT_TYPES: { slot: 'S1' | 'S2' | 'S3'; type: string }[] = [
  { slot: 'S1', type: 'SKT_FIRST' },
  { slot: 'S2', type: 'SKT_SECOND' },
  { slot: 'S3', type: 'SKT_ULTIMATE' },
];
const BURST_TYPES = ['SKT_BURST_1', 'SKT_BURST_2', 'SKT_BURST_3'];

/**
 * Stats de combat § 16.1 pour toute la fiche saisie. Les canaux de buffs par
 * stat viennent de `collectStatChannels` (affinité + chips BT_STAT).
 */
export function buildCombatStats(
  attacker: AttackerBuildInput,
  char: DataCharacter,
  growth: DamageGrowthData,
  activeBuffs: ActiveBuff[],
): Record<string, number> {
  const channels = collectStatChannels(activeBuffs);
  const modifier = modifierAfter100For(char, attacker.level, growth);
  const combat: Record<string, number> = {};
  for (const [slug, sheetValue] of Object.entries(attacker.sheet)) {
    const map = SHEET_STAT_MAP[slug];
    if (!map) continue;
    const pair = map.base ? char.baseStats[map.base] : undefined;
    const archiveRate = archiveRateFor(slug, attacker.codexLevel, growth);
    const channel = channels[map.st];
    combat[slug] = sheetToCombatStat({
      sheetValue,
      // La base ne sert qu'au terme Codex (§ 16.1) — 0 quand la stat n'en a pas.
      baseValue:
        pair && archiveRate !== 0 ? calcBaseStat(pair.min, pair.max, attacker.level, modifier) : 0,
      archiveRatePermille: archiveRate,
      buffValue: channel?.value ?? 0,
      buffValueRate: channel?.rate ?? 0,
    });
  }
  return combat;
}

/**
 * L'ENTRÉE du moteur (contrat harnais § 1) : fabrique les stats de combat,
 * le scénario et les lignes par skill (S1/S2/S3 + sous-lignes burst du S2),
 * et appelle `buildSkillReport` pour chacune.
 */
export function buildDamageReport(
  attacker: AttackerBuildInput,
  target: TargetBuildInput,
  data: DamageData,
  options?: BuildReportOptions,
): DamageReportResult {
  const char = data.characters.characters[attacker.id];
  if (!char) throw new Error(`buildDamageReport: personnage inconnu ${attacker.id}`);

  // Buffs actifs des deux côtés : affinité (donnée) + chips (catalogue).
  const atkFx = resolveFx(attacker.fx ?? []);
  const tgtFx = resolveFx(target.fx ?? []);
  const attackerBuffs = [...trustBuffs(attacker.affinityTier, data.buffs), ...atkFx.buffs];
  const defenderBuffs = tgtFx.buffs;

  const combatStats = buildCombatStats(attacker, char, data.growth, attackerBuffs);
  const statOf = (st: string): number => {
    const slug = Object.entries(SHEET_STAT_MAP).find(([, m]) => m.st === st)?.[0];
    return slug !== undefined ? (combatStats[slug] ?? 0) : 0;
  };

  const attackerElement = elementOf(char.element);
  const defenderElement = elementOf(target.element);
  if (attackerElement === undefined || defenderElement === undefined) {
    throw new Error(`buildDamageReport: élément inconnu (${char.element} / ${target.element})`);
  }

  const attackerMaxHP = combatStats.hp ?? 0;
  const defenderMaxHP = target.stats.hp ?? 0;
  const scenario: ReportScenario = {
    attacker: {
      attackStat: combatStats.atk ?? 0,
      criticalRate: combatStats.critical_rate ?? 0,
      criticalDmgRate: combatStats.critical_dmg ?? 0,
      dmgBoost: combatStats.dmg_boost ?? 0,
      piercePowerRate: combatStats.pierce_power_rate ?? 0,
      piercePower: 0, // pas de ligne de fiche — contribution 0 (jamais devinée)
      element: attackerElement,
    },
    defender: {
      defense: target.stats.def ?? 0,
      avoid: 0, // pas de saisie d'esquive côté cible — 0
      dmgReduceRate: target.stats.dmgRed ?? 0,
      enemyCriticalDamageReduce: target.stats.cdmgRed ?? 0,
      element: defenderElement,
    },
    attackerBuffs,
    defenderBuffs,
    additionalContext: {
      attacker:
        attackerMaxHP > 0
          ? {
              maxHP: attackerMaxHP,
              hp: Math.floor((attackerMaxHP * (attacker.hpPct ?? 100)) / 100),
            }
          : undefined,
      defender:
        defenderMaxHP > 0
          ? {
              maxHP: defenderMaxHP,
              hp: Math.floor((defenderMaxHP * (target.hpPct ?? 100)) / 100),
            }
          : undefined,
      attackerStat: statOf,
      targetIsBoss: target.boss === true,
      scene: 'pve',
    },
  };

  // Kit : S1/S2/S3, puis les bursts rattachés au S2 (même niveau saisi —
  // vérifié : 372/372 bursts ont le même nombre de niveaux que leur S2).
  const byType = new Map<string, DataSkill>();
  for (const ref of char.skills) {
    const sk = data.characters.skills[ref.id];
    if (sk && !byType.has(sk.type)) byType.set(sk.type, sk);
  }

  const slots: SlotReport[] = [];
  const pushSlot = (slot: 'S1' | 'S2' | 'S3', sk: DataSkill, burst?: number) => {
    const wanted = attacker.skillLevels[slot] ?? sk.levels.length;
    const level = Math.min(Math.max(wanted, 1), sk.levels.length);
    const lv = sk.levels.find((l) => l.level === level) ?? sk.levels[sk.levels.length - 1];
    if (!lv || lv.damageFactor <= 0) return; // skill sans dégâts : pas de ligne
    const report = buildSkillReport(
      {
        skillFactor: lv.damageFactor,
        wgReduce: lv.wgReduce,
        isFirstSkill: slot === 'S1',
        monoTarget: sk.rangeType === 'SINGLE',
        states: groupHitsByChain(sk.hits),
      },
      scenario,
      options,
    );
    slots.push({
      slot,
      skillId: sk.id,
      ...(burst !== undefined ? { burst } : {}),
      skillLevel: lv.level,
      ...(sk.hitsUnresolved ? { hitsUnresolved: true } : {}),
      report,
    });
  };

  for (const { slot, type } of SLOT_TYPES) {
    const sk = byType.get(type);
    if (sk) pushSlot(slot, sk);
  }
  BURST_TYPES.forEach((type, i) => {
    const sk = byType.get(type);
    if (sk) pushSlot('S2', sk, i + 1);
  });

  return {
    combatStats,
    slots,
    unresolvedFx: [...atkFx.unresolved, ...tgtFx.unresolved],
  };
}
