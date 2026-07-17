/**
 * Priorités de déblocage — VERBATIM V2 (core-fusion-priorities.json).
 * `op` relie une entrée à la SUIVANTE (`>` strictement avant, `>=`).
 */
export interface FusionPriorityPick {
  name: string;
  stars: number;
  op: '>' | '>=' | null;
}

export const unlockOrder: {
  first: FusionPriorityPick[];
  second: FusionPriorityPick[];
  third: FusionPriorityPick[];
} = {
  first: [
    { name: 'Core Fusion Veronica', stars: 3, op: '>' },
    { name: 'Core Fusion Eternal', stars: 3, op: '>' },
    { name: 'Core Fusion Notia', stars: 3, op: '>' },
    { name: 'Core Fusion Epsilon', stars: 3, op: '>' },
  ],
  second: [
    { name: 'Core Fusion Lisha', stars: 3, op: '>' },
    { name: 'Core Fusion Snow', stars: 3, op: null },
  ],
  third: [],
};
