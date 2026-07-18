/**
 * Lecture du domaine ÉQUIPEMENT : catalogues générés regroupés en FAMILLES
 * d'affichage + éditorial curé (sources, AP/CP, rangs EE).
 *
 * Le jeu décline un même item en variantes techniques (palier 5★ / 6★
 * craftable / instances de drop par difficulté 9xxxx / déclinaisons par classe
 * sous un même nom) : le wiki présente UNE famille par nom, portant ses
 * paliers d'étoiles et ses restrictions de classe. L'id canonique d'une
 * famille = le plus petit id numérique du groupe (stable à l'ajout de
 * variantes) — c'est aussi la clé de l'éditorial curé.
 *
 * Le curé est lu au FS (l'admin voit ses écritures immédiatement).
 */
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import type {
  ArmorItem,
  Boss,
  BuffValues,
  EffectShape,
  EquipmentCurated,
  EquipmentCuratedEntry,
  ExclusiveItem,
  Family,
  GameSet,
  GearItem,
  ItemSources,
  LangDict,
  Option,
  Passive,
  PassiveRef,
  SetEffect,
  SpecialItem,
} from '@contracts';
import type { Lang } from '@/lib/i18n/config';
import type { TFunction } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { statAbbr, statName } from '@/lib/stats';
import { GRADE_RANK } from '@/lib/data/gear-order';
import weaponData from '@data/generated/equipment/weapon.json';
import accessoryData from '@data/generated/equipment/accessory.json';
import helmetData from '@data/generated/equipment/helmet.json';
import armorData from '@data/generated/equipment/armor.json';
import glovesData from '@data/generated/equipment/gloves.json';
import shoesData from '@data/generated/equipment/shoes.json';
import talismanData from '@data/generated/equipment/talisman.json';
import eeData from '@data/generated/equipment/ee.json';
import setsData from '@data/generated/equipment/sets.json';
import poolsData from '@data/generated/equipment/pools.json';
import passivesData from '@data/generated/equipment/passives.json';
import bossesData from '@data/generated/equipment/bosses.json';
import familiesData from '@data/generated/equipment/families.json';
import sourcesData from '@data/generated/equipment/sources.json';

const WEAPONS = weaponData as unknown as Record<string, GearItem>;
const AMULETS = accessoryData as unknown as Record<string, GearItem>;
const TALISMANS = talismanData as unknown as Record<string, SpecialItem>;
const EE = eeData as unknown as Record<string, ExclusiveItem>;
const SETS = setsData as unknown as Record<string, GameSet>;
const POOLS = poolsData as unknown as Record<string, Option[]>;
const PASSIVES = passivesData as unknown as Record<string, Passive>;
const BOSSES = bossesData as unknown as Record<string, Boss>;
const FAMILIES = familiesData as unknown as {
  weapon: Family[];
  accessory: Family[];
  talisman: Family[];
};
const SOURCES = sourcesData as unknown as ItemSources;
const ARMOR_SLOTS = {
  helmet: armorPieces(helmetData),
  armor: armorPieces(armorData),
  gloves: armorPieces(glovesData),
  shoes: armorPieces(shoesData),
} as const;

function armorPieces(data: unknown): Record<string, ArmorItem> {
  return data as Record<string, ArmorItem>;
}

/** L'identité affichable d'une PIÈCE d'équipement, quel que soit son slot. */
export interface GearIdentity {
  name: LangDict;
  grade: string;
  star: number;
  icon: string;
}

/**
 * Résolution d'une pièce par id BRUT, tous slots confondus — pour les
 * références venues d'un autre domaine (les tables de récompense de donjons
 * mêlent items et équipement sous les mêmes entrées). `undefined` si l'id
 * n'est pas une pièce d'équipement : l'appelant essaie alors le catalogue
 * d'items, et SIGNALE s'il ne trouve toujours pas.
 */
export function gearById(id: string): GearIdentity | undefined {
  return (
    WEAPONS[id] ??
    AMULETS[id] ??
    TALISMANS[id] ??
    EE[id] ??
    ARMOR_SLOTS.helmet[id] ??
    ARMOR_SLOTS.armor[id] ??
    ARMOR_SLOTS.gloves[id] ??
    ARMOR_SLOTS.shoes[id]
  );
}

const CURATED_PATH = resolve(process.cwd(), 'data/curated/equipment.json');
const EMPTY: EquipmentCurated = { weapons: {}, amulets: {}, talismans: {}, sets: {}, ee: {} };

/** Éditorial curé complet (fichier absent = vide). */
export function loadEquipmentEditorial(): EquipmentCurated {
  try {
    return { ...EMPTY, ...(JSON.parse(readFileSync(CURATED_PATH, 'utf8')) as EquipmentCurated) };
  } catch {
    return EMPTY;
  }
}

/**
 * mtime de l'éditorial curé (`-1` si absent) — CLÉ DE FRAÎCHEUR pour les caches
 * qui matérialisent des familles (nom/icône/slug/source dérivés du curé, donc
 * mutables au runtime via l'admin). Les stamper là-dessus les garde alignés sur
 * le contrat FS de ce module (l'admin voit ses écritures immédiatement).
 */
export function equipmentEditorialStamp(): number {
  try {
    return statSync(CURATED_PATH).mtimeMs;
  } catch {
    return -1;
  }
}

// --- Slug (compatible V2 : basé sur le nom EN) --------------------------------

/** Slug d'URL d'un équipement (même règle que la V2 — les liens survivent). */
export function slugifyEquipment(name: string): string {
  return name
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// --- Placeholders des passifs (miroir client de datagen/lib/buff.ts) ----------

/**
 * Remplit un template de passif (`[Value]`, `[Rate]`, `[Turn]` + variantes)
 * avec les valeurs d'un palier. `color` enrobe chaque valeur de
 * `<color=#28d9ed>` (rendue par `renderGameColors`, src/components/ui/GameText.tsx).
 */
export function fillPlaceholders(template: string, v: BuffValues, color = true): string {
  const w = (s: string) => (color ? `<color=#28d9ed>${s}</color>` : s);
  const f = (s: string | undefined) => (s == null ? '?' : w(s));
  const fs = (s: string | undefined, sign: '+' | '-') => (s == null ? '?' : w(`${sign}${s}`));
  return template
    .replace(/\[\+Value5\]/gi, fs(v.value5, '+'))
    .replace(/\[-Value5\]/gi, fs(v.value5, '-'))
    .replace(/\[Value5\]/gi, f(v.value5))
    .replace(/\[\+Value4\]/gi, fs(v.value4, '+'))
    .replace(/\[-Value4\]/gi, fs(v.value4, '-'))
    .replace(/\[Value4\]/gi, f(v.value4))
    .replace(/\[\+Value2\]/gi, fs(v.value2, '+'))
    .replace(/\[-Value2\]/gi, fs(v.value2, '-'))
    .replace(/\[Value2\]/gi, f(v.value2))
    .replace(/\[RATE\]/gi, f(v.rate))
    .replace(/\[Rate1?\]/g, f(v.rate))
    .replace(/\[\+Value\]/gi, fs(v.value, '+'))
    .replace(/\[-Value\]/gi, fs(v.value, '-'))
    .replace(/\[Value\]/gi, f(v.value))
    .replace(/\[\+Turn1?\]/gi, f(v.turn))
    .replace(/\[-Turn\]/gi, fs(v.turn, '-'))
    .replace(/\[Turn2\]/gi, f(v.turn2))
    .replace(/\[Turn\]/gi, f(v.turn));
}

/** Un palier de passif résolu pour l'affichage. */
export interface ResolvedPassive {
  /** Niveau d'objet de déblocage (1, 10…). */
  level: number;
  /** Vrai si ce palier S'AJOUTE au précédent (sinon il le remplace). */
  isAdd: boolean;
  name: string;
  icon: string;
  /** Texte au premier palier de valeurs (reforge min). */
  first: string;
  /** Texte au dernier palier de valeurs (reforge max) — absent si un seul. */
  last?: string;
  levels: number;
}

/** Effets structurés des passifs d'un item (chips buff/debuff, comme les skills). */
export function passiveEffects(refs: PassiveRef[]): EffectShape[] {
  return refs.flatMap((ref) => PASSIVES[ref.id]?.effects ?? []);
}

/** Réfs de passif d'une arme / amulette / talisman / EE, par id BRUT. */
export function gearPassiveRefs(id: string): PassiveRef[] | undefined {
  return (WEAPONS[id] ?? AMULETS[id] ?? TALISMANS[id] ?? EE[id])?.passives;
}

/**
 * Texte du PREMIER passif d'un item à un PALIER donné (1-based — gear : un
 * palier par breakthrough, 1..5). Au-delà des paliers connus, le dernier fait
 * foi. Texte BRUT (sans balises couleur) : c'est la forme des tooltips.
 */
export function passiveTextAt(refs: PassiveRef[], tier: number, lang: Lang): string | undefined {
  const ref = refs[0];
  const p = ref ? PASSIVES[ref.id] : undefined;
  if (!p) return undefined;
  const desc = lRec(p.desc, lang) || p.desc.en;
  const v = p.values[Math.min(tier, p.values.length) - 1];
  return v ? fillPlaceholders(desc, v, false) : desc;
}

/** Paliers de passif d'un item, résolus (textes remplis, localisés). */
export function resolvePassives(refs: PassiveRef[], lang: Lang): ResolvedPassive[] {
  const out: ResolvedPassive[] = [];
  for (const ref of refs) {
    const p = PASSIVES[ref.id];
    if (!p) continue;
    const desc = lRec(p.desc, lang) || p.desc.en;
    const first = p.values.length ? fillPlaceholders(desc, p.values[0]) : desc;
    const last =
      p.values.length > 1 ? fillPlaceholders(desc, p.values[p.values.length - 1]) : undefined;
    out.push({
      level: ref.level,
      isAdd: ref.isAdd,
      name: lRec(p.name, lang) || p.name.en,
      icon: p.icon,
      first,
      last,
      levels: p.values.length,
    });
  }
  return out;
}

// --- Stats des pools -----------------------------------------------------------

/**
 * Libellé d'une option de stat (« ATK% », « EFF »…) — null si option de buff
 * pur. Le mode `rate` porte un suffixe `%` (EFF/RES/ATK… existent en flat ET
 * en %), sauf si l'abréviation en porte déjà un (PEN%, DMG RED%…).
 */
export function optionStatLabel(o: Option): string | null {
  if (!o.stat || o.stat === 'none') return null;
  const abbr = statAbbr(o.stat);
  return o.mode === 'rate' && !abbr.endsWith('%') ? `${abbr}%` : abbr;
}

/**
 * Main stats possibles d'un item (dédupliquées, ordre des pools).
 * `excludeFlatBase` : masque la stat de base garantie des armes (ATK flat) —
 * on ne liste que les mains INTÉRESSANTES.
 */
function mainStatsOf(main: string[], excludeFlatBase = false): string[] {
  const out: string[] = [];
  for (const g of main)
    for (const o of POOLS[g] ?? []) {
      if (excludeFlatBase && o.mode === 'flat' && ['atk', 'def', 'hp'].includes(o.stat)) continue;
      const label = optionStatLabel(o);
      if (label && !out.includes(label)) out.push(label);
    }
  return out;
}

/**
 * Le SET d'une pièce d'armure, par id BRUT — pour les pools de récompense de
 * donjon (l'Ecology Study droppe des pièces par slot ; leur set est LA raison
 * d'y farmer). `undefined` si l'id n'est pas une pièce d'armure ou si la pièce
 * ne référence aucun set.
 */
export function armorPieceSet(id: string): GameSet | undefined {
  const setId = armorPieceSetId(id);
  return setId ? SETS[setId] : undefined;
}

/**
 * L'ID du set d'une pièce d'armure — ce que `armorPieceSet` ne peut pas rendre
 * (un `GameSet` ne porte pas sa propre clé). C'est LUI qui sert de référence
 * partout ailleurs (vues de set, tuiles, bonus par palier).
 */
export function armorPieceSetId(id: string): string | undefined {
  for (const table of Object.values(ARMOR_SLOTS)) {
    const piece = table[id];
    if (piece) return piece.set || undefined;
  }
  return undefined;
}

/**
 * VARIANTE d'équipement par id BRUT + son slot — pour rendre un pool de
 * récompenses variante PAR variante (icône par classe), là où `gearById` perd
 * le slot et où les familles écraseraient les déclinaisons sous une seule
 * icône. `undefined` si l'id n'est ni arme, ni amulette, ni talisman.
 */
export function gearVariant(
  id: string,
): { slot: 'weapon' | 'amulet' | 'talisman'; item: GearIdentity } | undefined {
  if (WEAPONS[id]) return { slot: 'weapon', item: WEAPONS[id] };
  if (AMULETS[id]) return { slot: 'amulet', item: AMULETS[id] };
  if (TALISMANS[id]) return { slot: 'talisman', item: TALISMANS[id] };
  return undefined;
}

/**
 * Mains possibles d'un accessoire/talisman par id BRUT (+ grade, pour que
 * l'appelant ne retienne que les uniques) — même dérivation que les familles.
 * `undefined` si l'id n'est ni une amulette ni un talisman.
 */
export function accessoryMainStats(id: string): { grade: string; stats: string[] } | undefined {
  const it: GearItem | SpecialItem | undefined = AMULETS[id] ?? TALISMANS[id];
  if (!it) return undefined;
  const groups = 'options' in it ? (it as SpecialItem).options : (it as GearItem).main;
  return { grade: it.grade, stats: mainStatsOf(groups) };
}

// --- Familles d'items (armes / amulettes / talismans) --------------------------

/** Source d'obtention résolue (boss matérialisés + boutiques). */
export interface ResolvedSource {
  bosses: (Boss & { id: string })[];
  /** Slugs de boutique EXTRAITS (`adventure_license`, `event_shop`) — i18n côté page. */
  shops: string[];
  /** Libellé curé (texte libre, complément non extractible). */
  label?: string;
}

/** Slugs de boutique connus → clé de libellé localisé. */
const SHOP_SOURCE_KEYS = {
  adventure_license: 'equip.source.adventure_license',
  event_shop: 'equip.source.event_shop',
} as const;

/**
 * Libellé localisé d'un slug de boutique (source d'équipement), avec REPLI
 * ASSUMÉ sur le slug brut pour un slug sans clé `equip.source.*`. Source unique
 * des trois copies qui divergeaient : les pages équipement repliaient sur le
 * slug, la fiche perso traduisait via un cast (rendant la clé brute pour un
 * slug inconnu) — un nouveau slug s'affichait donc différemment selon la page.
 */
export function shopSourceLabel(slug: string, t: TFunction): string {
  const key = SHOP_SOURCE_KEYS[slug as keyof typeof SHOP_SOURCE_KEYS];
  return key ? t(key) : slug;
}

export interface GearFamily {
  /** Id canonique (= clé de l'éditorial curé). */
  id: string;
  /** Tous les membres de la famille (variantes). */
  ids: string[];
  slug: string;
  name: LangDict;
  icon: string;
  grade: string;
  /** Paliers d'étoiles existants (triés). */
  stars: number[];
  /** Restrictions de classe distinctes (slugs) — vide si libre. */
  classLimits: string[];
  /** Main stats possibles (« ATK% », « EFF »…). */
  mainStats: string[];
  /** Paliers de passif (refs → resolvePassives). */
  passives: PassiveRef[];
  /**
   * Passifs PAR VARIANTE DE CLASSE quand ils diffèrent au sein de la famille
   * (Briareos's Ambition / Gorgon's Vanity : 5 passifs distincts, un par
   * classe) — `passives` ne porte alors que celui du membre de tête.
   */
  classPassives?: { classLimit: string; passives: PassiveRef[] }[];
  source?: ResolvedSource;
  /** Talisman : type de points (extrait du buff du passif). */
  mode?: 'AP' | 'CP';
}

/**
 * Source d'obtention : boss EXTRAITS (`sources.json`, union sur les membres de
 * la famille) en priorité ; la couche curée ne complète que ce que le client
 * ne déclare pas (événementiel, boutiques).
 */
function resolveSource(
  itemIds: string[],
  entry?: EquipmentCuratedEntry,
): ResolvedSource | undefined {
  const extracted = [...new Set(itemIds.flatMap((id) => SOURCES[id]?.bosses ?? []))];
  const shops = [...new Set(itemIds.flatMap((id) => SOURCES[id]?.shops ?? []))];
  const bossIds = extracted.length ? extracted : (entry?.source?.bosses ?? []);
  const bosses = bossIds
    .map((id) => (BOSSES[id] ? { id, ...BOSSES[id] } : null))
    .filter((b): b is Boss & { id: string } => Boolean(b));
  // Le libellé curé ne sert que si RIEN n'est extrait pour la famille.
  const label = extracted.length || shops.length ? undefined : entry?.source?.label;
  if (!bosses.length && !shops.length && !label) return undefined;
  return { bosses, shops, label };
}

/**
 * Matérialise les familles de wiki d'un slot depuis `families.json` (la règle
 * de regroupement vit dans le datagen — source unique) + jointure curée.
 */
function materializeFamilies(
  families: Family[],
  table: Record<string, GearItem | SpecialItem>,
  curated: Record<string, EquipmentCuratedEntry>,
  excludeFlatBase = false,
): GearFamily[] {
  return families
    .filter((f) => f.wiki)
    .map((f) => {
      const top = table[f.topId];
      const entry = curated[f.id];
      // Mains possibles = UNION des variantes au palier max. Deux encodages :
      //   - famille à variante PAR main stat (Steel Necklace) : chaque membre
      //     porte un pool FIXE d'une option → union de tous les membres ;
      //   - variantes PRÉ-ROULÉES de la Singularité dimensionnelle (Dies Irae
      //     93xxx : main FIXE PEN%/SPD à 100 %) à CÔTÉ de la variante
      //     classique au pool roulé : seuls les pools ROULÉS disent ce que
      //     l'objet peut porter — les mains figées de ces loots spéciaux ne
      //     sont pas des mains de la famille.
      const topIds = f.ids.filter((id) => table[id].star === top.star);
      const memberGroups = topIds.map((id) =>
        'options' in table[id] ? (table[id] as SpecialItem).options : (table[id] as GearItem).main,
      );
      const rolled = memberGroups.filter((gs) => gs.some((g) => (POOLS[g] ?? []).length > 1));
      const mains = (rolled.length ? rolled : memberGroups).flat();
      // Passifs PAR CLASSE quand les variantes du palier max en portent des
      // DIFFÉRENTS (Briareos/Gorgon : « Ambition: Aggression/Determination/… »).
      const byClass = new Map<string, PassiveRef[]>();
      for (const id of topIds) {
        const m = table[id];
        const cl = 'classLimit' in m ? ((m as GearItem).classLimit ?? '') : '';
        if (cl && !byClass.has(cl)) byClass.set(cl, m.passives);
      }
      const sig = (ps: PassiveRef[]) => ps.map((p) => p.id).join(',');
      const classPassives =
        byClass.size > 1 && new Set([...byClass.values()].map(sig)).size > 1
          ? [...byClass].map(([classLimit, passives]) => ({ classLimit, passives }))
          : undefined;
      return {
        id: f.id,
        ids: f.ids,
        slug: slugifyEquipment(top.name.en),
        name: top.name,
        icon: top.icon,
        grade: top.grade,
        stars: f.stars,
        classLimits: f.classLimits,
        mainStats: mainStatsOf(mains, excludeFlatBase),
        passives: top.passives,
        ...(classPassives ? { classPassives } : {}),
        source: resolveSource(f.ids, entry),
        ...('mode' in top && top.mode ? { mode: top.mode } : {}),
      };
    });
}

export function getWeaponFamilies(): GearFamily[] {
  return materializeFamilies(FAMILIES.weapon, WEAPONS, loadEquipmentEditorial().weapons, true);
}

export function getAmuletFamilies(): GearFamily[] {
  return materializeFamilies(FAMILIES.accessory, AMULETS, loadEquipmentEditorial().amulets);
}

export function getTalismanFamilies(): GearFamily[] {
  return materializeFamilies(FAMILIES.talisman, TALISMANS, loadEquipmentEditorial().talismans);
}

// --- Sets d'armure --------------------------------------------------------------

export interface SetView {
  id: string;
  slug: string;
  name: LangDict;
  /** Icône d'enchantement du set (TI_Icon_Set_*). */
  icon: string;
  /** Icônes des 4 pièces 6★ (helmet/armor/gloves/shoes). */
  pieceIcons: Partial<Record<keyof typeof ARMOR_SLOTS, string>>;
  /** Bonus par palier (index 0 = base, 1 = enchanté), textes localisés. */
  tiers: { p2?: string; p4?: string }[];
  source?: ResolvedSource;
}

/** Texte d'un bonus de set : nom OFFICIEL de la stat, ou description officielle (riche). */
export function setEffectText(e: SetEffect | null, lang: Lang): string | undefined {
  if (!e) return undefined;
  if (e.stat) return `${statName(e.stat, lang)} +${e.value}`;
  if (e.desc) return lRec(e.desc, lang) || e.desc.en;
  return undefined;
}

export function getSetViews(lang: Lang): SetView[] {
  const curated = loadEquipmentEditorial().sets;
  return Object.entries(SETS).map(([id, s]) => {
    const pieceIcons: SetView['pieceIcons'] = {};
    const pieceIds: string[] = [];
    for (const [slot, table] of Object.entries(ARMOR_SLOTS) as [
      keyof typeof ARMOR_SLOTS,
      Record<string, ArmorItem>,
    ][]) {
      // Meilleure pièce = grade le plus haut PUIS étoiles (les grades bas
      // référencent aussi le set).
      let best: ArmorItem | undefined;
      const rank = (p: ArmorItem) => (GRADE_RANK[p.grade] ?? 0) * 10 + p.star;
      for (const [pid, piece] of Object.entries(table)) {
        if (piece.set !== id) continue;
        pieceIds.push(pid);
        if (!best || rank(piece) > rank(best)) best = piece;
      }
      if (best) pieceIcons[slot] = best.icon;
    }
    return {
      id,
      slug: slugifyEquipment(s.name.en),
      name: s.name,
      icon: s.icon,
      pieceIcons,
      tiers: s.tiers.map((t) => ({
        p2: setEffectText(t['2p'], lang),
        p4: setEffectText(t['4p'], lang),
      })),
      source: resolveSource(pieceIds, curated[id]),
    };
  });
}

// --- Équipements exclusifs (EE) ---------------------------------------------------

export interface EEView {
  /** Id d'item ET id de personnage porteur. */
  itemId: string;
  characterId: string;
  name: LangDict;
  star: number;
  grade: string;
  /** Main stats des 2 slots (labels d'options, buffs exclus). */
  mainStats: string[];
  /** Paliers de passif (niv. 1 + niv. 10 qui le remplace ou s'y ajoute). */
  passives: PassiveRef[];
  trustLevel: number;
  rank?: string;
  rank10?: string;
}

export function getEEViews(): EEView[] {
  const curated = loadEquipmentEditorial().ee;
  return Object.entries(EE).map(([itemId, e]) => ({
    itemId,
    characterId: e.character,
    name: e.name,
    star: e.star,
    grade: e.grade,
    // Le 2e slot d'un EE est une option spéciale (stat interne + buff, ex.
    // hit_ap) : son texte vient du passif — on ne garde que les stats connues.
    mainStats: mainStatsOf(e.options).filter((l) => !l.includes('_')),
    passives: e.passives,
    trustLevel: e.trustLevel,
    rank: curated[e.character]?.rank,
    rank10: curated[e.character]?.rank10,
  }));
}
