'use client';

/**
 * Carte interactive d'une route Monad Gate (port du composant V2, réécrit sur
 * les primitives V3 : pas de contexte i18n — `lang` + les chaînes d'UI
 * pré-résolues arrivent en props ; sprites via `img.monad` en `<img>` R2).
 *
 * La donnée (`nodes`/`edges`) est déjà localisable (chaque libellé est un
 * `LangDict`) : le composant ne fait que du RENDU + interaction (pan/zoom/plein
 * écran, mode compact, filtre True Ending, popup de choix, résumé des choix).
 */
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MonadEdge, MonadNode, MonadNodeType } from '@/lib/data/monad';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { img } from '@/lib/images';
import { NODE_STYLES } from './nodeStyles';

/** Chaînes d'UI pré-résolues (le composant est client, pas d'accès à `getT`). */
export interface MonadStrings {
  trueEndingPath: string;
  compact: string;
  reset: string;
  fullscreen: string;
  noOptions: string;
  required: string;
  grants: string;
  unnamedPath: string;
  clickToReveal: string;
  choiceDoesntMatter: string;
  trueEndingChoices: string;
  /** Séparateur des chemins alternatifs d'un même palier (« or »/« ou »…). */
  or: string;
  /** Libellé localisé de chaque type de nœud (`monad.node.<type>`). */
  nodeLabels: Record<MonadNodeType, string>;
}

interface Props {
  nodes: MonadNode[];
  edges: MonadEdge[];
  lang: Lang;
  strings: MonadStrings;
}

/**
 * Nœud avec coordonnées d'écran dérivées : `x = col`, `y = -row` (la rangée
 * croît vers le BAS, comme dans le jeu — la donnée porte `col`/`row` 1-based, le
 * calcul de layout raisonne en x/y comme la V2).
 */
type PositionedNode = MonadNode & { x: number; y: number };

const NODE_WIDTH = 200;
const NODE_HEIGHT = 100;
const NODE_GAP = 60;
const ZOOM_SENSITIVITY = 0.04;
const COMPACT_NODE_SIZE = 44;
const COMPACT_NODE_GAP = 24;

export default function MonadGateMap({ nodes, edges, lang, strings }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<PositionedNode | null>(null);
  const [tooltip, setTooltip] = useState<{ label: string; x: number; y: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOnlyTruePath, setShowOnlyTruePath] = useState(false);
  const [compactMode, setCompactMode] = useState(true);
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);

  const nodeWidth = compactMode ? COMPACT_NODE_SIZE : NODE_WIDTH;
  const nodeHeight = compactMode ? COMPACT_NODE_SIZE : NODE_HEIGHT;
  const nodeGap = compactMode ? COMPACT_NODE_GAP : NODE_GAP;
  const hasCenteredOnce = useRef(false);
  const scaleRef = useRef(scale);
  const dragRef = useRef(drag);

  useEffect(() => void (scaleRef.current = scale), [scale]);
  useEffect(() => void (dragRef.current = drag), [drag]);

  const positioned = useMemo<PositionedNode[]>(
    () => nodes.map((n) => ({ ...n, x: n.col, y: -n.row })),
    [nodes],
  );

  const { minX, maxX, minY, maxY } = useMemo(
    () => ({
      minX: Math.min(...positioned.map((n) => n.x)),
      maxX: Math.max(...positioned.map((n) => n.x)),
      minY: Math.min(...positioned.map((n) => n.y)),
      maxY: Math.max(...positioned.map((n) => n.y)),
    }),
    [positioned],
  );

  const contentWidth = (maxX - minX + 1) * (nodeWidth + nodeGap) + nodeGap * 2;
  const contentHeight = (maxY - minY + 1) * (nodeHeight + nodeGap) + nodeGap * 2;

  const nodeMap = useMemo(() => new Map(positioned.map((n) => [n.id, n])), [positioned]);
  const getNodeById = useCallback(
    (id: string): PositionedNode => {
      const node = nodeMap.get(id);
      if (!node) throw new Error(`Nœud ${id} introuvable`);
      return node;
    },
    [nodeMap],
  );

  // Seuls les choix NARRATIFS (nœuds `path`) entrent dans le résumé des choix.
  const labeledTruePathEdges = useMemo(
    () =>
      edges.filter((edge) => {
        if (!(edge.truePath || edge.altPath) || !edge.label) return false;
        if (edge.service) return false;
        return nodeMap.get(edge.from)?.type === 'path';
      }),
    [edges, nodeMap],
  );

  const zoomAt = useCallback((zoomFactor: number, centerX: number, centerY: number) => {
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
    setDrag({ x: offsetX - xRel * newScale, y: offsetY - yRel * newScale });
    setScale(newScale);
  }, []);

  const toggleFullscreen = () => {
    const el = fullscreenRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const startDragging = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setStartDrag({ x: clientX - drag.x, y: clientY - drag.y });
  };
  const updateDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (isDragging) setDrag({ x: clientX - startDrag.x, y: clientY - startDrag.y });
    },
    [isDragging, startDrag],
  );
  const stopDragging = () => setIsDragging(false);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => updateDrag(e.clientX, e.clientY),
    [updateDrag],
  );
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (isDragging) updateDrag(e.touches[0].clientX, e.touches[0].clientY);
    },
    [updateDrag, isDragging],
  );

  // Molette + pinch : écouteurs non passifs (preventDefault) — impossible en JSX.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomAt(1 + -e.deltaY * 0.001, e.clientX, e.clientY);
    };
    const dist = (t: TouchList) =>
      Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    let initialDistance = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        initialDistance = dist(e.touches);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      e.preventDefault();
      let zoomFactor = dist(e.touches) / initialDistance;
      zoomFactor = Math.max(1 - ZOOM_SENSITIVITY, Math.min(1 + ZOOM_SENSITIVITY, zoomFactor));
      if (Math.abs(zoomFactor - 1) < 0.01) return;
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      zoomAt(zoomFactor, cx, cy);
      initialDistance = dist(e.touches);
    };
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('touchstart', onTouchStart, { passive: false });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
    };
  }, [zoomAt]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopDragging);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', stopDragging);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', stopDragging);
    };
  }, [handleMouseMove, handleTouchMove]);

  const resetView = () => {
    setDrag({ x: 0, y: 0 });
    setScale(1);
  };

  // Centre la vue sur le nœud de départ, une seule fois.
  useEffect(() => {
    if (hasCenteredOnce.current) return;
    const startNode = positioned.find((n) => n.type === 'start');
    if (!startNode || !containerRef.current) return;
    hasCenteredOnce.current = true;
    const containerHeight = containerRef.current.clientHeight;
    const nodeCanvasX = (startNode.x - minX) * (nodeWidth + nodeGap) + nodeGap;
    const nodeCanvasY = (maxY - startNode.y) * (nodeHeight + nodeGap) + nodeGap;
    const offsetY = (containerHeight - (nodeHeight - 20)) / 2;
    setDrag({ x: -nodeCanvasX, y: offsetY - nodeCanvasY });
  }, [positioned, minX, maxY, nodeWidth, nodeHeight, nodeGap]);

  const edgeGeom = (edge: MonadEdge) => {
    const from = getNodeById(edge.from);
    const to = getNodeById(edge.to);
    const fromX =
      (from.x - minX) * (nodeWidth + nodeGap) + nodeWidth + nodeGap + (compactMode ? 0 : 10);
    const fromY = (maxY - from.y) * (nodeHeight + nodeGap) + nodeHeight / 2 + nodeGap;
    const toX = (to.x - minX) * (nodeWidth + nodeGap) + nodeGap + (compactMode ? 0 : 27);
    const toY = (maxY - to.y) * (nodeHeight + nodeGap) + nodeHeight / 2 + nodeGap;
    return { fromX, fromY, toX, toY };
  };

  return (
    <div
      ref={fullscreenRef}
      className={isFullscreen ? 'bg-surface-sunken fixed inset-0 z-9999' : 'relative'}
    >
      <div className="absolute top-14 right-4 left-4 z-20 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <label className="border-line-strong bg-surface-raised text-content-strong inline-flex items-center gap-2 rounded border px-3 py-1 text-sm shadow">
            <input
              type="checkbox"
              checked={showOnlyTruePath}
              onChange={(e) => setShowOnlyTruePath(e.target.checked)}
              className="text-monad-milestone"
            />
            {strings.trueEndingPath}
          </label>
          <label className="border-line-strong bg-surface-raised text-content-strong inline-flex items-center gap-2 rounded border px-3 py-1 text-sm shadow">
            <input
              type="checkbox"
              checked={compactMode}
              onChange={(e) => setCompactMode(e.target.checked)}
              className="text-monad-milestone"
            />
            {strings.compact}
          </label>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="border-line-strong bg-surface-raised text-content-strong rounded border px-3 py-1 shadow"
            onClick={resetView}
          >
            {strings.reset}
          </button>
          <button
            type="button"
            className="border-line-strong bg-surface-raised text-content-strong rounded border px-3 py-1 shadow"
            onClick={toggleFullscreen}
          >
            {strings.fullscreen}
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={containerRef}
          className={`bg-surface-sunken relative w-full overflow-x-auto overflow-y-hidden border select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{
            height: isFullscreen
              ? '100vh'
              : `${Math.min(Math.max(contentHeight + 80, 400), 800)}px`,
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            startDragging(e.clientX, e.clientY);
          }}
          onTouchStart={(e) => startDragging(e.touches[0].clientX, e.touches[0].clientY)}
        >
          <div
            className={isDragging ? '' : 'transition-transform duration-300'}
            style={{
              position: 'relative',
              minWidth: '100%',
              width: `${contentWidth}px`,
              height: `${contentHeight}px`,
              transform: `translate(${drag.x}px, ${drag.y}px) scale(${scale})`,
              transformOrigin: '0 0',
            }}
          >
            <svg
              className="absolute z-0"
              style={{ width: `${contentWidth}px`, height: `${contentHeight}px` }}
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="6"
                  markerHeight="6"
                  refX="5"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L0,6 L6,3 z" fill="white" />
                </marker>
              </defs>
              {/* Passe 1 : les traits d'arête. */}
              {edges
                .filter((edge) => !showOnlyTruePath || edge.truePath || edge.altPath)
                .map((edge, idx) => {
                  const isTrue = edge.truePath === true;
                  const isAlt = edge.altPath === true;
                  const shouldDim = showOnlyTruePath && !isTrue && !isAlt;
                  const { fromX, fromY, toX, toY } = edgeGeom(edge);
                  const midX = fromX + (toX - fromX) / 2;
                  const stroke = showOnlyTruePath && (isTrue || isAlt) ? '#facc15' : 'white';
                  return (
                    <path
                      key={`p-${idx}`}
                      d={`M${fromX},${fromY} L${midX},${fromY} L${midX},${toY} L${toX},${toY}`}
                      fill="none"
                      stroke={stroke}
                      strokeWidth={shouldDim ? 1 : 2}
                      strokeOpacity={shouldDim ? 0.2 : isAlt && !isTrue ? 0.6 : 1}
                      strokeDasharray={isAlt && !isTrue ? '6 4' : undefined}
                      markerEnd="url(#arrowhead)"
                      pointerEvents="stroke"
                    />
                  );
                })}
              {/* Passe 2 : les cadenas de condition, au-dessus des traits. */}
              {edges
                .filter((edge) => (!showOnlyTruePath || edge.truePath || edge.altPath) && edge.need)
                .map((edge, idx) => {
                  const { fromX, fromY, toX, toY } = edgeGeom(edge);
                  const cx = (fromX + toX) / 2;
                  const cy = (fromY + toY) / 2;
                  return (
                    <g key={`l-${idx}`} className="pointer-events-none">
                      <circle cx={cx} cy={cy} r="9" fill="#fde047" stroke="black" strokeWidth="1" />
                      <text
                        x={cx}
                        y={cy + 3}
                        fontSize="12"
                        textAnchor="middle"
                        fill="black"
                        fontWeight="bold"
                      >
                        &#128274;
                      </text>
                    </g>
                  );
                })}
            </svg>

            {positioned.map((node) => {
              const style = NODE_STYLES[node.type];
              const isDimmed = showOnlyTruePath && !node.truePath && !node.altPath;
              const giveLabel = node.givesItem ? lRec(node.givesItem, lang) : '';
              const nodeLabel = node.label ? lRec(node.label, lang) : '';
              const typeLabel = strings.nodeLabels[node.type];
              const baseLabel = (node.type === 'path' ? '' : nodeLabel) || typeLabel;
              const tooltipLabel = giveLabel ? `${baseLabel} · 🔑 ${giveLabel}` : baseLabel;
              return (
                <div
                  key={node.id}
                  onClick={() => {
                    if (node.type === 'path') setSelectedNode(node);
                  }}
                  onMouseEnter={(e) => {
                    if (node.type !== 'path' || giveLabel)
                      setTooltip({ label: tooltipLabel, x: e.clientX, y: e.clientY });
                  }}
                  onMouseMove={(e) => {
                    if (tooltip && (node.type !== 'path' || giveLabel))
                      setTooltip({ label: tooltipLabel, x: e.clientX, y: e.clientY });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  className={`text-content-strong absolute text-xs shadow ${isDimmed ? 'opacity-30 grayscale' : ''} ${
                    node.type === 'path' ? 'cursor-pointer' : ''
                  }`}
                  style={{
                    left: (node.x - minX) * (nodeWidth + nodeGap) + nodeGap,
                    top: (maxY - node.y) * (nodeHeight + nodeGap) + nodeGap,
                    width: compactMode ? nodeWidth : nodeWidth + 40,
                    height: nodeHeight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {compactMode ? (
                    <div className="relative flex h-full w-full items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
                      <img
                        src={img.monad('CM_Monad_Node_Circle')}
                        alt=""
                        width={COMPACT_NODE_SIZE}
                        height={COMPACT_NODE_SIZE}
                        className="absolute"
                        style={{ filter: style.filter }}
                      />
                      {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
                      <img
                        src={img.monad(style.icon)}
                        alt={typeLabel}
                        width={20}
                        height={20}
                        className="absolute z-10"
                        style={{ filter: style.filter }}
                      />
                      {giveLabel && (
                        <span
                          className="ring-surface-sunken bg-monad-key-badge absolute -top-1 -right-1 z-20 flex h-5 w-5 items-center justify-center rounded-full text-[10px] leading-none shadow ring-1"
                          title={giveLabel}
                        >
                          🔑
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="relative flex h-full w-full items-center overflow-hidden pl-10">
                      {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
                      <img
                        src={img.monad('CM_Monad_Box_Line')}
                        alt=""
                        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-contain"
                        style={{ filter: style.filter }}
                      />
                      <div className="relative z-20 flex h-12 w-12 items-center justify-center overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
                        <img
                          src={img.monad('CM_Monad_Node_Circle')}
                          alt=""
                          width={48}
                          height={48}
                          className="absolute"
                          style={{ filter: style.filter }}
                        />
                        {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
                        <img
                          src={img.monad(style.icon)}
                          alt={typeLabel}
                          width={24}
                          height={24}
                          className="absolute"
                          style={{ filter: style.filter }}
                        />
                      </div>
                      <div
                        className={`z-30 ml-3 max-w-25 text-left text-[11px] leading-tight wrap-break-word whitespace-pre-wrap ${style.textColor}`}
                      >
                        <div className="font-semibold">{typeLabel}</div>
                        {nodeLabel && <div className="text-[10px] italic">{nodeLabel}</div>}
                        {giveLabel && (
                          <div className="text-monad-key text-[10px] italic">🔑 {giveLabel}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {selectedNode && selectedNode.type === 'path' && (
          <NodeChoicesPopup
            node={selectedNode}
            edges={edges}
            getNodeById={getNodeById}
            showTruePath={showOnlyTruePath}
            lang={lang}
            strings={strings}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>

      {tooltip && (
        <div
          className="border-line-strong bg-surface-sunken text-content-strong pointer-events-none fixed z-9999 rounded border px-2 py-1 text-xs shadow-lg"
          style={{ left: tooltip.x + 12, top: tooltip.y - 28 }}
        >
          {tooltip.label}
        </div>
      )}

      <TrueEndingChoices
        edges={labeledTruePathEdges}
        lang={lang}
        strings={strings}
        revealed={spoilerRevealed}
        onReveal={() => setSpoilerRevealed(true)}
      />
    </div>
  );
}

// ─── Popup des choix d'un nœud `path` ───────────────────────────────────────
function NodeChoicesPopup({
  node,
  edges,
  getNodeById,
  showTruePath,
  lang,
  strings,
  onClose,
}: {
  node: PositionedNode;
  edges: MonadEdge[];
  getNodeById: (id: string) => PositionedNode;
  showTruePath: boolean;
  lang: Lang;
  strings: MonadStrings;
  onClose: () => void;
}) {
  const outgoing = edges
    .filter((e) => e.from === node.id)
    .sort((a, b) => getNodeById(b.to).y - getNodeById(a.to).y);
  const highlightedCount = outgoing.filter((e) => e.truePath || e.altPath).length;
  const showEquivalentNotice = showTruePath && highlightedCount > 1;
  const title = node.label ? lRec(node.label, lang) : strings.nodeLabels[node.type];

  return (
    <div className="border-line-strong bg-surface-sunken text-content-strong absolute bottom-4 left-4 z-50 w-75 rounded border p-4 shadow-xl">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold">{title}</div>
        <button
          type="button"
          onClick={onClose}
          className="text-content-strong hover:text-danger text-xs transition"
        >
          X
        </button>
      </div>
      <div className="space-y-3">
        {outgoing.length === 0 ? (
          <div className="text-sm">{strings.noOptions}</div>
        ) : (
          <>
            {showEquivalentNotice && (
              <div className="border-monad-void-bd/60 bg-monad-void-bg/30 text-monad-void-text mb-2 rounded border px-3 py-2 text-center text-xs font-semibold">
                {strings.choiceDoesntMatter}
              </div>
            )}
            {outgoing.map((edge, i) => {
              const isTrue = edge.truePath === true;
              const isAlt = edge.altPath === true;
              const shouldDim = showTruePath && !isTrue && !isAlt;
              const highlight = showTruePath && (isTrue || isAlt);
              const toNode = getNodeById(edge.to);
              const labelText = lRec(edge.label, lang) || strings.unnamedPath;
              const needText = lRec(edge.need, lang);
              const givesText = lRec(edge.gives, lang);
              return (
                <div
                  key={i}
                  className={`rounded border px-3 py-2 text-sm ${
                    shouldDim
                      ? 'border-line-subtle bg-surface-raised text-content-subtle'
                      : highlight
                        ? 'text-content-strong border-monad-choice-bd bg-monad-choice-bg'
                        : 'border-line-subtle bg-surface-raised text-content-strong'
                  }`}
                >
                  <div className="italic">{labelText}</div>
                  {needText && (
                    <div className="text-monad-milestone mt-1 text-xs italic">
                      {strings.required} : {needText}
                    </div>
                  )}
                  {givesText && (
                    <div className="text-monad-key mt-1 text-xs italic">
                      🔑 {strings.grants} : {givesText}
                    </div>
                  )}
                  <div className="text-content-muted mt-1 text-xs">
                    {'-> '}
                    {toNode.label ? lRec(toNode.label, lang) : strings.nodeLabels[toNode.type]}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Résumé « True Ending Choices » (spoiler) ───────────────────────────────
function TrueEndingChoices({
  edges,
  lang,
  strings,
  revealed,
  onReveal,
}: {
  edges: MonadEdge[];
  lang: Lang;
  strings: MonadStrings;
  revealed: boolean;
  onReveal: () => void;
}) {
  if (edges.length === 0) return null;

  // Groupe les choix équivalents du même nœud source (ordre de flux préservé),
  // puis fusionne les groupes consécutifs de même texte (un événement peut
  // s'étaler sur plusieurs nœuds `path` au libellé identique).
  const rawGroups: MonadEdge[][] = [];
  const groupIndex = new Map<string, number>();
  for (const edge of edges) {
    const existing = groupIndex.get(edge.from);
    if (existing === undefined) {
      groupIndex.set(edge.from, rawGroups.length);
      rawGroups.push([edge]);
    } else {
      rawGroups[existing].push(edge);
    }
  }
  const fingerprint = (group: MonadEdge[]) =>
    group
      .map((e) => `${lRec(e.label, lang)}|${lRec(e.gives, lang)}`)
      .sort()
      .join('\n');
  const groups: MonadEdge[][] = [];
  let lastFp: string | null = null;
  for (const g of rawGroups) {
    const fp = fingerprint(g);
    if (fp === lastFp) continue;
    groups.push(g);
    lastFp = fp;
  }

  return (
    <div
      className="border-line-subtle bg-surface-raised/60 relative mt-4 cursor-pointer rounded-lg border p-4"
      onClick={onReveal}
    >
      <h3 className="text-monad-milestone mb-4 flex items-center gap-2 text-base font-semibold">
        <span>★</span>
        {strings.trueEndingChoices}
      </h3>
      <ol
        className={`space-y-3 transition-all duration-300 ${revealed ? '' : 'blur-sm select-none'}`}
      >
        {groups.map((group, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span className="border-monad-quest-bd/40 bg-monad-milestone/15 text-monad-quest-text mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold">
              {idx + 1}
            </span>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
              {group.map((edge, i) => (
                <Fragment key={i}>
                  {i > 0 && (
                    <span className="text-content-subtle text-xs tracking-wide uppercase">
                      {strings.or}
                    </span>
                  )}
                  <span className="border-monad-choice-chip-bd/60 bg-monad-choice-bg/30 text-monad-choice-text inline-flex items-center rounded-md border px-2.5 py-1 text-sm">
                    {lRec(edge.label, lang)}
                  </span>
                  {edge.gives && (
                    <span className="text-monad-key-soft inline-flex items-center gap-1 text-xs font-medium">
                      🔑 {lRec(edge.gives, lang)}
                    </span>
                  )}
                </Fragment>
              ))}
              {group.length > 1 && (
                <span className="border-monad-void-bd/60 bg-monad-void-bg/30 text-monad-void-text inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold">
                  {strings.choiceDoesntMatter}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
      {!revealed && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-content-muted text-sm">{strings.clickToReveal}</span>
        </div>
      )}
    </div>
  );
}
