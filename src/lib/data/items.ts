import type { Item } from '@contracts';
import itemsData from '@data/generated/items.json';

const ITEMS = itemsData as unknown as Record<string, Item>;

export function getItems(): Record<string, Item> {
  return ITEMS;
}

export function getItem(id: string): Item | undefined {
  return ITEMS[id];
}

/** Forme compacte pour un picker / affichage inline (sans desc, léger côté client). */
export interface ItemOption {
  id: string;
  name: string;
  icon: string;
  grade: string;
  /** Description EN (tooltip). */
  desc?: string;
}

export function getItemOptions(): ItemOption[] {
  return Object.entries(ITEMS)
    .filter(([, it]) => it.name.en)
    .map(([id, it]) => ({ id, name: it.name.en, icon: it.icon, grade: it.grade }));
}

/** Index nom EN (minuscule) → id — pour mapper les rewards V2 (stockés par nom). */
export function itemIdByName(): Map<string, string> {
  const m = new Map<string, string>();
  for (const [id, it] of Object.entries(ITEMS)) {
    const n = it.name.en?.trim().toLowerCase();
    if (n && !m.has(n)) m.set(n, id);
  }
  return m;
}
