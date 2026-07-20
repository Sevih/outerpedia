'use client';

import { AdvancedFiltersPanel, type AdvancedFiltersPanelProps } from './AdvancedFiltersPanel';

type Props = AdvancedFiltersPanelProps & {
  advancedLabel: string;
  resetLabel: string;
  onResetAll: () => void;
};

/**
 * Colonne de filtres avancés persistante (xl+). Même corps que le drawer
 * mobile (`AdvancedFiltersPanel`) mais rendue inline, sticky, avec son propre
 * scroll — pas d'overlay ni de scrim.
 */
export function CharactersFiltersSidebar({
  advancedLabel,
  resetLabel,
  onResetAll,
  ...panelProps
}: Props) {
  return (
    <aside className="hidden w-90 shrink-0 xl:block">
      <div className="border-line-subtle bg-surface-raised/60 sticky top-4 flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-xl border">
        <div className="border-line-subtle/80 flex items-center gap-3 border-b px-4 py-3">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-accent">
            <path
              d="M2 4h12M4 8h8M6 12h4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <div className="text-content-strong min-w-0 flex-1 text-sm font-semibold">
            {advancedLabel}
          </div>
          <button
            type="button"
            onClick={onResetAll}
            className="text-content-muted hover:text-content-strong text-[11px] transition"
          >
            {resetLabel}
          </button>
        </div>
        <AdvancedFiltersPanel {...panelProps} />
      </div>
    </aside>
  );
}
