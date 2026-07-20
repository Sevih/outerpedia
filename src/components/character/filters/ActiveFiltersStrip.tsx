'use client';

import { ActiveChip, Eyebrow } from './FilterAtoms';

export interface ActiveChipItem {
  key: string;
  label: React.ReactNode;
  color: string;
  prefix?: string;
  onRemove: () => void;
}

export interface StripLabels {
  /** Gabarit `{count}` — « N characters » (compte de résultats). */
  count: string;
  emptyHint: string;
  reset: string;
  copy: string;
  copied: string;
}

interface Props {
  items: ActiveChipItem[];
  matchCount: number;
  labels: StripLabels;
  onResetAll: () => void;
  onCopyShareUrl: () => void;
  copied: boolean;
}

/**
 * Bandeau des filtres actifs : compte + chips removables + reset + copier le
 * lien de partage. Aligné sous la barre, plafonné à la largeur de la grille.
 */
export function ActiveFiltersStrip({
  items,
  matchCount,
  labels,
  onResetAll,
  onCopyShareUrl,
  copied,
}: Props) {
  if (items.length === 0) {
    return (
      <div className="border-line-subtle/80 bg-surface-raised/60 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2">
        <Eyebrow>{labels.count.replace('{count}', String(matchCount))}</Eyebrow>
        <span className="text-content-subtle text-xs">{labels.emptyHint}</span>
      </div>
    );
  }

  return (
    <div className="border-line-subtle/80 bg-surface-raised/60 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2">
      <Eyebrow>{labels.count.replace('{count}', String(matchCount))}</Eyebrow>
      <div className="flex flex-1 flex-wrap items-center gap-1.5">
        {items.map((item) => (
          <ActiveChip
            key={item.key}
            label={item.label}
            color={item.color}
            prefix={item.prefix}
            onRemove={item.onRemove}
          />
        ))}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={onResetAll}
          className="border-line-subtle bg-surface-sunken/70 text-content-muted hover:border-line hover:text-content-strong inline-flex h-6.5 items-center gap-1.5 rounded-md border px-2.5 text-[11px] transition"
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 4h8M3 4v6a1 1 0 001 1h4a1 1 0 001-1V4M5 4V3a1 1 0 011-1h0a1 1 0 011 1v1"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
          {labels.reset}
        </button>
        <button
          type="button"
          onClick={onCopyShareUrl}
          className="border-accent/40 bg-accent/15 text-accent hover:bg-accent/25 inline-flex h-6.5 items-center gap-1.5 rounded-md border px-2.5 text-[11px] transition"
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path
              d="M5 7l-1 1a2 2 0 11-3-3l2-2a2 2 0 013 0M7 5l1-1a2 2 0 113 3l-2 2a2 2 0 01-3 0"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
          {copied ? labels.copied : labels.copy}
        </button>
      </div>
    </div>
  );
}
