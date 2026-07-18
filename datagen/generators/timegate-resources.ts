/**
 * Générateur — RESSOURCES TIMEGATÉES (`timegate-resources.json`).
 *
 * Sert le guide « Weekly & Monthly Reference Tables » : pour un panel curé de
 * ressources (manuels, transistones, poussière/mémoire, glunite, engrenage de
 * singularité, limit break), combien on en récolte par semaine / par mois et
 * DEPUIS OÙ.
 *
 * Chaque source est classée selon SA DÉRIVABILITÉ (règle Sevih : dérivable →
 * on dérive, sinon → on cure) :
 *
 *  • SHOPS (dérivés de `ProductTemplet`) — tout shop permanent « à monnaie »
 *    qui vend l'item avec un reset RÉCURRENT (daily/weekly/monthly) et dont le
 *    produit est COURANT (même ancre `asOf` déterministe que `shop-priorities`,
 *    réutilisée telle quelle). La quantité = `MaxBuyCount` × période : elle se
 *    corrige toute seule quand le jeu rebrasse un shop (le Guild Shop l'a fait
 *    le 2024-12-03). La dérivation trouve MÊME des shops que la V2 hand-list
 *    avait ratés (Tower Coin, Real-Time Arena, Remains).
 *
 *  • NON-SHOP (curés, `data/curated/timegate-resources.json`) — les sources
 *    dont la quantité N'EST PAS dans la donnée car c'est une estimation joueur
 *    bâtie sur des hypothèses (rang SSS++ atteint, 4 jours joués Mer→Sam, taux
 *    de drop d'un clear de Floor, budget de points) : drops d'Infiltration
 *    Floor 3, échange de points d'Extermination, missions/récompenses de jeu
 *    hebdo, Singularité (rang/daily/ranking), atelier de Kate (la recette
 *    existe mais la limite hebdo de craft, non). Chiffres transplantés de la V2.
 *
 * Le panel d'items ET leur regroupement en onglets sont eux aussi curés (choix
 * éditorial « quelles ressources comptent »). Le générateur ne fait que : (1)
 * dériver les lignes de shop par item, (2) fusionner les lignes non-shop curées,
 * (3) calculer les totaux (mensuel global = mensuel + hebdo×4, comme la V2).
 */
import type { LangDict } from '../lib/lang';
import { isMain } from '../lib/is-main';
import { loadTable, num, type Row } from '../lib/tables';
import { readCuratedJson } from '../lib/json';
import { buildItemCatalog, type CatalogEntry } from './item-catalog';
import { computeAsOf, isCurrent, PERIOD, buildGearIcons, type ShopPeriod } from './shop-priorities';

/**
 * Shops permanents « à monnaie » retenus comme sources timegatées régulières :
 * `ProductBuyType` → clé de shop (le libellé 5 langues vit dans le guide). On
 * écarte sciemment l'événementiel (`PBT_EVENT_COIN_*`, transient), le premium
 * one-time (crystal/cash/facility, filtrés de toute façon par le reset), et les
 * monnaies sans reset récurrent. Ordre = ordre d'affichage.
 */
const SHOPS: { key: string; buyType: string }[] = [
  { key: 'general', buyType: 'PBT_GOLD' },
  { key: 'guild', buyType: 'PBT_GUILD_COIN' },
  { key: 'arena', buyType: 'PBT_PVP' },
  { key: 'pvp-real', buyType: 'PBT_PVP_REAL' },
  { key: 'stars', buyType: 'PBT_MEMORY_STAR' },
  { key: 'survey', buyType: 'PBT_RESEARCH' },
  { key: 'worldboss', buyType: 'PBT_WORLD_BOSS_COIN' },
  { key: 'tower', buyType: 'PBT_TOWER_COIN' },
  { key: 'remains', buyType: 'PBT_REMAINS' },
  { key: 'joint', buyType: 'PBT_EVENT_BOSS_COIN' },
];

/** Type de source dérivée d'un shop → badge du guide. */
const shopBadge = (key: string): SourceType => (key === 'guild' ? 'guild' : 'shop');

/**
 * Type de badge des sources NON-SHOP curées, par clé de source. `craft` =
 * atelier de Kate ; tout le reste (drops, missions, singularité, points) =
 * `mission`. Une clé absente ici jette au build (source curée non déclarée).
 */
const NON_SHOP_BADGE: Record<string, SourceType> = {
  'irregular-infiltration-floor-3': 'mission',
  'irregular-extermination-points': 'mission',
  'arena-weekly-play': 'mission',
  'weekly-mission': 'mission',
  'singularity-rank': 'mission',
  'singularity-daily-run': 'mission',
  'singularity-daily-ranking': 'mission',
  'kates-workshop': 'craft',
};

/** Ordre d'affichage des types de source (mission → guild → shop → craft). */
const SOURCE_TYPE_ORDER: Record<SourceType, number> = {
  mission: 0,
  guild: 1,
  shop: 2,
  craft: 3,
};

export type SourceType = 'mission' | 'guild' | 'shop' | 'craft';

/** Une source d'un item, dérivée (shop) ou curée (non-shop). */
export interface TimegateSource {
  /** Clé de source : clé de shop (`guild`…) ou clé curée (`kates-workshop`…). */
  sourceKey: string;
  /** Origine (shop dérivé vs éditorial curé) — utile au rendu/diagnostic. */
  origin: 'shop' | 'cured';
  /** Type de badge (ordre + couleur). */
  type: SourceType;
  /** Quantité hebdomadaire (absente si mensuelle ou plage). */
  weekly?: number;
  /** Quantité mensuelle (absente si hebdomadaire ou plage). */
  monthly?: number;
  /** Plage hebdomadaire estimée (ex. ranking : 20–240) — hors totaux, comme V2. */
  weeklyRange?: [number, number];
  /** Item de coût (craft : ex. 30 Blue Stardust → 1 Purple). */
  costItem?: { id: string; name: LangDict; icon: string; grade: string };
  /** Quantité de l'item de coût. */
  costAmount?: number;
}

export interface TimegateItem {
  id: string;
  name: LangDict;
  icon: string;
  iconKind: 'item' | 'equipment';
  grade: string;
  sources: TimegateSource[];
  totals: { weekly: number; monthly: number; grandMonthly: number };
}

export interface TimegateTab {
  key: string;
  items: TimegateItem[];
}

export interface TimegateResourcesData {
  /** Ancre temporelle déterministe (partagée avec shop-priorities). */
  asOf: string;
  tabs: TimegateTab[];
}

/** Overlay curé : panel d'items par onglet + sources non-shop par item. */
interface TimegateCurated {
  tabs: { key: string; items: string[] }[];
  nonShopSources: Record<string, CuratedSource[]>;
}
interface CuratedSource {
  source: string;
  weekly?: number;
  monthly?: number;
  weeklyRange?: [number, number];
  costItemId?: string;
  costAmount?: number;
}

const gradeOf = (e: CatalogEntry | undefined): string => e?.grade ?? 'normal';

/** Icône + namespace + grade d'un item cible (catalogue puis équipement). */
function itemIcon(
  id: string,
  catalog: Record<string, CatalogEntry>,
  gearIcons: Map<string, { icon: string; grade: string }>,
): { name: LangDict; icon: string; iconKind: 'item' | 'equipment'; grade: string } {
  const c = catalog[id];
  if (c) return { name: c.name, icon: c.icon, iconKind: 'item', grade: gradeOf(c) };
  const g = gearIcons.get(id);
  if (g) throw new Error(`timegate : item ${id} est un équipement sans nom au catalogue`);
  throw new Error(`timegate : item ${id} introuvable au catalogue`);
}

/** Période → clé de total (daily converti en hebdo ×7). */
function addToTotals(
  totals: { weekly: number; monthly: number },
  period: ShopPeriod,
  count: number,
): { weekly?: number; monthly?: number } {
  if (period === 'monthly') {
    totals.monthly += count;
    return { monthly: count };
  }
  const weekly = period === 'daily' ? count * 7 : count;
  totals.weekly += weekly;
  return { weekly };
}

/** Lignes de shop dérivées pour un item : par (shop, période), produit courant le + récent. */
function shopSourcesFor(
  itemId: string,
  byShop: Map<string, Row[]>,
  asOf: string,
  maxYear: number,
): { source: TimegateSource; period: ShopPeriod; count: number }[] {
  const out: { source: TimegateSource; period: ShopPeriod; count: number }[] = [];
  for (const { key } of SHOPS) {
    const rows = byShop.get(key) ?? [];
    // (période → meilleure ligne courante) : dédoublonne les offres superposées.
    const best = new Map<ShopPeriod, Row>();
    for (const r of rows) {
      if (r.ProductGoodsID !== itemId || r.ProductGoodsType !== 'PGT_ITEM') continue;
      if (!isCurrent(r, asOf, maxYear)) continue;
      const period = PERIOD[r.ProductResetType ?? ''];
      if (!period || period === 'one-time') continue; // récurrent seulement
      const prev = best.get(period);
      if (!prev || (r.StartDate ?? '') > (prev.StartDate ?? '')) best.set(period, r);
    }
    for (const [period, r] of best) {
      out.push({
        source: { sourceKey: key, origin: 'shop', type: shopBadge(key) },
        period,
        count: num(r.MaxBuyCount),
      });
    }
  }
  return out;
}

export function buildTimegateResources(): TimegateResourcesData {
  const products = loadTable('ProductTemplet');
  const catalog = buildItemCatalog();
  const gearIcons = buildGearIcons();
  const curated = readCuratedJson<TimegateCurated>('data/curated/timegate-resources.json');
  if (!curated) throw new Error('timegate : data/curated/timegate-resources.json absent');

  const { asOf, maxYear } = computeAsOf(products);

  // Pré-indexe les produits par shop retenu (une seule passe sur ProductTemplet).
  const byShop = new Map<string, Row[]>(SHOPS.map((s) => [s.key, []]));
  const buyTypeToShop = new Map(SHOPS.map((s) => [s.buyType, s.key]));
  for (const r of products) {
    const key = buyTypeToShop.get(r.ProductBuyType ?? '');
    if (key) byShop.get(key)!.push(r);
  }

  const buildItem = (id: string): TimegateItem => {
    const { name, icon, iconKind, grade } = itemIcon(id, catalog, gearIcons);
    const totals = { weekly: 0, monthly: 0 };
    const sources: TimegateSource[] = [];

    // 1. Sources de shop dérivées.
    for (const { source, period, count } of shopSourcesFor(id, byShop, asOf, maxYear)) {
      const q = addToTotals(totals, period, count);
      sources.push({ ...source, ...q });
    }

    // 2. Sources non-shop curées.
    for (const cs of curated.nonShopSources[id] ?? []) {
      const type = NON_SHOP_BADGE[cs.source];
      if (!type)
        throw new Error(`timegate : source curée « ${cs.source} » (item ${id}) non déclarée`);
      const src: TimegateSource = { sourceKey: cs.source, origin: 'cured', type };
      if (cs.weeklyRange) {
        src.weeklyRange = cs.weeklyRange; // hors totaux (estimation, comme V2)
      } else if (cs.monthly != null) {
        src.monthly = cs.monthly;
        totals.monthly += cs.monthly;
      } else if (cs.weekly != null) {
        src.weekly = cs.weekly;
        totals.weekly += cs.weekly;
      }
      if (cs.costItemId) {
        const ci = catalog[cs.costItemId];
        if (!ci)
          throw new Error(`timegate : item de coût ${cs.costItemId} introuvable (item ${id})`);
        src.costItem = { id: cs.costItemId, name: ci.name, icon: ci.icon, grade: gradeOf(ci) };
        src.costAmount = cs.costAmount;
      }
      sources.push(src);
    }

    if (!sources.length) throw new Error(`timegate : item ${id} (${name.en}) sans aucune source`);

    sources.sort((a, b) => SOURCE_TYPE_ORDER[a.type] - SOURCE_TYPE_ORDER[b.type]);
    return {
      id,
      name,
      icon,
      iconKind,
      grade,
      sources,
      totals: {
        weekly: totals.weekly,
        monthly: totals.monthly,
        grandMonthly: totals.monthly + totals.weekly * 4,
      },
    };
  };

  const tabs: TimegateTab[] = curated.tabs.map((t) => ({
    key: t.key,
    items: t.items.map(buildItem),
  }));

  return { asOf, tabs };
}

// Exécution directe : diagnostic (items, sources dérivées vs curées).
if (isMain(import.meta.url)) {
  const data = buildTimegateResources();
  console.log(`asOf = ${data.asOf}`);
  for (const tab of data.tabs) {
    console.log(`\n[${tab.key}]`);
    for (const it of tab.items) {
      const shop = it.sources.filter((s) => s.origin === 'shop').length;
      const cured = it.sources.filter((s) => s.origin === 'cured').length;
      console.log(
        `  ${it.name.en.padEnd(26)} ${shop} shop + ${cured} curé → mensuel global ${it.totals.grandMonthly}`,
      );
    }
  }
}
