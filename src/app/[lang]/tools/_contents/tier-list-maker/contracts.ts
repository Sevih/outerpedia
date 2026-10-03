/**
 * Types, contrats et constantes du Tier List Maker : l'item rangeable et les
 * libellés du pont wrapper serveur → client (`index.tsx`), les petits types
 * d'état partagés entre les briques, et les constantes de l'outil. Extrait de
 * `TierListMakerBrowser.tsx` le 03/10/2026 (découpage mécanique, contenu
 * inchangé).
 */
import { TIER_PALETTE, type Tier } from './share-codec';

// ── Types ──

/** Item rangeable — noms DÉJÀ localisés par le wrapper serveur. */
export interface TierItem {
  key: string;
  label: string;
  /** Nom court d'affichage (curé), si présent. */
  short?: string;
  /** Vignette carrée (face icon / EE / portrait de boss). */
  img: string;
  /**
   * Id du modèle (perso ou costume) dont on peut peindre le PORTRAIT du jeu —
   * absent pour les EE et les boss, qui n'en ont pas, et c'est ce qui décide qu'un
   * item est rangeable en mode « cartes ».
   *
   * L'ID et non l'URL : le mode « cartes » ne colle plus une image, il rend le
   * `Portrait` transcrit du prefab, qui compose lui-même ses sources.
   */
  cardId?: string;
  /**
   * Titre du jeu au-dessus du nom (`Text_Demi`) — le nickname des persos qui
   * l'affichent, cf. `characterNamePrefix`. Le portrait l'écrit dans un champ à
   * part ; `label` reste donc le nom NU.
   */
  prefix?: string;
  element?: string;
  cls?: string;
  rarity?: number;
  tags?: string[];
  isSkin?: boolean;
  /** Costume : nom du perso de base (affiché quand « noms de skin » est off). */
  baseLabel?: string;
  baseShort?: string;
}

export interface TlmLabels {
  tabs: Record<Tab, string>;
  /** Noms localisés des éléments et des classes (`sys.*`), par slug. */
  elementNames: Record<string, string>;
  classNames: Record<string, string>;
  tags: Record<string, string>;
  sorts: Record<SortKey, string>;
  sizes: Record<IconSize, string>;
  search: string;
  /** Nom accessible de la croix d'effacement de la recherche. */
  clearSearch: string;
  /** Nom accessible d'une pastille de rareté (`{rarity}` = nombre d'étoiles). */
  starAria: string;
  hint: string;
  titlePlaceholder: string;
  addRow: string;
  clearRow: string;
  deleteRow: string;
  moveUp: string;
  moveDown: string;
  dragRow: string;
  /** Boutons de placement clavier (`{tier}` = libellé de la ligne). */
  placeInTier: string;
  placeInPool: string;
  color: string;
  reset: string;
  share: string;
  copied: string;
  exportPng: string;
  noResults: string;
  emptyPool: string;
  confirmReset: string;
  confirmClearRow: string;
  confirmDeleteRow: string;
  settings: string;
  iconSize: string;
  showNames: string;
  showElement: string;
  showClass: string;
  showRarity: string;
  showCards: string;
  cardSize: string;
  showCardTags: string;
  showSkins: string;
  showSkinNames: string;
  skinsOnly: string;
  exportJson: string;
  importJson: string;
  importError: string;
  exportBlocked: string;
  sort: string;
}

export type Tab = 'characters' | 'ee' | 'bosses';
export type IconSize = 's' | 'm' | 'l';
export type SortKey = 'default' | 'name' | 'rarity' | 'element';

// ── Constantes ──

const DEFAULT_LABELS = ['S', 'A', 'B', 'C', 'D'];

// Ids de tiers DÉTERMINISTES : ce code tourne au SSR et à l'hydratation, un id
// aléatoire ici créerait un mismatch.
/**
 * Nom de fichier d'export depuis le titre. `\p{L}\p{N}` : `[^\w-]` retirait tout
 * caractère non ASCII — un titre japonais donnait `_.png`.
 */
export function safeFileStem(title: string): string {
  const stem = title
    .trim()
    .replace(/[^\p{L}\p{N}_-]+/gu, '_')
    .replace(/^_+|_+$/g, '');
  return stem || 'tier-list';
}

export function makeDefaultTiers(): Tier[] {
  return DEFAULT_LABELS.map((label, i) => ({
    id: `t${i}`,
    label,
    color: TIER_PALETTE[i],
    items: [],
  }));
}

export const DRAG_THRESHOLD = 6;
export const TOUCH_HOLD_MS = 220;

export const SORT_KEYS: SortKey[] = ['default', 'name', 'rarity', 'element'];
/**
 * Tags de perso exposés en filtres de pool, dans l'ORDRE CANONIQUE du
 * glossaire (`data/curated/tags.json` : premium, festival, seasonal, collab,
 * free) — le même que celui des badges de carte partout ailleurs.
 */
export const FILTER_TAGS = ['premium', 'festival', 'seasonal', 'collab', 'free'];
export const RARITIES = [1, 2, 3];
