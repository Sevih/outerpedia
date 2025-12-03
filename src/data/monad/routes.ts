import * as route11 from "./depth1-route1";
import * as route81 from "./depth8-route1";
import * as route82 from "./depth8-route2";
import * as route101 from "./depth10-route1";
import * as route102 from "./depth10-route2";
import * as defaultRoute from "./defaultRoute";
import type { MonadNode, MonadEdge } from "@/types/monad";

export const routes: Record<string, {
  routeTitle: string;
  nodes: MonadNode[];
  edges: MonadEdge[];
}> = {
  "Default": defaultRoute,
  "Deeps 1 – Route 1": route11,
  "Deeps 8 – Route 1": route81,
  "Deeps 8 – Route 2": route82,
  "Deeps 10 – Route 1": route101,
  "Deeps 10 – Route 2": route102,
};


export type RouteKey = keyof typeof routes;
