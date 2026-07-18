'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { useUrlTab } from '@/hooks/useUrlTab';

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
 * politique d'URL que `Tabs` (hook `useUrlTab`) : `?<urlParam>=<id>` via
 * replaceState, l'URL est la source de vérité, la page reste statiquement
 * rendable.
 */
export function BannerTabs({ tabs, urlParam }: { tabs: BannerTabDef[]; urlParam?: string }) {
  const { active, current, select } = useUrlTab(tabs, urlParam);

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
