'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { useUrlSlice } from '@/hooks/useUrlSlice';
import { readHashParam, writeHashParam } from '@/lib/url-hash';

export interface BannerTabDef {
  id: string;
  /** Libellé DÉJÀ localisé (superposé en bas du visuel). */
  label: string;
  /** URL complète du visuel de la carte (sprite ~206×94, `img.recruitSprite`). */
  imageSrc: string;
  content: ReactNode;
}

/**
 * Onglets à CARTES-IMAGES (colonne de vignettes de bannières, contenu à
 * droite) — le sélecteur du guide « Banners & Mileage » (portage V2). Même
 * politique d'URL que `SegmentedTabs` (règle 2026-07-16 : état interne d'un
 * guide = HASH multi-params) : `#<urlKey>=<id>` via url-hash, l'URL reste la
 * source de vérité et la page statiquement rendable. Sans `urlKey`, simple
 * état local.
 */
export function BannerTabs({ tabs, urlKey }: { tabs: BannerTabDef[]; urlKey?: string }) {
  const [localTab, setLocalTab] = useState<string | null>(null);
  // Lecture inconditionnelle (règle des hooks) ; ignorée sans `urlKey`. Snapshot
  // serveur `null` → premier rendu sur le 1er onglet, resync après hydratation.
  const hashValue = useUrlSlice('hashchange', () => (urlKey ? readHashParam(urlKey) : null));
  const fromHash = hashValue && tabs.some((t) => t.id === hashValue) ? hashValue : null;
  const active = (urlKey ? fromHash : localTab) ?? tabs[0]?.id;
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  const select = (id: string) => {
    if (urlKey) writeHashParam(urlKey, id);
    else setLocalTab(id);
  };

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      {/* Sprites du jeu affichés à leur taille NATIVE (~206×94 ; badges ~69×28) :
          les étirer les pixelise, les cadrer en 280×80 les coupe. */}
      <div className="flex w-51.5 shrink-0 flex-col gap-4">
        {tabs.map((tab) => {
          const on = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => select(tab.id)}
              aria-pressed={on}
              className={cn(
                'group relative w-full overflow-visible rounded-xl ring-2 transition-all duration-300',
                on
                  ? 'ring-ed-amber shadow-[0_0_8px_var(--ed-amber-glow)]'
                  : 'hover:ring-ed-amber-faint/60 ring-transparent',
              )}
            >
              <span className="relative block h-23.5 w-51.5 overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
                <img
                  src={tab.imageSrc}
                  alt={tab.label}
                  width={206}
                  height={94}
                  className="h-full w-full object-contain"
                />
                {/* Contour noir (ombre aux 4 points cardinaux) : lisible sur
                    n'importe quelle zone claire du visuel. */}
                <span className="text-content-strong pointer-events-none absolute right-3 bottom-2 text-left text-sm font-bold [text-shadow:-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000,0_1px_3px_rgb(0_0_0/80%)]">
                  {tab.label}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="min-w-0 flex-1">{current?.content}</div>
    </div>
  );
}
