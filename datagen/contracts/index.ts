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
export type {
  Character,
  CharacterTag,
  FusionInfo,
  FusionLevel,
  IgnoreDefenseSource,
  StatRange,
  StatScale,
} from '../extractor/specs/character';
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
export type { TagDef, TagGlossary, TagGroup, TagKind } from '../curated/tags';
export type {
  GearBuild,
  GearPick,
  GearPresets,
  SetCombo,
  SetComboPiece,
} from '../curated/gear-reco';
export type { Skill, SkillLevel } from '../generators/skills';
export type { DamageScaling, DamageScalingFile } from '../generators/damage-scaling';
export type { CharacterEffects, CharactersListData } from '../generators/characters-list';
export type { Item } from '../generators/items';
export type { Goods } from '../generators/goods';
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
  StoryMode,
  UnlockContentData,
  UnlockEntry,
  UnlockRequirement,
} from '../generators/unlock-content';
export type {
  RecruitBanner,
  RecruitData,
  RecruitDrop,
  RecruitKind,
  RecruitKindInfo,
  RecruitRate,
} from '../generators/recruit';
export type { CharacterReleaseFile } from '../generators/character-release';
export type { EtherRankTier, EtherRankingsData } from '../generators/ether-rankings';
export type {
  ShopPriority,
  ShopPeriod,
  ShopEntry,
  ShopSection,
  ShopPrioritiesData,
} from '../generators/shop-priorities';
export type {
  SourceType,
  TimegateSource,
  TimegateItem,
  TimegateTab,
  TimegateResourcesData,
} from '../generators/timegate-resources';
export type {
  ItemRef,
  ItemCost,
  LimitBreakStep,
  SkillUpgradeRow,
  EnchantRow,
  XpFoodItem,
  HeroGrowthData,
} from '../generators/hero-growth';
export type {
  SingularityAnchor,
  SingularityBoss,
  SingularityData,
  SingularityGroup,
  SingularitySchedule,
} from '../generators/singularity';
export type {
  Tower,
  TowerDebuff,
  TowerFloor,
  TowerRestriction,
  TowersData,
  TowerUnit,
} from '../generators/towers';
export type {
  ContentScheduleData,
  GuildRaidBoss,
  GuildRaidSeason,
  JointChallengeSeason,
  WorldBossSeason,
} from '../generators/content-schedule';
export type {
  EvolutionRung,
  // `LimitBreakStep` existe AUSSI dans hero-growth (forme différente : vue
  // Growth Systems) ; celui-ci est la mécanique de rappel (step/recallItemId/
  // price). Aliasé pour lever la collision de barrel — aucun consommateur du
  // nom nu, donc renommage sans risque de contrat.
  LimitBreakStep as ProgressionLimitBreakStep,
  PremiumInfo,
  ProgressionData,
  QuirkBlock,
  StatBonus,
} from '../generators/progression';
export type {
  QuirksData,
  QuirkCategory,
  QuirkTree,
  QuirkNode,
  QuirkLevel,
} from '../generators/quirks';
export type { ItemSources } from '../generators/sources';
export type {
  MonadNode,
  MonadNodeType,
  MonadEdge,
  MonadReward,
  MonadRouteRef,
  MonadRouteFile,
  MonadThemeFile,
} from '../generators/monad';
export type {
  AscensionBonus,
  AscensionGrade,
  AscensionMaterial,
  AscensionStep,
  EnhanceExample,
  EnhanceRules,
} from '../generators/enhance';
export type {
  EquipmentCurated,
  EquipmentCuratedEntry,
  EquipmentSource,
} from '../curated/equipment';

import type { LangDict } from '../lib/lang';
import type { Effect } from '../lib/effects';
import type { EffectCurated } from '../curated/effects';
import type { Character, StatScale } from '../extractor/specs/character';
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

// (StatScale — échelle d'affichage d'une stat — est DÉFINI par la spec perso
// et ré-exporté plus haut : une seule définition, pas de doublon à dériver.)

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
   * Taxonomie de FILTRE des effets (page liste `/characters`), par côté, clé =
   * clé `effectByKey`. `category` = famille UI (statBoosts/cc/dot…), `group` =
   * clé canonique absorbant les variantes (`_IR` → base). 100 % éditorial
   * (`data/curated/effect-filters.json`). Optionnel (curé absent → omis).
   */
  effectFilters?: Record<'buff' | 'debuff', Record<string, { category: string; group?: string }>>;
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
   * Titres officiels des FAMILLES de modes (clé `story`/`origin`/
   * `special_request`) : pour les sélecteurs qui replient plusieurs slugs en
   * une entrée — les 4 slugs story en 2 (Normal/Hard en toggle), raid_1/raid_2
   * sous « Special Request ». Curé dans mode-titles.json § families.
   * Optionnel comme `modes`.
   */
  modeFamilies?: Record<string, LangDict>;
  /**
   * Titre officiel de chaque SAISON de guild raid (n° → « The Frost
   * Legion »…, `GuildRaidTemplet.TitleStr`) — cartes de saison du picker de
   * cible. Optionnel comme `modes`.
   */
  guildRaidSeasons?: Record<string, LangDict>;
  /**
   * Passifs de PALIER résolus (`DungeonRank.options` → buff : nom localisé,
   * réf tooltip, stat/valeur) — cf. generators/encounters. Optionnel comme
   * `modes` (absent avant la première promotion).
   */
  rankOptions?: Record<string, RankOption>;
  /**
   * Geas du guild raid (phase 2 — contenu pas encore ouvert in-game),
   * référencés par `DungeonRef.geasRewards`. Optionnel comme `modes`.
   */
  geas?: Record<string, GuildRaidGeas>;
  /**
   * MONNAIES par id numérique : id d'`ASSET_TYPE` (celui que portent les
   * lignes `kind: 'asset'` des `rewardTables`) → clé du catalogue d'items
   * (`SYS_ASSET_*`). LU de l'enum du client (dump il2cpp), jamais déduit d'une
   * arithmétique — seules les correspondances qui existent VRAIMENT dans le
   * catalogue sortent. Optionnel comme `modes`.
   */
  assetTypes?: Record<string, string>;
  /**
   * Quirks de compte réduisant les stats AFFICHÉES des boss (slug de stat →
   * per-mille signé, ex. buff_chance/buff_resist −100) — le jeu les applique
   * à l'écran d'info, le site aussi. Cf. generators/encounters.
   */
  bossQuirkMods?: Record<string, number>;
}

/** `data/generated/characters.json` */
export type CharactersFile = Record<string, Character>;
/**
 * `data/generated/reward-tables.json` — tables de récompense résolues
 * (`RewardTemplet` + groupes), référencées par
 * `DungeonRef.reward`/`rewardWin`/`rewardLose`, mutualisées entre donjons.
 * Extrait de `glossaries.json` (le 2026-07-23) : 76 % de son poids, lu par le
 * SEUL `lib/data/rewards` côté serveur, alors que le glossaire part au
 * navigateur avec les fiches perso/équipement/tier list. Séparé, il ne voyage
 * plus. Optionnel à l'usage comme les autres sorties du domaine monstre —
 * absent avant la première promotion.
 */
export type RewardTablesFile = Record<string, RewardTable>;
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
  /**
   * SOURCES DE RÉSOLUTION figées avec l'entité. Un skill ne stocke que des
   * RÉFÉRENCES d'effets (`tooltip`, `label`, `type`) : le nom, l'icône et la
   * description sont rejoués à l'affichage. Sans ce snapshot, un boss épinglé
   * afficherait les libellés d'AUJOURD'HUI et perdrait les chips dont la
   * référence a disparu depuis — l'archive ne serait figée qu'à moitié.
   *
   * Absent = archive d'avant ce mécanisme : le rendu retombe sur le live (cf.
   * `getBossView`), ce qui reste le comportement qu'elle a toujours eu.
   */
  sources?: MonsterArchiveSources;
}

/**
 * Sections du glossaire dont dépend le RENDU d'un boss : les cinq index qui
 * disent ce qu'une référence d'effet désigne, plus les quatre tables de la carte
 * (échelles de stats, quirks de compte, passifs de palier, titres de modes). Le
 * reste (geas, filtres, cadeaux, familles story…) ne sert pas ici et resterait
 * mort dans chaque archive.
 *
 * C'est un CONTRAT, pas un détail du versionneur : le rendu d'un boss épinglé
 * ne dispose de rien d'autre. Qu'elles suffisent est vérifié par un test
 * (`boss-view.test.ts`), pas espéré — le jour où la carte consultera une
 * dixième section, il tombera au lieu de laisser passer une archive muette.
 */
export const ARCHIVED_GLOSSARY_KEYS = [
  'effects',
  'effectByTooltip',
  'effectByLabel',
  'effectByKey',
  'tooltipKinds',
  'statScales',
  'bossQuirkMods',
  'rankOptions',
  'modes',
] as const satisfies readonly (keyof Glossaries)[];

/** Ce dont l'affichage d'un boss a besoin EN PLUS de l'entité et de ses skills. */
export interface MonsterArchiveSources {
  /**
   * Sections du glossaire dont dépend le rendu d'un boss (cf. `GLOSSARY_KEYS`).
   * Gardées ENTIÈRES : déduire les seuls effets utiles demanderait de tracer la
   * résolution, et une restriction ratée produirait une archive silencieusement
   * incomplète — le pire des résultats pour un mécanisme dont tout l'intérêt est
   * la fidélité. Le glossaire complet ne pèse que ~270 Ko, et versionner est un
   * geste rare.
   */
  glossary: Partial<Glossaries>;
  /** `data/curated/effects.json` — overrides et créations d'effets (~12 Ko). */
  curatedEffects: Record<string, EffectCurated>;
  /** `data/curated/monster-skills.json` — curation d'affichage des kits (~7 Ko). */
  curatedMonsterSkills?: MonsterKitCuration;
}

/**
 * Curation d'AFFICHAGE des kits monstres — déplacement (`chipOwner`), ajout
 * (`chipAdd`) et masquage (`chipHide`) de chips. Le contrat vit ici parce que
 * l'archive le fige ; la doc d'usage est dans `src/lib/skill-view.ts`, qui le
 * ré-exporte.
 */
export interface MonsterKitCuration {
  chipOwner?: Record<string, string | string[]>;
  chipAdd?: Record<string, string[]>;
  chipHide?: Record<string, string[]>;
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
