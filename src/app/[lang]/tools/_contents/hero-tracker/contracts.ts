/**
 * Contrats du suivi de compte — les TYPES du pont wrapper serveur → client
 * (`HeroRow`, `HeroTrackerData`, `HeroTrackerLabels`…), la forme de l'état
 * persisté (`TrackerState`), les types de tri/filtre du roster et les
 * constantes de règle partagées entre les hooks d'état et les sections.
 * Extrait de `HeroTrackerBrowser.tsx` le 03/10/2026 (découpage mécanique,
 * contenu inchangé).
 */
import type { FusionLevelStep } from '@datagen/generators/hero-growth';
import type { GrowthRules, TranscendCost } from './engine';
import type { HeroEntry } from './roster-import';

/** Un palier de transcendance tel qu'il s'AFFICHE (l'étoile du jeu, pas l'index). */
export interface TranscendStep extends TranscendCost {
  /** Étoile INTERNE (1→9) : c'est elle que le barème de fusion référence. */
  star: number;
  /** Étoiles pleines affichées en jeu (1→6). */
  showStar: number;
  /** Petits « + » au-delà de l'étoile pleine (4★+1…). */
  starPlus: number;
  /** Couleur de l'étoile du palier (`STAR_SPRITE`) — jaune, puis orange/rouge/violet. */
  starColor: string;
}

export interface HeroRow {
  id: string;
  slug: string;
  name: string;
  element: string;
  class: string;
  rarity: number;
  /** Type de cadeau préféré (`present_01`…) — oriente la conversion en cadeaux. */
  gift?: string;
  searchNames: string[];
  /** Tags (`premium`, `festival`…) — ils disent comment le héros s'obtient. */
  tags: string[];
  /** Icônes des 4 skills améliorables, dans l'ordre S1 / S2 / ultime / chain. */
  skillIcons: string[];
  /** Équipements exclusifs portés : l'hérité d'abord pour un fusionné, puis le sien. */
  ee: ItemAsset[];
  /** Paliers de Core Fusion si CE héros est un fusionné. */
  fusionLevels?: FusionLevelStep[];
  /** Étoile interne exigée pour fusionner : un fusionné ne peut PAS être en deçà. */
  requiredStar?: number;
  /** Le fusionné qui remplace ce héros de base, si le jeu en propose un. */
  fusionId?: string;
  /** Le héros de base dont ce fusionné est issu. */
  baseId?: string;
}

export interface ItemAsset {
  name: string;
  icon: string;
  grade: string;
}

export interface HeroTrackerLabels {
  intro: string;
  search: string;
  /** Nom accessible de la croix d'effacement de la recherche (`common.clear`). */
  clearSearch: string;
  /** Nom accessible d'une pastille de rareté (`aria.star_rarity`, `{rarity}` = étoiles). */
  starAria: string;
  untrack: string;
  level: string;
  skills: string;
  fusionLevel: string;
  affinity: string;
  transcend: string;
  ee: string;
  eeFusion: string;
  needTitle: string;
  needEmpty: string;
  gold: string;
  xp: string;
  affinityPoints: string;
  pieces: string;
  dupes: string;
  giftNoteBonus: string;
  reset: string;
  resetConfirm: string;
  trackedCount: string;
  settings: string;
  settingsFusion: string;
  settingsFusionHint: string;
  base: string;
  coreFusion: string;
  alwaysMax: string;
  hideMaxed: string;
  hideDone: string;
  rarityRules: string;
  hideShort: string;
  skipShort: string;
  notCounted: string;
  shoppingList: string;
  myHeroes: string;
  addHero: string;
  untracked: string;
  heroNeeds: string;
  doneHero: string;
  emptyTitle: string;
  emptyCta: string;
  itemCount: string;
  itemUnit: string;
  axisAll: string;
  piecesNote: string;
  importTitle: string;
  importHint: string;
  importPick: string;
  importDone: string;
  importUnknown: string;
  importEmpty: string;
  /** Refus en bloc (codes de `RosterImportError`) — gabarits `{format}`, `{expected}`/`{actual}`. */
  importErrFormat: string;
  importErrVersion: string;
  importErrHeroes: string;
  sort: string;
  sortNeed: string;
  sortName: string;
  noMatch: string;
  piecesPremium: string;
  piecesLimited: string;
  scaleHint: string;
  now: string;
  goal: string;
}

export interface HeroTrackerData {
  heroes: HeroRow[];
  rules: Omit<GrowthRules, 'transcendLadder'>;
  /** Échelles de transcendance : barème par rareté + paliers propres à un héros. */
  transcend: {
    byStar: Record<string, TranscendStep[]>;
    overrides: Record<string, TranscendStep[]>;
  };
  /** Items référencés par les coûts (manuels, mémoires, matériaux EE, cores). */
  items: Record<string, ItemAsset>;
  /** Nom traduit de chaque élément — les pièces se groupent comme on les farme. */
  elementNames: Record<string, string>;
  /** Tags de la famille « limited » du glossaire (festival/seasonal/collab). */
  limitedTags: string[];
  /** Nom traduit de chaque classe — infobulle des filtres du roster. */
  classNames: Record<string, string>;
  labels: HeroTrackerLabels;
}

export interface TrackerState {
  heroes: Record<string, HeroEntry>;
  /** id du héros de BASE → on possède sa Core Fusion plutôt que lui. */
  fused: Record<string, boolean>;
  /** Tout viser au maximum : les cibles ne se saisissent plus, l'écran s'allège. */
  alwaysMax: boolean;
  /** Sortir de la liste les héros déjà au PLAFOND de chaque axe. */
  hideMaxed: boolean;
  /** Sortir de la liste les héros qui n'ont plus rien à farmer POUR LEUR cible. */
  hideDone: boolean;
  /** Laisser les héros 1★ / 2★ HORS des totaux (leur carte reste éditable). */
  ignore1Star: boolean;
  ignore2Star: boolean;
  /** Les sortir de l'écran — roster suivi ET tiroir « ajouter ». */
  hide1Star: boolean;
  hide2Star: boolean;
}

/** Ce sur quoi on trie le roster suivi. `need` = le volume qu'il reste à farmer. */
export type SortKey = 'need' | 'level' | 'affinity' | 'name';
export interface RosterFilters {
  element: string | null;
  class: string | null;
  rarity: number | null;
}
/** Le sens NATUREL de chaque critère : le plus gros besoin d'abord, les niveaux
 *  et affinités les plus BAS d'abord (c'est ce qu'il reste à monter), noms A→Z. */
export const SORT_DESC: Record<SortKey, boolean> = {
  need: true,
  level: false,
  affinity: false,
  name: false,
};

/** Les réglages qui sont de simples cases à cocher. */
export type BoolSetting =
  | 'alwaysMax'
  | 'hideMaxed'
  | 'hideDone'
  | 'ignore1Star'
  | 'ignore2Star'
  | 'hide1Star'
  | 'hide2Star';

export const SKILL_SLOTS = 4;
export const MAX_SKILL = 5;
/** Un héros se recrute au niveau 5 : rien en dessous n'existe en jeu. */
export const START_LEVEL = 5;
/**
 * Bonus du cadeau préféré (curé dans le guide heroes-growth, aucune table).
 * TOUJOURS appliqué : offrir autre chose que son cadeau préféré à un héros qu'on
 * monte n'a aucune raison d'arriver — le compter serait un majorant pour rien.
 */
export const PREFERRED_GIFT_BONUS = 0.5;
/** Au-delà, l'appui devient « je vise » plutôt que « j'en suis là ». */
export const LONG_PRESS_MS = 450;
/**
 * Héros dont les pièces NE tombent PAS dans les donjons d'élément : elles ne se
 * farment pas, elles s'achètent ou se gagnent en bannière. Les grouper avec un
 * élément promettrait une source qui n'existe pas.
 *
 * Deux familles, et pas une : « limité » au sens du joueur couvre TOUT ce qui ne
 * revient pas — festival, saisonnier, collaboration — là où les tags les
 * distinguent par occasion. Le premium, lui, reste achetable.
 *
 * La composition de la famille arrive en prop (`limitedTags`) : elle se déclare
 * dans `data/curated/tags.json` et se lit avec `tagsInGroup`, côté serveur —
 * ce composant est client et n'a pas accès au glossaire.
 */
export const piecesApart = (limitedTags: string[]): { key: string; tags: string[] }[] => [
  { key: 'premium', tags: ['premium'] },
  { key: 'limited', tags: limitedTags },
];

/**
 * Paliers d'affinité où l'on s'arrête vraiment : 10 débloque l'équipement
 * exclusif, puis 20/40/60/80/100 donnent des stats. Aucune table ne les porte
 * (cf. le générateur hero-growth) — les paliers 30 et 70, qui n'ajoutent qu'une
 * conversation, ne sont une raison de viser pour personne.
 */
export const AFFINITY_PRESETS = [10, 20, 40, 60, 80, 100];
