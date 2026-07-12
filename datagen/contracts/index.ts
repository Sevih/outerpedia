/**
 * Couche 4 — CONTRATS : les types publics décrivant `data/generated/*`.
 *
 * 100 % TYPES, AUCUN runtime : ce module ne fait que des `export type`, effacés à
 * la compilation. L'app peut donc l'importer pour typer la donnée committée SANS
 * embarquer le moindre code du datagen (pas de générateur, pas de `node:fs`, pas
 * du tout de logique d'admin dans le build).
 *
 * Côté app : `import type { Character } from '@/../datagen/contracts'`
 *            + `import data from '@data/generated/characters.json'`.
 */
export type { GameLang, LangDict } from '../lib/lang';
export type {
  Effect,
  EffectCategory,
  EffectFamily,
  EffectMode,
  EffectShape,
  ResolvedEffect,
} from '../lib/effects';
export type { BuffValues, SkillBuffVars } from '../lib/buff';
export type { Character, StatRange } from '../extractor/specs/character';
export type { Monster } from '../extractor/specs/monster';
export type { TranscendStep, TranscendData } from '../extractor/transcend';
export type {
  CharacterCurated,
  CuratedRole,
  SkillPriority,
  VideoRef,
  ProsCons,
  LocalizedText,
} from '../curated/character';
export type { EffectCurated } from '../curated/effects';
export type {
  GearBuild,
  GearPick,
  GearPresets,
  SetCombo,
  SetComboPiece,
} from '../curated/gear-reco';
export type { Skill, SkillLevel } from '../generators/skills';
export type { Item } from '../generators/items';
export type { Goods } from '../generators/goods';
export type { Costume as CostumeItem } from '../generators/costumes';
export type { CatalogEntry } from '../generators/item-catalog';
export type { GameVersion } from '../generators/game-version';
export type {
  DungeonAdv,
  DungeonDifficulty,
  DungeonMonster,
  DungeonRank,
  DungeonRef,
  EncountersData,
  GuildRaidGeas,
  MonsterEncounters,
  RankDamage,
  RankOption,
  RewardEntry,
  RewardTable,
  MonsterSpawn,
} from '../generators/encounters';
export type {
  ArmorItem,
  BreakLimit,
  BuffEffect,
  ExclusiveItem,
  Family,
  GameSet,
  GearItem,
  Option,
  Passive,
  PassiveRef,
  SetEffect,
  SetTier,
  SpecialItem,
} from '../generators/equipment';
export type { Boss } from '../generators/bosses';
export type {
  UnlockContentData,
  UnlockEntry,
  UnlockRequirement,
} from '../generators/unlock-content';
export type {
  SingularityAnchor,
  SingularityBoss,
  SingularityData,
  SingularityGroup,
  SingularitySchedule,
} from '../generators/singularity';
export type { Tower, TowerDebuff, TowerFloor, TowersData, TowerUnit } from '../generators/towers';
export type {
  ContentScheduleData,
  GuildRaidBoss,
  GuildRaidSeason,
  JointChallengeSeason,
  WorldBossSeason,
} from '../generators/content-schedule';
export type {
  EvolutionRung,
  LimitBreakStep,
  PremiumInfo,
  ProgressionData,
  QuirkBlock,
  StatBonus,
} from '../generators/progression';
export type { ItemSources } from '../generators/sources';
export type {
  AscensionBonus,
  AscensionGrade,
  AscensionMaterial,
  AscensionStep,
  EnhanceRules,
} from '../generators/enhance';
export type {
  EquipmentCurated,
  EquipmentCuratedEntry,
  EquipmentSource,
} from '../curated/equipment';

import type { LangDict } from '../lib/lang';
import type { Effect } from '../lib/effects';
import type { Character } from '../extractor/specs/character';
import type { Monster } from '../extractor/specs/monster';
import type { DungeonRef, GuildRaidGeas, RankOption, RewardTable } from '../generators/encounters';
import type { TranscendData } from '../extractor/transcend';
import type { Skill } from '../generators/skills';
import type { CatalogEntry } from '../generators/item-catalog';
import type {
  ArmorItem,
  BreakLimit,
  ExclusiveItem,
  Family,
  GameSet,
  GearItem,
  Option,
  Passive,
  SpecialItem,
} from '../generators/equipment';

// --- formes des fichiers data/generated/ -------------------------------------

/** Une sous-classe dans le glossaire (libellé + description optionnelle). */
export interface SubClassEntry {
  name: LangDict;
  desc?: LangDict;
}

/** Échelle d'affichage d'une stat (per-mille → % ou entier brut). */
export type StatScale = 'flat' | 'percent';

/**
 * Glossaires GLOBAUX (slug → libellé), définis une seule fois et partagés par
 * toutes les entités. `data/generated/glossaries.json`.
 */
export interface Glossaries {
  /** Raretés d'équipement (IG_* → Superior/Epic/Legendary…). */
  grades: Record<string, LangDict>;
  /** Noms OFFICIELS des stats (`SYS_STAT_*` : « Counterattack Chance »…). */
  statNames: Record<string, LangDict>;
  /** Descriptions OFFICIELLES des stats (`SYS_STAT_DESC_*`) — rares. */
  statDescs: Record<string, LangDict>;
  /** Classes de combat (CCT_* → Striker/Healer…). */
  classes: Record<string, LangDict>;
  /** Éléments (CET_* → Fire/Water…). */
  elements: Record<string, LangDict>;
  /** Sous-classes (+ description). */
  subClasses: Record<string, SubClassEntry>;
  /** Échelle d'affichage par stat (front formate, damage-calc utilise le brut). */
  statScales: Record<string, StatScale>;
  /** Types de cadeau préféré (slug → libellé). */
  gifts: Record<string, LangDict>;
  /** Libellé « Core Fusion » du jeu — préfixe du nom des entités core-fusion. */
  fusionTitle: LangDict;
  /** Effets nommés (« Burned »…), variantes fusionnées ; réf par skill/équip. */
  effects: Record<string, Effect>;
  /** Carte tooltip → id d'effet canonique (résout une réf de variante). */
  effectByTooltip: Record<string, string>;
  /** Carte label (symbole CreateText) → id d'effet (effets mécaniques). */
  effectByLabel: Record<string, string>;
  /**
   * Carte CLÉ ÉDITORIALE → id d'effet, par côté : clés type du jeu
   * (`BT_DOT_BURN`, `BT_STAT|ST_ATK`), noms normalisés (`POLAR_NIGHT`) et
   * alias historiques du wiki (`BT_BARRIER`). Résout les tags `{B/…}`/`{D/…}`.
   * Suffixe `_IR` = variante INDISSIPABLE du statut (effet distinct, icône
   * `_Interruption`) : `BT_SEALED_IR`, `BT_STAT|ST_CRITICAL_RATE_IR`…
   */
  effectByKey: Record<'buff' | 'debuff', Record<string, string>>;
  /**
   * tooltip → types de mécanique (`BT_X`, ou `BT_STAT|stat` composite) qui
   * l'appliquent dans les tables. Dédup des statuts de NIVEAU redondants : un
   * statut générique affiché par le skill est masqué quand une chip du kit
   * applique la même mécanique sous un statut custom (« Execution time! » ⊃
   * « Increased Damage Taken »).
   */
  tooltipKinds: Record<string, string[]>;
  /**
   * Titres localisés des MODES de contenu (slug de DungeonMode → titre résolu
   * sans mapping en dur — cf. generators/encounters). Optionnel : absent des
   * glossaires committés avant la première promotion du domaine monstre.
   */
  modes?: Record<string, LangDict>;
  /**
   * Passifs de PALIER résolus (`DungeonRank.options` → buff : nom localisé,
   * réf tooltip, stat/valeur) — cf. generators/encounters. Optionnel comme
   * `modes` (absent avant la première promotion).
   */
  rankOptions?: Record<string, RankOption>;
  /**
   * Tables de récompense résolues (`RewardTemplet` + groupes), référencées
   * par `DungeonRef.reward`/`rewardWin`/`rewardLose` — mutualisées entre
   * donjons. Optionnel comme `modes` (absent avant la première promotion).
   */
  rewardTables?: Record<string, RewardTable>;
  /**
   * Geas du guild raid (phase 2 — contenu pas encore ouvert in-game),
   * référencés par `DungeonRef.geasRewards`. Optionnel comme `modes`.
   */
  geas?: Record<string, GuildRaidGeas>;
  /**
   * Quirks de compte réduisant les stats AFFICHÉES des boss (slug de stat →
   * per-mille signé, ex. buff_chance/buff_resist −100) — le jeu les applique
   * à l'écran d'info, le site aussi. Cf. generators/encounters.
   */
  bossQuirkMods?: Record<string, number>;
}

/** `data/generated/characters.json` */
export type CharactersFile = Record<string, Character>;
/** `data/generated/transcend.json` (barème partagé + overrides) */
export type TranscendFile = TranscendData;
/** `data/generated/skills.json` */
export type SkillsFile = Record<string, Skill>;
/** `data/generated/monsters.json` (mobs, élites, boss — filtrés par `type`) */
export type MonstersFile = Record<string, Monster>;
/** `data/generated/monster-skills.json` (même contrat `Skill` que les persos) */
export type MonsterSkillsFile = Record<string, Skill>;
/**
 * `data/generated/encounters.json` — dictionnaire des DONJONS/STAGES référencés
 * par les `spawns` des monstres : mode (slug, titre dans `glossaries.modes`),
 * titre localisé du stage (difficulté incluse) et région. La localisation
 * elle-même (spawns/summonedBy/linkedTo, avec le NIVEAU réel — les stats
 * s'interpolent min@1 → max@100 comme les persos) vit SUR chaque monstre.
 */
export type EncountersFile = Record<string, DungeonRef>;
/**
 * `data/generated/monster-archive/<id>@<n>.json` — état FIGÉ d'un boss
 * (`pnpm datagen:version-boss`, geste humain). Les guides référencent un boss
 * par `<id>` (live, défaut) ou `<id>@<n>` (épinglé sur cet état). Append-only.
 */
export interface MonsterArchiveEntry {
  id: string;
  /** Numéro de version d'archive (1, 2, …) — la référence est `<id>@<version>`. */
  version: number;
  /** Provenance : sha court du commit source, ou `worktree`. */
  ref: string;
  /** Date ISO du commit source (ou de la capture en worktree). */
  committedAt: string;
  /** `resVersion` du jeu au moment de la capture, si connue. */
  gameVersion?: string;
  /** Note humaine (« avant la maj 1.11 », …). */
  label?: string;
  monster: Monster;
  /** Les skills du monstre TELS QU'ILS ÉTAIENT (sous-ensemble figé du catalogue). */
  skills: Record<string, Skill>;
  /**
   * Snapshot des donjons référencés par `monster.spawns` (+ titres de modes) —
   * l'archive reste LISIBLE seule, même si le donjon disparaît du live.
   */
  dungeons?: Record<string, DungeonRef>;
  modes?: Record<string, LangDict>;
}
/**
 * `data/generated/items.json` — CATALOGUE UNIFIÉ servi : items de jeu +
 * monnaies + costumes + curé (overrides & créations), format aligné.
 */
export type ItemsFile = Record<string, CatalogEntry>;

/** Fichiers `data/generated/equipment/*` (un par slot + catalogues transverses). */
export interface EquipmentFiles {
  weapon: Record<string, GearItem>;
  accessory: Record<string, GearItem>;
  helmet: Record<string, ArmorItem>;
  armor: Record<string, ArmorItem>;
  gloves: Record<string, ArmorItem>;
  shoes: Record<string, ArmorItem>;
  talisman: Record<string, SpecialItem>;
  ee: Record<string, ExclusiveItem>;
  /** Familles d'items (règle de regroupement UNIQUE, calculée au build). */
  families: { weapon: Family[]; accessory: Family[]; talisman: Family[] };
  pools: Record<string, Option[]>;
  passives: Record<string, Passive>;
  breakLimits: Record<string, BreakLimit>;
  sets: Record<string, GameSet>;
}
