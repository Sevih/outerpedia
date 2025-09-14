import * as route81 from "./depth8-route1";
import * as route82 from "./depth8-route2";
import * as defaultRoute from "./defaultRoute";
import type { MonadNode, MonadEdge } from "@/types/monad";

export const routes: Record<string, {
  routeTitle: string;
  nodes: MonadNode[];
  edges: MonadEdge[];
}> = {
  "Default": defaultRoute,
  "Deeps 8 – Route 1": route81,
  "Deeps 8 – Route 2": route82,
};


export type RouteKey = keyof typeof routes;
