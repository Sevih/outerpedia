/**
 * FORME du guide « Core Fusion » — ses priorités de déblocage et ses reviews,
 * telles que `core-fusion/priorities.json` et `core-fusion/reviews.json` les
 * portent : types, constantes, normalisation, sans aucune I/O.
 *
 * Module volontairement PUR (ni `node:fs`, ni store), comme `review-shape.ts`
 * et `shop-priorities-shape.ts` : il est importé par le store, qui lit et
 * écrit les deux JSON, et par `general-guide-form.ts`, qui décrit ce que quick
 * édite — et qui ne peut pas tirer le store.
 *
 * Les types du RENDU restent à côté des données (`FusionPriorityPick`,
 * `FusionReviewEntry` de `core-fusion/*.ts`) ; ceux-ci en sont le miroir côté
 * édition, comme `ReviewEntryData` l'est de `HeroReviewEntry`.
 */
import type { LocalizedText } from '@contracts';
import { hasText } from './review-shape';

/** Les paliers de déblocage, dans l'ordre de la page. */
export const FUSION_TIERS = ['first', 'second', 'third'] as const;
export type FusionTier = (typeof FUSION_TIERS)[number];

/** La relation d'une priorité avec la SUIVANTE : strictement avant, avant ou égal — ou rien (`null`). */
export const FUSION_OPS = ['>', '>='] as const;
export type FusionOp = (typeof FUSION_OPS)[number];

/** Ce qu'une review dit changer à la fusion, dans l'ordre du fichier et de la page. */
export const FUSION_CHANGE_KEYS = ['s1', 's2', 's3', 'chain', 'passive', 'transcendence'] as const;
export type FusionChangeKey = (typeof FUSION_CHANGE_KEYS)[number];

export interface FusionPriorityPickData {
  name: string;
  /** Un PALIER de transcendance (`TransStar`), comme les priorités de Premium & Limited. */
  stars: number;
  op: FusionOp | null;
}
export type FusionPriorityOrderData = Record<FusionTier, FusionPriorityPickData[]>;

export type FusionChangesData = Partial<Record<FusionChangeKey, LocalizedText>>;

export interface FusionReviewData {
  name: string;
  review: LocalizedText;
  /** Niveaux de fusion recommandés (les paliers du JEU ; leur coût en dérive). */
  recommendedLevels: number[];
  changes?: FusionChangesData;
}

export interface CoreFusionData {
  reviews: FusionReviewData[];
  priorities: FusionPriorityOrderData;
}

export const isFusionOp = (v: unknown): v is FusionOp =>
  (FUSION_OPS as readonly unknown[]).includes(v);

export const emptyFusionOrder = (): FusionPriorityOrderData => ({
  first: [],
  second: [],
  third: [],
});

/** Une priorité chargée : ses trois clés, dans l'ordre du fichier ; un `op` absent vaut `null`. */
export function normalizeFusionPick(p: Partial<FusionPriorityPickData>): FusionPriorityPickData {
  return {
    name: p.name ?? '',
    stars: p.stars as number,
    op: p.op === undefined ? null : p.op,
  };
}

/**
 * Normalise une review chargée ou venue de la page : les clés du fichier dans
 * leur ordre, et de `changes` les SEULS textes qui portent quelque chose, dans
 * l'ordre de `FUSION_CHANGE_KEYS` — aucun : `changes` est absent (JSON mince,
 * et le rendu ne titre pas une liste vide). Une clé inconnue de `changes` est
 * GARDÉE : c'est au store de la refuser, pas à la normalisation de la taire.
 */
export function normalizeFusionReview(r: Partial<FusionReviewData>): FusionReviewData {
  const raw = (r.changes ?? {}) as Record<string, LocalizedText | undefined>;
  const changes: Record<string, LocalizedText> = {};
  const known: readonly string[] = FUSION_CHANGE_KEYS;
  for (const key of [...known, ...Object.keys(raw).filter((k) => !known.includes(k))]) {
    const text = raw[key];
    if (hasText(text)) changes[key] = text as LocalizedText;
  }
  return {
    name: r.name ?? '',
    review: r.review ?? { en: '' },
    recommendedLevels: r.recommendedLevels ?? [],
    ...(Object.keys(changes).length ? { changes: changes as FusionChangesData } : {}),
  };
}
