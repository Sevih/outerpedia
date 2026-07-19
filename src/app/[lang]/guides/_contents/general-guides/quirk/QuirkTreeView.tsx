'use client';

/**
 * Rendu d'un ARBRE de quirks — reproduction FIDÈLE de l'affichage du jeu.
 *
 * Layout = la grille RÉELLE du jeu, pas un radial inventé : chaque nœud porte
 * une page (`PageNum` : 0 = aile gauche, 1 = aile droite) et une case
 * `col,row` (`NodePosition`). Le main node est au centre ; chaque aile
 * s'étend horizontalement, l'ancre interne d'une aile étant le nœud qu'elle
 * connecte au main. On en déduit distance = |col − colAncre| + 1.
 *
 * Apparence des nœuds = les sprites du jeu : glyphe blanc (`CM_Gift_*Node_*`)
 * sur un disque sombre cerclé de la couleur du nœud (`NodeIconBgColorHex`) ;
 * le main reprend le cadre hexagonal (`CM_Gift_MainNode_Bg`). Survol = aperçu ;
 * tap = verrou (mobile). Le détail a un sélecteur de niveau (effet + coût cumulé
 * suivent le palier). Tous les arbres partagent un cadre commun au ratio 2:1.
 */
import { useMemo, useState } from 'react';
import { img } from '@/lib/images';
import type { QuirkLevel } from '@contracts';

/** Nœud PRÉ-LOCALISÉ (name/desc résolus côté serveur). */
export interface LocalNode {
  id: number;
  type: 'main' | 'normal';
  color: string;
  icon: string;
  name: string;
  desc: string;
  connections: number[];
  page: number;
  col: number;
  row: number;
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
  level: string;
  cost: string;
  unlockAt: string;
  mainNode: string;
}

interface Placed {
  node: LocalNode;
  /** Position en % (0–100) du conteneur, x ET y sur la même échelle d'unité. */
  x: number;
  y: number;
}

/** Demi-extents (en unités de grille) du cadre COMMUN à tous les arbres. */
export interface Frame {
  xh: number;
  yh: number;
}

/** Diamètre des nœuds, en UNITÉS de grille (converti en % par l'appelant). */
const NODE_UNITS = { main: 0.68, normal: 0.45 } as const;
/** Marge (demi-nœud) autour du cadre pour ne rien rogner au bord. */
const PAD = 0.7;
/** Ratio imposé du conteneur (large, façon écran de jeu). */
const TARGET_ASPECT = 2;

/**
 * Coordonnées d'un arbre en UNITÉS de grille, centrées sur le main (0,0) :
 * x = distance à l'ancre interne de l'aile (± selon la page), y = ligne centrée.
 * Sert au layout ET au calcul du cadre commun (`frameOf`).
 */
export function gridCoords(tree: LocalTree): { node: LocalNode; ux: number; uy: number }[] {
  const main = tree.nodes.find((n) => n.id === tree.mainId) ?? tree.nodes[0];
  const normals = tree.nodes.filter((n) => n.type !== 'main');
  const mainConns = new Set(main.connections);

  // Ancre interne de chaque aile = son nœud connecté au main (col la plus proche
  // du centre). Repli : bord de la page si aucune connexion directe.
  const innerCol = new Map<number, number>();
  for (const page of new Set(normals.map((n) => n.page))) {
    const inPage = normals.filter((n) => n.page === page);
    const anchor = inPage.find((n) => mainConns.has(n.id));
    // page 0 (gauche) : l'ancre a la col MAX ; page 1 (droite) : la col MIN.
    const fallback =
      page === 0 ? Math.max(...inPage.map((n) => n.col)) : Math.min(...inPage.map((n) => n.col));
    innerCol.set(page, anchor ? anchor.col : fallback);
  }

  const rows = normals.map((n) => n.row);
  const rowMid = (Math.min(...rows) + Math.max(...rows)) / 2;
  return tree.nodes.map((n) => {
    if (n.type === 'main') return { node: n, ux: 0, uy: 0 };
    const dist = Math.abs(n.col - (innerCol.get(n.page) ?? 0)) + 1;
    const side = n.page === 0 ? -1 : 1;
    return { node: n, ux: side * dist, uy: n.row - rowMid };
  });
}

/** Cadre commun = extents MAX sur un lot d'arbres → tous rendus à la même forme. */
export function frameOf(trees: LocalTree[]): Frame {
  let xh = 0;
  let yh = 0;
  for (const t of trees)
    for (const c of gridCoords(t)) {
      xh = Math.max(xh, Math.abs(c.ux));
      yh = Math.max(yh, Math.abs(c.uy));
    }
  return { xh: xh || 1, yh: yh || 1 };
}

/**
 * Layout : place l'arbre dans le CADRE COMMUN `frame` (extents max de tous les
 * arbres) plutôt que sur sa propre boîte — même conteneur et même espacement
 * partout, les arbres plus petits étant centrés. Le conteneur est imposé à
 * `TARGET_ASPECT` (2:1) : x remplit la largeur, y la hauteur, ce qui étale les
 * ailes horizontalement comme en jeu. `unit` = un pas de grille en % de largeur
 * (pour la taille des nœuds, ronds car dimensionnés sur la largeur).
 */
function layout(tree: LocalTree, frame: Frame): { placed: Placed[]; aspect: number; unit: number } {
  const xhalf = frame.xh + PAD;
  const yhalf = frame.yh + PAD;
  return {
    placed: gridCoords(tree).map((c) => ({
      node: c.node,
      x: 50 + (c.ux / xhalf) * 50,
      y: 50 + (c.uy / yhalf) * 50,
    })),
    aspect: TARGET_ASPECT,
    unit: 100 / (2 * xhalf),
  };
}

const strip = (s: string): string => s.replace(/<[^>]+>/g, '');

export function QuirkTreeView({
  tree,
  frame,
  materials,
  labels,
}: {
  tree: LocalTree;
  frame: Frame;
  materials: Record<string, { name: string; icon: string }>;
  labels: QuirkTreeLabels;
}) {
  const { placed, aspect, unit } = useMemo(() => layout(tree, frame), [tree, frame]);
  const posById = useMemo(() => new Map(placed.map((p) => [p.node.id, p])), [placed]);
  const [hover, setHover] = useState<number | null>(null);
  // Tap = VERROU (mobile : le survol s'efface au relâchement du doigt). Le survol
  // PC prévisualise par-dessus le verrou ; sans survol, on retombe sur le verrou,
  // sinon sur le main node.
  const [locked, setLocked] = useState<number | null>(null);
  // Niveau choisi PAR nœud (défaut = max) : on peut monter/descendre le palier
  // et voir effet + coût correspondants.
  const [levelSel, setLevelSel] = useState<Record<number, number>>({});
  // Un verrou/survol issu d'un autre arbre (après changement de catégorie) est
  // ignoré : on retombe alors sur le main node.
  const rawActive = hover ?? locked ?? tree.mainId;
  const active = posById.has(rawActive) ? rawActive : tree.mainId;
  const node = posById.get(active)?.node ?? tree.nodes[0];

  // Niveau sélectionné (borné au max du nœud), effet et coût CUMULÉ à ce niveau.
  const level = Math.min(levelSel[node.id] ?? node.maxLevel, node.maxLevel) || 1;
  const upto = node.levels.slice(0, level);
  const cumGold = upto.reduce((s, l) => s + l.gold, 0);
  const cumItems = new Map<string, number>();
  for (const l of upto)
    for (const it of l.items) cumItems.set(it.id, (cumItems.get(it.id) ?? 0) + it.count);
  const levelValueAt = node.levels[level - 1]?.value;
  const effect = levelValueAt ? strip(node.desc.replace('{0}', levelValueAt)) : strip(node.desc);
  const setLevel = (v: number) =>
    setLevelSel((m) => ({ ...m, [node.id]: Math.max(1, Math.min(node.maxLevel, v)) }));

  return (
    <div className="space-y-3">
      <div
        className="border-line-subtle bg-surface-overlay/30 relative mx-auto w-full max-w-160 overflow-hidden rounded-xl border"
        style={{ aspectRatio: aspect }}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
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
                  strokeWidth={active === p.node.id || active === q.node.id ? 1.6 : 1}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              )),
          )}
        </svg>
        {placed.map((p) => {
          const isMain = p.node.type === 'main';
          const on = active === p.node.id;
          const isLocked = locked === p.node.id;
          // Diamètre en % de LARGEUR ; `aspect-ratio:1` garde le nœud rond.
          const s = (isMain ? NODE_UNITS.main : NODE_UNITS.normal) * unit;
          const color = p.node.color || 'var(--color-line-strong)';
          // Verrou = liseré persistant (visible même en prévisualisant un autre
          // nœud) ; survol/actif = halo ; défaut = léger halo.
          const ring = isLocked
            ? `0 0 0 2px color-mix(in srgb, ${color} 90%, transparent), 0 0 9px 1px color-mix(in srgb, ${color} 60%, transparent)`
            : on
              ? `0 0 8px 1px color-mix(in srgb, ${color} 70%, transparent)`
              : `0 0 4px color-mix(in srgb, ${color} 35%, transparent)`;
          return (
            <button
              key={p.node.id}
              type="button"
              onMouseEnter={() => setHover(p.node.id)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(p.node.id)}
              onBlur={() => setHover(null)}
              onClick={() => setLocked((cur) => (cur === p.node.id ? null : p.node.id))}
              aria-pressed={locked === p.node.id}
              className="absolute grid place-items-center rounded-full transition-transform"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${s}%`,
                aspectRatio: '1',
                ...(isMain
                  ? {
                      backgroundImage: `url('${img.quirkNode('CM_Gift_MainNode_Bg')}')`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                    }
                  : {
                      background: `radial-gradient(circle, color-mix(in srgb, ${color} 22%, #0b0e14) 0%, #0b0e14 78%)`,
                      border: `2px solid ${color}`,
                    }),
                boxShadow: ring,
                transform: `translate(-50%,-50%) scale(${on || isLocked ? 1.14 : 1})`,
                zIndex: on ? 20 : isLocked ? 15 : isMain ? 10 : 1,
              }}
              aria-label={strip(p.node.name)}
            >
              {p.node.icon && (
                // eslint-disable-next-line @next/next/no-img-element -- asset R2/staging
                <img
                  src={img.quirkNode(p.node.icon)}
                  alt=""
                  className="pointer-events-none select-none"
                  style={{ width: isMain ? '52%' : '60%', height: isMain ? '52%' : '60%' }}
                  draggable={false}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Détail du nœud survolé (défaut : main node). */}
      <div className="border-line-subtle bg-surface-overlay/40 min-h-23 rounded-lg border p-3 text-sm">
        <div className="flex items-center gap-2">
          <span
            className="grid h-6 w-6 shrink-0 place-items-center rounded-full"
            style={{
              background: `radial-gradient(circle, color-mix(in srgb, ${node.color} 22%, #0b0e14) 0%, #0b0e14 78%)`,
              border: `1.5px solid ${node.color || 'var(--color-line-strong)'}`,
            }}
          >
            {node.icon && (
              // eslint-disable-next-line @next/next/no-img-element -- asset R2/staging
              <img
                src={img.quirkNode(node.icon)}
                alt=""
                className="h-3.5 w-3.5"
                draggable={false}
              />
            )}
          </span>
          <span className="text-content-strong font-semibold">{strip(node.name)}</span>
          {node.type === 'main' && (
            <span className="border-ed-sky/30 bg-ed-sky/10 text-ed-sky rounded border px-1.5 text-[10px] font-bold">
              {labels.mainNode}
            </span>
          )}
        </div>
        {effect && <p className="text-content-muted mt-1.5">{effect}</p>}

        {/* Sélecteur de niveau (défaut = max). Effet + coût suivent le palier. */}
        <div className="mt-2.5 flex items-center gap-2">
          <span className="text-content-subtle text-xs">{labels.level}</span>
          <div className="border-line-subtle inline-flex items-center overflow-hidden rounded-md border">
            <button
              type="button"
              onClick={() => setLevel(level - 1)}
              disabled={level <= 1}
              className="text-content hover:bg-surface-overlay px-2 py-0.5 text-sm font-bold transition-colors disabled:opacity-30"
              aria-label="-1"
            >
              −
            </button>
            <span className="text-content-strong min-w-14 px-2 text-center text-xs font-semibold tabular-nums">
              {level}
              <span className="text-content-subtle"> / {node.maxLevel}</span>
            </span>
            <button
              type="button"
              onClick={() => setLevel(level + 1)}
              disabled={level >= node.maxLevel}
              className="text-content hover:bg-surface-overlay px-2 py-0.5 text-sm font-bold transition-colors disabled:opacity-30"
              aria-label="+1"
            >
              +
            </button>
          </div>
          {node.requireMainLevel > 0 && (
            <span className="text-content-subtle text-xs">
              {labels.unlockAt} {node.requireMainLevel}
            </span>
          )}
        </div>

        <div className="text-content mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="text-content-subtle">{labels.cost}</span>
          <span className="inline-flex items-center gap-1">
            {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
            <img src={img.gold()} alt="" className="h-4 w-4" />
            {cumGold.toLocaleString('en-US')}
          </span>
          {[...cumItems].map(([id, count]) => {
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
