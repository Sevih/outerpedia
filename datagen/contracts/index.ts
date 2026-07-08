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
import type { TranscendData } from '../extractor/transcend';
import type { Skill } from '../generators/skills';
import type { Item } from '../generators/items';
import type { Goods } from '../generators/goods';
import type { Costume as CostumeItem } from '../generators/costumes';
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
}

/** `data/generated/characters.json` */
export type CharactersFile = Record<string, Character>;
/** `data/generated/transcend.json` (barème partagé + overrides) */
export type TranscendFile = TranscendData;
/** `data/generated/skills.json` */
export type SkillsFile = Record<string, Skill>;
/** `data/generated/items.json` */
export type ItemsFile = Record<string, Item>;
/** `data/generated/goods.json` — monnaies/ressources (SYS_ASSET_*). */
export type GoodsFile = Record<string, Goods>;
/** `data/generated/costumes.json` — skins (CostumeTemplet), vue plate. */
export type CostumesFile = Record<string, CostumeItem>;

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
