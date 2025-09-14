'use client';
import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import type { MonadNode, MonadEdge } from "@/types/monad";
import { nodeTypes as defaultNodeTypes, nodeColorFilters } from "@/lib/monad/nodeTypes";
import { NodeContextPopup, PathOptionsContent } from "@/app/components/guides/monad-ui";
const NODE_WIDTH = 200;
const NODE_HEIGHT = 100;
const NODE_GAP = 60;
const ZOOM_SENSITIVITY = 0.04; // ← de 0.02 (très doux) à 0.1 (rapide)

interface MonadGateMapProps {
    nodes: MonadNode[];
    edges: MonadEdge[];
    nodeTypes?: typeof defaultNodeTypes;
    title?: string;
    onNodeClick?: (id: string) => void;
    adminMode?: boolean; // ✅ AJOUT
    onEdgeClick?: (id: string) => void;
}
const MonadGateMap: React.FC<MonadGateMapProps> = ({
    nodes,
    edges,
    nodeTypes = defaultNodeTypes,
    title,
    onNodeClick,
    adminMode = false, // ✅ valeur par défaut
    onEdgeClick,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const fullscreenRef = useRef<HTMLDivElement>(null);
    const [drag, setDrag] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });
    const [selectedNode, setSelectedNode] = useState<MonadNode | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showOnlyTruePath, setShowOnlyTruePath] = useState(false);
    const hasCenteredOnce = useRef(false);
    const scaleRef = useRef(scale);
    const initialDistanceRef = useRef(0);
    const dragRef = useRef(drag);
    useEffect(() => {
        scaleRef.current = scale;
    }, [scale]);


    useEffect(() => {
        dragRef.current = drag;
    }, [drag]);


    const zoomAt = (zoomFactor: number, centerX: number, centerY: number) => {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const offsetX = centerX - rect.left;
        const offsetY = centerY - rect.top;

        const currentScale = scaleRef.current;
        const currentDrag = dragRef.current;
        const newScale = Math.min(2, Math.max(0.5, currentScale * zoomFactor));

        const xRel = (offsetX - currentDrag.x) / currentScale;
        const yRel = (offsetY - currentDrag.y) / currentScale;

        const newX = offsetX - xRel * newScale;
        const newY = offsetY - yRel * newScale;

        setDrag({ x: newX, y: newY });
        setScale(newScale);
    };





    const toggleFullscreen = () => {
        const el = fullscreenRef.current;
        if (!el) return;
        if (!document.fullscreenElement) {
            el.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    };
    useEffect(() => {
        const handleExit = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handleExit);
        return () => document.removeEventListener("fullscreenchange", handleExit);
    }, []);
    const maxX = Math.max(...nodes.map(n => n.x));
    const minY = Math.min(...nodes.map(n => n.y));
    const maxY = Math.max(...nodes.map(n => n.y));
    const getNodeById = (id: string) => nodes.find((n) => n.id === id)!;
    const startDragging = (clientX: number, clientY: number) => {
        setIsDragging(true);
        setStartDrag({ x: clientX - drag.x, y: clientY - drag.y });
    };
    const updateDrag = useCallback((clientX: number, clientY: number) => {
        if (isDragging) {
            setDrag({ x: clientX - startDrag.x, y: clientY - startDrag.y });
        }
    }, [isDragging, startDrag]);

    const stopDragging = () => setIsDragging(false);
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        startDragging(e.clientX, e.clientY);
    };
    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        startDragging(touch.clientX, touch.clientY);
    };
    const handleMouseMove = useCallback((e: MouseEvent) => {
        updateDrag(e.clientX, e.clientY);
    }, [updateDrag]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (isDragging) {
            const touch = e.touches[0];
            updateDrag(touch.clientX, touch.clientY);
        }
    }, [updateDrag, isDragging]);
    const initialRender = useRef(true);

    useEffect(() => {
        if (hasCenteredOnce.current) return;
        if (initialRender.current) {
            initialRender.current = false;
            return; // skip first render
        }

        // Ne pas reset le zoom ici
    }, [nodes, edges]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const handleWheelCapture = (e: WheelEvent) => {
            if (container.contains(e.target as Node)) {
                e.preventDefault();
            }
        };

        const getDistance = (touches: TouchList) => {
            const dx = touches[0].clientX - touches[1].clientX;
            const dy = touches[0].clientY - touches[1].clientY;
            return Math.sqrt(dx * dx + dy * dy);
        };


        const handleTouchStartPinch = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                initialDistanceRef.current = getDistance(e.touches);
            }
        };

        const handleTouchMovePinch = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const newDistance = getDistance(e.touches);
                let zoomFactor = newDistance / initialDistanceRef.current;

                // Clamp et seuil
                zoomFactor = Math.max(1 - ZOOM_SENSITIVITY, Math.min(1 + ZOOM_SENSITIVITY, zoomFactor));
                if (Math.abs(zoomFactor - 1) < 0.01) return;

                const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

                zoomAt(zoomFactor, centerX, centerY);

                // Update la distance pour un zoom fluide
                initialDistanceRef.current = newDistance;
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
    }, [scale]);
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
    }, [isDragging, startDrag, handleMouseMove, handleTouchMove]);
    const resetView = () => {
        setDrag({ x: 0, y: 0 });
        setScale(1);
    };

    useEffect(() => {
        if (hasCenteredOnce.current) return;

        const startNode = nodes.find(n => n.type === 'start');
        if (!startNode || !containerRef.current) return;

        hasCenteredOnce.current = true;

        const containerHeight = containerRef.current.clientHeight;
        const nodeCanvasX = startNode.x * (NODE_WIDTH + NODE_GAP) + NODE_GAP;
        const nodeCanvasY = (maxY - startNode.y) * (NODE_HEIGHT + NODE_GAP) + NODE_GAP;
        const nodeHeight = NODE_HEIGHT - 20;
        const offsetY = (containerHeight - nodeHeight) / 2;
        setDrag({
            x: -nodeCanvasX,
            y: offsetY - nodeCanvasY,
        });
    }, [nodes, maxY]);



    const [, setFullscreenHeight] = useState<number | null>(null);
    useEffect(() => {
        if (isFullscreen) {
            const updateHeight = () => setFullscreenHeight(window.innerHeight);
            updateHeight();
            window.addEventListener("resize", updateHeight);
            return () => window.removeEventListener("resize", updateHeight);
        } else {
            setFullscreenHeight(null);
        }
    }, [isFullscreen]);
    useEffect(() => {
        if (isFullscreen) {
            document.body.classList.add('fullscreen-mode');
        } else {
            document.body.classList.remove('fullscreen-mode');
        }
    }, [isFullscreen]);
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const zoomFactor = 1 + (-e.deltaY * 0.001);
            zoomAt(zoomFactor, e.clientX, e.clientY);
        };


        container.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, []);



    return (
        <div
            ref={fullscreenRef}
            className={`z-[9999] ${isFullscreen ? "fixed inset-0 bg-black" : "relative"}`}
        >
            {title && <h2 className="text-lg font-bold mb-2">{title}</h2>}
            <div className="absolute top-10 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-4">
                <label className="inline-flex items-center gap-2 bg-zinc-800 px-3 py-1 rounded border border-zinc-500 shadow text-white text-sm">
                    <input
                        type="checkbox"
                        checked={showOnlyTruePath}
                        onChange={(e) => setShowOnlyTruePath(e.target.checked)}
                        className="form-checkbox text-yellow-400"
                    />
                    True Ending Path
                </label>
                <div className="flex gap-2">
                    <button
                        className="px-3 py-1 bg-zinc-800 text-white border border-zinc-500 rounded shadow"
                        onClick={resetView}
                    >
                        Reset
                    </button>
                    <button
                        className="px-3 py-1 bg-zinc-800 text-white border border-zinc-500 rounded shadow"
                        onClick={toggleFullscreen}
                    >
                        Fullscreen
                    </button>
                </div>
            </div>
            <div
                ref={containerRef}
                className={`relative w-full ${isFullscreen ? 'h-[100vh]' : 'h-[600px] md:h-[1200px]'
                    } overflow-x-auto overflow-y-hidden border bg-zinc-900 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
                    } touch-auto select-none overscroll-none transition-all duration-300`}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
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
                        className="absolute z-0"
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
                        {edges
                            .filter(edge => !showOnlyTruePath || edge.truePath)
                            .map((edge, idx) => {
                                const isTruePath = edge.truePath === true;
                                const shouldDim = showOnlyTruePath && !isTruePath;
                                const from = getNodeById(edge.from);
                                const to = getNodeById(edge.to);
                                const fromX = from.x * (NODE_WIDTH + NODE_GAP) + NODE_WIDTH + NODE_GAP + 10;
                                const fromY = (maxY - from.y) * (NODE_HEIGHT + NODE_GAP) + NODE_HEIGHT / 2 + NODE_GAP;
                                const toX = to.x * (NODE_WIDTH + NODE_GAP) + NODE_GAP + 27;
                                const toY = (maxY - to.y) * (NODE_HEIGHT + NODE_GAP) + NODE_HEIGHT / 2 + NODE_GAP;
                                const midX = fromX + (toX - fromX) / 2;
                                return (
                                    <g key={idx} onClick={() => onEdgeClick?.(`${edge.from}-${edge.to}`)} className="cursor-pointer">
                                        <path
                                            d={`M${fromX},${fromY} L${midX},${fromY} L${midX},${toY} L${toX},${toY}`}
                                            fill="none"
                                            stroke={
                                                showOnlyTruePath
                                                    ? isTruePath
                                                        ? "#facc15" // jaune si vrai chemin ET case cochée
                                                        : "white"
                                                    : "white"
                                            }
                                            strokeWidth={shouldDim ? 1 : 2}
                                            strokeOpacity={shouldDim ? 0.2 : 1}
                                            markerEnd="url(#arrowhead)"
                                            pointerEvents="stroke"
                                        />
                                        {edge.need && (
                                            <>
                                                <circle
                                                    cx={(fromX + toX) / 2}
                                                    cy={(fromY + toY) / 2}
                                                    r="9"
                                                    fill="#fde047" // yellow-300
                                                    stroke="black"
                                                    strokeWidth="1"
                                                />
                                                <text
                                                    x={(fromX + toX) / 2}
                                                    y={(fromY + toY) / 2 + 3}
                                                    fontSize="12"
                                                    textAnchor="middle"
                                                    alignmentBaseline="middle"
                                                    fill="black"
                                                    fontWeight="bold"
                                                >
                                                    🔒
                                                </text>
                                            </>
                                        )}
                                    </g>
                                );
                            })}
                    </svg>
                    {nodes.map((node) => {
                        const isDimmed = showOnlyTruePath && !node.truePath;
                        return (
                            <div
                                key={node.id}
                                onClick={() => {
                                    setSelectedNode(node);
                                    onNodeClick?.(node.id);
                                }}
                                title={node.label || nodeTypes[node.type]?.label}
                                className={`absolute text-white text-xs shadow ${isDimmed ? "opacity-30 grayscale" : ""}`}
                                style={{
                                    left: node.x * (NODE_WIDTH + NODE_GAP) + NODE_GAP,
                                    top: (maxY - node.y) * (NODE_HEIGHT + NODE_GAP) + NODE_GAP,
                                    width: NODE_WIDTH + 40,
                                    height: NODE_HEIGHT,
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'absolute',
                                }}
                            >
                                <div className="relative w-full h-full flex items-center pl-10 overflow-hidden">
                                    <Image
                                        src="/images/guides/monad-gate/CM_Monad_Box_Line.webp"
                                        alt="node box"
                                        fill
                                        className={`object-contain z-0 pointer-events-none`}
                                        style={{ filter: nodeColorFilters[node.type] }}
                                    />
                                    {adminMode ? (
                                        <div className="absolute z-10 text-[18px] font-bold left-15 top-4">
                                            {node.id}
                                            <div className={`text-[14px] leading-tight text-left z-30 whitespace-pre-wrap break-words max-w-[100px] ${nodeTypes[node.type]?.textColor}`}>{nodeTypes[node.type]?.label}</div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="relative w-[48px] h-[48px] flex items-center justify-center z-20 overflow-hidden">
                                                <Image
                                                    src={`/images/guides/monad-gate/CM_Monad_Node_Circle.webp`}
                                                    alt="circle"
                                                    width={48}
                                                    height={48}
                                                    className="absolute"
                                                    style={{ filter: nodeColorFilters[node.type] }}
                                                />
                                                <Image
                                                    src={`/images/guides/monad-gate/${nodeTypes[node.type]?.icon}.webp`}
                                                    alt={node.type}
                                                    width={24}
                                                    height={24}
                                                    className="absolute"
                                                    style={{ filter: nodeColorFilters[node.type] }}
                                                />
                                            </div>
                                            <div className={`ml-3 text-[11px] leading-tight text-left z-30 whitespace-pre-wrap break-words max-w-[100px] ${nodeTypes[node.type]?.textColor}`}>
                                                <div className="font-semibold">{nodeTypes[node.type]?.label}</div>
                                                {node.label && (
                                                    <div className="text-[10px] italic">{node.label}</div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {selectedNode && (
                <NodeContextPopup
                    node={selectedNode}
                    onClose={() => setSelectedNode(null)}
                    position="bottom"
                >
                    <PathOptionsContent
                        node={selectedNode}
                        edges={edges}
                        getNodeById={getNodeById}
                        showTruePath={showOnlyTruePath}
                    />
                </NodeContextPopup>
            )}
        </div>
    );
};
export default MonadGateMap;
