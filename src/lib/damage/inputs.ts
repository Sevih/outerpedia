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
 *    états burst (SKT_BURST_1..3) rattachés au slot du skill BURSTABLE
 *    (`burstAP` — S1 chez Caren/Valentine, S2 chez la plupart) en SOUS-LIGNES
 *    avec LEUR `skillFactor` et LEURS chaînes (garde datagen : tous les
 *    bursts du roster ont le même nombre de niveaux que leur burstable — le
 *    niveau saisi s'applique 1:1).
 *
 * HORS périmètre v1 (documenté, jamais comblé en douce) : lignes DOT
 * (liaison buffIds → templets de buff), immunités de cible. Les passifs
 * d'équipement § 15 (canal 2 — buffs) sont branchés via gear.ts ; le canal 1
 * (stats chiffrées main/sub/sets %) reste dans la fiche SAISIE.
 */

import { collectStatChannels, type ActiveBuff } from './aggregate';
import { calcBaseStat } from './formula';
import {
  burstableSlotOf,
  pickBuffRow,
  resolveGearPassives,
  resolveKitPassives,
  resolveQuirkPassives,
  type GearPassivesInfo,
  type GearSelection,
} from './gear';
import { BASE_AMOUNT_STATS, resolveBossPassives, type BossPassivesInfo } from './passives';
import {
  attachChainClips,
  buildDotLine,
  buildSkillReport,
  groupHitsByChain,
  type ReportScenario,
  type SkillReport,
  type SkillReportOptions,
} from './report';
import { sheetToCombatStat } from './sheet';
import { Element, MAX_USER_TEAM_MEMBER } from './types';

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
  /** Coûts d'AP des bursts (CSV `RequireAP`) — marque le skill BURSTABLE :
   *  ses déclinaisons `SKT_BURST_1..3` se rattachent à SON slot. */
  burstAP?: number[];
  hits: DataHit[];
  hitsUnresolved?: boolean;
  /** Clips d'animation du skill (§ 8.1 par clip — datagen/damage/clips.ts). */
  clips?: { name: string; events: { id: string; factor: number; count: number }[] }[];
  /** Chaînes à l'affectation de clips NON résolue — fallback § 12.4. */
  clipsUnresolvedChains?: string[];
}

export interface DataCharacter {
  id: string;
  element: string;
  basicStar: number;
  /** `CCT_*` / nom d'enum de sous-classe — portée des quirks (gear.ts). */
  class?: string;
  subClass?: string;
  baseStats: Record<string, DataStatPair>;
  skills: { slot: number; id: string }[];
}

export interface DamageCharactersData {
  characters: Record<string, DataCharacter>;
  skills: Record<string, DataSkill>;
}

export interface DamageGrowthData {
  archive: { level: number; atkRate: number; defRate: number; hpRate: number }[];
  /** Paliers de transcendance — `skillLevel` = niveau du passif UNIQUE. */
  transcend: { basicStar: number; transStar: number; skillLevel: number }[];
  /** Nœuds d'éveil (quirks du compte) — les `IOT_BUFF` seuls comptent ici. */
  awakening: {
    id: string;
    /** `ELEMENTAL`/`JOB`/`UTILITY` (tous contenus), `PVE`, `ADVENTURE_LICENSE`
     *  (contenu licence SEULEMENT — colonne de scope de la table des groupes). */
    groupType: string;
    applyType: string;
    applyTypeValue: number;
    levels: { level: number; optionType: string; value?: number; buffId?: string }[];
  }[];
  maxLevelSteps: {
    basicStar: number;
    element: string;
    requireLevel: number;
    maxLevel: number;
    modifierAfter100: number;
  }[];
  /** Buff de guilde (§ 16.2) : par niveau 1..10, la part MAX_HP et ses modes. */
  guildMaxHp: {
    level: number;
    maxHpValue: number;
    modes: string[];
    ignoreModes?: string[];
  }[];
  /** Event buffs MAX_HP HORS guilde (§ 16.2) — buff de titre « Premium
   *  Body » en 1.4.9 ; même somme du manager. */
  titleMaxHp: {
    group: number;
    title: string;
    maxHpValue: number;
    modes: string[];
    ignoreModes?: string[];
  }[];
}

export interface DataBuffLevel {
  level: number;
  type: string;
  stat?: string;
  applyingType?: string;
  value?: number;
  /** Cible du buff (`ME`, `ENEMY_TEAM`…) — classement des passifs de boss. */
  targetType?: string;
  /** `PASSIVE` = permanent au combat ; le reste est dynamique (état). */
  createType?: string;
  /** `BUFF_CONDITION_TYPE` brut (`ATTACKER_ELEMENT_WIN`…). */
  conditionType?: string;
  /** `BuffConditionValue` — pour `TARGET_ELEMENT` : CET_* de la CIBLE
   *  (absent = 0 = terre, preuve gear.ts). */
  conditionValue?: number;
  /** `TargetSkillType` (`SKT_*`) — buff restreint à UN skill. */
  targetSkillType?: string;
  /** `CallerSkillType` (`SKT_*`, CSV) — buff restreint aux skills LANCEURS
   *  (ex. nœuds « Chain Damage » : SKT_STRIKE_* seulement). */
  callerSkillType?: string;
  /** ‰ — proba de pose (`CheckProbabilityPermille` puis CheckResist § 5). */
  createRate?: number;
  /** Valeur effective = `value × stacks` (§ 14.1). */
  stackCount?: number;
  /** `DEBUFF_IGNORE_RESIST` = pose sans jet de résistance § 5. */
  buffDebuffType?: string;
  /** Tours de présence (`-1` = permanent) — affichage des lignes DoT. */
  turnDuration?: number;
  /** Jointure vers le glossaire des effets (même espace d'ids que
   *  `conditionValue` des conditions `*_HAS_BUFF*`) — icône/nom UI. */
  tooltipId?: number;
}

export interface DamageBuffsData {
  buffs: Record<string, DataBuffLevel[]>;
}

// ── Miroirs minimaux d'equipment.json (la vérité : datagen/damage/equipment.ts) ──

export interface DataItemOption {
  id: string;
  optionType: string;
  stat?: string;
  applyingType?: string;
  value?: number;
  factor?: number;
  maxValue?: number;
  buffId?: string;
  rate: number;
}

export interface DataSetEffect {
  optionType: string;
  stat?: string;
  applyingType?: string;
  value?: number;
  buffId?: string;
  buffLevel?: number;
}

export interface DataSpecialOption {
  level: number;
  isAdd: boolean;
  breakLimitCounts: number[];
  twoPiece?: DataSetEffect;
  fourPiece?: DataSetEffect;
  buffIds?: string[];
}

export interface DataPiece {
  id: string;
  subType: string;
  characterLimit?: string;
  mainOptionGroups: string[];
  uniqueOptionGroups: string[];
  setOptionGroups: string[];
}

export interface DamageEquipmentData {
  pieces: Record<string, DataPiece>;
  optionGroups: Record<string, DataItemOption[]>;
  specialGroups: Record<string, DataSpecialOption[]>;
}

/** Kit d'un monstre preset (miroir minimal de targets.json). */
export interface DataTargetSkill {
  id: string;
  /** `SKT_MONSTER_*`, `SKT_RAGE_ENTER*` (skill d'enrage — passives.ts)… */
  type: string;
  subType: string;
  levels: { level: number; buffIds: string[] }[];
}

export interface DataTarget {
  id: string;
  element: string;
  skills: { slot: number; id: string }[];
}

export interface DamageTargetsData {
  targets: Record<string, DataTarget>;
  skills: Record<string, DataTargetSkill>;
}

export interface DamageData {
  characters: DamageCharactersData;
  growth: DamageGrowthData;
  buffs: DamageBuffsData;
  /** Cibles preset (kits → passifs de boss) — OPTIONNEL : sans elle, un
   *  `monsterId` de cible est signalé non résolu, jamais tu. */
  targets?: DamageTargetsData;
  /** Pièces/groupes d'options (passifs d'équipement § 15) — OPTIONNEL : sans
   *  elle, un équipement sélectionné est signalé non résolu, jamais tu. */
  equipment?: DamageEquipmentData;
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

/** Enum `ST_*` → slug de fiche UI (libellés des passifs de boss, § 9.1). */
export function sheetSlugOfStat(st: string): string | undefined {
  return Object.entries(SHEET_STAT_MAP).find(([, m]) => m.st === st)?.[0];
}

/** Enum `ST_*` → clé des stats de CIBLE du scénario (famille TARGET_STAT
 *  § 9.1) — pendant défenseur de SHEET_STAT_MAP : les seules stats que la
 *  cible du scénario porte (preset ou saisie), le reste contribue 0. */
const TARGET_STAT_MAP: Record<string, keyof TargetBuildInput['stats']> = {
  ST_HP: 'hp',
  ST_DEF: 'def',
  ST_DMG_REDUCE_RATE: 'dmgRed',
  ST_E_CRI_DMG_REDUCE: 'cdmgRed',
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

// ── Buff de guilde (spec § 16.2 — event buff MAX_HP, prouvé binaire) ────────

/**
 * Slug de mode d'encounters → `DUNGEON_MODE` brut. Les QUATRE slugs story
 * (`normal`, `normal_hard`, `origin`, `origin_hard` — DM_NORMAL éclaté par
 * type de zone AreaTemplet, cf. STORY_MODES du générateur encounters) sont le
 * MÊME mode DM_NORMAL ; tous les autres slugs sont l'enum en minuscules sans
 * préfixe (vérifié sur la liste 1.4.9 — qui ne connaît ni AGT_NEW_* ni
 * l'Origin Story : découpage purement site).
 */
export function dungeonModeOf(encounterMode: string): string {
  return encounterMode === 'normal_hard' ||
    encounterMode === 'origin' ||
    encounterMode === 'origin_hard'
    ? 'DM_NORMAL'
    : `DM_${encounterMode.toUpperCase()}`;
}

/** `MaxHPRate` du binaire : `float32(100 + Σ) × 0.01f` (constante 0x1056648) —
 *  Σ = somme des `BuffValue` de TOUS les event buffs MAX_HP actifs. */
export function eventMaxHpRate(sum: number): number {
  return Math.fround((sum + 100) * Math.fround(0.01));
}

/** `get_MaxHP` (0x27DFB20) : `floor(float32(rate × float32(HP)))`. */
export function applyMaxHpRate(hp: number, rate: number): number {
  return Math.floor(Math.fround(rate * Math.fround(hp)));
}

/** Une part de la somme MAX_HP § 16.2 (guilde, titre…), active ou non. */
export interface MaxHpBuffPart {
  source: 'guild' | 'title';
  /** Niveau de guilde retenu (part guilde seulement, clampé au dernier palier). */
  level?: number;
  /** `BuffValue` brut des tables (‰ de rien — des points de %). */
  value: number;
  /** Vrai si le mode du contenu est éligible (ou coche manuelle). */
  active: boolean;
}

/** La somme MAX_HP appliquée (ou pas) au scénario — exposée pour le harnais. */
export interface MaxHpBuffInfo {
  parts: MaxHpBuffPart[];
  /** Σ des valeurs ACTIVES (0 = rien ne s'applique dans ce contenu). */
  sum: number;
  /** Multiplicateur float32 réellement appliqué quand Σ > 0. */
  rate: number;
  hpBefore: number;
  /** HP de combat après application — égal à `hpBefore` si Σ = 0. */
  hpAfter: number;
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

/**
 * Tooltips des 6 buffs STANDARDS couverts par les chips attaquant ci-dessus
 * (tooltip → clé de chip). Un proc de skill qui porte un de ces tooltips EST
 * ce buff visible en jeu, LITTÉRALEMENT (vérifié table entière 23/08/2026 :
 * magnitudes identiques aux chips — ex. tooltip 7 = ST_ATK 300 ‰ sur 75/76
 * lignes) et il ne se cumule pas avec lui (`isTypeOverlap`) : il se déclare
 * par la CHIP, jamais par un stepper de stacks (retour Sevih 23/08 — « les
 * buffs de Pilgrimage sont les mêmes que dans caster buffs, là tu déclares
 * en double »). Un effet visible mais DISTINCT (tooltip propre au perso, ex.
 * +50 % vs break) garde son stepper : ce n'est pas le même buff.
 */
export const FX_CHIP_TOOLTIPS: Record<number, string> = {
  6: 'def',
  7: 'atk',
  8: 'pen',
  9: 'eff',
  12: 'chd',
  15: 'spd',
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
  /** INDEX du palier de transcendance (z `x`) — transStar = basicStar + index ;
   *  absent = palier MAX (défaut UI). Sert au passif UNIQUE du kit. */
  transcendIndex?: number;
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
  /** Niveau de GUILDE du compte (0..10) — buff MAX_HP § 16.2, hors z. */
  guildLevel?: number;
  /** Buff de TITRE « Premium Body » possédé (+5 % PV, § 16.2) — hors z. */
  premiumHp?: boolean;
  /** Équipement porté (passifs § 15 canal 2) — résolu par le pont (gear.ts). */
  gear?: GearSelection;
  /** QUIRKS du compte (nœud d'éveil → niveau) — réglage hors z, comme Codex. */
  quirks?: Record<string, number>;
  /** Conditions d'ÉTAT DE COMBAT déclarées REMPLIES (z `cs`, buffIds) —
   *  mécaniques perso (STATE_CONDITIONS, gear.ts) : active les entrées
   *  `stateful` (ex. `2000022_3_3` = 5 Kaizer Energy au S3 de Noa). */
  metConditions?: string[];
  /** Nb de BUFFS positifs portés en jeu (compteur § 9.1 BT_DMG_OWNER_BUFF) —
   *  déclaré, jamais dérivé des chips (elles ne couvrent pas tout). */
  buffCount?: number;
  /** Nb de DÉBUFFS subis en jeu (§ 9.1 BT_DMG_OWNER_DEBUFF). */
  debuffCount?: number;
  /** Σ des buffs positifs de l'ÉQUIPE (§ 9.1 BT_DMG_OWNER_TEAM_BUFF). */
  teamBuffCount?: number;
  /** ALLIÉS déclarés (z `al`) — leurs passifs d'équipe `MY_TEAM*` et leurs
   *  auras `ENEMY*` atteignent le scénario (resolveAllyPassives). */
  allies?: AllyBuildInput[];
  /** Stacks DÉCLARÉS des buffs DYNAMIQUES qui atteignent l'attaquant —
   *  procs de son PROPRE kit/EE/quirks comme de ses ALLIÉS (z `ab` :
   *  buffId → stacks posés en jeu). Le moteur ne simule jamais un proc, le
   *  scénario le déclare ; plafonné au `StackCount` de la ligne, valeur
   *  effective = value × stacks (§ 14.1). PROUVÉ 23/08/2026 : 1 S2 d'Eris
   *  = 1 stack de 2000117_2_5 (+200 ‰ § 9.1), S1 de Francesca exact. */
  buffStacks?: Record<string, number>;
}

/** Un allié déclaré — ses passifs de kit (gatés par la transcendance pour le
 *  passif unique) et son ÉQUIPEMENT d'équipe : EE, main stat de talisman,
 *  arme et accessoire. Correctif 24/08/2026 : le sondage du 23/08 (« la main
 *  stat de talisman d'un allié n'a aucun consommateur ») était mal cadré —
 *  cette main est un buff d'ÉQUIPE direct (`BT_STAT_PREMIUM` `MY_TEAM`,
 *  cf. GearSelection.talismanMain), et des armes/accessoires portent aussi
 *  des lignes `MY_TEAM*` (ex. `BID_ITEM_UO_ACC_25` : +10 % vs boss aux
 *  alliés ; `BID_ITEM_UO_WEAPON_22` : dégâts d'équipe basés sur la DEF du
 *  porteur). Les stats du PORTEUR allié restent non capturées : les lignes
 *  qui en dépendent (`BT_DMG_CASTER_*`) sortent signalées, contribution 0. */
export interface AllyBuildInput {
  id: string;
  /** INDEX du palier de transcendance — absent = palier MAX (défaut UI). */
  transcendIndex?: number;
  /** EE possédé — `enchant` 10 si « +10 » déclaré, 0 sinon ; absent = pas
   *  d'EE déclaré (les lignes d'équipe des EE vivent au Lv1 comme au Lv10). */
  ee?: { enchant: number };
  /** Main stat du talisman porté (buff d'équipe — résolue par le pont). */
  talisman?: { buffId: string; enchant: number };
  /** Arme / accessoire portés (groupes des tables + breakthrough 0..4) —
   *  seules les lignes qui ATTEIGNENT l'attaquant comptent (mode allié). */
  weapon?: { groups: string[]; tier: number };
  amulet?: { groups: string[]; tier: number };
}

export interface TargetBuildInput {
  /** Élément (`CET_*` ou slug UI). */
  element: string;
  /** Stats défensives effectives (preset résolu par l'UI, ou saisie manuelle). */
  stats: { hp?: number; def?: number; dmgRed?: number; cdmgRed?: number };
  /** Cible boss (presets : toujours vrai). */
  boss?: boolean;
  /** Cible en BREAK (jauge détruite) — contexte § 9.1 (BT_DMG_TARGET_BREAK :
   *  Rogue's Charm +10, set Pulverization, EE…). */
  broken?: boolean;
  /** PV actuels en % (défaut 100). */
  hpPct?: number;
  /** Chips de scénario actifs côté cible. */
  fx?: string[];
  /** Mode d'encounters du PRESET (slug) — décide les buffs MAX_HP § 16.2. */
  mode?: string;
  /** ID de MONSTRE du preset — active ses passifs de boss (passives.ts). */
  monsterId?: string;
  /** Coche MANUELLE « buff de guilde actif » (cible sans mode connu). */
  guildBuffOn?: boolean;
  /** Coche MANUELLE « buff de titre actif » (cible sans mode connu). */
  titleBuffOn?: boolean;
  /** Boss ENRAGÉ (coche, z `en`) : active les buffs de son skill d'enrage et
   *  les passifs conditionnés `OWNER_RAGE` (passives.ts) — jamais deviné. */
  enraged?: boolean;
  /** Nb de BUFFS positifs de la cible en jeu (§ 9.1 BT_DMG_TARGET_BUFF). */
  buffCount?: number;
  /** Nb de DÉBUFFS de la cible en jeu (§ 9.1 BT_DMG_TARGET_DEBUFF — ex. Eris
   *  2000117_2_4 : +20 % par débuff sur S2/S3). */
  debuffCount?: number;
}

export interface BuildReportOptions extends SkillReportOptions {
  /** Cibles touchées (z `n`, défaut 1) — décompte § 7 :
   *  `decreaseTargetCount = 4 − n` (BT_DMG_ENEMY_TEAM_DECREASE). */
  targetsHit?: number;
  /** Force la branche MISS (sans esquive, le miss n'existe qu'avec un buff de
   *  « miss chance ») — comparaison d'un coup manqué observé en jeu. */
  includeMissBranch?: boolean;
}

/** Un DoT posé par le skill (BT_DOT_* des `buffIds` du niveau servi) —
 *  dégâts PAR TICK § 11 + proba de pose § 5. Le tick périodique lui-même
 *  (ordre, cumul sur tours) n'est pas désassemblé (§ 12.8) : la ligne montre
 *  le tick et la durée, jamais une somme inventée. */
export interface SlotDotLine {
  buffId: string;
  /** `BT_DOT_*` (BLEED, BURN, POISON…). */
  type: string;
  /** Jointure glossaire des effets (icône + nom UI) — `ToolTipID` du templet. */
  tooltipId?: number;
  /** Dégâts d'UN tick (§ 11 — stat de référence capturée au lancement). */
  damagePerTick: number;
  /** P(pose) = P‰(CreateRate) × (1 − P(résist § 5)) — résistance sautée si
   *  `DEBUFF_IGNORE_RESIST` (ex. le Bleed de Francesca). */
  applyProbability: number;
  /** Tours de présence (`TurnDuration`). */
  turnDuration?: number;
  /** Stacks posés d'un coup (`StackCount` > 1). */
  stackCount?: number;
}

/**
 * DoT DISTINCTS d'un rapport — dédup par EFFET + tick + proba, pas par slot
 * ni par buffId : les poses jumelles (les Bleeds du S1/S2 de Francesca)
 * fusionnent, deux ticks différents d'un même effet gardent chacun leur
 * ligne. MÊME liste pour le pied de la table Résultat et pour
 * `flattenReport` (capture/rejeu — clé `dot:<buffId>` du premier
 * représentant, ordre des slots donc déterministe).
 */
export function distinctDots(slots: SlotReport[]): SlotDotLine[] {
  const seen = new Set<string>();
  const out: SlotDotLine[] = [];
  for (const s of slots) {
    for (const d of s.dots ?? []) {
      const key = `${d.tooltipId ?? d.buffId}|${d.damagePerTick}|${d.applyProbability}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(d);
    }
  }
  return out;
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
  /** DoT posés par ce skill (dégâts par tick § 11) — absents si aucun. */
  dots?: SlotDotLine[];
}

export interface DamageReportResult {
  /** Stats de COMBAT reconstruites (par slug UI saisi) — § 16.1, buff de
   *  guilde § 16.2 déjà appliqué au HP quand actif. */
  combatStats: Record<string, number>;
  slots: SlotReport[];
  /** Chips actifs SANS magnitude standard — contribution 0, à afficher. */
  unresolvedFx: string[];
  /** Somme des buffs MAX_HP § 16.2 — présente dès qu'un réglage de compte
   *  (guilde, titre) est actif. */
  maxHpBuff?: MaxHpBuffInfo;
  /** Passifs de boss du preset (entrées évaluées + non-résolus signalés) —
   *  présent dès que la cible porte un `monsterId`. */
  bossPassives?: BossPassivesInfo;
  /** Stats de l'attaquant qui pèsent un MONTANT dans ce scénario (base +
   *  lectures des buffs actifs : § 9.1, § 10.1, § 14) — filtre des chips de
   *  passifs de boss (`passiveAffectsDamageAmount`). */
  attackerAmountStats: string[];
  /** Anomalies de DONNÉES rencontrées à la construction (jamais tues) — ex.
   *  bursts présents sans marqueur `burstAP` : lignes burst omises. */
  dataIssues?: string[];
  /** Passifs d'équipement § 15 (appliqués + procs signalés + non-résolus) —
   *  présent dès que l'attaquant porte du `gear`. */
  gearPassives?: GearPassivesInfo;
  /** Passifs du KIT de l'attaquant (skills `*_PASSIVE`, § 16.3 côté joueur) —
   *  toujours présent (le kit vient avec le perso). */
  kitPassives?: GearPassivesInfo;
  /** QUIRKS du compte (nœuds d'éveil à buff) — présent dès qu'un niveau > 0
   *  est fourni. */
  quirkPassives?: GearPassivesInfo;
  /** Passifs d'ALLIÉS (kit + EE des membres déclarés, cibles `MY_TEAM*` qui
   *  atteignent l'attaquant + auras `ENEMY*`) — présent dès qu'un allié est
   *  déclaré ; chaque entrée porte son `ally` (id du personnage). */
  allyPassives?: GearPassivesInfo;
}

// ── Construction ─────────────────────────────────────────────────────────────

const SLOT_TYPES: { slot: 'S1' | 'S2' | 'S3'; type: string }[] = [
  { slot: 'S1', type: 'SKT_FIRST' },
  { slot: 'S2', type: 'SKT_SECOND' },
  { slot: 'S3', type: 'SKT_ULTIMATE' },
];
const BURST_TYPES = ['SKT_BURST_1', 'SKT_BURST_2', 'SKT_BURST_3'];

/**
 * Canal de STAT du DÉFENSEUR : les `BT_STAT` posés sur la cible (enrage du
 * boss, débuffs permanents d'équipement, débuffs au LANCEMENT d'un skill —
 * ex. Rhona 2000008_3_3 : DEF -50 % au début du S3) s'appliquent aux stats
 * effectives par l'identité § 16.1 avec A = 0 (un monstre n'a pas de terme
 * d'archive) : `stat' = trunc((stat + val) × (1000 + taux) / 1000)`. Les
 * stacks ne sont pas simulés (lignes damage-pertinentes mono-stack en
 * donnée).
 */
function applyTargetStatChannel(
  base: TargetBuildInput['stats'],
  buffs: ActiveBuff[],
): TargetBuildInput['stats'] {
  const acc: Partial<Record<keyof TargetBuildInput['stats'], { add: number; rate: number }>> = {};
  for (const b of buffs) {
    if (b.type !== 'BT_STAT') continue;
    const key = b.stat !== undefined ? TARGET_STAT_MAP[b.stat] : undefined;
    if (key === undefined) continue;
    const slot = (acc[key] ??= { add: 0, rate: 0 });
    if (b.applyingType === 'OAT_RATE') slot.rate += b.value ?? 0;
    else slot.add += b.value ?? 0;
  }
  const out = { ...base };
  for (const [key, agg] of Object.entries(acc) as [
    keyof TargetBuildInput['stats'],
    { add: number; rate: number },
  ][]) {
    const value = out[key] ?? 0;
    out[key] = Math.trunc(((value + agg.add) * (1000 + agg.rate)) / 1000);
  }
  return out;
}

/**
 * Stats de combat § 16.1 pour toute la fiche saisie. Les canaux de buffs par
 * stat viennent de `collectStatChannels` (affinité + chips BT_STAT).
 */
export function buildCombatStats(
  attacker: AttackerBuildInput,
  char: DataCharacter,
  growth: DamageGrowthData,
  activeBuffs: ActiveBuff[],
  /** PV du porteur (§ 14 BT 31/32 — stats « PV perdus ») ; absent : ces
   *  familles contribuent 0. */
  owner?: { maxHP: number; hp: number },
  /** Taux premium par ST_* (‰), DÉJÀ dans la fiche saisie — collectés par les
   *  résolveurs kit/équipement/quirks (gear.ts) ; absent = 0 partout. */
  premiumRates?: Record<string, number>,
): Record<string, number> {
  const channels = collectStatChannels(activeBuffs, owner ? { owner } : undefined);
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
      premiumRatePermille: premiumRates?.[map.st] ?? 0,
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

  const attackerElement = elementOf(char.element);
  const defenderElement = elementOf(target.element);
  if (attackerElement === undefined || defenderElement === undefined) {
    throw new Error(`buildDamageReport: élément inconnu (${char.element} / ${target.element})`);
  }

  // Passifs de BOSS du preset (passives.ts) : « un débuff comme un autre »
  // (Sevih 05/08) — ils traversent les MÊMES canaux que les chips, jamais les
  // stats saisies. Conditions élémentaires évaluées ici ; le reste est signalé.
  let bossPassives: BossPassivesInfo | undefined;
  if (target.monsterId !== undefined) {
    bossPassives = data.targets
      ? resolveBossPassives(
          target.monsterId,
          data.targets,
          data.buffs,
          attackerElement,
          defenderElement,
          target.enraged === true,
        )
      : undefined;
    bossPassives ??= {
      entries: [],
      unresolved: [
        {
          buffId: target.monsterId,
          reason: data.targets
            ? 'monstre absent des tables targets'
            : 'tables targets non chargées',
        },
      ],
    };
  }
  const passiveBuffs = (side: 'attacker' | 'defender'): ActiveBuff[] =>
    (bossPassives?.entries ?? [])
      // Les BT_STAT défenseur (enrage) ne passent PAS en buff de scénario :
      // ils s'appliquent aux STATS de la cible (canal § 16.1, ci-dessous).
      .filter(
        (e) => e.side === side && e.active && !(side === 'defender' && e.buff.type === 'BT_STAT'),
      )
      .map((e) => e.buff);

  // Conditions d'ÉTAT déclarées remplies (z `cs`) — consommées par les
  // entrées `stateful` des trois collecteurs (mécaniques perso, gear.ts).
  const metConditions = attacker.metConditions?.length
    ? new Set(attacker.metConditions)
    : undefined;

  // Passifs d'ÉQUIPEMENT § 15 (gear.ts) : mêmes canaux que les chips — le
  // porteur reçoit les entrées actives côté attaquant, les débuffs permanents
  // posés par l'équipement partent côté défenseur. Procs/conditions non
  // évaluables : signalés, jamais tus.
  let gearPassives: GearPassivesInfo | undefined;
  if (attacker.gear !== undefined) {
    gearPassives = data.equipment
      ? resolveGearPassives(
          attacker.id,
          attacker.gear,
          data.equipment,
          data.buffs,
          attackerElement,
          defenderElement,
          metConditions,
          target.boss === true,
          undefined,
          char.class,
        )
      : {
          entries: [],
          dynamic: [],
          premium: [],
          unresolved: [
            {
              source: 'weapon',
              sourceId: attacker.id,
              buffId: attacker.id,
              reason: 'tables equipment non chargées',
            },
          ],
        };
  }
  // Les BT_STAT DÉFENSEUR sans callers ne passent pas en buff de scénario :
  // ils vont au canal § 16.1 des stats de la cible (tgtStats, ci-dessous).
  const scenarioSide = (e: { side: string; buff: ActiveBuff }, side: string): boolean =>
    e.side === side && !(side === 'defender' && e.buff.type === 'BT_STAT');
  const gearBuffs = (side: 'attacker' | 'defender'): ActiveBuff[] =>
    (gearPassives?.entries ?? [])
      .filter((e) => scenarioSide(e, side) && e.active && !e.callers)
      .map((e) => e.buff);

  // Passifs du KIT (§ 16.3 côté joueur) : skills `*_PASSIVE` du perso — le
  // passif UNIQUE suit la TRANSCENDANCE (growth.transcend.skillLevel).
  // Étoile de transcendance EFFECTIVE (index absent = palier MAX, défaut UI)
  // — même règle pour l'attaquant et les alliés déclarés.
  const transStarOf = (c: DataCharacter, transcendIndex: number | undefined): number => {
    const max = data.growth.transcend.reduce(
      (m, r) => (r.basicStar === c.basicStar && r.transStar > m ? r.transStar : m),
      c.basicStar,
    );
    return transcendIndex !== undefined ? Math.min(c.basicStar + transcendIndex, max) : max;
  };
  const transStar = transStarOf(char, attacker.transcendIndex);
  const kitPassives = resolveKitPassives(
    char,
    transStar,
    data.characters.skills,
    data.growth.transcend,
    data.buffs,
    attackerElement,
    defenderElement,
    attacker.skillLevels,
    metConditions,
    target.boss === true,
  );
  const kitBuffs = (side: 'attacker' | 'defender'): ActiveBuff[] =>
    kitPassives.entries
      .filter((e) => scenarioSide(e, side) && e.active && !e.callers)
      .map((e) => e.buff);

  // QUIRKS du compte (nœuds d'éveil à buff) — portée élément/classe évaluée
  // dans gear.ts ; les nœuds de stats sont déjà dans la fiche (§ 17.4).
  let quirkPassives: GearPassivesInfo | undefined;
  if (attacker.quirks && Object.keys(attacker.quirks).length) {
    quirkPassives = resolveQuirkPassives(
      attacker.quirks,
      data.growth.awakening,
      { element: attackerElement, class: char.class, subClass: char.subClass },
      data.buffs,
      defenderElement,
      target.mode !== undefined ? dungeonModeOf(target.mode) : undefined,
      metConditions,
      target.boss === true,
    );
  }
  const quirkBuffs = (side: 'attacker' | 'defender'): ActiveBuff[] =>
    (quirkPassives?.entries ?? [])
      .filter((e) => scenarioSide(e, side) && e.active && !e.callers)
      .map((e) => e.buff);

  // Passifs d'ALLIÉS (lot « buffs d'alliés ») : pour chaque membre déclaré,
  // son kit (niveaux de skill au MAX — pas de saisie UI) et son EE passent
  // par les MÊMES résolveurs en mode allié — seules les cibles `MY_TEAM*`
  // qui atteignent l'attaquant (classe évaluée) et les auras `ENEMY*`
  // ressortent ; dynamiques signalés, jamais simulés. Chaque entrée est
  // étiquetée de son `ally` pour l'affichage.
  let allyPassives: GearPassivesInfo | undefined;
  if (attacker.allies?.length) {
    allyPassives = { entries: [], dynamic: [], premium: [], unresolved: [] };
    const receiver = { class: char.class };
    for (const al of attacker.allies) {
      const ac = data.characters.characters[al.id];
      if (!ac) {
        allyPassives.unresolved.push({
          source: 'kit',
          sourceId: al.id,
          buffId: al.id,
          reason: 'allié absent des tables characters',
          ally: al.id,
        });
        continue;
      }
      const infos = [
        resolveKitPassives(
          ac,
          transStarOf(ac, al.transcendIndex),
          data.characters.skills,
          data.growth.transcend,
          data.buffs,
          attackerElement,
          defenderElement,
          {},
          metConditions,
          target.boss === true,
          receiver,
        ),
      ];
      // Équipement de l'allié (EE, main de talisman, arme, accessoire) : le
      // MÊME résolveur qu'au porteur, en mode allié — seules les lignes qui
      // atteignent l'attaquant ressortent (24/08/2026).
      const alGear: GearSelection = {
        ...(al.ee ? { ee: al.ee } : {}),
        ...(al.talisman ? { talismanMain: al.talisman } : {}),
        ...(al.weapon ? { weapon: al.weapon } : {}),
        ...(al.amulet ? { amulet: al.amulet } : {}),
      };
      if (Object.keys(alGear).length && data.equipment) {
        infos.push(
          resolveGearPassives(
            al.id,
            alGear,
            data.equipment,
            data.buffs,
            attackerElement,
            defenderElement,
            metConditions,
            target.boss === true,
            receiver,
          ),
        );
      }
      for (const i of infos) {
        allyPassives.entries.push(...i.entries.map((e) => ({ ...e, ally: al.id })));
        allyPassives.dynamic.push(...i.dynamic.map((e) => ({ ...e, ally: al.id })));
        allyPassives.unresolved.push(...i.unresolved.map((e) => ({ ...e, ally: al.id })));
      }
    }
  }
  const allyBuffs = (side: 'attacker' | 'defender'): ActiveBuff[] =>
    (allyPassives?.entries ?? [])
      .filter((e) => scenarioSide(e, side) && e.active && !e.callers)
      .map((e) => e.buff);
  // Procs DÉCLARÉS (stacks > 0, côté attaquant seulement) — kit/EE/quirks
  // du porteur comme des alliés : valeur effective = value × stacks
  // (§ 14.1), stacks plafonnés au StackCount de la ligne. Dédup par buffId
  // (un même buff référencé par plusieurs sources = UNE instance en jeu).
  // NB : cette collecte lit gearPassives/kitPassives/quirkPassives déclarés
  // PLUS HAUT — allyPassives ferme la liste.
  const declaredDynamicBuffs: ActiveBuff[] = [];
  if (attacker.buffStacks) {
    const served = new Set<string>();
    for (const i of [kitPassives, gearPassives, quirkPassives, allyPassives]) {
      for (const d of i?.dynamic ?? []) {
        if (d.side !== 'attacker' || served.has(d.buffId)) continue;
        const n = attacker.buffStacks[d.buffId] ?? 0;
        if (n < 1) continue;
        served.add(d.buffId);
        declaredDynamicBuffs.push({ ...d.buff, stacks: Math.min(n, d.maxStacks ?? 1) });
      }
    }
  }

  // Buffs restreints par slot (`CallerSkillType`, gear.ts) : versés SEULEMENT
  // au slot dont le skill lanceur matche — jamais aux stats de combat (les
  // familles à canal de stat gatées sont signalées, pas des entrées).
  const gatedInfos = () => [gearPassives, kitPassives, quirkPassives, allyPassives];
  const gatedBuffs = (side: 'attacker' | 'defender', skillType: string): ActiveBuff[] =>
    gatedInfos().flatMap((i) =>
      (i?.entries ?? [])
        .filter((e) => e.side === side && e.active && e.callers?.includes(skillType))
        .map((e) => e.buff),
    );

  // Buffs actifs des deux côtés : affinité (donnée) + chips (catalogue) +
  // passifs de boss et d'équipement (donnée, évalués ci-dessus).
  const atkFx = resolveFx(attacker.fx ?? []);
  const tgtFx = resolveFx(target.fx ?? []);
  const attackerBuffs = [
    ...trustBuffs(attacker.affinityTier, data.buffs),
    ...atkFx.buffs,
    ...passiveBuffs('attacker'),
    ...gearBuffs('attacker'),
    ...kitBuffs('attacker'),
    ...quirkBuffs('attacker'),
    ...allyBuffs('attacker'),
    ...declaredDynamicBuffs,
  ];
  const defenderBuffs = [
    ...tgtFx.buffs,
    ...passiveBuffs('defender'),
    ...gearBuffs('defender'),
    ...kitBuffs('defender'),
    ...quirkBuffs('defender'),
    ...allyBuffs('defender'),
  ];

  // Stats effectives de la CIBLE (canal § 16.1, A = 0) : BT_STAT actifs posés
  // sur elle par le boss lui-même (enrage) ou par le kit/équipement/quirks du
  // porteur — hors callers (les débuffs AU LANCEMENT d'un skill passent par
  // le canal PAR SLOT de pushSlot, 18/08/2026).
  const tgtStats = applyTargetStatChannel(target.stats, [
    ...(bossPassives?.entries ?? [])
      .filter((e) => e.side === 'defender' && e.active && e.buff.type === 'BT_STAT')
      .map((e) => e.buff),
    ...gatedInfos().flatMap((i) =>
      (i?.entries ?? [])
        .filter((e) => e.side === 'defender' && e.active && !e.callers && e.buff.type === 'BT_STAT')
        .map((e) => e.buff),
    ),
  ]);

  // Stats de l'attaquant qui pèsent un MONTANT dans CE scénario (filtre des
  // chips de passifs de boss, cf. passives.ts) : la base § 8/§ 7.5/§ 9, plus
  // ce que les buffs ACTIFS lisent — familles `*_STAT` § 9.1 (ex. 2000067_2_6 :
  // +50 % du taux CRIT en dégâts), swap d'attaque § 10.1, contexte PV § 14 et
  // familles PV-perdus. Les entrées gatées par slot (`callers`) lisent aussi.
  const attackerAmountStats = new Set<string>(BASE_AMOUNT_STATS);
  {
    const reading = [
      ...attackerBuffs,
      ...gatedInfos().flatMap((i) =>
        (i?.entries ?? [])
          .filter((e) => e.side === 'attacker' && e.active && e.callers)
          .map((e) => e.buff),
      ),
    ];
    for (const b of reading) {
      const readsStat =
        b.type === 'BT_DMG_OWNER_STAT' ||
        b.type === 'BT_DMG_CASTER_STAT' ||
        b.type === 'BT_SWAP_STAT_ATTACK';
      if (readsStat && b.stat !== undefined) attackerAmountStats.add(b.stat);
      const readsHp =
        b.type === 'BT_DMG_OWNER_LOST_HP_RATE' ||
        b.type === 'BT_DMG_CASTER_LOST_HP_RATE' ||
        b.type.startsWith('BT_STAT_OWNER_LOST_HP_RATE');
      if (readsHp) attackerAmountStats.add('ST_HP');
    }
  }

  // Taux PREMIUM par stat (‰) — `BT_STAT_PREMIUM` passifs inconditionnels du
  // porteur, collectés par les trois résolveurs : DÉJÀ dans la fiche saisie,
  // ils servent à la défactoriser puis multiplient les plats du canal buff
  // (sheet.ts — terme croisé trust × premiums, prouvé 18/08/2026 sur Caren).
  const premiumRates: Record<string, number> = {};
  for (const i of gatedInfos())
    for (const p of i?.premium ?? [])
      premiumRates[p.stat] = (premiumRates[p.stat] ?? 0) + p.valueRate;

  let combatStats = buildCombatStats(
    attacker,
    char,
    data.growth,
    attackerBuffs,
    undefined,
    premiumRates,
  );
  // Familles « PV perdus » § 14 (BT 31/32 — sets Revenge/Patience/Swiftness) :
  // leur contexte est le PV de COMBAT, connu seulement après la première
  // passe — on rejoue alors la construction avec le contexte (le PV lui-même
  // n'est jamais scalé par ces familles : la seconde passe est stable).
  if (attackerBuffs.some((b) => b.type.startsWith('BT_STAT_OWNER_LOST_HP_RATE'))) {
    const maxHP = combatStats.hp ?? 0;
    if (maxHP > 0) {
      combatStats = buildCombatStats(
        attacker,
        char,
        data.growth,
        attackerBuffs,
        {
          maxHP,
          hp: Math.floor((maxHP * (attacker.hpPct ?? 100)) / 100),
        },
        premiumRates,
      );
    }
  }

  // Buffs MAX_HP § 16.2 (guilde + titre) : seul le HP MAX bouge. Chaque part
  // est active dans SES modes (preset) ou sur SA coche (cible manuelle) —
  // jamais supposée ; la SOMME des parts actives fait le taux, comme le
  // manager du jeu. Appliqué AVANT le scénario : le HP servi au swap § 10.1
  // et au contexte PV est celui du combat réel.
  let maxHpBuff: MaxHpBuffInfo | undefined;
  const guildLevel = attacker.guildLevel ?? 0;
  const premiumHp = attacker.premiumHp === true;
  if (guildLevel > 0 || premiumHp) {
    const dm = target.mode !== undefined ? dungeonModeOf(target.mode) : undefined;
    const modeOk = (modes: string[], ignore?: string[]): boolean =>
      dm !== undefined && modes.includes(dm) && !ignore?.includes(dm);
    const parts: MaxHpBuffPart[] = [];
    if (guildLevel > 0 && data.growth.guildMaxHp.length) {
      const tiers = data.growth.guildMaxHp;
      const tier = tiers.find((t) => t.level === guildLevel) ?? tiers[tiers.length - 1];
      parts.push({
        source: 'guild',
        level: tier.level,
        value: tier.maxHpValue,
        active: target.guildBuffOn === true || modeOk(tier.modes, tier.ignoreModes),
      });
    }
    if (premiumHp) {
      for (const t of data.growth.titleMaxHp) {
        parts.push({
          source: 'title',
          value: t.maxHpValue,
          active: target.titleBuffOn === true || modeOk(t.modes, t.ignoreModes),
        });
      }
    }
    const sum = parts.reduce((s, p) => s + (p.active ? p.value : 0), 0);
    const hpBefore = combatStats.hp ?? 0;
    const rate = eventMaxHpRate(sum);
    const hpAfter = sum > 0 && hpBefore > 0 ? applyMaxHpRate(hpBefore, rate) : hpBefore;
    if (sum > 0 && hpBefore > 0) combatStats.hp = hpAfter;
    maxHpBuff = { parts, sum, rate, hpBefore, hpAfter };
  }

  const statOf = (st: string): number => {
    const slug = sheetSlugOfStat(st);
    return slug !== undefined ? (combatStats[slug] ?? 0) : 0;
  };
  // Stats FINALES du défenseur (famille TARGET_STAT § 9.1 — ex. Noa
  // 2000022_2_2 : +3 % des PV max de la CIBLE en taux) : celles que le
  // scénario porte (TARGET_STAT_MAP) ; absente → 0, jamais devinée.
  const defenderStatOf = (st: string): number => {
    const key = TARGET_STAT_MAP[st];
    return key !== undefined ? (tgtStats[key] ?? 0) : 0;
  };

  const attackerMaxHP = combatStats.hp ?? 0;
  const defenderMaxHP = tgtStats.hp ?? 0;
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
      defense: tgtStats.def ?? 0,
      avoid: 0, // pas de saisie d'esquive côté cible — 0
      dmgReduceRate: tgtStats.dmgRed ?? 0,
      enemyCriticalDamageReduce: tgtStats.cdmgRed ?? 0,
      element: defenderElement,
    },
    attackerBuffs,
    defenderBuffs,
    ...(options?.includeMissBranch ? { includeMissBranch: true } : {}),
    // BT_DMG_ENEMY_TEAM_DECREASE (§ 7) : cibles décomptées = taille d'équipe
    // (CCommonDefine.MAX_USER_TEAM_MEMBER) − cibles touchées. Le décompte du
    // code d'attaque n'est pas désassemblé — la référence est PROUVÉE par la
    // fixture Noa vs Rhona (10/08/2026, +450 ‰ = 150 × 3 exacts, 1 ennemi).
    decreaseTargetCount: Math.max(0, MAX_USER_TEAM_MEMBER - (options?.targetsHit ?? 1)),
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
      defenderStat: defenderStatOf,
      targetIsBoss: target.boss === true,
      ...(target.broken !== undefined ? { targetIsBreak: target.broken } : {}),
      // Compteurs § 9.1 — DÉCLARÉS par le scénario (steppers UI, z), jamais
      // dérivés des chips : absents = 0, la famille contribue 0.
      ...(attacker.buffCount !== undefined ? { attackerBuffCount: attacker.buffCount } : {}),
      ...(attacker.debuffCount !== undefined ? { attackerDebuffCount: attacker.debuffCount } : {}),
      ...(attacker.teamBuffCount !== undefined
        ? { casterTeamBuffCount: attacker.teamBuffCount }
        : {}),
      ...(target.buffCount !== undefined ? { defenderBuffCount: target.buffCount } : {}),
      ...(target.debuffCount !== undefined ? { defenderDebuffCount: target.debuffCount } : {}),
      scene: 'pve',
    },
  };

  // Kit : S1/S2/S3, puis les bursts rattachés au slot du skill BURSTABLE
  // (`burstAP` — S1 chez Caren/Valentine, S2 chez la plupart), même niveau
  // saisi que lui (vérifié : tous les bursts du roster ont le même nombre de
  // niveaux que leur skill burstable — garde datagen).
  const byType = new Map<string, DataSkill>();
  for (const ref of char.skills) {
    const sk = data.characters.skills[ref.id];
    if (sk && !byType.has(sk.type)) byType.set(sk.type, sk);
  }

  // Familles à canal de STAT (§ 16.1) — par slot, elles recalculent les
  // stats de la ligne au lieu d'entrer en buffs de scénario.
  const isStatChannel = (b: ActiveBuff): boolean =>
    b.type === 'BT_STAT' || b.type.startsWith('BT_STAT_OWNER_LOST_HP_RATE');
  // Stats de combat pour une liste de buffs (2 passes « PV perdus » § 14 +
  // buff MAX_HP § 16.2 réappliqué) — sert le canal PAR SLOT.
  const combatStatsWith = (buffsList: ActiveBuff[]): Record<string, number> => {
    let stats = buildCombatStats(attacker, char, data.growth, buffsList, undefined, premiumRates);
    if (buffsList.some((b) => b.type.startsWith('BT_STAT_OWNER_LOST_HP_RATE'))) {
      const maxHP = stats.hp ?? 0;
      if (maxHP > 0) {
        stats = buildCombatStats(
          attacker,
          char,
          data.growth,
          buffsList,
          {
            maxHP,
            hp: Math.floor((maxHP * (attacker.hpPct ?? 100)) / 100),
          },
          premiumRates,
        );
      }
    }
    if (maxHpBuff !== undefined && maxHpBuff.sum > 0 && (stats.hp ?? 0) > 0) {
      stats.hp = applyMaxHpRate(stats.hp, maxHpBuff.rate);
    }
    return stats;
  };

  // DoT posés par un skill : les BT_DOT_* de ses `buffIds` au niveau servi,
  // tick § 11 sur les stats de LA ligne (stat de référence capturée au
  // lancement — même canal § 16.1 que les procs). Un DoT sans taux OAT_RATE
  // d'une stat lisible n'a pas de tick calculable : pas de ligne inventée.
  const collectSlotDots = (
    buffIds: string[],
    buffLevel: number,
    slotScenario: ReportScenario,
  ): SlotDotLine[] => {
    const out: SlotDotLine[] = [];
    for (const id of buffIds) {
      const rows = data.buffs.buffs[id];
      if (!rows?.length) continue;
      const row = pickBuffRow(rows, buffLevel);
      if (!row || !row.type.startsWith('BT_DOT_')) continue;
      if (!row.targetType?.startsWith('ENEMY')) continue;
      // Row conditionnelle = inactive par défaut (contexte absent = 0, § 12.1)
      // — ex. le Bleed OWNER_IS_BOSS du S1 de Francesca (version monstre du
      // kit) : jamais posé par un attaquant joueur, pas de ligne fantôme.
      if (row.conditionType !== undefined) continue;
      if (row.applyingType !== 'OAT_RATE' || row.value === undefined || row.stat === undefined)
        continue;
      const statValue =
        row.stat === 'ST_ATK'
          ? slotScenario.attacker.attackStat
          : (slotScenario.additionalContext?.attackerStat?.(row.stat) ?? 0);
      if (statValue <= 0) continue;
      const line = buildDotLine({
        attackRate: row.value,
        statValue,
        defense: slotScenario.defender.defense,
        piercePowerRate: slotScenario.attacker.piercePowerRate,
        piercePower: slotScenario.attacker.piercePower,
        dmgReduceRate: slotScenario.defender.dmgReduceRate,
        createRatePermille: row.createRate ?? 1000,
        buffChancePermille: slotScenario.additionalContext?.attackerStat?.('ST_BUFF_CHANCE') ?? 0,
        buffResistPermille: slotScenario.additionalContext?.defenderStat?.('ST_BUFF_RESIST') ?? 0,
        ignoreResist: row.buffDebuffType === 'DEBUFF_IGNORE_RESIST',
      });
      out.push({
        buffId: id,
        type: row.type,
        ...(row.tooltipId !== undefined ? { tooltipId: row.tooltipId } : {}),
        damagePerTick: line.damagePerTick,
        applyProbability: line.applyProbability,
        ...(row.turnDuration !== undefined ? { turnDuration: row.turnDuration } : {}),
        ...(row.stackCount !== undefined && row.stackCount > 1
          ? { stackCount: row.stackCount }
          : {}),
      });
    }
    return out;
  };

  const slots: SlotReport[] = [];
  const pushSlot = (slot: 'S1' | 'S2' | 'S3', sk: DataSkill, burst?: number) => {
    const wanted = attacker.skillLevels[slot] ?? sk.levels.length;
    const level = Math.min(Math.max(wanted, 1), sk.levels.length);
    const lv = sk.levels.find((l) => l.level === level) ?? sk.levels[sk.levels.length - 1];
    if (!lv || lv.damageFactor <= 0) return; // skill sans dégâts : pas de ligne
    // Buffs restreints par slot : la ligne reçoit en buffs de scénario les
    // entrées dont les lanceurs matchent son skill (ex. Noa : le +3 % PV
    // cible sur le S2 seul — fixture 10/08/2026) ; ses BT_STAT (procs au
    // LANCEMENT, passifs gated) passent par le canal § 16.1 — les stats de
    // COMBAT de CETTE ligne sont recalculées (le pierce du B2 de Caren n'est
    // pas celui du B1 : captures 18/08/2026, ratio exact).
    const gatedAtk = gatedBuffs('attacker', sk.type);
    const gatedDef = gatedBuffs('defender', sk.type);
    let slotScenario: ReportScenario = scenario;
    if (gatedAtk.length || gatedDef.length) {
      const statAtk = gatedAtk.filter(isStatChannel);
      const buffAtk = gatedAtk.filter((b) => !isStatChannel(b));
      const statDef = gatedDef.filter((b) => b.type === 'BT_STAT');
      const buffDef = gatedDef.filter((b) => b.type !== 'BT_STAT');
      let slotAttacker = scenario.attacker;
      let slotStatOf = statOf;
      let slotAtkHp = scenario.additionalContext?.attacker;
      if (statAtk.length) {
        const sc = combatStatsWith([...attackerBuffs, ...statAtk]);
        slotAttacker = {
          ...scenario.attacker,
          attackStat: sc.atk ?? 0,
          criticalRate: sc.critical_rate ?? 0,
          criticalDmgRate: sc.critical_dmg ?? 0,
          dmgBoost: sc.dmg_boost ?? 0,
          piercePowerRate: sc.pierce_power_rate ?? 0,
        };
        slotStatOf = (st: string): number => {
          const slug = sheetSlugOfStat(st);
          return slug !== undefined ? (sc[slug] ?? 0) : 0;
        };
        const hp = sc.hp ?? 0;
        slotAtkHp =
          hp > 0 ? { maxHP: hp, hp: Math.floor((hp * (attacker.hpPct ?? 100)) / 100) } : undefined;
      }
      let slotDefender = scenario.defender;
      let slotDefStat = defenderStatOf;
      let slotDefHp = scenario.additionalContext?.defender;
      if (statDef.length) {
        const ts = applyTargetStatChannel(tgtStats, statDef);
        slotDefender = {
          ...scenario.defender,
          defense: ts.def ?? 0,
          dmgReduceRate: ts.dmgRed ?? 0,
          enemyCriticalDamageReduce: ts.cdmgRed ?? 0,
        };
        slotDefStat = (st: string): number => {
          const key = TARGET_STAT_MAP[st];
          return key !== undefined ? (ts[key] ?? 0) : 0;
        };
        const hp = ts.hp ?? 0;
        slotDefHp =
          hp > 0 ? { maxHP: hp, hp: Math.floor((hp * (target.hpPct ?? 100)) / 100) } : undefined;
      }
      slotScenario = {
        ...scenario,
        attacker: slotAttacker,
        defender: slotDefender,
        attackerBuffs: [...attackerBuffs, ...buffAtk],
        defenderBuffs: [...defenderBuffs, ...buffDef],
        additionalContext: {
          ...scenario.additionalContext,
          attacker: slotAtkHp,
          defender: slotDefHp,
          attackerStat: slotStatOf,
          defenderStat: slotDefStat,
        },
      };
    }
    const report = buildSkillReport(
      {
        skillFactor: lv.damageFactor,
        wgReduce: lv.wgReduce,
        isFirstSkill: slot === 'S1',
        monoTarget: sk.rangeType === 'SINGLE',
        // § 8.1 par clip quand l'affectation est résolue (sinon fallback § 12.4).
        states: attachChainClips(groupHitsByChain(sk.hits), sk.clips, sk.clipsUnresolvedChains),
      },
      slotScenario,
      options,
    );
    const dots = collectSlotDots(lv.buffIds, lv.level, slotScenario);
    slots.push({
      slot,
      skillId: sk.id,
      ...(burst !== undefined ? { burst } : {}),
      skillLevel: lv.level,
      ...(sk.hitsUnresolved ? { hitsUnresolved: true } : {}),
      report,
      ...(dots.length ? { dots } : {}),
    });
  };

  for (const { slot, type } of SLOT_TYPES) {
    const sk = byType.get(type);
    if (sk) pushSlot(slot, sk);
  }
  // Slot du burstable — SANS marqueur (artefact antérieur à `burstAP`,
  // RequireAP inattendu), les lignes burst sont OMISES et signalées : un slot
  // supposé rejouerait le bug « toujours S2 » avec le niveau du S2, en
  // silence (revue 18/08/2026).
  const burstSlot = burstableSlotOf(SLOT_TYPES.map(({ type }) => byType.get(type)));
  const dataIssues: string[] = [];
  if (burstSlot === undefined && BURST_TYPES.some((t) => byType.has(t))) {
    dataIssues.push(
      'bursts sans marqueur burstAP (damage/characters.json anterieur ?) — lignes burst omises',
    );
  }
  if (burstSlot !== undefined) {
    BURST_TYPES.forEach((type, i) => {
      const sk = byType.get(type);
      if (sk) pushSlot(burstSlot, sk, i + 1);
    });
  }

  return {
    combatStats,
    slots,
    unresolvedFx: [...atkFx.unresolved, ...tgtFx.unresolved],
    ...(maxHpBuff ? { maxHpBuff } : {}),
    ...(bossPassives ? { bossPassives } : {}),
    attackerAmountStats: [...attackerAmountStats],
    ...(dataIssues.length ? { dataIssues } : {}),
    ...(gearPassives ? { gearPassives } : {}),
    kitPassives,
    ...(quirkPassives ? { quirkPassives } : {}),
    ...(allyPassives ? { allyPassives } : {}),
  };
}
