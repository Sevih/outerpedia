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
import { characterDisplayName, findCharacterByName, getAllCharacters } from '@/lib/data/characters';

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
  return slug in EDITABLE_GENERAL_GUIDES;
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

const STARS = ['3', '4', '5', '6'] as const;
type StarKey = (typeof STARS)[number];

export interface ReviewEntryData {
  name: string;
  review: LocalizedText;
  /** Cibles de transcendance recommandées (texte éditorial : « 4 to 5 », « Any »…). */
  recommendedPve: string;
  recommendedPvp: string;
  /** Note éditoriale (1-5) par étoile de transcendance, PvE/PvP. */
  impact: Record<StarKey, { pve: string; pvp: string }>;
  /**
   * Perso PAS ENCORE SORTI (absent de la data du site) : la review est rédigée
   * d'avance (contribution). On N'exige PAS que le nom résolve, et le rendu du
   * guide SAUTE l'entrée tant que le perso n'existe pas — elle apparaît toute
   * seule à la sortie (cf. `reviewCards`).
   */
  unreleased?: boolean;
}
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

const emptyImpact = (): ReviewEntryData['impact'] => ({
  '3': { pve: '', pvp: '' },
  '4': { pve: '', pvp: '' },
  '5': { pve: '', pvp: '' },
  '6': { pve: '', pvp: '' },
});

/** Normalise une review chargée/importée (impact complet, champs présents). */
export function normalizeReview(r: Partial<ReviewEntryData>): ReviewEntryData {
  const impact = emptyImpact();
  for (const s of STARS) {
    const cell = r.impact?.[s];
    if (cell) impact[s] = { pve: cell.pve ?? '', pvp: cell.pvp ?? '' };
  }
  return {
    name: r.name ?? '',
    review: (r.review ?? { en: '' }) as LocalizedText,
    recommendedPve: r.recommendedPve ?? '',
    recommendedPvp: r.recommendedPvp ?? '',
    impact,
    ...(r.unreleased ? { unreleased: true } : {}),
  };
}

const PREMIUM_TAG = 'premium';
const LIMITED_TAGS = ['limited', 'seasonal', 'collab'];

/**
 * Rosters « à reviewer » dérivés des TAGS de perso (source unique, toujours à
 * jour) : Premium = tag `premium` ; Limited = `limited`/`seasonal`/`collab`
 * (hors `premium`/`core-fusion`, qui ont leurs propres bannières/guides).
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
        (c.tags ?? []).some((t) => LIMITED_TAGS.includes(t)) &&
        !has(c, PREMIUM_TAG) &&
        !has(c, 'core-fusion'),
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
function validateOrder(bucket: string, order: PriorityOrderData, errors: string[]): void {
  (['first', 'second', 'third', 'transcend'] as const).forEach((tier) => {
    (order[tier] ?? []).forEach((p, i) => {
      const at = `${bucket}/${tier} #${i + 1}`;
      if (!p.name?.trim()) errors.push(`${at}: hero is required.`);
      else if (!findCharacterByName(p.name)) errors.push(`${at}: unknown hero “${p.name}”.`);
      if (!(p.stars >= 1 && p.stars <= 6)) errors.push(`${at}: invalid star (1-6).`);
    });
  });
}

/** Valide puis écrit reviews + priorités. Renvoie les écarts bloquants (vide = OK). */
export async function savePremiumLimited(data: PremiumLimitedData): Promise<string[]> {
  const errors: string[] = [];
  validateReviews('Premium', data.reviews.premium, errors);
  validateReviews('Limited', data.reviews.limited, errors);
  validateOrder('Premium', data.priorities.premium, errors);
  validateOrder('Limited', data.priorities.limited, errors);
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
