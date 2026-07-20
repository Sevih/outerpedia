'use client';

import { useEffect } from 'react';
import { AdvancedFiltersPanel, type AdvancedFiltersPanelProps } from './AdvancedFiltersPanel';
import { TONE } from './FilterAtoms';

export interface DrawerLabels {
  advanced: string;
  reset: string;
  close: string;
  /** Gabarit `{count}` du bouton d'application (« N persos »). */
  matches: string;
}

type Props = AdvancedFiltersPanelProps & {
  open: boolean;
  onClose: () => void;
  onResetAll: () => void;
  matchCount: number;
  totalCount: number;
  drawerLabels: DrawerLabels;
};

/**
 * Drawer des filtres avancés (mobile/tablette) : bottom-sheet en bas d'écran,
 * panneau latéral droit à partir de md. Sous xl uniquement (la sidebar prend le
 * relais au-delà). TOUJOURS monté, ouverture/fermeture pilotées par CSS
 * (transform + opacité) — pas de state d'animation, transitions d'entrée ET de
 * sortie gratuites. Portage V2 sur tokens V3 + token `scrim`.
 */
export function CharactersFiltersDrawer({
  open,
  onClose,
  onResetAll,
  matchCount,
  totalCount,
  drawerLabels,
  ...panelProps
}: Props) {
  // Verrou de scroll + Échap tant que le drawer est ouvert.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-70 flex items-end md:items-stretch md:justify-end xl:hidden ${open ? '' : 'pointer-events-none'}`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
    >
      {/* Scrim */}
      <button
        type="button"
        aria-label={drawerLabels.close}
        onClick={onClose}
        tabIndex={open ? 0 : -1}
        className={`bg-scrim/60 absolute inset-0 cursor-default transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Panneau */}
      <aside
        className={`border-line-subtle bg-surface-base relative flex h-[88vh] w-full flex-col rounded-t-2xl border-t shadow-2xl transition-transform duration-200 ease-out md:h-full md:max-h-none md:w-full md:max-w-lg md:rounded-none md:border-t-0 md:border-l ${
          open
            ? 'translate-y-0 md:translate-x-0'
            : 'translate-y-full md:translate-x-full md:translate-y-0'
        }`}
      >
        {/* Poignée (mobile) */}
        <div className="flex justify-center pt-2.5 md:hidden">
          <span className="bg-line h-1 w-10 rounded" aria-hidden />
        </div>

        {/* En-tête */}
        <div className="border-line-subtle/80 flex items-center gap-3 border-b px-5 py-3.5">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-accent">
            <path
              d="M2 4h12M4 8h8M6 12h4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <div className="text-content-strong min-w-0 flex-1 text-sm font-semibold">
            {drawerLabels.advanced}
          </div>
          <button
            type="button"
            onClick={onResetAll}
            className="text-content-muted hover:text-content-strong text-[11px] transition"
          >
            {drawerLabels.reset}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label={drawerLabels.close}
            className="border-line-subtle text-content-muted hover:border-line hover:text-content-strong flex size-7 items-center justify-center rounded-md border transition"
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 2l8 8M10 2l-8 8"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <AdvancedFiltersPanel {...panelProps} />

        {/* Pied */}
        <div className="border-line-subtle/80 bg-surface-base/95 flex items-center gap-2 border-t px-5 py-3">
          <span className="text-content-muted font-mono text-xs">
            <span className="text-content-strong text-base font-semibold">{matchCount}</span>
            <span className="text-content-subtle ml-1">/ {totalCount}</span>
          </span>
          <div className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            style={{ background: TONE.cyan }}
            className="inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-[#0a0a0a] transition hover:brightness-110"
          >
            {drawerLabels.matches.replace('{count}', String(matchCount))}
          </button>
        </div>
      </aside>
    </div>
  );
}
