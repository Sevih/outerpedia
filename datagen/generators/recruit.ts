/**
 * Générateur — DOMAINE RECRUTEMENT (`recruit.json`).
 *
 * Sert les guides de la catégorie general-guides (« Free Heroes & Starter
 * Banners », « How Banners & Mileage Work ») : tout ce qui était tenu à la
 * main (banner.json, taux/coûts hardcodés) se lit ici dans les tables du jeu.
 *
 *   customPool  — persos recrutables au Custom Recruit :
 *                 RecruitGroupTemplet (CUSTOM) → RecruitGradeRecipeTemplet
 *                 (CHARACTER) → RecruitRecipeTemplet.CharacterID.
 *   kinds       — pour chaque TYPE de bannière documenté (custom/pickup/
 *                 premium/limited/equipment), le groupe le plus récent fait
 *                 référence :
 *                 taux par palier (RecruitGradeRecipeTemplet — des POIDS, la
 *                 somme fait 100/1000/10000 selon le groupe → normalisés en %,
 *                 libellés TextSystem ; les paliers « sac de butin » portent
 *                 en plus leur CONTENU, RecruitItemRecipeTemplet), prix éther
 *                 (Price_1/Price_10), tickets
 *                 (RTT_ITEM → id d'item ; RTT_ASSET → clé SYS_ASSET_* via la
 *                 même convention AT_↔SYS_ASSET que buildAssetTypes), pulls
 *                 gratuits, et coût mileage (ProductTemplet PC_MILEAGE — mode
 *                 des PriceValue sur les persos du type).
 *   banners     — TOUTES les apparitions bannière à pickup de perso
 *                 (SEASONAL/OUTER_FES + leurs SELECTION) : release/rerun des
 *                 limited se DÉRIVENT (data/banner.json était maintenu à la
 *                 main). Le tri éditorial (qui est « limited ») reste à la vue,
 *                 via les tags des persos. Les tables ne sont PAS un historique
 *                 fiable : VAGames purge les vieilles lignes →
 *                 data/curated/recruit-banners.json archive les bannières
 *                 disparues, et toute disparition non archivée/assumée casse
 *                 la génération (cf. mergeArchivedBanners).
 *
 * Un PickupID de bannière inconnu de CharacterTemplet casse la génération.
 */
import type { LangDict } from '../lib/lang';
import { DUMP_PATH, assetTypeKeys } from '../lib/dump';
import { isMain } from '../lib/is-main';
import { readCuratedJson } from '../lib/json';
import { loadTextIndex, resolveText } from '../lib/text';
import { fileStamp, loadTable, num, type Row } from '../lib/tables';

/**
 * Un LOT d'un palier (Dimensional Supply) : ce que le palier peut rendre,
 * avec son taux ABSOLU (part du palier, pas part du lot dans le palier).
 */
export interface RecruitDrop {
  itemId: string;
  /** Quantité rendue (Reload Cartridge x20 → 20). */
  count: number;
  /** Taux absolu en % (4 décimales — les lots descendent sous le centième). */
  percent: number;
}

/** Une ligne de taux d'une bannière (déjà normalisée en pourcents). */
export interface RecruitRate {
  /** Clé TextSystem du palier (`SYS_RECRUIT_RATEINFO_TITLE_05` = pickup…) —
   *  permet à la vue d'overrider un libellé officiel trop vague. */
  titleKey: string;
  /** Libellé du palier (« 3 Star Recruit Chance », « Chance Increase »…). */
  title: LangDict;
  /** Taux au tirage normal (%). */
  percent: number;
  /** Taux sur le slot garanti du x10 (%). */
  confirmPercent: number;
  /**
   * Ce que le palier contient, quand c'est une liste FINIE d'objets (les
   * paliers « sac de butin » de la Dimensional Supply). Absent quand le palier
   * rend une pièce d'ÉQUIPEMENT : ses 154 lignes sont le catalogue entier,
   * les lister n'apprendrait rien.
   */
  drops?: RecruitDrop[];
}

/**
 * Les types de bannière documentés par les guides. `equipment` (Dimensional
 * Supply) tire de l'ÉQUIPEMENT, pas des persos : ses paliers sont des recettes
 * ITEM et sa monnaie de mileage a son propre barème.
 */
export type RecruitKind = 'custom' | 'pickup' | 'premium' | 'limited' | 'equipment';

export interface RecruitKindInfo {
  kind: RecruitKind;
  /** Groupe de référence (le plus récent du type) — pour audit. */
  groupId: string;
  rates: RecruitRate[];
  /** Prix éther d'un tirage / de dix. */
  price1: number;
  price10: number;
  /** Ticket dédié : id du catalogue d'items (RTT_ITEM → id numérique,
   *  RTT_ASSET → clé `SYS_ASSET_*`). Absent si le groupe n'en déclare pas. */
  ticketId?: string;
  /** Ticket d'EVENT (`RecruitTicketID_FREE`) — même résolution que `ticketId`.
   *  C'est la variante qui ne rapporte PAS de mileage. */
  eventTicketId?: string;
  /** Tickets consommés par tirage (10 pour le Premium : Call of the Demiurge). */
  ticketCost: number;
  /** Tirages gratuits par jour. */
  freeCount: number;
  /** Coût mileage de l'échange du perso vedette (absent si non trouvé). */
  mileageCost?: number;
  /** Sprite du bouton de bannière (BannerImageName — namespace ui/recruit). */
  bannerImage?: string;
}

/** Une apparition en bannière d'un perso (pickup). */
export interface RecruitBanner {
  characterId: string;
  /** `selection` : bannière « choisis un ancien limited » (rerun groupé). */
  kind: 'seasonal' | 'fes' | 'seasonal-selection' | 'fes-selection';
  /** Dates ISO `YYYY-MM-DD`. */
  start: string;
  end: string;
}

/** `data/generated/recruit.json` */
export interface RecruitData {
  customPool: string[];
  kinds: RecruitKindInfo[];
  banners: RecruitBanner[];
}

/** RecruitType du jeu → type documenté (les groupes de référence des taux). */
const KIND_OF_TYPE: Record<string, RecruitKind> = {
  CUSTOM: 'custom',
  PICKUP: 'pickup',
  DEMIURGE: 'premium',
  SEASONAL: 'limited',
  OUTER_FES: 'limited',
  EQUIPMENT_SELECTION: 'equipment',
};

/** RecruitType → kind d'apparition bannière (persos limited). */
const BANNER_KIND: Record<string, RecruitBanner['kind']> = {
  SEASONAL: 'seasonal',
  OUTER_FES: 'fes',
  SEASONAL_SELECTION: 'seasonal-selection',
  OUTER_FES_SELECTION: 'fes-selection',
};

/** `2026-07-14  00:00:00` → `2026-07-14`. */
export const isoDate = (raw: string): string => (raw ?? '').trim().slice(0, 10);

/** `data/curated/recruit-banners.json` — mémoire des purges de tables. */
interface RecruitBannersCurated {
  /** Bannières disparues des tables, réinjectées dans `banners`. */
  banners?: RecruitBanner[];
  /** Disparitions assumées SANS réinjection (ex. date corrigée en table). */
  dropped?: Array<Pick<RecruitBanner, 'characterId' | 'start'>>;
}

const ARCHIVE_PATH = 'data/curated/recruit-banners.json';
const bannerKey = (b: { characterId: string; start: string }): string =>
  `${b.characterId} @ ${b.start}`;

/**
 * Réinjecte l'archive curée dans `banners` (in place), puis vérifie qu'aucune
 * bannière du `recruit.json` déjà promu n'a disparu du résultat : les tables
 * du jeu sont périodiquement purgées, et une purge non archivée serait une
 * perte d'historique silencieuse (release/rerun des limited). Résolution au
 * choix du réviseur : archiver l'entrée dans `banners` de l'archive, ou
 * l'assumer dans `dropped` (fausse donnée corrigée côté jeu).
 */
function mergeArchivedBanners(banners: RecruitBanner[], knownChars: Set<string>): void {
  const archive = readCuratedJson<RecruitBannersCurated>(ARCHIVE_PATH);
  const validKinds = new Set<string>(Object.values(BANNER_KIND));
  const fromTables = new Set(banners.map(bannerKey));
  for (const b of archive?.banners ?? []) {
    if (!knownChars.has(b.characterId)) {
      throw new Error(`recruit : archive — characterId inconnu « ${b.characterId} »`);
    }
    if (!validKinds.has(b.kind)) {
      throw new Error(`recruit : archive — kind inconnu « ${b.kind} » (${bannerKey(b)})`);
    }
    if (fromTables.has(bannerKey(b))) {
      throw new Error(
        `recruit : archive — ${bannerKey(b)} est revenu dans les tables, retirer l'entrée`,
      );
    }
    banners.push({ characterId: b.characterId, kind: b.kind, start: b.start, end: b.end });
  }

  // Garde anti-purge. Lecture volontairement optionnelle (premier build : pas
  // encore de generated) — readCuratedJson rend exactement ce contrat.
  const previous = readCuratedJson<RecruitData>('data/generated/recruit.json');
  const dropped = new Set((archive?.dropped ?? []).map(bannerKey));
  const current = new Set(banners.map(bannerKey));
  const lost = (previous?.banners ?? []).filter(
    (b) => !current.has(bannerKey(b)) && !dropped.has(bannerKey(b)),
  );
  if (lost.length) {
    throw new Error(
      `recruit : bannières purgées des tables — archiver (ou assumer via dropped) dans ${ARCHIVE_PATH} : ${lost
        .map(bannerKey)
        .join(', ')}`,
    );
  }
}

function buildCustomPool(groups: Row[], gradeRecipes: Row[]): string[] {
  const customGroups = new Set(groups.filter((g) => g.RecruitType === 'CUSTOM').map((g) => g.ID));
  if (customGroups.size === 0) {
    throw new Error('recruit : aucun groupe CUSTOM dans RecruitGroupTemplet');
  }
  const gradeGroups = new Set(
    gradeRecipes
      .filter((r) => customGroups.has(r.GroupID) && r.RecipeType === 'CHARACTER')
      .map((r) => r.ID),
  );
  const pool = new Set(
    loadTable('RecruitRecipeTemplet')
      .filter((r) => gradeGroups.has(r.GradeGroupID))
      .map((r) => r.CharacterID),
  );
  return [...pool].sort((a, b) => a.localeCompare(b));
}

/** Options de `ratesOf` — au-delà de deux, les positionnels deviennent illisibles. */
export interface RatesOptions {
  /**
   * Quelles lignes du groupe forment les paliers — un groupe en porte d'autres
   * (ASSET…) qui ne sont pas des taux et fausseraient la somme. Les bannières
   * de persos tirent des recettes CHARACTER, la Dimensional Supply des ITEM.
   */
  recipeType?: 'CHARACTER' | 'ITEM';
  /** `RecruitItemRecipeTemplet` — sans elle, aucun détail de lot n'est produit. */
  itemRecipes?: Row[];
  /** L'item est-il une pièce d'ÉQUIPEMENT (`IT_EQUIP`) ? */
  isEquip?: (itemId: string) => boolean;
}

/**
 * Détail des lots d'un palier — `undefined` dès qu'une ligne est de
 * l'ÉQUIPEMENT : le palier rend alors « une pièce », pas un lot nommé, et ses
 * 154 lignes sont le catalogue d'équipement au complet.
 *
 * Le taux d'un lot est sa part du palier : `Rate / ΣRate × percent`. Vérifié
 * contre les taux publiés par l'éditeur (Reload Cartridge x10 : 3/26 × 8 % =
 * 0,9231 %).
 */
function dropsOf(
  gradeId: string,
  percent: number,
  { itemRecipes, isEquip }: RatesOptions,
): RecruitDrop[] | undefined {
  if (!itemRecipes || !isEquip) return undefined;
  const rows = itemRecipes.filter((r) => r.GradeGroupID === gradeId);
  if (!rows.length || rows.some((r) => isEquip(r.ItemID))) return undefined;
  const total = rows.reduce((s, r) => s + num(r.Rate), 0);
  if (!total) return undefined;
  return rows.map((r) => ({
    itemId: r.ItemID,
    count: num(r.Count) || 1,
    percent: Math.round((num(r.Rate) / total) * percent * 10000) / 10000,
  }));
}

/** Taux d'un groupe : poids normalisés en % (2 décimales). */
export function ratesOf(
  gradeRecipes: Row[],
  groupId: string,
  tsys: Map<string, LangDict>,
  opts: RatesOptions = {},
): RecruitRate[] {
  const recipeType = opts.recipeType ?? 'CHARACTER';
  const rows = gradeRecipes.filter((r) => r.GroupID === groupId && r.RecipeType === recipeType);
  const totalNormal = rows.reduce((s, r) => s + num(r.NormalRate), 0);
  const totalConfirm = rows.reduce((s, r) => s + num(r.ConfirmRate), 0);
  if (!rows.length || !totalNormal) {
    throw new Error(`recruit : groupe ${groupId} sans recette ${recipeType} exploitable`);
  }
  const pct = (v: number, total: number) => (total ? Math.round((v / total) * 10000) / 100 : 0);
  return rows.map((r) => {
    const percent = pct(num(r.NormalRate), totalNormal);
    const drops = dropsOf(r.ID, percent, opts);
    return {
      titleKey: r.Title,
      title: resolveText(tsys, r.Title),
      percent,
      confirmPercent: pct(num(r.ConfirmRate), totalConfirm),
      ...(drops ? { drops } : {}),
    };
  });
}

/**
 * Ticket d'un groupe → id du catalogue (item ou clé SYS_ASSET_*).
 * `column` vaut `RecruitTicketID` (ticket payant) ou `RecruitTicketID_FREE`
 * (variante event, sans mileage) — les deux portent le même RTT.
 */
function ticketIdOf(
  group: Row,
  column: 'RecruitTicketID' | 'RecruitTicketID_FREE',
): string | undefined {
  const id = group[column];
  if (!id || id === '0') return undefined;
  if (group.RecruitTicketType === 'RTT_ASSET') {
    // Même source de vérité que le glossaire `assetTypes` (goods.ts) : l'enum
    // ASSET_TYPE du dump ne vit dans aucune table. On la relit ici.
    return assetKeyOf(id);
  }
  return id;
}

// Empreinte mtime de dump.cs : un re-dump (nouvelle version du jeu, process
// admin long-running) doit invalider l'enum, comme partout (modèle
// `curatedKeyCache`).
let assetEnum: { data: Map<string, string>; stamp: string } | undefined;
/** Id numérique de monnaie → clé `SYS_ASSET_*` (via l'enum dumpée). */
function assetKeyOf(id: string): string {
  const stamp = fileStamp(DUMP_PATH);
  if (!assetEnum || assetEnum.stamp !== stamp) {
    assetEnum = { data: assetTypeKeys(), stamp };
  }
  const key = assetEnum.data.get(id);
  if (!key) throw new Error(`recruit : ASSET_TYPE inconnu dans la dump — id ${id}`);
  return key;
}

export function buildRecruit(): RecruitData {
  const tsys = loadTextIndex('TextSystem');
  const groups = loadTable('RecruitGroupTemplet');
  const gradeRecipes = loadTable('RecruitGradeRecipeTemplet');
  const knownChars = new Set(loadTable('CharacterTemplet').map((c) => c.ID));
  const itemRecipes = loadTable('RecruitItemRecipeTemplet');
  // `IT_EQUIP` separe la piece d'equipement du lot nomme : c'est la seule chose
  // qui les distingue, ItemTemplet portant les deux.
  const equipIds = new Set(
    loadTable('ItemTemplet')
      .filter((r) => r.ItemType === 'IT_EQUIP')
      .map((r) => r.ID),
  );
  const isEquip = (itemId: string): boolean => equipIds.has(itemId);

  // --- pool custom ------------------------------------------------------------
  const customPool = buildCustomPool(groups, gradeRecipes);
  const unknownPool = customPool.filter((id) => !knownChars.has(id));
  if (unknownPool.length) {
    throw new Error(
      `recruit : CharacterID inconnus dans le pool custom — ${unknownPool.join(', ')}`,
    );
  }

  // --- apparitions bannière (limited) -----------------------------------------
  const banners: RecruitBanner[] = [];
  for (const g of groups) {
    const kind = BANNER_KIND[g.RecruitType];
    if (!kind) continue;
    const characterId = g.PickupID;
    if (!characterId || characterId === '0') continue;
    if (!knownChars.has(characterId)) {
      throw new Error(
        `recruit : PickupID inconnu « ${characterId} » (groupe ${g.ID}, ${g.RecruitType})`,
      );
    }
    banners.push({ characterId, kind, start: isoDate(g.StartDate), end: isoDate(g.EndDate) });
  }
  mergeArchivedBanners(banners, knownChars);
  banners.sort(
    (a, b) => a.start.localeCompare(b.start) || a.characterId.localeCompare(b.characterId),
  );

  // --- coût mileage par famille ------------------------------------------------
  // ProductTemplet PC_MILEAGE : un produit par perso échangeable (PriceValue =
  // coût mileage). Les persos des bannières limited coûtent leur propre tarif ;
  // pour les autres types on prend le MODE des tarifs restants. L'équipement a
  // sa propre catégorie (PC_MILEAGE_EQUIP : un produit par pièce d'équipement).
  const limitedChars = new Set(banners.map((b) => b.characterId));
  const mileageProducts = loadTable('ProductTemplet').filter(
    (r) => r.ProductCategory === 'PC_MILEAGE' && r.ProductGoodsType === 'PGT_CHARACTER',
  );
  const modeOf = (values: number[]): number | undefined => {
    if (!values.length) return undefined;
    const counts = new Map<number, number>();
    for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  };
  const limitedMileage = modeOf(
    mileageProducts.filter((r) => limitedChars.has(r.ProductGoodsID)).map((r) => num(r.PriceValue)),
  );
  const regularMileage = modeOf(
    mileageProducts
      .filter((r) => !limitedChars.has(r.ProductGoodsID))
      .map((r) => num(r.PriceValue)),
  );
  const equipMileage = modeOf(
    loadTable('ProductTemplet')
      .filter((r) => r.ProductCategory === 'PC_MILEAGE_EQUIP')
      .map((r) => num(r.PriceValue)),
  );
  const mileageOf = (kind: RecruitKind): number | undefined =>
    kind === 'equipment' ? equipMileage : kind === 'limited' ? limitedMileage : regularMileage;

  // --- fiche par type de bannière ----------------------------------------------
  // Le groupe le PLUS RÉCENT (StartDate) du type fait référence — les taux et
  // prix sont identiques d'une édition à l'autre, mais si l'éditeur les change,
  // c'est la dernière édition qui fait foi.
  const kinds: RecruitKindInfo[] = [];
  for (const kind of ['custom', 'pickup', 'premium', 'limited', 'equipment'] as const) {
    const candidates = groups
      .filter((g) => KIND_OF_TYPE[g.RecruitType] === kind)
      .sort((a, b) => (a.StartDate ?? '').localeCompare(b.StartDate ?? ''));
    const ref = candidates[candidates.length - 1];
    if (!ref) throw new Error(`recruit : aucun groupe pour le type « ${kind} »`);
    kinds.push({
      kind,
      groupId: ref.ID,
      rates: ratesOf(gradeRecipes, ref.ID, tsys, {
        recipeType: kind === 'equipment' ? 'ITEM' : 'CHARACTER',
        itemRecipes,
        isEquip,
      }),
      price1: num(ref.Price_1),
      price10: num(ref.Price_10),
      ...(ticketIdOf(ref, 'RecruitTicketID')
        ? { ticketId: ticketIdOf(ref, 'RecruitTicketID') }
        : {}),
      ...(ticketIdOf(ref, 'RecruitTicketID_FREE')
        ? { eventTicketId: ticketIdOf(ref, 'RecruitTicketID_FREE') }
        : {}),
      ticketCost: num(ref.RecruitTicketValue) || 1,
      freeCount: num(ref.FreeCount),
      ...(ref.BannerImageName && ref.BannerImageName !== '0'
        ? { bannerImage: ref.BannerImageName }
        : {}),
      ...(mileageOf(kind) !== undefined ? { mileageCost: mileageOf(kind) } : {}),
    });
  }

  return { customPool, kinds, banners };
}

// Exécution directe.
if (isMain(import.meta.url)) {
  console.log(JSON.stringify(buildRecruit(), null, 2));
}
