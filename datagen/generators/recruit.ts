/**
 * Générateur — DOMAINE RECRUTEMENT (`recruit.json`).
 *
 * Sert les guides de la catégorie general-guides (« Free Heroes & Starter
 * Banners », « How Banners & Mileage Work ») : tout ce que la V2 tenait à la
 * main (banner.json, taux/coûts hardcodés) se lit ici dans les tables du jeu.
 *
 *   customPool  — persos recrutables au Custom Recruit :
 *                 RecruitGroupTemplet (CUSTOM) → RecruitGradeRecipeTemplet
 *                 (CHARACTER) → RecruitRecipeTemplet.CharacterID.
 *   kinds       — pour chaque TYPE de bannière documenté (custom/pickup/
 *                 premium/limited), le groupe le plus récent fait référence :
 *                 taux par palier (RecruitGradeRecipeTemplet — des POIDS, la
 *                 somme fait 100/1000/10000 selon le groupe → normalisés en %,
 *                 libellés TextSystem), prix éther (Price_1/Price_10), tickets
 *                 (RTT_ITEM → id d'item ; RTT_ASSET → clé SYS_ASSET_* via la
 *                 même convention AT_↔SYS_ASSET que buildAssetTypes), pulls
 *                 gratuits, et coût mileage (ProductTemplet PC_MILEAGE — mode
 *                 des PriceValue sur les persos du type).
 *   banners     — TOUTES les apparitions bannière à pickup de perso
 *                 (SEASONAL/OUTER_FES + leurs SELECTION) : release/rerun des
 *                 limited se DÉRIVENT (la V2 maintenait data/banner.json à la
 *                 main). Le tri éditorial (qui est « limited ») reste à la vue,
 *                 via les tags des persos.
 *
 * Un PickupID de bannière inconnu de CharacterTemplet casse la génération.
 */
import type { LangDict } from '../lib/lang';
import { readDump } from '../lib/dump';
import { isMain } from '../lib/is-main';
import { loadTextIndex, resolveText } from '../lib/text';
import { loadTable, num, type Row } from '../lib/tables';

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
}

/** Les types de bannière documentés par les guides. */
export type RecruitKind = 'custom' | 'pickup' | 'premium' | 'limited';

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
};

/** RecruitType → kind d'apparition bannière (persos limited). */
const BANNER_KIND: Record<string, RecruitBanner['kind']> = {
  SEASONAL: 'seasonal',
  OUTER_FES: 'fes',
  SEASONAL_SELECTION: 'seasonal-selection',
  OUTER_FES_SELECTION: 'fes-selection',
};

/** `2026-07-14  00:00:00` → `2026-07-14`. */
const isoDate = (raw: string): string => (raw ?? '').trim().slice(0, 10);

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

/** Taux d'un groupe : poids CHARACTER normalisés en % (2 décimales). */
function ratesOf(gradeRecipes: Row[], groupId: string, tsys: Map<string, LangDict>): RecruitRate[] {
  const rows = gradeRecipes.filter((r) => r.GroupID === groupId && r.RecipeType === 'CHARACTER');
  const totalNormal = rows.reduce((s, r) => s + num(r.NormalRate), 0);
  const totalConfirm = rows.reduce((s, r) => s + num(r.ConfirmRate), 0);
  if (!rows.length || !totalNormal) {
    throw new Error(`recruit : groupe ${groupId} sans recette CHARACTER exploitable`);
  }
  const pct = (v: number, total: number) => (total ? Math.round((v / total) * 10000) / 100 : 0);
  return rows.map((r) => ({
    titleKey: r.Title,
    title: resolveText(tsys, r.Title),
    percent: pct(num(r.NormalRate), totalNormal),
    confirmPercent: pct(num(r.ConfirmRate), totalConfirm),
  }));
}

/** Ticket d'un groupe → id du catalogue (item ou clé SYS_ASSET_*). */
function ticketIdOf(group: Row): string | undefined {
  const id = group.RecruitTicketID;
  if (!id || id === '0') return undefined;
  if (group.RecruitTicketType === 'RTT_ASSET') {
    // Même source de vérité que le glossaire `assetTypes` (goods.ts) : l'enum
    // ASSET_TYPE du dump ne vit dans aucune table. On la relit ici.
    return assetKeyOf(id);
  }
  return id;
}

let assetEnum: Map<string, string> | undefined;
/** Id numérique de monnaie → clé `SYS_ASSET_*` (via l'enum dumpée). */
function assetKeyOf(id: string): string {
  if (!assetEnum) {
    assetEnum = new Map();
    const dump = readDump();
    for (const m of dump.matchAll(/public const ASSET_TYPE AT_([A-Z0-9_]+) = (\d+);/g)) {
      assetEnum.set(m[2], `SYS_ASSET_${m[1]}`);
    }
  }
  const key = assetEnum.get(id);
  if (!key) throw new Error(`recruit : ASSET_TYPE inconnu dans la dump — id ${id}`);
  return key;
}

export function buildRecruit(): RecruitData {
  const tsys = loadTextIndex('TextSystem');
  const groups = loadTable('RecruitGroupTemplet');
  const gradeRecipes = loadTable('RecruitGradeRecipeTemplet');
  const knownChars = new Set(loadTable('CharacterTemplet').map((c) => c.ID));

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
  banners.sort(
    (a, b) => a.start.localeCompare(b.start) || a.characterId.localeCompare(b.characterId),
  );

  // --- coût mileage par famille de persos --------------------------------------
  // ProductTemplet PC_MILEAGE : un produit par perso échangeable (PriceValue =
  // coût mileage). Les persos des bannières limited coûtent leur propre tarif ;
  // pour les autres types on prend le MODE des tarifs restants.
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

  // --- fiche par type de bannière ----------------------------------------------
  // Le groupe le PLUS RÉCENT (StartDate) du type fait référence — les taux et
  // prix sont identiques d'une édition à l'autre, mais si l'éditeur les change,
  // c'est la dernière édition qui fait foi.
  const kinds: RecruitKindInfo[] = [];
  for (const kind of ['custom', 'pickup', 'premium', 'limited'] as const) {
    const candidates = groups
      .filter((g) => KIND_OF_TYPE[g.RecruitType] === kind)
      .sort((a, b) => (a.StartDate ?? '').localeCompare(b.StartDate ?? ''));
    const ref = candidates[candidates.length - 1];
    if (!ref) throw new Error(`recruit : aucun groupe pour le type « ${kind} »`);
    kinds.push({
      kind,
      groupId: ref.ID,
      rates: ratesOf(gradeRecipes, ref.ID, tsys),
      price1: num(ref.Price_1),
      price10: num(ref.Price_10),
      ...(ticketIdOf(ref) ? { ticketId: ticketIdOf(ref) } : {}),
      ticketCost: num(ref.RecruitTicketValue) || 1,
      freeCount: num(ref.FreeCount),
      ...(ref.BannerImageName && ref.BannerImageName !== '0'
        ? { bannerImage: ref.BannerImageName }
        : {}),
      ...((kind === 'limited' ? limitedMileage : regularMileage) !== undefined
        ? { mileageCost: kind === 'limited' ? limitedMileage : regularMileage }
        : {}),
    });
  }

  return { customPool, kinds, banners };
}

// Exécution directe.
if (isMain(import.meta.url)) {
  console.log(JSON.stringify(buildRecruit(), null, 2));
}
