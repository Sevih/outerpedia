/**
 * Reviews ÉDITORIALES du guide « Core Fusion » — transplantées VERBATIM de la
 * l'ancien site (data/core_fusion_data.json, oracle). `recommendedLevels`
 * vient de ce texte (« 3 or 5 ») ; les COÛTS de ces niveaux dérivent des
 * tables du jeu (fusionCumulativeCosts), plus de constantes en dur.
 */
import type { LocalizedText } from '@contracts';
import reviewsData from './reviews.json';

export interface FusionChanges {
  s1?: LocalizedText;
  s2?: LocalizedText;
  s3?: LocalizedText;
  chain?: LocalizedText;
  passive?: LocalizedText;
  transcendence?: LocalizedText;
}

export interface FusionReviewEntry {
  name: string;
  review: LocalizedText;
  /** Niveaux de fusion recommandés (paliers du jeu, coût dérivé). */
  recommendedLevels: number[];
  changes?: FusionChanges;
}

// Reviews éditables (JSON) : sorties du TS pour quick. Rendu index.tsx inchangé
// (même export).
export const fusionReviews: FusionReviewEntry[] = reviewsData as FusionReviewEntry[];
