'use client';

import { FaSearch } from 'react-icons/fa';

/**
 * Bandeau d'accueil : titre discret + déclencheur de recherche (élément focal).
 * Le bouton ouvre la palette globale via un événement `op:open-search` écouté par
 * le header (HeaderClient). Fond en dégradé de tokens — pas d'image dédiée en V3.
 */
export interface HeroStrings {
  title: string;
  description: string;
  searchPlaceholder: string;
}

export function HomeHero({ strings }: { strings: HeroStrings }) {
  const openSearch = () => window.dispatchEvent(new CustomEvent('op:open-search'));

  return (
    <section className="from-surface-raised to-surface relative isolate min-h-44 overflow-hidden bg-gradient-to-b md:min-h-52 lg:min-h-60">
      <div className="relative z-10 mx-auto flex min-h-44 w-full max-w-3xl flex-col items-center justify-center gap-3 px-4 py-8 md:min-h-52 md:py-10 lg:min-h-60 lg:py-12">
        <h1 className="border-line-subtle bg-surface-overlay/60 text-content-muted rounded-md border px-3 py-1 text-center text-xs font-semibold tracking-widest text-balance uppercase backdrop-blur-xs sm:text-sm">
          {strings.title}
        </h1>

        <p className="sr-only">{strings.description}</p>

        <button
          type="button"
          onClick={openSearch}
          className="border-line bg-surface/85 text-content-muted hover:border-accent hover:bg-surface flex w-full max-w-md items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm shadow-2xl backdrop-blur transition"
        >
          <FaSearch className="text-content-subtle shrink-0" />
          <span className="text-content-subtle flex-1 truncate">{strings.searchPlaceholder}</span>
          <kbd className="border-line bg-surface-raised text-content-muted hidden rounded border px-1.5 py-0.5 font-mono text-[10px] sm:inline">
            Ctrl+K
          </kbd>
        </button>
      </div>
    </section>
  );
}
