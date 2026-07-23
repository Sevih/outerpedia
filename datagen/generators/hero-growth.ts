/**
 * Générateur — SYSTÈMES DE CROISSANCE DES HÉROS (`hero-growth.json`).
 *
 * Sert le guide « Growth Systems » (heroes-growth). Le guide est surtout de la
 * PROSE éditoriale (transcendance, gems, gear, bond/chat…) qui reste dans le
 * guide ; ici on ne DÉRIVE que les tables NUMÉRIQUES dont la donnée de jeu porte
 * les chiffres exacts (règle Sevih : dérivable → on dérive, sinon → on cure) :
 *
 *  • `limitBreak` — coûts d'expansion de niveau (100→120) par rareté :
 *    `CharacterMaxLevelTemplet` (facteurs = `CharBreakPieceQuantity`, gold =
 *    `Price`, bonus de stat = `LevelUpStatModifierAfter100`). Pièces/prix sont
 *    indépendants de l'élément → on collapse par (rareté, palier).
 *  • `skillUpgrade` — coût d'amélioration de skill par rareté × niveau (2→5) :
 *    `CharacterSkillEnchantTemplet` (manuels via `ItemID_n`/`ItemCnt_n`, gold =
 *    `UpgradePrice`). Vérifié identique à la V2 (qui masquait le gold).
 *  • `specialEquip` — enchant EE (`ITS_EQUIP_EXCLUSIVE`) et talisman
 *    (`ITS_EQUIP_OOPARTS`) : `SpecialEquipEnchantTemplet` (matériaux, gold,
 *    déblocage de `GemSlot`). Les « 150 » de la V2 = la SOMME des coûts par
 *    palier (10+20+30+40+50) — ici on donne le détail par niveau.
 *  • `xpFood` — items de nourriture d'XP : `ItemTemplet` `ITS_MATERIAL_CHAR_LEVEL`
 *    (XP = `MaterialValue`).
 *
 * Le reste (points des gifts d'affinité, paliers de récompense, effets de
 * transcendance…) N'A PAS ses chiffres dans la donnée → reste éditorial dans le
 * guide (`editorial.ts`).
 */
import type { LangDict } from '../lib/lang';
import { isMain } from '../lib/is-main';
import { loadTable, num, type Row } from '../lib/tables';
import { buildItemCatalog, type CatalogEntry } from './item-catalog';

/** Réf d'item prête au rendu (tuile à cadre de rareté). */
export interface ItemRef {
  id: string;
  name: LangDict;
  icon: string;
  grade: string;
}

/** Un item + une quantité (matériau d'un coût). */
export interface ItemCost {
  item: ItemRef;
  count: number;
}

export interface LimitBreakStep {
  fromLevel: number;
  toLevel: number;
  /** Facteurs de limit break (Limit Break Factor, par héros). */
  pieces: number;
  gold: number;
  /** Bonus de stat (ATK/DEF/HP) après le palier. */
  statModifier: number;
}

export interface SkillUpgradeRow {
  /** Niveau d'amélioration atteint (2 à 5). */
  level: number;
  manuals: ItemCost[];
  gold: number;
}

export interface EnchantRow {
  level: number;
  materials: ItemCost[];
  gold: number;
  /** Slot de gem débloqué à ce niveau (sinon 0). */
  gemSlot: number;
}

export interface XpFoodItem extends ItemRef {
  xp: number;
}

export interface HeroGrowthData {
  limitBreak: Record<string, LimitBreakStep[]>;
  skillUpgrade: Record<string, SkillUpgradeRow[]>;
  specialEquip: { ee: EnchantRow[]; talisman: EnchantRow[] };
  xpFood: XpFoodItem[];
}

/** Résout une réf d'item depuis le catalogue (jette si absent — SSG strict). */
export function itemRef(id: string, catalog: Record<string, CatalogEntry>): ItemRef {
  const e = catalog[id];
  if (!e) throw new Error(`hero-growth : item ${id} absent du catalogue`);
  return { id, name: e.name, icon: e.icon, grade: e.grade };
}

/** [{ItemID_n, ItemCnt_n}] présents (id ≠ 0, count > 0) → coûts résolus. */
export function costsFrom(
  row: Row,
  pairs: [string, string][],
  catalog: Record<string, CatalogEntry>,
): ItemCost[] {
  const out: ItemCost[] = [];
  for (const [idKey, cntKey] of pairs) {
    const id = String(row[idKey] ?? '0');
    const count = num(row[cntKey]);
    if (id !== '0' && count > 0) out.push({ item: itemRef(id, catalog), count });
  }
  return out;
}

/** Coûts d'expansion 100→120 par rareté (pièces/prix indépendants de l'élément). */
function buildLimitBreak(catalog: Record<string, CatalogEntry>): Record<string, LimitBreakStep[]> {
  void catalog;
  const rows = loadTable('CharacterMaxLevelTemplet');
  const out: Record<string, LimitBreakStep[]> = {};
  for (const r of rows) {
    const star = String(r.BasicStar);
    const step = num(r.Step);
    const list = (out[star] ??= []);
    if (list.some((s) => s.fromLevel === num(r.RequireLevel))) continue; // 1 élément suffit
    list[step - 1] = {
      fromLevel: num(r.RequireLevel),
      toLevel: num(r.MaxLevel),
      pieces: num(r.CharBreakPieceQuantity),
      gold: num(r.Price),
      statModifier: num(r.LevelUpStatModifierAfter100),
    };
  }
  for (const star of Object.keys(out)) out[star] = out[star].filter(Boolean);
  return out;
}

/** Coût d'amélioration de skill par rareté (1/2/3) × niveau (2→5). */
function buildSkillUpgrade(
  catalog: Record<string, CatalogEntry>,
): Record<string, SkillUpgradeRow[]> {
  const rows = loadTable('CharacterSkillEnchantTemplet');
  const out: Record<string, SkillUpgradeRow[]> = {};
  for (const r of rows) {
    const star = String(r.BasicStar);
    (out[star] ??= []).push({
      level: num(r.EnchantLevel),
      manuals: costsFrom(
        r,
        [
          ['ItemID_1', 'ItemCnt_1'],
          ['ItemID_2', 'ItemCnt_2'],
        ],
        catalog,
      ),
      gold: num(r.UpgradePrice),
    });
  }
  for (const star of Object.keys(out)) out[star].sort((a, b) => a.level - b.level);
  return out;
}

/** Enchant EE / talisman (matériaux, gold, déblocage de gem slot) par niveau. */
function buildSpecialEquip(catalog: Record<string, CatalogEntry>): {
  ee: EnchantRow[];
  talisman: EnchantRow[];
} {
  const rows = loadTable('SpecialEquipEnchantTemplet');
  const pick = (subType: string): EnchantRow[] =>
    rows
      .filter((r) => r.ItemSubType === subType)
      .map((r) => ({
        level: num(r.EnchantLevel),
        materials: costsFrom(
          r,
          [
            ['RequireMaterial1', 'MaterialCount1'],
            ['RequireMaterial2', 'MaterialCount2'],
            ['RequireMaterial3', 'MaterialCount3'],
          ],
          catalog,
        ),
        gold: num(r.UpgradePrice),
        gemSlot: num(r.GemSlot),
      }))
      .sort((a, b) => a.level - b.level);
  return { ee: pick('ITS_EQUIP_EXCLUSIVE'), talisman: pick('ITS_EQUIP_OOPARTS') };
}

/** Items de nourriture d'XP (`ITS_MATERIAL_CHAR_LEVEL`), triés par XP. */
function buildXpFood(catalog: Record<string, CatalogEntry>): XpFoodItem[] {
  const rows = loadTable('ItemTemplet');
  return rows
    .filter((r) => r.ItemSubType === 'ITS_MATERIAL_CHAR_LEVEL' && num(r.MaterialValue) > 0)
    .map((r) => ({ ...itemRef(String(r.ID), catalog), xp: num(r.MaterialValue) }))
    .sort((a, b) => a.xp - b.xp);
}

export function buildHeroGrowth(): HeroGrowthData {
  const catalog = buildItemCatalog();
  return {
    limitBreak: buildLimitBreak(catalog),
    skillUpgrade: buildSkillUpgrade(catalog),
    specialEquip: buildSpecialEquip(catalog),
    xpFood: buildXpFood(catalog),
  };
}

// Exécution directe : diagnostic.
if (isMain(import.meta.url)) {
  const d = buildHeroGrowth();
  for (const star of Object.keys(d.limitBreak))
    console.log(
      `limitBreak ${star}★ :`,
      d.limitBreak[star]
        .map((s) => `${s.fromLevel}→${s.toLevel} ${s.pieces}f/${s.gold}g`)
        .join('  '),
    );
  for (const star of Object.keys(d.skillUpgrade))
    console.log(
      `skill ${star}★ :`,
      d.skillUpgrade[star]
        .map((s) => `L${s.level} ${s.manuals.map((m) => m.item.name.en + '×' + m.count).join('+')}`)
        .join(' | '),
    );
  console.log(
    'EE niveaux :',
    d.specialEquip.ee.length,
    '| talisman :',
    d.specialEquip.talisman.length,
  );
  console.log('xpFood :', d.xpFood.map((f) => `${f.name.en}=${f.xp}`).join(', '));
}
