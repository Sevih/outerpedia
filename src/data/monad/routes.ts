import * as route11 from "./depth1-route1";
import * as route21 from "./depth2-route1";
import * as route31 from "./depth3-route1";
import * as route41 from "./depth4-route1";
import * as route42 from "./depth4-route2";
import * as route51 from "./depth5-route1";
import * as route81 from "./depth8-route1";
import * as route82 from "./depth8-route2";
import * as route91 from "./depth9-route1";
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
  "Deeps 2 – Route 1": route21,
  "Deeps 3 – Route 1": route31,
  "Deeps 4 – Route 1": route41,
  "Deeps 4 – Route 2": route42,
  "Deeps 5 – Route 1": route51,
  "Deeps 8 – Route 1": route81,
  "Deeps 8 – Route 2": route82,
  "Deeps 9 – Route 1": route91,
  "Deeps 10 – Route 1": route101,
  "Deeps 10 – Route 2": route102,
};

export type RouteKey = keyof typeof routes;
