/**
 * Vue ADMIN du catalogue d'items : le catalogue SERVI (`items.json`, déjà bakée
 * items + monnaies + costumes + curé committé) + un overlay LIVE de
 * `data/curated/items.json` pour un retour instantané avant `datagen:regen`.
 * Source unique pour le picker de rewards ET le navigateur d'items.
 */
import type { CatalogEntry, LangDict } from '@contracts';
import { getCatalog, type ItemOption } from './items';
import { loadItemCurated, type ItemCurated } from '@/lib/admin/item-curated-store';

/** Préfixe d'id des costumes dans le catalogue (aligné sur le générateur). */
export const COSTUME_PREFIX = 'COSTUME_';

export interface CatalogItem extends CatalogEntry {
  id: string;
  /** A un override curé (ou est une création). */
  curated: boolean;
}

const EMPTY: LangDict = { en: '', jp: '', kr: '', zh: '' };

/** Applique un override curé LIVE sur une entrée bakée. */
function overlay(id: string, base: CatalogEntry, cur?: ItemCurated): CatalogItem {
  const curated = Boolean(cur && Object.keys(cur).length);
  if (!cur) return { id, ...base, curated };
  return {
    id,
    ...base,
    name: cur.name ?? base.name,
    desc: cur.desc ?? base.desc,
    icon: cur.icon ?? base.icon,
    hidden: cur.hidden || base.hidden,
    curated,
  };
}

/** Entrée synthétisée pour une création curée LIVE pas encore bakée. */
function creation(id: string, cur: ItemCurated): CatalogItem {
  return {
    id,
    kind: 'custom',
    name: cur.name ?? EMPTY,
    desc: cur.desc,
    icon: cur.icon ?? '',
    grade: 'normal',
    type: 'custom',
    star: 0,
    hidden: cur.hidden || undefined,
    curated: true,
  };
}

/** Toutes les entrées (catalogue baké + overlay curé live). */
export function listItemEntries(): CatalogItem[] {
  const cat = getCatalog();
  const cur = loadItemCurated();
  const out: CatalogItem[] = [];
  for (const [id, e] of Object.entries(cat)) out.push(overlay(id, e, cur[id]));
  // Créations LIVE (curées, pas encore bakées dans le catalogue servi).
  for (const [id, c] of Object.entries(cur)) if (!cat[id] && c.name?.en) out.push(creation(id, c));
  return out;
}

export function getItemEntry(id: string): CatalogItem | undefined {
  const base = getCatalog()[id];
  const cur = loadItemCurated()[id];
  if (base) return overlay(id, base, cur);
  if (cur && cur.name?.en) return creation(id, cur);
  return undefined;
}

/**
 * Base d'un id (catalogue baké), pour l'éditeur. `undefined` si l'id n'existe
 * pas encore dans le servi (→ création).
 */
export function itemBase(
  id: string,
):
  | { kind: CatalogEntry['kind']; name: LangDict; desc?: LangDict; icon: string; grade: string }
  | undefined {
  const e = getCatalog()[id];
  return e && { kind: e.kind, name: e.name, desc: e.desc, icon: e.icon, grade: e.grade };
}

/**
 * Index nom EN (minuscule) → id de catalogue, sur TOUTES les entrées. Sert à
 * mapper les rewards V2 (stockés par nom) vers un id V3. Première occurrence
 * gagnante (ordre du catalogue : items avant monnaies/costumes/créations).
 */
export function catalogIdByName(): Map<string, string> {
  const m = new Map<string, string>();
  for (const e of listItemEntries()) {
    const n = e.name.en?.trim().toLowerCase();
    if (n && !m.has(n)) m.set(n, e.id);
  }
  return m;
}

/** Options compactes (id/nom/icône/grade/desc) pour le picker — hors masqués. */
export function catalogOptions(): ItemOption[] {
  return listItemEntries()
    .filter((e) => !e.hidden && e.name.en)
    .map((e) => ({ id: e.id, name: e.name.en, icon: e.icon, grade: e.grade, desc: e.desc?.en }));
}
