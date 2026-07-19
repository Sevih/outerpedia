/**
 * Reviews ÉDITORIALES du guide « Premium & Limited » — transplantées VERBATIM
 * de la V2 (data/premium_limited_data.json, oracle de contenu). Persos désignés
 * par NOM D'AFFICHAGE EN (un nom inconnu casse le build à la résolution) ; les
 * reviews passent par parse-text (tags {B}/{D}/{C}… contrôlés au build).
 */
import type { LocalizedText } from '@contracts';
import reviewsData from './premium-reviews.json';

export interface HeroReviewEntry {
  name: string;
  review: LocalizedText;
  /** Cibles de transcendance recommandées (texte éditorial : « 4 to 5 », « Any »…). */
  recommendedPve: string;
  recommendedPvp: string;
  /** Note éditoriale (1-5) par étoile de transcendance, PvE/PvP. */
  impact: Record<'3' | '4' | '5' | '6', { pve: string; pvp: string }>;
  /** Perso pas encore sorti (review écrite d'avance) : SAUTÉ au rendu tant que
   * le nom ne résout pas ; apparaît tout seul à la sortie du perso. */
  unreleased?: boolean;
}

// Reviews éditables (JSON) : sorties du TS pour l'admin + contribution publique
// (export/import Shiraen). Rendu index.tsx inchangé (mêmes exports).
export const premiumReviews: HeroReviewEntry[] = reviewsData.premium as HeroReviewEntry[];
export const limitedReviews: HeroReviewEntry[] = reviewsData.limited as HeroReviewEntry[];
