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
 * HORS périmètre v1 (documenté, jamais comblé en douce) : lignes DOT
 * (liaison buffIds → templets de buff), immunités de cible. Les passifs
 * d'équipement § 15 (canal 2 — buffs) sont branchés via gear.ts ; le canal 1
 * (stats chiffrées main/sub/sets %) reste dans la fiche SAISIE.
 */

import { collectStatChannels, type ActiveBuff } from './aggregate';
import { calcBaseStat } from './formula';
import { resolveGearPassives, type GearPassivesInfo, type GearSelection } from './gear';
import { resolveBossPassives, type BossPassivesInfo } from './passives';
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
 * Slug de mode d'encounters → `DUNGEON_MODE` brut. `normal_hard` est un
 * `AGT_HARD` du MÊME mode DM_NORMAL ; tous les autres slugs sont l'enum en
 * minuscules sans préfixe (vérifié sur la liste 1.4.9).
 */
export function dungeonModeOf(encounterMode: string): string {
  return encounterMode === 'normal_hard' ? 'DM_NORMAL' : `DM_${encounterMode.toUpperCase()}`;
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
  /** Niveau de GUILDE du compte (0..10) — buff MAX_HP § 16.2, hors z. */
  guildLevel?: number;
  /** Buff de TITRE « Premium Body » possédé (+5 % PV, § 16.2) — hors z. */
  premiumHp?: boolean;
  /** Équipement porté (passifs § 15 canal 2) — résolu par le pont (gear.ts). */
  gear?: GearSelection;
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
}

export interface BuildReportOptions extends SkillReportOptions {
  /** Cibles touchées (décroissance § 7 — réservé ; 1 par défaut). */
  targetsHit?: number;
  /** Force la branche MISS (sans esquive, le miss n'existe qu'avec un buff de
   *  « miss chance ») — comparaison d'un coup manqué observé en jeu. */
  includeMissBranch?: boolean;
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
  /** Passifs d'équipement § 15 (appliqués + procs signalés + non-résolus) —
   *  présent dès que l'attaquant porte du `gear`. */
  gearPassives?: GearPassivesInfo;
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
  /** PV du porteur (§ 14 BT 31/32 — stats « PV perdus ») ; absent : ces
   *  familles contribuent 0. */
  owner?: { maxHP: number; hp: number },
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
    (bossPassives?.entries ?? []).filter((e) => e.side === side && e.active).map((e) => e.buff);

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
        )
      : {
          entries: [],
          dynamic: [],
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
  const gearBuffs = (side: 'attacker' | 'defender'): ActiveBuff[] =>
    (gearPassives?.entries ?? []).filter((e) => e.side === side && e.active).map((e) => e.buff);

  // Buffs actifs des deux côtés : affinité (donnée) + chips (catalogue) +
  // passifs de boss et d'équipement (donnée, évalués ci-dessus).
  const atkFx = resolveFx(attacker.fx ?? []);
  const tgtFx = resolveFx(target.fx ?? []);
  const attackerBuffs = [
    ...trustBuffs(attacker.affinityTier, data.buffs),
    ...atkFx.buffs,
    ...passiveBuffs('attacker'),
    ...gearBuffs('attacker'),
  ];
  const defenderBuffs = [...tgtFx.buffs, ...passiveBuffs('defender'), ...gearBuffs('defender')];

  let combatStats = buildCombatStats(attacker, char, data.growth, attackerBuffs);
  // Familles « PV perdus » § 14 (BT 31/32 — sets Revenge/Patience/Swiftness) :
  // leur contexte est le PV de COMBAT, connu seulement après la première
  // passe — on rejoue alors la construction avec le contexte (le PV lui-même
  // n'est jamais scalé par ces familles : la seconde passe est stable).
  if (attackerBuffs.some((b) => b.type.startsWith('BT_STAT_OWNER_LOST_HP_RATE'))) {
    const maxHP = combatStats.hp ?? 0;
    if (maxHP > 0) {
      combatStats = buildCombatStats(attacker, char, data.growth, attackerBuffs, {
        maxHP,
        hp: Math.floor((maxHP * (attacker.hpPct ?? 100)) / 100),
      });
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
    ...(options?.includeMissBranch ? { includeMissBranch: true } : {}),
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
      ...(target.broken !== undefined ? { targetIsBreak: target.broken } : {}),
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
    ...(maxHpBuff ? { maxHpBuff } : {}),
    ...(bossPassives ? { bossPassives } : {}),
    ...(gearPassives ? { gearPassives } : {}),
  };
}
