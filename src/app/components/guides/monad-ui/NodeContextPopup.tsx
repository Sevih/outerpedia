'use client';

import React from "react";
import type { MonadNode } from "@/types/monad";
import { nodeTypes } from "@/lib/monad/nodeTypes";

interface NodeContextPopupProps {
  node: MonadNode;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'left' | 'right' | 'bottom' | 'top';
}

export const NodeContextPopup: React.FC<NodeContextPopupProps> = ({
  node,
  onClose,
  children,
  position = 'bottom',
}) => {
  const positionClasses = {
    bottom: "left-4 bottom-4",
    top: "left-4 top-4",
    right: "right-4 bottom-4",
    left: "left-4 top-1/2 -translate-y-1/2",
  };

  return (
    <div
      className={`absolute z-50 bg-zinc-900 text-white border border-white p-4 rounded w-[300px] shadow-xl ${positionClasses[position]}`}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="font-semibold text-sm">
          {node.label ?? nodeTypes[node.type]?.label ?? node.id}

        </div>
        <button
          onClick={onClose}
          className="text-white text-xs hover:text-red-400 transition"
        >
          ✖
        </button>
      </div>

      {/* ✅ texte libre ajouté ici */}
      {node.popupText && (
        <p className="text-xs text-gray-300 mb-3 whitespace-pre-line">
          {node.popupText}
        </p>
      )}

      <div className="space-y-3">{children}</div>
    </div>
  );
};

