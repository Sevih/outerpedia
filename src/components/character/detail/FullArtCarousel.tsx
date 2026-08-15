'use client';

import { useRef, useState } from 'react';
import { setSkin, useSiteSettings } from '@/lib/site-settings';

export interface FullArt {
  src: string;
  alt: string;
  /** Nom du skin en légende ; null pour l'art par défaut. */
  label: string | null;
  /**
   * ModelNameID du costume — la clé des réglages du site (« utiliser ce
   * portrait ») ; null pour l'art de BASE, dont le choix EFFACE l'entrée.
   */
  model: string | null;
}

/**
 * Visionneuse d'art en pied (portée telle quelle) : image simple s'il n'y a qu'un art,
 * carrousel swipe (flèches + points + légende) dès qu'il y a des skins — avec,
 * sous les points, le bouton « utiliser ce portrait » qui pose le skin courant
 * dans les réglages du site (`site-settings`, partagé avec la modale du header).
 */
export function FullArtCarousel({
  items,
  charId,
  hex,
  strings,
}: {
  items: FullArt[];
  /** Id de BASE du perso de la fiche — la clé sous laquelle le choix est rangé. */
  charId: string;
  hex: string;
  /** Libellés a11y localisés (composant client) — `show` : gabarit `{n}`. */
  strings: { prev: string; next: string; show: string; usePortrait: string; inUse: string };
}) {
  const { skins } = useSiteSettings();
  const [active, setActive] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const length = items.length;

  if (length <= 1) {
    const art = items[0];
    return (
      <div className="relative mx-auto aspect-6/7 w-full max-w-90 shrink-0 lg:mx-0">
        {art && (
          <img
            src={art.src}
            alt={art.alt}
            className="absolute inset-0 h-full w-full object-contain"
          />
        )}
      </div>
    );
  }

  const go = (next: number) => setActive((next + length) % length);
  const current = items[active];

  return (
    <div className="mx-auto flex w-full max-w-90 shrink-0 flex-col items-center gap-2.5 lg:mx-0">
      <div
        className="relative aspect-6/7 w-full"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
          touchStartX.current = null;
        }}
      >
        {items.map((art, i) => (
          <img
            key={art.src}
            src={art.src}
            alt={art.alt}
            className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ${i === active ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          />
        ))}

        <button
          type="button"
          onClick={() => go(active - 1)}
          aria-label={strings.prev}
          className="absolute top-1/2 left-0 -translate-y-1/2 rounded-full border border-white/10 bg-slate-950/55 p-1.5 text-zinc-200 backdrop-blur transition hover:bg-slate-950/80 hover:text-white"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => go(active + 1)}
          aria-label={strings.next}
          className="absolute top-1/2 right-0 -translate-y-1/2 rounded-full border border-white/10 bg-slate-950/55 p-1.5 text-zinc-200 backdrop-blur transition hover:bg-slate-950/80 hover:text-white"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Légende — hauteur réservée pour éviter le layout shift. */}
      <div className="font-game flex h-5 items-center text-sm text-zinc-300">{current.label}</div>

      <div className="flex justify-center gap-2">
        {items.map((art, i) => (
          <button
            key={art.src}
            type="button"
            onClick={() => setActive(i)}
            aria-label={strings.show.replace('{n}', String(i + 1))}
            aria-current={i === active ? 'true' : undefined}
            style={i === active ? { backgroundColor: hex, width: '1.5rem' } : undefined}
            className={`h-2 rounded-full transition-all ${i === active ? '' : 'w-2 bg-zinc-700 hover:bg-zinc-500'}`}
          />
        ))}
      </div>

      {/* Le choix de portrait — même store que la modale du header. L'art de
          base (`model` null) est « actuel » quand aucune entrée n'existe. */}
      {(() => {
        const isCurrent = (skins[charId] ?? null) === current.model;
        return (
          <button
            type="button"
            disabled={isCurrent}
            onClick={() => setSkin(charId, current.model)}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              isCurrent
                ? 'cursor-default border-white/20 text-zinc-300'
                : 'border-white/10 bg-slate-950/55 text-zinc-200 hover:bg-slate-950/80 hover:text-white'
            }`}
            style={isCurrent ? { borderColor: hex, color: hex } : undefined}
          >
            {isCurrent ? strings.inUse : strings.usePortrait}
          </button>
        );
      })()}
    </div>
  );
}
