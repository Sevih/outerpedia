'use client';

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import type { MonadNode, MonadEdge, NodeType } from "@/types/monad";
import { nodeTypes as defaultNodeTypes } from "@/lib/monad/nodeTypes";

const NODE_WIDTH = 100;
const NODE_HEIGHT = 80;
const NODE_GAP = 20;

interface MonadGateMapProps {
    nodes: MonadNode[];
    edges: MonadEdge[];
    nodeTypes?: typeof defaultNodeTypes;
    title?: string;
}

const MonadGateMap: React.FC<MonadGateMapProps> = ({
    nodes,
    edges,
    nodeTypes = defaultNodeTypes,
    title,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [drag, setDrag] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });

    const typeColors: Record<NodeType, string> = Object.fromEntries(
        Object.entries(nodeTypes).map(([key, val]) => [key, val.color])
    ) as Record<NodeType, string>;

    const maxX = Math.max(...nodes.map(n => n.x));
    const minY = Math.min(...nodes.map(n => n.y));
    const maxY = Math.max(...nodes.map(n => n.y));
    const getNodeById = (id: string) => nodes.find((n) => n.id === id)!;

    const startDragging = (clientX: number, clientY: number) => {
        setIsDragging(true);
        setStartDrag({ x: clientX - drag.x, y: clientY - drag.y });
    };

    const updateDrag = (clientX: number, clientY: number) => {
        if (isDragging) {
            setDrag({ x: clientX - startDrag.x, y: clientY - startDrag.y });
        }
    };

    const stopDragging = () => setIsDragging(false);
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        startDragging(e.clientX, e.clientY);
    };
    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        startDragging(touch.clientX, touch.clientY);
    };
    const handleTouchMove = (e: TouchEvent) => {
        if (isDragging) {
            const touch = e.touches[0];
            updateDrag(touch.clientX, touch.clientY);
        }
    };
    const handleMouseMove = (e: MouseEvent) => updateDrag(e.clientX, e.clientY);

    const handleWheel = (e: React.WheelEvent) => {
        if (containerRef.current?.contains(e.target as Node)) {
            e.preventDefault();
            const delta = -e.deltaY * 0.001;
            setScale(prev => Math.min(2, Math.max(0.5, prev + delta)));
        }
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheelCapture = (e: WheelEvent) => {
            if (container.contains(e.target as Node)) {
                e.preventDefault();
            }
        };

        let initialDistance = 0;
        let initialScale = scale;

        const getDistance = (touches: TouchList) => {
            const dx = touches[0].clientX - touches[1].clientX;
            const dy = touches[0].clientY - touches[1].clientY;
            return Math.sqrt(dx * dx + dy * dy);
        };

        const handleTouchStartPinch = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                initialDistance = getDistance(e.touches);
                initialScale = scale;
            }
        };

        const handleTouchMovePinch = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const newDistance = getDistance(e.touches);
                const zoomFactor = newDistance / initialDistance;
                setScale(Math.min(2, Math.max(0.5, initialScale * zoomFactor)));
            }
        };

        container.addEventListener("wheel", handleWheelCapture, { passive: false });
        container.addEventListener("touchstart", handleTouchStartPinch, { passive: false });
        container.addEventListener("touchmove", handleTouchMovePinch, { passive: false });

        return () => {
            container.removeEventListener("wheel", handleWheelCapture);
            container.removeEventListener("touchstart", handleTouchStartPinch);
            container.removeEventListener("touchmove", handleTouchMovePinch);
        };
    }, []);

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", stopDragging);
        window.addEventListener("touchmove", handleTouchMove);
        window.addEventListener("touchend", stopDragging);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", stopDragging);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("touchend", stopDragging);
        };
    }, [isDragging, startDrag]);

    const resetView = () => {
        setDrag({ x: 0, y: 0 });
        setScale(1);
    };

    return (
        <div className="relative">
            {title && <h2 className="text-lg font-bold mb-2">{title}</h2>}
            <button
                className="absolute right-4 top-4 z-20 px-3 py-1 bg-zinc-800 text-white border border-zinc-500 rounded shadow"
                onClick={resetView}
            >
                Reset
            </button>

            <div
                ref={containerRef}
                className={`relative w-full max-h-[70vh] md:h-[500px] overflow-x-auto overflow-y-hidden border bg-zinc-900 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
                    } touch-none select-none`}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onWheel={handleWheel}
            >
                <div
                    ref={contentRef}
                    className={`${isDragging ? '' : 'transition-transform duration-300'}`}
                    style={{
                        position: 'relative',
                        minWidth: '100%',
                        width: `${(maxX + 1) * (NODE_WIDTH + NODE_GAP)}px`,
                        transform: `translate(${drag.x}px, ${drag.y}px) scale(${scale})`,
                        transformOrigin: '0 0',
                        minHeight: '200px',
                    }}
                >
                    <svg
                        className="absolute z-0 pointer-events-none"
                        style={{
                            width: `${(maxX + 1) * (NODE_WIDTH + NODE_GAP)}px`,
                            height: `${(Math.abs(minY) + 1 + Math.max(...nodes.map(n => n.y))) * (NODE_HEIGHT + NODE_GAP)}px`,
                            minHeight: '200px',
                        }}
                    >
                        <defs>
                            <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
                                <path d="M0,0 L0,6 L6,3 z" fill="white" />
                            </marker>
                        </defs>
                        {edges.map((edge, idx) => {
                            const from = getNodeById(edge.from);
                            const to = getNodeById(edge.to);
                            const fromX = from.x * (NODE_WIDTH + NODE_GAP) + NODE_WIDTH - 10; // avant : -20
                            const fromY = (maxY - from.y) * (NODE_HEIGHT + NODE_GAP) + (NODE_HEIGHT - 20) / 2 + NODE_GAP;

                            const toX = to.x * (NODE_WIDTH + NODE_GAP) + NODE_GAP;
                            const toY = (maxY - to.y) * (NODE_HEIGHT + NODE_GAP) + (NODE_HEIGHT - 20) / 2 + NODE_GAP;

                            const midX = fromX + (toX - fromX) / 2;

                            return (
                                <g key={idx}>
                                    <path
                                        d={`M${fromX},${fromY} L${midX},${fromY} L${midX},${toY} L${toX},${toY}`}
                                        fill="none"
                                        stroke="white"
                                        strokeWidth={2}
                                        markerEnd="url(#arrowhead)"
                                    />
                                    {edge.label && (
                                        <>
                                            <rect
                                                x={(fromX + toX) / 2 - 30}
                                                y={(fromY + toY) / 2 - 12}
                                                width={60}
                                                height={18}
                                                fill="black"
                                                fillOpacity={0.6}
                                                rx={4}
                                            />
                                            <text
                                                x={(fromX + toX) / 2}
                                                y={(fromY + toY) / 2}
                                                fill="white"
                                                fontSize={11}
                                                textAnchor="middle"
                                                alignmentBaseline="middle"
                                            >
                                                {edge.label}
                                            </text>
                                        </>
                                    )}
                                </g>
                            );
                        })}
                    </svg>

                    {nodes.map((node) => (
                        <div
                            key={node.id}
                            title={node.label || nodeTypes[node.type]?.label}
                            className={`absolute rounded px-2 py-1 text-xs text-white border border-white shadow ${typeColors[node.type]}`}
                            style={{
                                left: node.x * (NODE_WIDTH + NODE_GAP) + NODE_GAP,
                                top: (maxY - node.y) * (NODE_HEIGHT + NODE_GAP) + NODE_GAP,
                                width: NODE_WIDTH - 20,
                                height: NODE_HEIGHT - 20,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Image
                                src={`/images/guides/monad-gate/${nodeTypes[node.type]?.icon}.webp`}
                                alt={node.type}
                                width={25}
                                height={25}
                                className="mb-1 object-contain"
                            />
                            <div className="text-center text-xs">
                                {nodeTypes[node.type]?.label || node.id}
                            </div>
                            {node.label && (
                                <div className="text-[10px] italic text-center">{node.label}</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MonadGateMap;
