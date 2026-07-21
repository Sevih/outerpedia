'use client';

import { FaSearch } from 'react-icons/fa';
import { img } from '@/lib/images';

/**
 * Bandeau d'accueil : bannière du site (chrome, `img.homeBanner`) assombrie pour
 * la lisibilité, titre discret, et déclencheur de recherche (élément focal, ouvre
 * la palette via l'événement `op:open-search` écouté par le header). Overlay en
 * noir littéral (par-dessus une photo, indépendant du thème).
 */
export interface HeroStrings {
  title: string;
  description: string;
  searchPlaceholder: string;
}

export function HomeHero({ strings }: { strings: HeroStrings }) {
  const openSearch = () => window.dispatchEvent(new CustomEvent('op:open-search'));

  return (
    <section className="relative isolate min-h-44 overflow-hidden md:min-h-52 lg:min-h-60">
      <img
        src={img.homeBanner()}
        alt={strings.title}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-b from-[rgb(0_0_0/0.55)] via-[rgb(0_0_0/0.35)] to-[rgb(0_0_0/0.8)]"
      />

      <div className="relative z-10 mx-auto flex min-h-44 w-full max-w-3xl flex-col items-center justify-center gap-3 px-4 py-8 md:min-h-52 md:py-10 lg:min-h-60 lg:py-12">
        <h1 className="border-line-subtle text-content-muted rounded-md border bg-[rgb(0_0_0/0.35)] px-3 py-1 text-center text-xs font-semibold tracking-widest text-balance uppercase backdrop-blur-xs sm:text-sm">
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
