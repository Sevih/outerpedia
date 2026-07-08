/**
 * Générateur — CATALOGUE D'ITEMS UNIFIÉ (`data/generated/items.json`).
 *
 * UNE seule source servie, format aligné, pour tout ce qui se référence comme
 * « item » : items de jeu (ItemTemplet), monnaies (`goods`), costumes
 * (`CostumeTemplet`) — plus la couche CURÉE (overrides nom/desc/icône/masquage
 * ET créations d'entrées absentes du jeu, ex. Stamina).
 *
 * La curation est BAKED ICI, au build, exactement comme le curé des persos est
 * fusionné dans `characters.json` : `datagen:regen` la promeut, et les
 * consommateurs prod (parse-text, tooltips) lisent la donnée déjà fusionnée
 * SANS toucher à la couche curée au runtime (client-safe). L'admin garde en
 * plus un overlay live de `data/curated/items.json` pour un retour instantané.
 *
 * Ids : items = id ItemTemplet ; monnaies = clé `SYS_ASSET_*` ; costumes =
 * `COSTUME_<id>` (la PK brute `1`/`2`… est trop générique pour un id transverse).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { num } from '../lib/tables';
import type { LangDict } from '../lib/lang';
import { MISSING_ITEM_ICONS } from '../../src/lib/data/item-blacklist';
import { buildItems, type Item } from './items';
import { buildGoods, type Goods } from './goods';
import { buildCostumes, type Costume } from './costumes';

/** Préfixe d'id des costumes dans le catalogue unifié. */
export const COSTUME_PREFIX = 'COSTUME_';

export interface CatalogEntry {
  kind: 'item' | 'goods' | 'costume' | 'custom';
  name: LangDict;
  desc?: LangDict;
  icon: string;
  grade: string;
  /** item : gem/material/… ; goods : `goods` ; costume : `costume` ; custom : `custom`. */
  type: string;
  /** Sous-type (items uniquement — presents d'affinité, etc.). */
  subType?: string;
  star: number;
  /** Réservé à UN perso (presents d'affinité dédiés — items uniquement). */
  characterLimit?: string;
  /** Perso qui peut l'équiper (costumes uniquement). */
  characterId?: string;
  /** Provenance (costumes uniquement — slug shop/event_shop/…). */
  source?: string;
  /** Masqué du catalogue servi (baked depuis le curé). */
  hidden?: boolean;
}

/** Override curé d'une entrée (forme miroir de `data/curated/items.json`). */
interface ItemCurated {
  name?: LangDict;
  desc?: LangDict;
  icon?: string;
  hidden?: boolean;
  note?: string;
}

const EMPTY: LangDict = { en: '', jp: '', kr: '', zh: '' };

function loadCurated(): Record<string, ItemCurated> {
  try {
    return JSON.parse(readFileSync(resolve('data/curated/items.json'), 'utf8')) as Record<
      string,
      ItemCurated
    >;
  } catch {
    return {};
  }
}

/** Applique un override curé (nom/desc/icône/masquage) sur une entrée de base. */
function applyCurated(e: CatalogEntry, cur: ItemCurated | undefined): CatalogEntry {
  if (!cur) return e;
  return {
    ...e,
    name: cur.name ?? e.name,
    desc: cur.desc ?? e.desc,
    icon: cur.icon ?? e.icon,
    hidden: cur.hidden || undefined,
  };
}

export function buildItemCatalog(inputs?: {
  items?: Record<string, Item>;
  goods?: Record<string, Goods>;
  costumes?: Record<string, Costume>;
}): Record<string, CatalogEntry> {
  const items = inputs?.items ?? buildItems();
  const goods = inputs?.goods ?? buildGoods();
  const costumes = inputs?.costumes ?? buildCostumes();
  const cur = loadCurated();

  const out: Record<string, CatalogEntry> = {};

  for (const [id, it] of Object.entries(items)) {
    if (!it.name.en && !cur[id]?.name?.en) continue; // item sans nom (sauf nom curé)
    const effIcon = cur[id]?.icon ?? it.icon;
    if (effIcon && MISSING_ITEM_ICONS.has(effIcon)) continue; // placeholder (sprite absent)
    const base: CatalogEntry = {
      kind: 'item',
      name: it.name,
      desc: it.desc,
      icon: it.icon,
      grade: it.grade,
      type: it.type,
      subType: it.subType,
      star: it.star,
      characterLimit: it.characterLimit,
    };
    out[id] = applyCurated(base, cur[id]);
  }

  for (const [id, g] of Object.entries(goods)) {
    const base: CatalogEntry = {
      kind: 'goods',
      name: g.name,
      desc: g.desc,
      icon: g.icon,
      grade: g.grade,
      type: 'goods',
      star: 0,
    };
    out[id] = applyCurated(base, cur[id]);
  }

  for (const [rawId, c] of Object.entries(costumes)) {
    const id = COSTUME_PREFIX + rawId;
    const base: CatalogEntry = {
      kind: 'costume',
      name: c.name,
      desc: c.desc,
      icon: c.icon,
      grade: c.grade,
      type: 'costume',
      star: 0,
      characterId: c.characterId,
      source: c.source,
    };
    out[id] = applyCurated(base, cur[id]);
  }

  // Créations : ids curés absents des trois sources, avec un nom EN.
  for (const [id, c] of Object.entries(cur)) {
    if (out[id]) continue;
    if (id.startsWith(COSTUME_PREFIX) && costumes[id.slice(COSTUME_PREFIX.length)]) continue;
    if (!c.name?.en) continue;
    out[id] = {
      kind: 'custom',
      name: c.name ?? EMPTY,
      desc: c.desc,
      icon: c.icon ?? '',
      grade: 'normal',
      type: 'custom',
      star: 0,
      hidden: c.hidden || undefined,
    };
  }

  // Tri stable : items (id numérique) d'abord, puis monnaies/costumes/créations (id texte).
  const sorted = Object.entries(out).sort(([a], [b]) => {
    const na = num(a);
    const nb = num(b);
    if (na && nb) return na - nb;
    if (na) return -1;
    if (nb) return 1;
    return a.localeCompare(b);
  });
  return Object.fromEntries(sorted);
}

// Exécution directe : échantillon pour revue.
if (process.argv[1] && process.argv[1].endsWith('item-catalog.ts')) {
  const cat = buildItemCatalog();
  const ids = Object.keys(cat);
  const byKind: Record<string, number> = {};
  for (const id of ids) byKind[cat[id].kind] = (byKind[cat[id].kind] ?? 0) + 1;
  console.log(`catalogue : ${ids.length} entrées`, JSON.stringify(byKind));
  console.log('avec desc :', ids.filter((i) => cat[i].desc).length);
}
