import { nodeTypes } from "@/lib/monad/nodeTypes";
import type { LangMap } from "@/lib/localize";

export type NodeType = keyof typeof nodeTypes;

export interface MonadNode {
  id: string;
  x: number;
  y: number;
  type: NodeType;
  label?: string;
  popupText?: string;
  truePath?: boolean;
}

export interface MonadEdge {
  from: string;
  to: string;
  label?: LangMap | string;
  need?: LangMap | string;
  truePath?: boolean;
}
