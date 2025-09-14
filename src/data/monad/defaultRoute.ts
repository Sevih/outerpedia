import type { MonadNode, MonadEdge } from "@/types/monad";

export const routeTitle = "New Route";

export const nodes: MonadNode[] = [
  {
    id: "A",
    x: 0,
    y: 0,
    type: "start",
    truePath: true,
  },
];

export const edges: MonadEdge[] = [];
