/**
 * Générateur — ACHATS DE SHOP PAR PRIORITÉ (`shop-priorities.json`).
 *
 * Sert le guide « Recommended Purchases by Shop ». La V2 codait EN DUR le
 * contenu des shops (noms, coûts, limites) dans un `data.ts` de ~1000 lignes —
 * déjà PÉRIMÉ (le Guild Shop a été rebrassé le 2024-12-03 : prix changés, items
 * ajoutés/retirés). Ici tout le factuel DÉRIVE de `ProductTemplet` ; seul
 * l'éditorial (priorité S/A/B/C + notes) vit dans l'overlay curé
 * `data/curated/shop-priorities.json`, keyé par un slug STABLE (cf. plus bas).
 *
 * Huit shops permanents « à monnaie » sont dérivés (un `ProductBuyType` chacun).
 * Les shops variables (Event, Rico, Supply, General/Resource) restent éditoriaux
 * dans le guide — contenu qui change à chaque event ou sélection curée, pas un
 * shop entier à refléter.
 *
 * PRODUIT COURANT — sans horloge (déterministe, « ne bouge que quand la donnée
 * bouge ») : on ancre le « maintenant » sur `asOf`, la StartDate réelle la plus
 * récente de la table. « Réelle » = dans le cluster d'années CONTIGU depuis le
 * minimum (on coupe au 1er trou > 1 an : ça élimine les sentinelles « forever »
 * 2034/2224/2999). Un produit est courant si `StartDate ≤ asOf < EndDate`.
 *
 * SLUG STABLE — le `productId` (ID de ligne) ET le `ProductNameID` changent à
 * chaque rotation (vérifié : NAME_04→NAME_14, ID 26xxx→29xxx). Le seul invariant
 * est CE QU'ON ACHÈTE : on key donc l'éditorial par `shop/<goods>/<période>`,
 * insensible au prix — la priorité reste accrochée quand le jeu rebrasse le shop.
 */
import type { LangDict } from '../lib/lang';
import { isMain } from '../lib/is-main';
import { loadTextIndex, resolveText, hasText } from '../lib/text';
import { loadTable, num, type Row } from '../lib/tables';
import { readCuratedJson } from '../lib/json';
import { buildItemCatalog, COSTUME_PREFIX, type CatalogEntry } from './item-catalog';

/** Les 8 shops permanents dérivables : monnaie d'achat → clé de shop + asset monnaie. */
const SHOPS: { key: string; buyType: string; currencyId: string }[] = [
  { key: 'guild', buyType: 'PBT_GUILD_COIN', currencyId: 'SYS_ASSET_GUILD_COIN' },
  { key: 'joint', buyType: 'PBT_EVENT_BOSS_COIN', currencyId: 'SYS_ASSET_EVENT_BOSS_COIN' },
  { key: 'friend', buyType: 'PBT_FRIENDSHIP', currencyId: 'SYS_ASSET_FRIENDSHIP' },
  { key: 'arena', buyType: 'PBT_PVP', currencyId: 'SYS_ASSET_PVP_POINT' },
  { key: 'stars', buyType: 'PBT_MEMORY_STAR', currencyId: 'SYS_ASSET_MEMORY_STAR' },
  { key: 'worldboss', buyType: 'PBT_WORLD_BOSS_COIN', currencyId: 'SYS_ASSET_WORLD_BOSS_COIN' },
  { key: 'al', buyType: 'PBT_ADVENTURE_LICENSE', currencyId: 'SYS_ASSET_ADVENTURE_LICENSE' },
  { key: 'survey', buyType: 'PBT_RESEARCH', currencyId: 'SYS_ASSET_RESEARCH' },
];

/** ProductResetType → période d'achat (l'axe « limite »). */
const PERIOD: Record<string, ShopPeriod> = {
  PRT_DAILY: 'daily',
  PRT_WEEKLY: 'weekly',
  PRT_MONTHLY: 'monthly',
  PRT_NONE: 'one-time',
};

/** Asset d'icône par type de gains SANS id d'item propre (résolus par valeur/perso). */
const GOODS_ICON_ASSET: Record<string, string> = {
  PGT_GOLD: 'SYS_ASSET_GOLD',
  PGT_CRYSTAL: 'SYS_ASSET_FREE_CRYSTAL',
  PGT_CHARACTER_PIECE: 'Hero%20Piece',
};

export type ShopPriority = 'S' | 'A' | 'B' | 'C';
export type ShopPeriod = 'daily' | 'weekly' | 'monthly' | 'one-time';

/** Un produit d'un shop, factuel dérivé + éditorial curé fusionné. */
export interface ShopEntry {
  /** Slug STABLE (clé de l'overlay curé) : `shop/<goods>/<période>`. */
  key: string;
  /** ID de ligne ProductTemplet COURANT (indicatif — change à chaque rotation). */
  productId: string;
  /** Nom du produit (game-authored, ProductNameID → TextItem). */
  name: LangDict;
  /** Icône du gain (vide si non résoluble — rendu nom seul). */
  icon: string;
  /** Quantité obtenue par achat (ProductGoodsValue). */
  gives: number;
  /** Coût unitaire dans la monnaie du shop. */
  cost: number;
  /** Plafond d'achat sur la période. */
  limit: { count: number; period: ShopPeriod };
  /** Priorité éditoriale (curé) — absente = à trancher (warn au build). */
  priority?: ShopPriority;
  /** Note éditoriale (curé). */
  notes?: LangDict;
}

export interface ShopSection {
  key: string;
  currency: { id: string; name: LangDict; icon: string };
  entries: ShopEntry[];
}

export interface ShopPrioritiesData {
  /** Ancre temporelle déterministe (StartDate réelle la plus récente). */
  asOf: string;
  shops: ShopSection[];
}

/** Overlay curé : slug stable → éditorial. */
interface ShopCurated {
  priority?: ShopPriority;
  notes?: LangDict;
}

const year = (s: string | undefined): number => {
  const y = Number((s ?? '').slice(0, 4));
  return Number.isFinite(y) ? y : 0;
};
const day = (s: string | undefined): string => (s ?? '').slice(0, 10);

/**
 * Ancre `asOf` = StartDate réelle max, « réelle » = dans le cluster d'années
 * contigu depuis le min (coupe au 1er trou > 1 an → écarte les sentinelles).
 */
function computeAsOf(rows: Row[]): { asOf: string; maxYear: number } {
  const years = [...new Set(rows.filter((r) => r.StartDate).map((r) => year(r.StartDate)))].sort(
    (a, b) => a - b,
  );
  if (!years.length) throw new Error('shop-priorities : aucune StartDate dans ProductTemplet');
  let maxYear = years[0];
  for (const y of years.slice(1)) {
    if (y - maxYear > 1) break;
    maxYear = y;
  }
  let asOf = '';
  for (const r of rows) {
    if (r.StartDate && year(r.StartDate) <= maxYear) {
      const d = day(r.StartDate);
      if (d > asOf) asOf = d;
    }
  }
  return { asOf, maxYear };
}

/** Produit courant à la date d'ancrage (déterministe, sans horloge). */
function isCurrent(r: Row, asOf: string, maxYear: number): boolean {
  const s = day(r.StartDate);
  const e = day(r.EndDate);
  if (s && year(r.StartDate) > maxYear) return false; // placeholder futur
  if (s && s > asOf) return false; // pas encore ouvert
  if (e && e <= asOf) return false; // fenêtre close (retiré/superseded)
  return true;
}

/** Partie « goods » du slug stable : ce qu'on achète, indépendant du prix/rotation. */
function goodsSlug(r: Row): string {
  const type = r.ProductGoodsType ?? '';
  const id = r.ProductGoodsID ?? '';
  const val = r.ProductGoodsValue ?? '';
  if (type === 'PGT_ITEM' || type === 'PGT_CHARACTER_PIECE') return `item-${id}`;
  if (type === 'PGT_COSTUME') return `costume-${id}`;
  if (type === 'PGT_GOLD') return `gold-${val}`;
  if (type === 'PGT_CRYSTAL') return `ether-${val}`;
  // Ticket / titre / exotiques : pas d'id d'item stable → clé de nom du produit.
  return `p-${(r.ProductNameID ?? r.ID).toLowerCase()}`;
}

/** Icône du gain via le catalogue unifié (vide si non résoluble → nom seul). */
function iconOf(r: Row, catalog: Record<string, CatalogEntry>): string {
  const type = r.ProductGoodsType ?? '';
  const id = r.ProductGoodsID ?? '';
  if (type === 'PGT_ITEM') return catalog[id]?.icon ?? '';
  if (type === 'PGT_COSTUME') return catalog[COSTUME_PREFIX + id]?.icon ?? '';
  return catalog[GOODS_ICON_ASSET[type] ?? '']?.icon ?? '';
}

export function buildShopPriorities(): ShopPrioritiesData {
  const products = loadTable('ProductTemplet');
  const titems = loadTextIndex('TextItem');
  const catalog = buildItemCatalog();
  const curated =
    readCuratedJson<Record<string, ShopCurated>>('data/curated/shop-priorities.json') ?? {};

  const { asOf, maxYear } = computeAsOf(products);

  const shops: ShopSection[] = SHOPS.map(({ key, buyType, currencyId }) => {
    const cur = catalog[currencyId];
    if (!cur) throw new Error(`shop-priorities : monnaie « ${currencyId} » absente du catalogue`);

    const seen = new Set<string>();
    const entries: ShopEntry[] = [];
    for (const r of products) {
      if (r.ProductBuyType !== buyType) continue;
      if (!isCurrent(r, asOf, maxYear)) continue;

      const period = PERIOD[r.ProductResetType ?? ''];
      if (!period) {
        throw new Error(
          `shop-priorities : ${key} produit ${r.ID} — reset inconnu « ${r.ProductResetType} »`,
        );
      }
      const name = resolveText(titems, r.ProductNameID);
      if (!hasText(name)) {
        throw new Error(
          `shop-priorities : ${key} produit ${r.ID} — nom introuvable (${r.ProductNameID})`,
        );
      }
      const slug = `${key}/${goodsSlug(r)}/${period}`;
      if (seen.has(slug)) {
        throw new Error(`shop-priorities : slug en collision « ${slug} » (produits ${r.ID})`);
      }
      seen.add(slug);

      const ed = curated[slug];
      entries.push({
        key: slug,
        productId: r.ID,
        name,
        icon: iconOf(r, catalog),
        gives: num(r.ProductGoodsValue),
        cost: num(r.PriceValue),
        limit: { count: num(r.MaxBuyCount), period },
        ...(ed?.priority ? { priority: ed.priority } : {}),
        ...(ed?.notes && hasText(ed.notes) ? { notes: ed.notes } : {}),
      });
    }
    if (!entries.length)
      throw new Error(`shop-priorities : ${key} (${buyType}) sans produit courant`);
    return {
      key,
      currency: { id: currencyId, name: cur.name, icon: cur.icon },
      entries,
    };
  });

  return { asOf, shops };
}

// Exécution directe : diagnostic (produits par shop, couverture éditoriale).
if (isMain(import.meta.url)) {
  const data = buildShopPriorities();
  console.log(`asOf = ${data.asOf}`);
  for (const s of data.shops) {
    const tagged = s.entries.filter((e) => e.priority).length;
    console.log(`  ${s.key.padEnd(10)} ${s.entries.length} produits — ${tagged} priorisés`);
  }
}
