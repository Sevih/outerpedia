/**
 * MODÈLE de la page détail équipement : tout est pré-résolu côté serveur
 * (textes localisés, bases de stats, paliers) — le client ne fait que la
 * MATHS live (enhance × breakthrough × ascension, formules extraites du jeu
 * dans `equipment/enhance.json`).
 */
import type {
  EffectShape,
  EnhanceRules,
  GearItem,
  LangDict,
  Option,
  Passive,
  PassiveRef,
  SpecialItem,
} from '@contracts';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { STAT_ABBR, statName, statOptionView } from '@/lib/stats';
import { PERCENT_STATS } from '@/../datagen/lib/stats';
import {
  getAmuletFamilies,
  getEEViews,
  getSetViews,
  getTalismanFamilies,
  getWeaponFamilies,
  fillPlaceholders,
  resolvePassives,
  slugifyEquipment,
  type EEView,
  type GearFamily,
  type ResolvedPassive,
  type ResolvedSource,
} from '@/lib/data/equipment';
import { loadGearReco, loadGearPresets } from '@/lib/data/gear-reco';
import {
  characterDisplayName,
  characterNamePrefix,
  getCharacter,
  slugForId,
} from '@/lib/data/characters';
import { loadCuratedCharacters } from '@/lib/data/curated';
import { mergeStatusEffects } from '@/lib/data/effects';
import type { StatusMap } from '@/components/character/EffectChips';
import weaponData from '@data/generated/equipment/weapon.json';
import accessoryData from '@data/generated/equipment/accessory.json';
import talismanData from '@data/generated/equipment/talisman.json';
import eeItemsData from '@data/generated/equipment/ee.json';
import helmetData from '@data/generated/equipment/helmet.json';
import armorData from '@data/generated/equipment/armor.json';
import glovesData from '@data/generated/equipment/gloves.json';
import shoesData from '@data/generated/equipment/shoes.json';
import poolsData from '@data/generated/equipment/pools.json';
import passivesData from '@data/generated/equipment/passives.json';
import enhanceData from '@data/generated/equipment/enhance.json';

const WEAPONS = weaponData as unknown as Record<string, GearItem>;
const AMULETS = accessoryData as unknown as Record<string, GearItem>;
const TALISMANS = talismanData as unknown as Record<string, SpecialItem>;
const EE_ITEMS = eeItemsData as unknown as Record<string, SpecialItem>;
const POOLS = poolsData as unknown as Record<string, Option[]>;
const PASSIVES = passivesData as unknown as Record<string, Passive>;
const ENHANCE = enhanceData as unknown as EnhanceRules;
const ARMOR_TABLES = {
  helmet: helmetData,
  armor: armorData,
  gloves: glovesData,
  shoes: shoesData,
} as unknown as Record<
  string,
  Record<
    string,
    {
      name: never;
      star: number;
      grade: string;
      icon: string;
      main: string[];
      sub: string | null;
      set: string | null;
    }
  >
>;

// --- briques du modèle ---------------------------------------------------------

/** Une option de stat prête au calcul live. */
export interface StatOption {
  /** Abréviation affichée (« ATK% », « EFF »…). */
  key: string;
  /** Nom complet du jeu quand il n'existe pas d'abréviation propre (hit_ap…). */
  label?: string;
  /** Valeur affichée en % (suffixe + arrondi 0.1). */
  percent: boolean;
  /** Valeur de base au +0 (déjà à l'échelle d'affichage : rate/per-mille ÷10). */
  base: number;
  /** Talisman/EE : valeur par NIVEAU (déjà à l'échelle) — remplace la formule. */
  levels?: number[];
}

/** Un slot de main stat : fixe ou au choix. */
export interface StatSlot {
  type: 'fixed' | 'choice';
  options: StatOption[];
}

export interface SubstatPool {
  /** Nombre max de procs par stat (max / factor). */
  maxSegments: number;
  pool: { key: string; percent: boolean; step: number; max: number }[];
}

/** Un palier de passif prêt à rendre : textes remplis PAR INDEX de valeurs. */
export interface PassiveTier {
  name: string;
  icon: string;
  unlockLevel: number;
  isAdd: boolean;
  /** Textes remplis pour chaque palier de valeurs (breakthrough OU niveau). */
  texts: string[];
  /** Effets structurés des buffs (chips buff/debuff, comme les skills). */
  effects?: EffectShape[];
  /** Variante de CLASSE (familles à passif par classe — Briareos/Gorgon) :
   * le palier ne vaut que pour cette classe, rendu avec son icône. */
  classLimit?: string;
}

export interface DetailPiece {
  slot: string;
  label: string;
  icon: string;
  mains: StatSlot[];
  sub?: SubstatPool;
}

export interface RecommendedChar {
  id: string;
  slug: string;
  name: string;
  prefix?: string | null;
  element: string;
  classType: string;
  rarity: number;
  tags: string[];
}

export interface DetailModel {
  kind: 'weapon' | 'amulet' | 'talisman' | 'set' | 'ee';
  slug: string;
  name: string;
  icon: string;
  /** Set : icône d'enchantement (TI_Icon_Set_*) posée en overlay des tuiles. */
  setIcon?: string;
  /** EE : portrait dédié (img.ee). */
  eeCharacterId?: string;
  grade: string;
  star: number;
  classLimits: string[];
  mode?: 'AP' | 'CP';
  /** Slots de main stats (gear/talisman/EE). */
  slots: StatSlot[];
  sub?: SubstatPool;
  /** Paliers de passif (gear : textes par breakthrough ; talisman/EE : par niveau). */
  passives: PassiveTier[];
  /** Gear : les textes du passif suivent le BREAKTHROUGH (sinon le niveau). */
  passiveByTier: boolean;
  /** Sets : bonus par état (base / enchanté) — le client bascule à T4. */
  setEffects?: { p2?: string; p4?: string; p2e?: string; p4e?: string };
  pieces?: DetailPiece[];
  canAscend: boolean;
  reforgeBase: number;
  rules: EnhanceRules;
  /** Bloc Ascension localisé (activation, pas +11..+15, bonus +15). */
  ascension: AscensionView;
  source?: {
    bosses: { id: string; name: string; icon: string; sourceLabel?: string }[];
    /** Slugs de boutique extraits (traduits par la page). */
    shops?: string[];
    label?: string;
  };
  recommended: RecommendedChar[];
  /** EE : buffs/debuffs des passifs (chips comme les skills) + statuts. */
  effectChips?: { effects: EffectShape[]; statuses: StatusMap };
  /** EE : rangs éditoriaux + porteur (+ pendant core-fusion éventuel). */
  rank?: string;
  rank10?: string;
  owner?: RecommendedChar;
  ownerCompanion?: RecommendedChar;
  trustLevel?: number;
}

// --- helpers ---------------------------------------------------------------------

// Clé + nature % : logique UNIQUE dans statOptionView (src/lib/stats).
const isPercent = (o: Option) => statOptionView(o.stat, o.mode).percent;
const scale = (o: Option, v: number) => (isPercent(o) ? v / 10 : v);

/** Option de stat simple (clé/label/percent/base/niveaux). */
function simpleStatOption(
  statSlug: string,
  percent: boolean,
  base: number,
  lang: Lang,
  levels?: number[],
  labelOverride?: string,
): StatOption {
  const { key } = statOptionView(statSlug, percent ? 'rate' : 'flat');
  const label = labelOverride ?? (STAT_ABBR[statSlug] ? undefined : statName(statSlug, lang));
  return {
    key,
    // Libellé officiel (buff conditionnel « vs Fire ») ou nom complet du jeu
    // quand il n'existe pas d'abréviation propre (« Gains AP when hit »).
    ...(label ? { label } : {}),
    percent,
    base,
    ...(levels ? { levels } : {}),
  };
}

/**
 * Options prêtes au calcul d'UNE ligne de pool. Cas général : une option.
 * Option spéciale EE (buff + stat propre) : DEUX options — la stat
 * CONDITIONNELLE portée par le buff (dmg_reduce 200 = 20 %, niveaux du buff)
 * ET la stat SECONDAIRE flat de la ligne (hit_ap : min(max, factor×(niv+1)),
 * formule du client — validée contre l'oracle V2 : 1..10 puis plafond).
 */
function toStatOptions(o: Option, lang: Lang): StatOption[] {
  if (!o.stat || o.stat === 'none') return [];
  const eff = o.buff && o.effects?.length ? o.effects[0] : undefined;
  if (!eff) {
    const percent = isPercent(o);
    const sc = (v: number) => (percent ? v / 10 : v);
    return [simpleStatOption(o.stat, percent, sc(o.value), lang, o.levels?.map(sc))];
  }
  const out: StatOption[] = [];
  const statSlug = eff.stat ?? eff.type;
  const percent = eff.mode === 'rate' || PERCENT_STATS.has(statSlug);
  const sc = (v: number) => (percent ? v / 10 : v);
  const condLabel = o.label ? lRec(o.label, lang) || o.label.en : undefined;
  out.push(simpleStatOption(statSlug, percent, sc(eff.value), lang, o.levels?.map(sc), condLabel));
  if (o.factor && o.max) {
    const levels = Array.from({ length: ENHANCE.maxEnhance + 1 }, (_, n) =>
      Math.min(o.max ?? 0, (o.factor ?? 0) * (n + 1)),
    );
    out.push(simpleStatOption(o.stat, PERCENT_STATS.has(o.stat), levels[0], lang, levels));
  }
  return out;
}

function toSlots(mainGroups: string[], lang: Lang): StatSlot[] {
  const out: StatSlot[] = [];
  for (const g of mainGroups) {
    const rows = POOLS[g] ?? [];
    if (rows.length === 1) {
      // Ligne unique : chaque option dérivée (EE : conditionnelle + flat)
      // devient un slot FIXE distinct.
      for (const o of toStatOptions(rows[0], lang)) out.push({ type: 'fixed', options: [o] });
      continue;
    }
    const options = rows
      .map((o) => toStatOptions(o, lang)[0])
      .filter((o): o is StatOption => Boolean(o));
    if (!options.length) continue;
    out.push({ type: options.length > 1 ? 'choice' : 'fixed', options });
  }
  return out;
}

function toSubPool(sub: string | null): SubstatPool | undefined {
  if (!sub) return undefined;
  const rows = POOLS[sub] ?? [];
  const pool = rows
    .filter((o) => o.stat && o.stat !== 'none')
    .map((o) => ({
      ...statOptionView(o.stat, o.mode),
      step: scale(o, o.value),
      max: scale(o, o.max ?? o.value),
    }));
  if (!pool.length) return undefined;
  const first = rows.find((o) => o.factor && o.max);
  const maxSegments = first ? Math.round((first.max ?? 0) / (first.factor ?? 1)) : 1;
  return { maxSegments, pool };
}

/** Paliers de passif → textes remplis par index de valeurs (le client indexe). */
function toPassiveTiers(
  tiers: ResolvedPassive[],
  refsTexts: string[][],
  refs?: PassiveRef[],
): PassiveTier[] {
  return tiers.map((t, i) => {
    const effects = refs ? PASSIVES[refs[i]?.id]?.effects : undefined;
    return {
      name: t.name,
      icon: t.icon,
      unlockLevel: t.level,
      isAdd: t.isAdd,
      texts: refsTexts[i],
      ...(effects?.length ? { effects } : {}),
    };
  });
}

/**
 * Textes remplis des passifs. Gear (`byTier`) : un texte par palier de
 * breakthrough (le client indexe par T0..T4). Talisman/EE : les `values` sont
 * aux niveaux DÉCLARÉS du buff (souvent [1, 10]) — chaque palier affiche UN
 * texte, celui de la valeur à SON niveau de déblocage (Mage's Charm : 30
 * jusqu'à +9, 39 au +10).
 */
function passiveTexts(refs: PassiveRef[], lang: Lang, byTier = true): string[][] {
  return refs.map((ref) => {
    const p = PASSIVES[ref.id];
    if (!p) return [];
    const desc = lRec(p.desc, lang) || p.desc.en;
    if (!p.values.length) return [desc];
    if (byTier) return p.values.map((v) => fillPlaceholders(desc, v));
    let idx = 0;
    for (let i = 0; i < (p.levels?.length ?? 0); i++) if (p.levels[i] <= ref.level) idx = i;
    return [fillPlaceholders(desc, p.values[Math.min(idx, p.values.length - 1)])];
  });
}

/** Persos recommandant cet équipement (gear-reco par ID — robuste). */
function recommendedFor(
  match: (b: {
    weapons?: { id: string }[];
    amulets?: { id: string }[];
    talismans?: string[];
    sets?: { preset?: string; pieces?: { set: string }[] }[];
  }) => boolean,
  lang: Lang,
): RecommendedChar[] {
  const reco = loadGearReco();
  const curated = loadCuratedCharacters();
  const out: RecommendedChar[] = [];
  for (const [charId, builds] of Object.entries(reco)) {
    if (!builds.some(match)) continue;
    const c = getCharacter(charId);
    if (!c) continue;
    out.push({
      id: charId,
      slug: slugForId(charId) ?? charId,
      name: characterDisplayName(c, lang),
      prefix: characterNamePrefix(c, lang),
      element: c.element,
      classType: c.class,
      rarity: c.rarity,
      tags: [...(curated[charId]?.tags ?? []), ...(c.fusion ? ['core-fusion'] : [])],
    });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

/** Résout les combos de sets d'un build (presets inclus) en ids de sets. */
function buildSetIds(b: { sets?: { preset?: string; pieces?: { set: string }[] }[] }): string[] {
  const presets = loadGearPresets();
  return (b.sets ?? []).flatMap((c) =>
    (c.pieces ?? (c.preset ? (presets.sets[c.preset] ?? []) : [])).map((p) => p.set),
  );
}

function toSourceView(source: ResolvedSource | undefined, lang: Lang) {
  if (!source) return undefined;
  return {
    bosses: source.bosses.map((b) => ({
      id: b.id,
      name: lRec(b.name, lang) || b.name.en,
      icon: b.icon,
      // Titre extrait du contenu où on l'affronte (« Special Request: … »).
      ...(b.source ? { sourceLabel: lRec(b.source, lang) || b.source.en } : {}),
    })),
    shops: source.shops.length ? source.shops : undefined,
    label: source.label,
  };
}

const GRADE_RANK: Record<string, number> = { normal: 0, magic: 1, rare: 2, unique: 3 };
const betterPiece = (a: { grade: string; star: number }, b: { grade: string; star: number }) =>
  (GRADE_RANK[a.grade] ?? 0) - (GRADE_RANK[b.grade] ?? 0) || a.star - b.star;

const PIECE_ORDER = ['helmet', 'armor', 'gloves', 'shoes'] as const;

/** Un bonus +15 localisé : effet + répartition par grades (couleurs du jeu). */
export interface AscensionBonusView {
  name: string;
  icon: string;
  chance: number;
  grades: { grade: string; color: string; range: string; rangeAlt?: string; rate: number }[];
  splitLabels?: { primary: string; alt: string };
}

export interface AscensionMaterialView {
  icon: string;
  name: string;
  count: number;
  /** Grade slug (cadre de rareté de la tuile). */
  grade: string;
  /** Description officielle (tooltip). */
  desc?: string;
}

/** Bloc Ascension complet, PRÉ-LOCALISÉ (ledger de la page détail). */
export interface AscensionView {
  activation: { price: number; rate: number; materials: AscensionMaterialView[] };
  steps: { to: number; price: number; rate: number; materials: AscensionMaterialView[] }[];
  bonuses: AscensionBonusView[];
}

/** Vue Ascension localisée du groupe (armes/amulettes vs armure). */
function ascensionView(group: 'weapon' | 'armor', lang: Lang): AscensionView {
  const s = ENHANCE.singularity;
  const mats = (
    list: { icon: string; name: LangDict; count: number; grade: string; desc?: LangDict }[],
  ): AscensionMaterialView[] =>
    list.map((m) => ({
      icon: m.icon,
      name: lRec(m.name, lang) || m.name.en,
      count: m.count,
      grade: m.grade,
      ...(m.desc ? { desc: lRec(m.desc, lang) || m.desc.en } : {}),
    }));
  return {
    activation: {
      price: s.activation.price,
      rate: s.activation.rate,
      materials: mats(s.activation.materials),
    },
    steps: s.steps.map((st) => ({
      to: st.to,
      price: st.price,
      rate: st.rate,
      materials: mats(st.materials),
    })),
    bonuses: s.bonuses[group].map((b) => ({
      name: lRec(b.name, lang) || b.name.en,
      icon: b.icon,
      chance: b.chance,
      grades: b.grades,
      ...(b.splitLabels ? { splitLabels: b.splitLabels } : {}),
    })),
  };
}

// --- construction du modèle par type ------------------------------------------------

function gearModel(
  f: GearFamily,
  table: Record<string, GearItem>,
  kind: 'weapon' | 'amulet',
  lang: Lang,
): DetailModel {
  const top = table[f.ids.reduce((m, id) => (table[id].star > table[m].star ? id : m), f.ids[0])];
  const idSet = new Set(f.ids);
  return {
    kind,
    slug: f.slug,
    name: lRec(f.name, lang) || f.name.en,
    icon: f.icon,
    grade: f.grade,
    star: top.star,
    classLimits: f.classLimits,
    slots: toSlots(top.main, lang),
    sub: toSubPool(top.sub),
    // Famille à passif PAR CLASSE : un palier par variante, tagué de sa classe.
    passives: (f.classPassives ?? [{ classLimit: undefined, passives: f.passives }]).flatMap((v) =>
      toPassiveTiers(
        resolvePassives(v.passives, lang),
        passiveTexts(v.passives, lang),
        v.passives,
      ).map((t) => (v.classLimit ? { ...t, classLimit: v.classLimit } : t)),
    ),
    passiveByTier: true,
    canAscend:
      top.grade === ENHANCE.singularity.minGrade && top.star >= ENHANCE.singularity.minStar,
    reforgeBase: top.sub ? top.star : 0,
    rules: ENHANCE,
    ascension: ascensionView('weapon', lang),
    source: toSourceView(f.source, lang),
    recommended: recommendedFor(
      (b) =>
        (b.weapons ?? []).some((w) => idSet.has(w.id)) ||
        (b.amulets ?? []).some((a) => idSet.has(a.id)),
      lang,
    ),
    ...(f.mode ? { mode: f.mode } : {}),
  };
}

function talismanModel(f: GearFamily, lang: Lang): DetailModel {
  const top =
    TALISMANS[f.ids.reduce((m, id) => (TALISMANS[id].star > TALISMANS[m].star ? id : m), f.ids[0])];
  const idSet = new Set(f.ids);
  return {
    kind: 'talisman',
    slug: f.slug,
    name: lRec(f.name, lang) || f.name.en,
    icon: f.icon,
    grade: f.grade,
    star: top.star,
    classLimits: [],
    mode: f.mode,
    slots: toSlots(top.options, lang),
    passives: toPassiveTiers(
      resolvePassives(f.passives, lang),
      passiveTexts(f.passives, lang, false),
      f.passives,
    ),
    passiveByTier: false,
    canAscend: false,
    reforgeBase: 0,
    rules: ENHANCE,
    ascension: ascensionView('weapon', lang),
    source: toSourceView(f.source, lang),
    recommended: recommendedFor((b) => {
      const presets = loadGearPresets();
      const ids = (b.talismans ?? []).flatMap((t) =>
        t.startsWith('$') ? (presets.talismans[t.slice(1)] ?? []) : [t],
      );
      return ids.some((t) => idSet.has(t));
    }, lang),
  };
}

function setModel(slug: string, lang: Lang): DetailModel | null {
  const view = getSetViews(lang).find((s) => s.slug === slug);
  if (!view) return null;
  const pieces: DetailPiece[] = [];
  let star = 0;
  let canAscend = false;
  for (const slot of PIECE_ORDER) {
    let best: (typeof ARMOR_TABLES)[string][string] | undefined;
    for (const p of Object.values(ARMOR_TABLES[slot])) {
      if (p.set === view.id && (!best || betterPiece(p, best) > 0)) best = p;
    }
    if (!best) continue;
    star = Math.max(star, best.star);
    canAscend ||=
      best.grade === ENHANCE.singularity.minGrade && best.star >= ENHANCE.singularity.minStar;
    pieces.push({
      slot,
      label: slot,
      icon: best.icon,
      mains: toSlots(best.main, lang),
      sub: toSubPool(best.sub),
    });
  }
  const t0 = view.tiers[0];
  const t1 = view.tiers[1];
  return {
    kind: 'set',
    slug,
    name: lRec(view.name, lang) || view.name.en,
    icon: pieces[0]?.icon ?? view.icon,
    setIcon: view.icon,
    grade: 'unique',
    star,
    classLimits: [],
    slots: [],
    passives: [],
    passiveByTier: false,
    setEffects: { p2: t0?.p2, p4: t0?.p4, p2e: t1?.p2, p4e: t1?.p4 },
    pieces,
    canAscend,
    reforgeBase: star,
    rules: ENHANCE,
    ascension: ascensionView('armor', lang),
    source: toSourceView(view.source, lang),
    recommended: recommendedFor((b) => buildSetIds(b).includes(view.id), lang),
  };
}

function eeModel(slug: string, lang: Lang): DetailModel | null {
  const view = getEEViews().find((e) => slugifyEquipment(e.name.en) === slug);
  return view ? eeModelForView(view, lang) : null;
}

/**
 * Modèle de page EE à partir d'une vue DÉJÀ résolue — évite le `.find` par slug
 * (et surtout la re-matérialisation de toutes les familles de `getEquipmentDetail`)
 * quand l'appelant tient déjà la vue. Utile quand on itère les ~90 vues EE :
 * construire par vue reste O(n) au lieu de O(n²).
 */
export function eeModelForView(view: EEView, lang: Lang): DetailModel {
  const slug = slugifyEquipment(view.name.en);
  const c = getCharacter(view.characterId);
  const curatedChars = loadCuratedCharacters();
  const eeItem = EE_ITEMS[view.itemId];
  const toRef = (ch: NonNullable<ReturnType<typeof getCharacter>>): RecommendedChar => ({
    id: ch.id,
    slug: slugForId(ch.id) ?? ch.id,
    name: characterDisplayName(ch, lang),
    prefix: characterNamePrefix(ch, lang),
    element: ch.element,
    classType: ch.class,
    rarity: ch.rarity,
    tags: [...(curatedChars[ch.id]?.tags ?? []), ...(ch.fusion ? ['core-fusion'] : [])],
  });
  // Pendant core-fusion : id 20xxxxx → 27xxxxx (convention du jeu, comme en V2).
  const companion = c && c.id.startsWith('20') ? getCharacter(`27${c.id.slice(2)}`) : undefined;
  return {
    kind: 'ee',
    slug,
    name: lRec(view.name, lang) || view.name.en,
    icon: '',
    eeCharacterId: view.characterId,
    grade: view.grade,
    star: view.star,
    classLimits: [],
    slots: toSlots(eeItem?.options ?? [], lang),
    passives: toPassiveTiers(
      resolvePassives(view.passives, lang),
      passiveTexts(view.passives, lang, false),
      view.passives,
    ),
    ...(() => {
      // Chips buff/debuff des passifs (comme les skills), statuts résolus.
      const effects = view.passives.flatMap((ref) => PASSIVES[ref.id]?.effects ?? []);
      return effects.length
        ? { effectChips: { effects, statuses: mergeStatusEffects({}, effects, lang) } }
        : {};
    })(),
    passiveByTier: false,
    canAscend: false,
    reforgeBase: 0,
    rules: ENHANCE,
    ascension: ascensionView('weapon', lang),
    recommended: [],
    rank: view.rank,
    rank10: view.rank10,
    trustLevel: view.trustLevel,
    owner: c ? toRef(c) : undefined,
    ownerCompanion: companion ? toRef(companion) : undefined,
  };
}

// --- résolution par slug -------------------------------------------------------------

/** Toutes les fiches (slug + nom EN) — sitemap, static params, index llms.txt. */
export function allEquipmentEntries(): { slug: string; name: string }[] {
  return [
    ...getWeaponFamilies().map((f) => ({ slug: f.slug, name: f.name.en })),
    ...getAmuletFamilies().map((f) => ({ slug: f.slug, name: f.name.en })),
    ...getTalismanFamilies().map((f) => ({ slug: f.slug, name: f.name.en })),
    ...getSetViews('en').map((s) => ({ slug: s.slug, name: s.name.en })),
    ...getEEViews().map((e) => ({ slug: slugifyEquipment(e.name.en), name: e.name.en })),
  ];
}

/** Tous les slugs (pour le sitemap / static params). */
export function allEquipmentSlugs(): string[] {
  return allEquipmentEntries().map((e) => e.slug);
}

/** Modèle complet d'une page détail, ou null (ordre de balayage V2). */
export function getEquipmentDetail(slug: string, lang: Lang): DetailModel | null {
  const w = getWeaponFamilies().find((f) => f.slug === slug);
  if (w) return gearModel(w, WEAPONS, 'weapon', lang);
  const a = getAmuletFamilies().find((f) => f.slug === slug);
  if (a) return gearModel(a, AMULETS, 'amulet', lang);
  const t = getTalismanFamilies().find((f) => f.slug === slug);
  if (t) return talismanModel(t, lang);
  return setModel(slug, lang) ?? eeModel(slug, lang);
}
