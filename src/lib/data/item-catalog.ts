/**
 * Catalogue unifié : items (`items.json`) + monnaies (`goods.json`), fusionnés
 * avec la couche curée (`data/curated/items.json` — override nom/desc/icône/
 * masquage, ET créations d'entrées absentes des deux — monnaies hors
 * `SYS_ASSET_*`, etc.). Source unique pour le picker de rewards ET le catalogue.
 */
import type { LangDict } from '@contracts';
import { getItems, type ItemOption } from './items';
import { getGoods } from './goods';
import { getCostumes } from './costumes';
import { MISSING_ITEM_ICONS } from './item-blacklist';
import { loadItemCurated, type ItemCurated } from '@/lib/admin/item-curated-store';

/**
 * Préfixe d'id des costumes dans le catalogue : leur clé de table (`1`, `2`…)
 * est trop générique pour servir d'id d'item transverse → on la namespace.
 */
export const COSTUME_PREFIX = 'COSTUME_';

export interface CatalogItem {
  id: string;
  kind: 'item' | 'goods' | 'costume' | 'custom';
  name: LangDict;
  desc?: LangDict;
  icon: string;
  grade: string;
  type: string;
  star: number;
  hidden: boolean;
  /** A un override curé (ou est une création). */
  curated: boolean;
}

interface Base {
  kind: 'item' | 'goods' | 'costume';
  name: LangDict;
  desc?: LangDict;
  icon: string;
  grade: string;
  type: string;
  star: number;
}

function merge(id: string, base: Base, cur?: ItemCurated): CatalogItem {
  return {
    id,
    kind: base.kind,
    name: cur?.name ?? base.name,
    desc: cur?.desc ?? base.desc,
    icon: cur?.icon ?? base.icon,
    grade: base.grade,
    type: base.type,
    star: base.star,
    hidden: Boolean(cur?.hidden),
    curated: Boolean(cur && Object.keys(cur).length),
  };
}

/** Entrée synthétisée pour une création curée (id absent de items/goods). */
function creation(id: string, cur: ItemCurated): CatalogItem {
  return {
    id,
    kind: 'custom',
    name: cur.name ?? { en: '', jp: '', kr: '', zh: '' },
    desc: cur.desc,
    icon: cur.icon ?? '',
    grade: 'normal',
    type: 'custom',
    star: 0,
    hidden: Boolean(cur.hidden),
    curated: true,
  };
}

function costumeBase(id: string): Base | undefined {
  const c = getCostumes()[id.slice(COSTUME_PREFIX.length)];
  if (!c) return undefined;
  return {
    kind: 'costume',
    name: c.name,
    desc: c.desc,
    icon: c.icon,
    grade: c.grade,
    type: 'costume',
    star: 0,
  };
}

function baseOf(id: string): Base | undefined {
  if (id.startsWith(COSTUME_PREFIX)) return costumeBase(id);
  const it = getItems()[id];
  if (it)
    return {
      kind: 'item',
      name: it.name,
      desc: it.desc,
      icon: it.icon,
      grade: it.grade,
      type: it.type,
      star: it.star,
    };
  const g = getGoods()[id];
  if (g)
    return {
      kind: 'goods',
      name: g.name,
      desc: g.desc,
      icon: g.icon,
      grade: g.grade,
      type: 'goods',
      star: 0,
    };
  return undefined;
}

/** Toutes les entrées mergées (items nommés + monnaies + créations curées). */
export function listItemEntries(): CatalogItem[] {
  const cur = loadItemCurated();
  const out: CatalogItem[] = [];
  const items = getItems();
  const goods = getGoods();
  for (const [id, it] of Object.entries(items)) {
    if (!it.name.en && !cur[id]?.name?.en) continue; // items sans nom : ignorés (sauf nom curé)
    // Item placeholder (icône sans sprite en jeu) : exclu, sauf icône curée valide.
    const effIcon = cur[id]?.icon ?? it.icon;
    if (effIcon && MISSING_ITEM_ICONS.has(effIcon)) continue;
    out.push(
      merge(
        id,
        {
          kind: 'item',
          name: it.name,
          desc: it.desc,
          icon: it.icon,
          grade: it.grade,
          type: it.type,
          star: it.star,
        },
        cur[id],
      ),
    );
  }
  for (const [id, g] of Object.entries(goods))
    out.push(
      merge(
        id,
        {
          kind: 'goods',
          name: g.name,
          desc: g.desc,
          icon: g.icon,
          grade: g.grade,
          type: 'goods',
          star: 0,
        },
        cur[id],
      ),
    );
  for (const [rawId, c] of Object.entries(getCostumes())) {
    const id = COSTUME_PREFIX + rawId;
    out.push(
      merge(
        id,
        {
          kind: 'costume',
          name: c.name,
          desc: c.desc,
          icon: c.icon,
          grade: c.grade,
          type: 'costume',
          star: 0,
        },
        cur[id],
      ),
    );
  }
  // Créations : entrées curées absentes de items/goods/costumes.
  const costumes = getCostumes();
  for (const [id, c] of Object.entries(cur))
    if (
      !items[id] &&
      !goods[id] &&
      !(id.startsWith(COSTUME_PREFIX) && costumes[id.slice(COSTUME_PREFIX.length)]) &&
      c.name?.en
    )
      out.push(creation(id, c));
  return out;
}

export function getItemEntry(id: string): CatalogItem | undefined {
  const base = baseOf(id);
  const cur = loadItemCurated()[id];
  if (base) return merge(id, base, cur);
  if (cur && cur.name?.en) return creation(id, cur);
  return undefined;
}

/**
 * Base NON curée d'un id (item / monnaie / costume), pour l'éditeur qui
 * superpose la couche curée par-dessus. `undefined` si l'id n'existe dans
 * aucune source de jeu (→ création).
 */
export function itemBase(
  id: string,
):
  | { kind: CatalogItem['kind']; name: LangDict; desc?: LangDict; icon: string; grade: string }
  | undefined {
  const b = baseOf(id);
  return b && { kind: b.kind, name: b.name, desc: b.desc, icon: b.icon, grade: b.grade };
}

/**
 * Index nom EN (minuscule) → id de catalogue, sur TOUTES les entrées (items +
 * monnaies + costumes + créations curées comme Stamina). Sert à mapper les
 * rewards V2 (stockés par nom) vers un id V3. Première occurrence gagnante
 * (items avant monnaies/costumes/créations, cf. `listItemEntries`).
 */
export function catalogIdByName(): Map<string, string> {
  const m = new Map<string, string>();
  for (const e of listItemEntries()) {
    const n = e.name.en.trim().toLowerCase();
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
