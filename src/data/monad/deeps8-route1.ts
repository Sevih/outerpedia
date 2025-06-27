import type { MonadNode, MonadEdge } from "@/types/monad";

export const routeTitle = "Deeps 8 – Route 1";

export const nodes: MonadNode[] = [
    { id: "A", x: 0, y: 0, type: "start" },
    { id: "B", x: 1, y: 0, type: "relic" },
    { id: "C", x: 1, y: 1, type: "combat" },
    { id: "D", x: 1, y: -1, type: "combat" },
    { id: "E", x: 2, y: 0, type: "moment" },
    { id: "F", x: 3, y: 0, type: "path" },
    { id: "G", x: 4, y: 1, type: "relic" },
    { id: "H", x: 4, y: -1, type: "unknown" },

    //siscion G
    { id: "GA", x: 5, y: 1, type: "elite" },
    { id: "GB", x: 5, y: 2, type: "combat" },
    { id: "GC", x: 6, y: 1, type: "moment" },
    { id: "GD", x: 6, y: 2, type: "unknown" },

    { id: "GE", x: 7, y: 2, type: "combat" },

    { id: "GF", x: 8, y: 2, type: "relic" },
    { id: "GG", x: 8, y: 1, type: "combat" },
    { id: "GH", x: 8, y: 3, type: "combat" },

    { id: "GI", x: 9, y: 2, type: "combat" },
    { id: "GJ", x: 9, y: 1, type: "relic" },
    { id: "GK", x: 9, y: 3, type: "relic" },

    { id: "GL", x: 10, y: 1, type: "unknown" },
    { id: "GM", x: 10, y: 2, type: "combat" },

    { id: "GN", x: 11, y: 1, type: "unknown" },
    { id: "GO", x: 11, y: 2, type: "combat" },

     { id: "GP", x: 12, y: 1, type: "moment" },
     { id: "GQ", x: 13, y: 1, type: "path" },
    
];

export const edges: MonadEdge[] = [
    { from: "A", to: "B" },
    { from: "A", to: "C" },
    { from: "A", to: "D" },
    { from: "B", to: "E" },
    { from: "C", to: "E" },
    { from: "D", to: "E" },
    { from: "E", to: "F" },
    { from: "F", to: "G", label: "Force our way through" },
    { from: "F", to: "H", label: "Look for another way" },

    //siscion G
    { from: "G", to: "GA" },
    { from: "G", to: "GB" },
    { from: "GA", to: "GC" },
    { from: "GB", to: "GD" },
    { from: "GC", to: "GE" },
    { from: "GD", to: "GE" },
    { from: "GE", to: "GF" },
    { from: "GE", to: "GG" },
    { from: "GE", to: "GH" },
    { from: "GF", to: "GI" },
    { from: "GG", to: "GJ" },
    { from: "GH", to: "GK" },
    { from: "GK", to: "GM" },
    { from: "GI", to: "GM" },
    { from: "GI", to: "GL" },
    { from: "GJ", to: "GM" },
    { from: "GJ", to: "GL" },

    { from: "GL", to: "GO" },
    { from: "GL", to: "GN" },
    { from: "GM", to: "GO" },
    { from: "GM", to: "GN" },
];
