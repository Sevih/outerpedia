'use client';

import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { EDITORIAL_ACCENT, type EditorialAccent } from './accents';

export interface TocSection {
  /** Ancre (`id` de la section dans la page) — stable, jamais localisé. */
  id: string;
  accent: EditorialAccent;
  /** Libellé DÉJÀ localisé (l'appelant est un composant serveur). */
  label: string;
}

/** Décalage de visée : header sticky du site + la barre elle-même. */
const SCROLL_OFFSET = 110;

/**
 * Sommaire sticky horizontal avec scroll-spy — pills accentuées, la section
 * courante s'allume. Seule brique CLIENTE des primitives éditoriales : le
 * repérage de section et le saut adouci exigent le DOM.
 *
 * Les sections cibles doivent porter `scroll-mt-28` (ancres natives correctes
 * même sans JS — le clic écrit le hash).
 */
export function TocBar({ ariaLabel, sections }: { ariaLabel: string; sections: TocSection[] }) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? '');

  useEffect(() => {
    const ids = sections.map((s) => s.id);
    const onScroll = () => {
      // Ligne de visée à 28 % du viewport : la dernière section entamée gagne.
      const trigger = window.scrollY + window.innerHeight * 0.28;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= trigger) current = id;
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [sections]);

  const jump = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET,
      behavior: 'smooth',
    });
  }, []);

  return (
    <nav
      aria-label={ariaLabel}
      className="border-line-subtle bg-surface-base/85 sticky top-12.25 z-30 -mx-4 border-y px-4 backdrop-blur lg:-mx-6 lg:px-6"
    >
      <ul className="flex flex-wrap justify-center gap-1.5 py-2.5">
        {sections.map((s) => {
          const a = EDITORIAL_ACCENT[s.accent];
          const on = s.id === activeId;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  jump(s.id);
                }}
                className={cn(
                  'inline-flex items-center rounded-full border px-3 py-1 text-xs transition-colors',
                  on
                    ? cn('font-medium', a.text, a.chipBg, a.chipBorder)
                    : 'text-content-muted hover:text-content hover:bg-surface-overlay/60 border-transparent',
                )}
              >
                {s.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
