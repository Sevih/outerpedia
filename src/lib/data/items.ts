/**
 * Lecteur du CATALOGUE D'ITEMS UNIFIÉ (`data/generated/items.json`) — items de
 * jeu + monnaies + costumes + curé (baked au build). Source unique servie ;
 * l'overlay curé LIVE de l'admin est ajouté par `item-catalog.ts`.
 */
import type { CatalogEntry } from '@contracts';
import itemsData from '@data/generated/items.json';

const CATALOG = itemsData as unknown as Record<string, CatalogEntry>;

export function getCatalog(): Record<string, CatalogEntry> {
  return CATALOG;
}

export function getCatalogEntry(id: string): CatalogEntry | undefined {
  return CATALOG[id];
}

/** Forme compacte pour un picker / affichage inline. */
export interface ItemOption {
  id: string;
  name: string;
  icon: string;
  grade: string;
  /** Description EN (tooltip). */
  desc?: string;
}
