'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useEffect, useState } from 'react';
import { LanguageSwitcher, type LanguageSwitcherStrings } from './LanguageSwitcher';
import { SearchModal, type SearchStrings } from './SearchModal';
import type { Lang } from '@/lib/i18n/config';

/** Item de nav pré-localisé côté serveur (icône = URL R2 résolue). */
export interface HeaderNavItem {
  href: string;
  label: string;
  short: string;
  iconSrc: string;
  /** Sous-menu (Guides : les catégories). */
  children?: Array<{ href: string; label: string }>;
}

export interface HeaderStrings {
  toggleMenu: string;
  lang: LanguageSwitcherStrings;
  /** Palette de recherche (Ctrl+K) : libellés + placeholder court du trigger. */
  search: SearchStrings & { short: string };
}

/** Loupe (trigger + barre de la palette). */
function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function NavIcon({ src, alt, size }: { src: string; alt: string; size: number }) {
  return <img src={src} alt={alt} width={size} height={size} className="object-contain" />;
}

/**
 * En-tête interactif (structure V2, tokens V3) : logo + badges de version,
 * nav à icônes de jeu (libellé court < xl, long ≥ xl), dropdown Guides au
 * survol, collapse au scroll (hystérésis), drawer mobile. L'emplacement de la
 * RECHERCHE (trigger + Ctrl+K de la V2) est réservé — cf. TODO
 * « Pages manquantes ».
 */
export function HeaderClient({
  lang,
  nav,
  appVersion,
  gameVersion,
  strings,
}: {
  lang: Lang;
  nav: HeaderNavItem[];
  appVersion: string;
  gameVersion: string;
  strings: HeaderStrings;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Raccourci global Ctrl/⌘+K (convention des palettes de recherche) + événement
  // `op:open-search` : d'autres surfaces (bandeau d'accueil…) ouvrent la palette
  // sans connaître l'état interne du header.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    const onOpen = () => setSearchOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('op:open-search', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('op:open-search', onOpen);
    };
  }, []);

  // Collapse au scroll — hystérésis (replie > 40, déplie < 10) : la zone morte
  // est plus large que la variation de hauteur du header, l'ancrage de scroll
  // du navigateur ne peut pas osciller entre les deux états près du haut.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled((prev) => (prev ? y > 10 : y > 40));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Repli du drawer au passage desktop.
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <header className="border-line-subtle bg-surface-raised/80 supports-backdrop-filter:bg-surface-raised/60 sticky top-0 z-60 border-b backdrop-blur">
      <div
        className={`mx-auto flex items-center gap-3 px-3 transition-[padding] md:px-6 ${
          scrolled ? 'py-1.5' : 'py-2.5 md:py-3'
        }`}
      >
        {/* Logo + versions */}
        <Link href={'/' as Route} className="flex shrink-0 items-center gap-2">
          <img
            src="/favicon.ico"
            alt="Outerpedia"
            width={28}
            height={28}
            className={`object-contain transition-[width,height] ${scrolled ? 'h-6 w-6' : 'h-7 w-7'}`}
          />
          <span
            className={`text-content-strong font-semibold tracking-wide transition-[font-size] ${
              scrolled ? 'text-sm' : 'text-base'
            }`}
          >
            Outerpedia
          </span>
          {!scrolled && (
            <span className="text-content-subtle hidden flex-col items-start gap-0.5 font-mono text-[9px] tracking-widest uppercase lg:inline-flex">
              <span className="border-line rounded border px-1.5 py-0.5">v{appVersion}</span>
              <span
                className="border-line rounded border px-1.5 py-0.5"
                title={`Game version ${gameVersion}`}
              >
                GV {gameVersion}
              </span>
            </span>
          )}
        </Link>

        {/* Nav desktop */}
        <nav className="ml-1 hidden items-center gap-0.5 md:flex lg:gap-1">
          {nav.map((item) => (
            <div key={item.href} className="group relative">
              <Link
                href={item.href as Route}
                className={`text-content-muted hover:bg-surface-overlay hover:text-content-strong flex items-center gap-1.5 rounded-md text-sm transition lg:gap-2 ${
                  scrolled ? 'px-2 py-1' : 'px-2 py-1.5 lg:px-3'
                }`}
                aria-label={item.label}
                title={item.label}
              >
                <span className="hidden lg:inline-block">
                  <NavIcon src={item.iconSrc} alt="" size={scrolled ? 16 : 18} />
                </span>
                <span className="whitespace-nowrap xl:hidden">{item.short}</span>
                <span className="hidden whitespace-nowrap xl:inline">{item.label}</span>
              </Link>

              {item.children && (
                <div className="pointer-events-none absolute top-full left-0 pt-1 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
                  <div className="border-line bg-surface-raised min-w-52 rounded-lg border py-1 shadow-xl">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href as Route}
                        className="text-content-muted hover:bg-surface-overlay hover:text-content-strong block px-4 py-2 text-sm"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Droite desktop : recherche + admin (dev) + langue. */}
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label={strings.search.placeholder}
            className="border-line bg-surface-base text-content-subtle hover:text-content-muted flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs transition"
          >
            <SearchIcon size={14} />
            <span className="hidden lg:inline">{strings.search.short}</span>
            <kbd className="border-line hidden rounded border px-1 py-0.5 font-mono text-[10px] lg:inline-block">
              ⌘K
            </kbd>
          </button>
          {process.env.NODE_ENV === 'development' && (
            <Link
              href={'/admin' as Route}
              className="bg-warn/15 text-warn rounded-md px-2.5 py-1.5 text-xs font-semibold tracking-wide uppercase"
              title="Admin (dev only)"
            >
              Admin
            </Link>
          )}
          <LanguageSwitcher current={lang} strings={strings.lang} />
        </div>

        {/* Droite mobile : recherche + burger */}
        <div className="ml-auto flex items-center gap-2 md:hidden">
          <button
            className="border-line bg-surface-base text-content-muted hover:bg-surface-overlay flex size-9 items-center justify-center rounded-lg border transition"
            onClick={() => setSearchOpen(true)}
            aria-label={strings.search.placeholder}
          >
            <SearchIcon size={16} />
          </button>
          <button
            className="border-line bg-surface-base text-content-muted hover:bg-surface-overlay flex size-9 items-center justify-center rounded-lg border transition"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={strings.toggleMenu}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              {menuOpen ? (
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Drawer mobile */}
      {menuOpen && (
        <div className="border-line-subtle bg-surface-raised relative z-60 border-t md:hidden">
          <div className="flex flex-col gap-3 px-4 py-4">
            <nav className="flex flex-col gap-0.5">
              {nav.map((item) => (
                <div key={item.href}>
                  <Link
                    href={item.href as Route}
                    className="text-content hover:bg-surface-overlay flex items-center gap-3 rounded-md px-2 py-2.5 text-sm transition"
                    onClick={() => setMenuOpen(false)}
                    aria-label={item.label}
                  >
                    <span className="bg-surface-overlay flex size-7 items-center justify-center rounded">
                      <NavIcon src={item.iconSrc} alt="" size={16} />
                    </span>
                    <span className="flex-1">{item.label}</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-content-subtle"
                      aria-hidden
                    >
                      <path
                        d="M9 6l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                  {item.children && (
                    <div className="ml-10 flex flex-col gap-0.5 pb-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href as Route}
                          className="text-content-subtle hover:bg-surface-overlay hover:text-content-strong rounded px-2 py-1.5 text-sm transition"
                          onClick={() => setMenuOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
            <div className="border-line-subtle border-t pt-3">
              <LanguageSwitcher current={lang} strings={strings.lang} variant="mobile-chips" />
            </div>
          </div>
        </div>
      )}

      {searchOpen && (
        <SearchModal lang={lang} strings={strings.search} onClose={() => setSearchOpen(false)} />
      )}
    </header>
  );
}
