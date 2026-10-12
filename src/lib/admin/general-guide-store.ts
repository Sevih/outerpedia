/**
 * Édition des GUIDES GÉNÉRAUX à contenu BESPOKE — réservée à l'ADMIN local
 * (dev-only). Contrairement à la famille de boss (modèle unifié piloté par
 * `CatSpec`), chaque guide général a sa propre forme : ici un REGISTRE des
 * fragments éditables (slug → parties), chacun lu/écrit dans son JSON local,
 * que le guide importe statiquement au rendu.
 *
 * Premier fragment branché : `free-heroes-start-banner` → les SOURCES de héros
 * gratuits (onglet « Free Heroes »). D'autres suivront (un fragment = un JSON).
 */
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { writeJson } from '@datagen/lib/json';
import type { LocalizedText } from '@contracts';
import { normalizeReview, type ReviewEntryData } from './review-shape';
export { normalizeReview };
import {
  FUSION_CHANGE_KEYS,
  FUSION_TIERS,
  emptyFusionOrder,
  isFusionOp,
  normalizeFusionPick,
  normalizeFusionReview,
  type CoreFusionData,
  type FusionPriorityOrderData,
  type FusionReviewData,
} from './core-fusion-shape';
import { characterDisplayName, findCharacterByName, getAllCharacters } from '@/lib/data/characters';
import { getCoreFusionPairs } from '@/lib/data/core-fusion';
import { hasTagInGroup } from '@/lib/data/tags';
import { transcendenceFullSteps, transcendenceLabel } from '@/lib/transcendence';

const CONTENTS_DIR = resolve(process.cwd(), 'src/app/[lang]/guides/_contents');
const GENERAL_DIR = resolve(CONTENTS_DIR, 'general-guides');

/* --- Modèle « sources de héros gratuits » (miroir de free-heroes-sources.json) --- */

export interface FreeHeroEntryData {
  names: string[];
  pickType: 'one' | 'all';
  reason: LocalizedText;
}
export interface FreeHeroSourceData {
  source: LocalizedText;
  entries: FreeHeroEntryData[];
}
export interface FreeHeroesData {
  sources: FreeHeroSourceData[];
}

/** Slugs de general-guides dont un fragment est éditable ici (+ libellé de liste). */
export const EDITABLE_GENERAL_GUIDES: Record<string, string> = {
  'free-heroes-start-banner': 'Free Heroes & Starter Banners',
  'premium-limited': 'Premium & Limited',
  'shop-purchase-priorities': 'Shop Purchase Priorities',
};

export function isEditableGeneralGuide(slug: string): boolean {
  return Object.hasOwn(EDITABLE_GENERAL_GUIDES, slug);
}

const freeHeroesPath = () =>
  resolve(GENERAL_DIR, 'free-heroes-start-banner', 'free-heroes-sources.json');

/** Lit les sources de héros gratuits dans leur JSON local. */
export function loadFreeHeroes(): FreeHeroesData {
  const raw = JSON.parse(readFileSync(freeHeroesPath(), 'utf8')) as FreeHeroesData;
  return { sources: raw.sources ?? [] };
}

/**
 * Valide puis écrit les sources de héros gratuits. Renvoie les écarts bloquants
 * (vide = OK) : chaque source doit avoir un libellé EN et au moins une entrée ;
 * chaque entrée au moins un héros ; chaque nom de héros doit RÉSOUDRE (même
 * garde que le build, mais sans casser — on remonte l'erreur à l'éditeur).
 */
export async function saveFreeHeroes(data: FreeHeroesData): Promise<string[]> {
  const errors: string[] = [];
  const sources = data.sources ?? [];

  sources.forEach((s, si) => {
    const at = `Source ${si + 1}`;
    if (!s.source?.en?.trim()) errors.push(`${at}: EN label is required.`);
    if (!s.entries?.length) errors.push(`${at}: at least one entry is required.`);
    s.entries?.forEach((e, ei) => {
      const eat = `${at}, entry ${ei + 1}`;
      if (!e.names?.length) errors.push(`${eat}: at least one hero is required.`);
      e.names?.forEach((n) => {
        if (!findCharacterByName(n)) errors.push(`${eat}: unknown hero “${n}”.`);
      });
      if (e.pickType !== 'one' && e.pickType !== 'all') errors.push(`${eat}: invalid pick type.`);
    });
  });
  if (errors.length) return errors;

  await writeJson(freeHeroesPath(), { sources });
  return [];
}

/* --- Modèle « Premium & Limited » (reviews + recommended choices) --- */

// Forme + normalisation : `review-shape.ts` (PUR — partagé avec la brique client).
export type { ReviewEntryData, StarKey } from './review-shape';
export interface PriorityPickData {
  name: string;
  stars: number;
}
export interface PriorityOrderData {
  first: PriorityPickData[];
  second: PriorityPickData[];
  third: PriorityPickData[];
  transcend: PriorityPickData[];
}
/** Reviews des deux buckets — c'est CE fragment que Shiraen exporte/importe. */
export interface ReviewsBundle {
  premium: ReviewEntryData[];
  limited: ReviewEntryData[];
}
export interface PremiumLimitedData {
  reviews: ReviewsBundle;
  priorities: { premium: PriorityOrderData; limited: PriorityOrderData };
}

const plDir = () => resolve(GENERAL_DIR, 'premium-limited');
const plReviewsPath = () => resolve(plDir(), 'premium-reviews.json');
const plPrioritiesPath = () => resolve(plDir(), 'premium-priorities.json');

const PREMIUM_TAG = 'premium';
const PL_TIERS = ['first', 'second', 'third', 'transcend'] as const;

/**
 * Rosters « à reviewer » dérivés des TAGS de perso (source unique, toujours à
 * jour) : Premium = tag `premium` ; Limited = la FAMILLE `limited` du
 * glossaire (festival/seasonal/collab, cf. `tagsInGroup`), hors
 * `premium`/`core-fusion` qui ont leurs propres bannières/guides.
 * Noms d'affichage EN triés. Sert au compteur « X/Y reviews » de l'outil.
 */
export function premiumLimitedRoster(): { premium: string[]; limited: string[] } {
  const chars = getAllCharacters();
  const has = (c: (typeof chars)[number], tag: string) => (c.tags ?? []).some((t) => t === tag);
  const byName = (a: string, b: string) => a.localeCompare(b);
  const premium = chars
    .filter((c) => has(c, PREMIUM_TAG))
    .map((c) => characterDisplayName(c))
    .sort(byName);
  const limited = chars
    .filter(
      (c) =>
        hasTagInGroup(c.tags ?? [], 'limited') && !has(c, PREMIUM_TAG) && !has(c, 'core-fusion'),
    )
    .map((c) => characterDisplayName(c))
    .sort(byName);
  return { premium, limited };
}

/** Lit reviews + priorités dans leurs JSON locaux. */
export function loadPremiumLimited(): PremiumLimitedData {
  const reviews = JSON.parse(readFileSync(plReviewsPath(), 'utf8')) as Partial<ReviewsBundle>;
  const priorities = JSON.parse(readFileSync(plPrioritiesPath(), 'utf8')) as {
    premium?: PriorityOrderData;
    limited?: PriorityOrderData;
  };
  const emptyOrder = (): PriorityOrderData => ({
    first: [],
    second: [],
    third: [],
    transcend: [],
  });
  return {
    reviews: {
      premium: (reviews.premium ?? []).map(normalizeReview),
      limited: (reviews.limited ?? []).map(normalizeReview),
    },
    priorities: {
      premium: priorities.premium ?? emptyOrder(),
      limited: priorities.limited ?? emptyOrder(),
    },
  };
}

/** Valide un lot de reviews (noms résolus, review EN présente). */
function validateReviews(bucket: string, list: ReviewEntryData[], errors: string[]): void {
  list.forEach((r, i) => {
    const at = `${bucket} #${i + 1}`;
    if (!r.name?.trim()) errors.push(`${at}: hero is required.`);
    // Un perso « unreleased » n'est pas encore dans la data : on NE l'exige pas
    // résolvable (sinon la contribution anticipée serait impossible à enregistrer).
    else if (!r.unreleased && !findCharacterByName(r.name))
      errors.push(`${at}: unknown hero “${r.name}”.`);
    if (!r.review?.en?.trim()) errors.push(`${at} (${r.name || '?'}): EN review is required.`);
  });
}
/**
 * `stars` est un PALIER de transcendance (`TransStar`), pas un compte d'étoiles.
 *
 * L'ancienne règle — « entre 1 et 6 » — décrivait des étoiles, et c'est elle qui
 * laissait entrer la faute : un « 6 » saisi pour 6★ passait, puis s'affichait
 * 5★. Elle aurait de surcroît REFUSÉ la valeur correcte, le palier 9.
 *
 * On n'accepte donc que les paliers PLEINS de l'échelle du héros : un éditorial
 * vise 3★/4★/5★/6★, jamais un 5★+. Le message énumère les valeurs valides avec
 * leur libellé, puisque c'est précisément la correspondance qui n'est pas
 * évidente.
 */
function validateOrder<T extends string>(
  bucket: string,
  order: Partial<Record<T, PriorityPickData[]>>,
  tiers: readonly T[],
  errors: string[],
): void {
  tiers.forEach((tier) => {
    (order[tier] ?? []).forEach((p, i) => {
      const at = `${bucket}/${tier} #${i + 1}`;
      if (!p.name?.trim()) return errors.push(`${at}: hero is required.`);
      const c = findCharacterByName(p.name);
      if (!c) return errors.push(`${at}: unknown hero “${p.name}”.`);
      const steps = transcendenceFullSteps(c.rarity, c.id);
      if (!steps.includes(p.stars)) {
        const allowed = steps.map((s) => `${s} (${transcendenceLabel(c.rarity, s, c.id)})`);
        errors.push(
          `${at}: “${p.stars}” is not a full transcendence step — expected ${allowed.join(', ')}.`,
        );
      }
    });
  });
}

/** Valide puis écrit reviews + priorités. Renvoie les écarts bloquants (vide = OK). */
export async function savePremiumLimited(data: PremiumLimitedData): Promise<string[]> {
  const errors: string[] = [];
  validateReviews('Premium', data.reviews.premium, errors);
  validateReviews('Limited', data.reviews.limited, errors);
  validateOrder('Premium', data.priorities.premium, PL_TIERS, errors);
  validateOrder('Limited', data.priorities.limited, PL_TIERS, errors);
  if (errors.length) return errors;

  await writeJson(plReviewsPath(), {
    premium: data.reviews.premium,
    limited: data.reviews.limited,
  });
  await writeJson(plPrioritiesPath(), {
    premium: data.priorities.premium,
    limited: data.priorities.limited,
  });
  return [];
}

/* --- Modèle « Core Fusion » (reviews + priorités de déblocage) --- */

// Forme + normalisation : `core-fusion-shape.ts` (PUR — partagé avec la forme de quick).
export type {
  CoreFusionData,
  FusionPriorityOrderData,
  FusionPriorityPickData,
  FusionReviewData,
} from './core-fusion-shape';

const cfDir = () => resolve(GENERAL_DIR, 'core-fusion');
const cfReviewsPath = () => resolve(cfDir(), 'reviews.json');
const cfPrioritiesPath = () => resolve(cfDir(), 'priorities.json');

/** Un héros fusion du jeu : son nom d'affichage EN (la clé de l'éditorial), son id, ses niveaux de fusion. */
export interface CoreFusionHero {
  name: string;
  id: string;
  levels: number[];
}

/**
 * Les héros FUSION du jeu (les paires base ↔ fusion de `getCoreFusionPairs`),
 * triés par nom d'affichage EN : ceux dont le guide EXIGE la review (une fusion
 * du jeu sans review casse le build), et les niveaux que leur review peut
 * recommander — ceux de la table du jeu, dont le coût dérive.
 */
export function coreFusionRoster(): CoreFusionHero[] {
  return getCoreFusionPairs()
    .map((p) => ({
      name: characterDisplayName(p.fusion),
      id: p.fusion.id,
      levels: p.info.levels.map((l) => l.level).sort((a, b) => a - b),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Lit reviews + priorités de déblocage dans leurs JSON locaux. */
export function loadCoreFusion(): CoreFusionData {
  const reviews = JSON.parse(readFileSync(cfReviewsPath(), 'utf8')) as Partial<FusionReviewData>[];
  const priorities = JSON.parse(
    readFileSync(cfPrioritiesPath(), 'utf8'),
  ) as Partial<FusionPriorityOrderData>;
  const order = emptyFusionOrder();
  for (const tier of FUSION_TIERS) order[tier] = (priorities[tier] ?? []).map(normalizeFusionPick);
  return { reviews: (reviews ?? []).map(normalizeFusionReview), priorities: order };
}

/**
 * Valide les reviews de fusion : le héros est une FUSION DU JEU (la garde du
 * rendu, jouée avant — un nom hors des paires casse le build), sa review EN est
 * écrite, ses niveaux recommandés sont des entiers de SA table de fusion (un
 * niveau absent des paliers du jeu casse le build lui aussi), et `changes` ne
 * porte que ses six clés.
 */
function validateFusionReviews(list: FusionReviewData[], errors: string[]): void {
  const heroes = new Map(coreFusionRoster().map((h) => [h.name, h]));
  list.forEach((r, i) => {
    const at = `Reviews #${i + 1}`;
    const named = `${at} (${r.name || '?'})`;
    const hero = heroes.get(r.name ?? '');
    if (!r.name?.trim()) errors.push(`${at}: hero is required.`);
    else if (!findCharacterByName(r.name)) errors.push(`${at}: unknown hero “${r.name}”.`);
    else if (!hero) errors.push(`${at}: “${r.name}” is not a core fusion.`);
    if (!r.review?.en?.trim()) errors.push(`${named}: EN review is required.`);
    const levels: unknown = r.recommendedLevels;
    if (!Array.isArray(levels) || levels.some((l) => !Number.isInteger(l)))
      errors.push(`${named}: recommended levels must be integers.`);
    else if (hero) {
      const stray = (levels as number[]).filter((l) => !hero.levels.includes(l));
      if (stray.length)
        errors.push(
          `${named}: “${stray.join(', ')}” is not a fusion level — expected ${hero.levels.join(', ')}.`,
        );
    }
    const known: readonly string[] = FUSION_CHANGE_KEYS;
    for (const key of Object.keys(r.changes ?? {}))
      if (!known.includes(key))
        errors.push(`${named}: unknown change “${key}” — expected ${known.join(', ')}.`);
  });
}

/** Valide puis écrit reviews + priorités de déblocage. Renvoie les écarts bloquants (vide = OK). */
export async function saveCoreFusion(data: CoreFusionData): Promise<string[]> {
  const errors: string[] = [];
  validateFusionReviews(data.reviews, errors);
  validateOrder('Priorities', data.priorities, FUSION_TIERS, errors);
  for (const tier of FUSION_TIERS)
    (data.priorities[tier] ?? []).forEach((p, i) => {
      if (p.op !== null && !isFusionOp(p.op))
        errors.push(
          `Priorities/${tier} #${i + 1}: “${String(p.op)}” is not a relation — expected >, >= or null.`,
        );
    });
  if (errors.length) return errors;

  // Les deux écritures sont solidaires, comme celles de Premium & Limited.
  await writeJson(cfReviewsPath(), data.reviews.map(normalizeFusionReview));
  const order = emptyFusionOrder();
  for (const tier of FUSION_TIERS)
    order[tier] = (data.priorities[tier] ?? []).map(normalizeFusionPick);
  await writeJson(cfPrioritiesPath(), order);
  return [];
}
