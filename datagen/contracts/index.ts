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
  EffectCategory,
  EffectFamily,
  EffectMode,
  EffectShape,
  ResolvedEffect,
  StatusEffect,
} from '../lib/effects';
export type { SkillBuffVars } from '../lib/buff';
export type { Character, StatRange } from '../extractor/specs/character';
export type { TranscendStep, TranscendData } from '../extractor/transcend';
export type { CharacterCurated, CuratedRole, SkillPriority } from '../curated/character';
export type { Skill, SkillLevel } from '../generators/skills';
export type { Item } from '../generators/items';
export type {
  ArmorItem,
  BreakLimit,
  BuffEffect,
  ExclusiveItem,
  GameSet,
  GearItem,
  Option,
  Passive,
  SetEffect,
  SetTier,
  SpecialItem,
} from '../generators/equipment';

import type { LangDict } from '../lib/lang';
import type { StatusEffect } from '../lib/effects';
import type { Character } from '../extractor/specs/character';
import type { TranscendData } from '../extractor/transcend';
import type { Skill } from '../generators/skills';
import type { Item } from '../generators/items';
import type {
  ArmorItem,
  BreakLimit,
  ExclusiveItem,
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
  /** Effets de statut nommés (« Burned »…), réf par les effets de skill/équip. */
  statusEffects: Record<string, StatusEffect>;
}

/** `data/generated/characters.json` */
export type CharactersFile = Record<string, Character>;
/** `data/generated/transcend.json` (barème partagé + overrides) */
export type TranscendFile = TranscendData;
/** `data/generated/skills.json` */
export type SkillsFile = Record<string, Skill>;
/** `data/generated/items.json` */
export type ItemsFile = Record<string, Item>;

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
  pools: Record<string, Option[]>;
  passives: Record<string, Passive>;
  breakLimits: Record<string, BreakLimit>;
  sets: Record<string, GameSet>;
}
