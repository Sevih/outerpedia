import { nodeTypes } from "@/lib/monad/nodeTypes";

export type NodeType = keyof typeof nodeTypes;

export interface MonadNode {
  id: string;
  x: number;
  y: number;
  type: NodeType;
  label?: string;
  popupText?: string;
  truePath?:boolean
}

export interface MonadEdge {
  from: string;
  to: string;
  label?: string;
  need?:string;
  truePath?:boolean
}
