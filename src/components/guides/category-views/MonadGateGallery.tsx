'use client';

import { useState } from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { ART_TILE, GuideCardArt } from './CardArt';

/**
 * Une tuile de route Monad Gate, préparée côté serveur (nom localisé, URLs
 * complètes). Deux formes exclusives :
 *   - `href`     : la route mène à UNE page (carte simple) ;
 *   - `segments` : la carte porte plusieurs cibles cliquables — les parts d'une
 *     profondeur Story (Depth 4) ou les variantes de map d'une route (Depth 10).
 */
export interface RouteTile {
  key: string;
  /** « Depth 6 » (déjà localisé). */
  depthLabel: string;
  /** Nom de la région — affiché quand la carte n'a qu'une cible ou des variantes. */
  name?: string;
  /** Nom de sprite de l'art de map (namespace guides). */
  icon: string;
  href?: string;
  segments?: { label: string; href: string }[];
}

/** Une profondeur Endless et ses tuiles (pour le sélecteur). */
export interface EndlessDepth {
  depth: number;
  label: string;
  tiles: RouteTile[];
}

/** Rend une tuile — carte simple (lien plein) ou carte à segments. */
export function Tile({ tile }: { tile: RouteTile }) {
  // Le zoom au survol vit sur le WRAPPER (les voiles zooment avec l'art),
  // pas sur l'image — cf. GuideCardArt.
  const bg = <GuideCardArt icon={tile.icon} alt={tile.name ?? ''} topVeil />;
  const header = (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-2">
      <p className="text-content text-xs font-medium drop-shadow-lg">{tile.depthLabel}</p>
      {tile.name && (
        <p className="text-content line-clamp-3 text-xs font-medium drop-shadow-lg">{tile.name}</p>
      )}
    </div>
  );

  if (tile.href) {
    return (
      <Link
        href={tile.href as Route}
        className={`group ring-line-subtle ${ART_TILE} ring-1 transition-all hover:ring-yellow-400/50`}
      >
        <span className="absolute inset-0 transition-transform duration-300 group-hover:scale-105">
          {bg}
        </span>
        {header}
      </Link>
    );
  }

  const segments = tile.segments ?? [];
  return (
    <div className={`ring-line-subtle ${ART_TILE} ring-1`}>
      {bg}
      {header}
      {/* Segments répartis sous le header (haut = 1/4), chacun cliquable. */}
      <div className="absolute inset-x-0 top-1/4 bottom-0 z-10 flex flex-col">
        {segments.map((s, i) => (
          <Link
            key={s.href}
            href={s.href as Route}
            className={`hover:bg-content/10 flex flex-1 items-center justify-center transition-colors ${
              i > 0 ? 'border-line border-t' : ''
            }`}
          >
            <span className="bg-surface-sunken text-content-strong rounded px-2 py-0.5 text-[10px] font-bold drop-shadow-lg sm:text-xs">
              {s.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/** Section Endless : sélecteur de profondeur + tuiles de la profondeur active. */
export function MonadEndless({ title, depths }: { title: string; depths: EndlessDepth[] }) {
  const [active, setActive] = useState(depths[0]?.depth ?? 0);
  const current = depths.find((d) => d.depth === active) ?? depths[0];

  return (
    <section>
      <h2 className="mb-4">{title}</h2>
      <div className="mb-4 flex flex-wrap gap-2">
        {depths.map((d) => (
          <button
            key={d.depth}
            type="button"
            onClick={() => setActive(d.depth)}
            className={`rounded border px-3 py-1.5 text-sm font-medium transition ${
              d.depth === active
                ? 'text-surface-base border-yellow-400 bg-yellow-400'
                : 'border-line bg-surface-overlay text-content hover:border-line-strong'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {current?.tiles.map((tile) => (
          <Tile key={tile.key} tile={tile} />
        ))}
      </div>
    </section>
  );
}
