'use client';

import React from "react";
import type { MonadEdge, MonadNode } from "@/types/monad";
import { nodeTypes } from "@/lib/monad/nodeTypes";

interface PathOptionsContentProps {
    node: MonadNode;
    edges: MonadEdge[];
    getNodeById: (id: string) => MonadNode;
    showTruePath?: boolean; // <- doit exister
}


export const PathOptionsContent: React.FC<PathOptionsContentProps> = ({
    node,
    edges,
    getNodeById,
    showTruePath, // 👈 ajoute ceci ici
}) => {

    const outgoing = edges
        .filter(e => e.from === node.id)
        .sort((a, b) => {
            const nodeA = getNodeById(a.to);
            const nodeB = getNodeById(b.to);
            return nodeB.y - nodeA.y; // ordre du plus haut vers le plus bas
        });

    if (outgoing.length === 0) return <div className="text-sm">No options available.</div>;

    return (
        <>
            {outgoing.map((edge, i) => {
                const toNode = getNodeById(edge.to);
                const isTrue = edge.truePath === true;

                const shouldDim = showTruePath && !isTrue;
                const highlight = showTruePath && isTrue;

                return (
                    <div
                        key={i}
                        className={`rounded px-3 py-2 border text-sm
                ${shouldDim ? "bg-zinc-800 text-zinc-500 border-zinc-700" : ""}
                ${highlight ? "bg-green-700 text-white border-green-500" : "bg-zinc-800 text-white border-zinc-700"}`}
                    >
                        <div className="italic">
                            {edge.label?.trim() || "(Unnamed path)"}
                        </div>
                        {edge.need && (
                            <div className="text-xs text-yellow-400 mt-1 italic">
                                <span className="mr-1">🔒</span>
                                Required : {edge.need}
                            </div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                            → {toNode.label ?? nodeTypes[toNode.type]?.label ?? toNode.id}
                        </div>
                    </div>
                );
            })}

        </>
    );
};
