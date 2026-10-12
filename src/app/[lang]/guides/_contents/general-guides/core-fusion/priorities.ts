/**
 * Priorités de déblocage — VERBATIM (`priorities.json`, à côté, comme le
 * pendant premium `premium-priorities.json`).
 * `op` relie une entrée à la SUIVANTE (`>` strictement avant, `>=`).
 *
 * Priorités éditables (JSON) : sorties du TS pour quick. Rendu inchangé.
 */
import prioritiesData from './priorities.json';

export interface FusionPriorityPick {
  name: string;
  stars: number;
  op: '>' | '>=' | null;
}

// Un `type`, pas une `interface` : `Object.entries(unlockOrder)` doit rester typé
// (`priorities.test.ts` de premium-limited parcourt les paliers ainsi).
export type FusionPriorityOrder = {
  first: FusionPriorityPick[];
  second: FusionPriorityPick[];
  third: FusionPriorityPick[];
};

export const unlockOrder: FusionPriorityOrder = prioritiesData as FusionPriorityOrder;
