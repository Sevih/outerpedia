'use client';

/**
 * Rendu d'un ARBRE de quirks — graphe dérivé, main node au CENTRE (choix Sevih).
 * Layout radial calculé depuis les connexions (`ConnectionNodeID`) : profondeur =
 * distance au main, angle = éventail des feuilles. Les nœuds n'ont pas de sprite
 * disponible → pastilles teintées par leur couleur de jeu (`color`). Survol d'un
 * nœud = tooltip (nom, effet, coût total, niveau de déblocage).
 */
import { useMemo, useState } from 'react';
import { img } from '@/lib/images';
import type { QuirkLevel } from '@contracts';

/** Nœud PRÉ-LOCALISÉ (name/desc résolus côté serveur). */
export interface LocalNode {
  id: number;
  type: 'main' | 'normal';
  color: string;
  name: string;
  desc: string;
  connections: number[];
  requireMainLevel: number;
  maxLevel: number;
  levels: QuirkLevel[];
}
export interface LocalTree {
  key: string;
  mainId: number;
  nodes: LocalNode[];
}

export interface QuirkTreeLabels {
  maxLevel: string;
  cost: string;
  unlockAt: string;
  mainNode: string;
}

interface Placed {
  node: LocalNode;
  x: number;
  y: number;
}

/** Layout radial : main au centre (50,50), enfants en éventail par profondeur. */
function layout(tree: LocalTree): Placed[] {
  const byId = new Map(tree.nodes.map((n) => [n.id, n]));
  const children = new Map<number, number[]>();
  const depth = new Map<number, number>([[tree.mainId, 0]]);
  const visited = new Set<number>([tree.mainId]);
  const queue = [tree.mainId];
  while (queue.length) {
    const id = queue.shift()!;
    const kids: number[] = [];
    for (const c of byId.get(id)?.connections ?? []) {
      if (byId.has(c) && !visited.has(c)) {
        visited.add(c);
        depth.set(c, (depth.get(id) ?? 0) + 1);
        kids.push(c);
        queue.push(c);
      }
    }
    children.set(id, kids);
  }
  // Nœuds non atteints par les connexions → rattachés au main (1er anneau).
  for (const n of tree.nodes)
    if (!visited.has(n.id)) {
      visited.add(n.id);
      depth.set(n.id, 1);
      (children.get(tree.mainId) ?? children.set(tree.mainId, []).get(tree.mainId)!).push(n.id);
    }

  const totalLeaves = Math.max(
    1,
    [...children.values()].filter((k) => !k.length).length || tree.nodes.length,
  );
  let cursor = 0;
  const angle = new Map<number, number>();
  const assign = (id: number): number => {
    const kids = children.get(id) ?? [];
    if (!kids.length) {
      const a = ((cursor + 0.5) / totalLeaves) * 2 * Math.PI;
      cursor++;
      angle.set(id, a);
      return a;
    }
    const mean = kids.map(assign).reduce((s, x) => s + x, 0) / kids.length;
    angle.set(id, mean);
    return mean;
  };
  assign(tree.mainId);

  const maxD = Math.max(1, ...depth.values());
  const ring = 42 / maxD;
  return tree.nodes.map((n) => {
    const d = depth.get(n.id) ?? 0;
    const a = angle.get(n.id) ?? 0;
    return { node: n, x: 50 + d * ring * Math.cos(a), y: 50 + d * ring * Math.sin(a) };
  });
}

const strip = (s: string): string => s.replace(/<[^>]+>/g, '');

export function QuirkTreeView({
  tree,
  materials,
  labels,
}: {
  tree: LocalTree;
  materials: Record<string, { name: string; icon: string }>;
  labels: QuirkTreeLabels;
}) {
  const placed = useMemo(() => layout(tree), [tree]);
  const posById = useMemo(() => new Map(placed.map((p) => [p.node.id, p])), [placed]);
  const [hover, setHover] = useState<number | null>(null);
  const active = hover ?? tree.mainId;
  const node = posById.get(active)?.node ?? tree.nodes[0];

  // Coût total jusqu'au max + valeur d'effet au max.
  const totalGold = node.levels.reduce((s, l) => s + l.gold, 0);
  const totalItems = new Map<string, number>();
  for (const l of node.levels)
    for (const it of l.items) totalItems.set(it.id, (totalItems.get(it.id) ?? 0) + it.count);
  const maxValue = [...node.levels].reverse().find((l) => l.value)?.value;
  const effect = maxValue ? strip(node.desc.replace('{0}', maxValue)) : strip(node.desc);

  return (
    <div className="space-y-3">
      <div className="relative mx-auto aspect-square w-full max-w-105">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
          {placed.flatMap((p) =>
            p.node.connections
              .map((c) => posById.get(c))
              .filter((q): q is Placed => !!q)
              .map((q) => (
                <line
                  key={`${p.node.id}-${q.node.id}`}
                  x1={p.x}
                  y1={p.y}
                  x2={q.x}
                  y2={q.y}
                  className="stroke-line-strong"
                  strokeWidth={active === p.node.id || active === q.node.id ? 0.9 : 0.5}
                />
              )),
          )}
        </svg>
        {placed.map((p) => {
          const isMain = p.node.type === 'main';
          const on = active === p.node.id;
          const s = isMain ? 34 : 22;
          return (
            <button
              key={p.node.id}
              type="button"
              onMouseEnter={() => setHover(p.node.id)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(p.node.id)}
              onBlur={() => setHover(null)}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: s,
                height: s,
                background: `color-mix(in srgb, ${p.node.color} 30%, transparent)`,
                border: `2px solid ${p.node.color}`,
                boxShadow: on
                  ? `0 0 0 3px color-mix(in srgb, ${p.node.color} 35%, transparent)`
                  : undefined,
                transform: `translate(-50%,-50%) scale(${on ? 1.15 : 1})`,
                zIndex: on ? 20 : isMain ? 10 : 1,
              }}
              aria-label={strip(p.node.name)}
            />
          );
        })}
      </div>

      {/* Détail du nœud survolé (défaut : main node). */}
      <div className="border-line-subtle bg-surface-overlay/40 min-h-23 rounded-lg border p-3 text-sm">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 shrink-0 rounded-full"
            style={{ background: node.color, border: `1px solid ${node.color}` }}
          />
          <span className="text-content-strong font-semibold">{strip(node.name)}</span>
          {node.type === 'main' && (
            <span className="border-ed-sky/30 bg-ed-sky/10 text-ed-sky rounded border px-1.5 text-[10px] font-bold">
              {labels.mainNode}
            </span>
          )}
        </div>
        {effect && <p className="text-content-muted mt-1.5">{effect}</p>}
        <div className="text-content mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span>
            {labels.maxLevel} {node.maxLevel}
          </span>
          {node.requireMainLevel > 0 && (
            <span className="text-content-subtle">
              {labels.unlockAt} {node.requireMainLevel}
            </span>
          )}
          <span className="text-content-subtle">{labels.cost}</span>
          <span className="inline-flex items-center gap-1">
            {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
            <img src={img.gold()} alt="" className="h-4 w-4" />
            {totalGold.toLocaleString('en-US')}
          </span>
          {[...totalItems].map(([id, count]) => {
            const m = materials[id];
            return (
              <span key={id} className="inline-flex items-center gap-1 whitespace-nowrap">
                {m && (
                  // eslint-disable-next-line @next/next/no-img-element -- asset R2/staging
                  <img src={m.icon} alt={m.name} title={m.name} className="h-4 w-4" />
                )}
                ×{count}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
