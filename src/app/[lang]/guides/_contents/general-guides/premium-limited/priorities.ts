/**
 * Priorités de pull/transcendance — VERBATIM V2 (premium-priorities.json).
 * `stars` = étoile CIBLE affichée sous le portrait (pas la rareté).
 *
 * Priorités éditables (JSON) : sorties du TS pour l'admin. Rendu inchangé.
 */
import prioritiesData from './premium-priorities.json';

export interface PriorityPick {
  name: string;
  stars: number;
}

export interface PriorityOrder {
  first: PriorityPick[];
  second: PriorityPick[];
  third: PriorityPick[];
  transcend: PriorityPick[];
}

export const premiumOrder: PriorityOrder = prioritiesData.premium as PriorityOrder;
export const limitedOrder: PriorityOrder = prioritiesData.limited as PriorityOrder;
