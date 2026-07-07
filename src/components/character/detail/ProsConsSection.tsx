'use client';

import { useState, type ReactNode } from 'react';

interface SideProps {
  label: string;
  items: ReactNode[];
  tone: string;
  sign: string;
}

function Side({ label, items, tone, sign }: SideProps) {
  return (
    <div className="card rounded-xl p-4">
      <div
        className={`mb-2.5 font-mono text-[10px] font-semibold tracking-[0.2em] uppercase ${tone}`}
      >
        {label}
      </div>
      {items.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {items.map((entry, i) => (
            <li
              key={i}
              className="grid grid-cols-[16px_1fr] gap-1.5 text-[13px] leading-snug text-zinc-300"
            >
              <span className={`font-mono text-sm font-bold ${tone}`}>{sign}</span>
              <span className="first-letter:uppercase">{entry}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-zinc-500 italic">—</p>
      )}
    </div>
  );
}

const COLLAPSED_COUNT = 4;

/**
 * Forces & faiblesses (portage V2) : deux colonnes, repli à 4 entrées.
 * Les items arrivent PRÉ-RENDUS du serveur (parse-text) — ce composant ne
 * gère que le repli/dépli.
 */
export function ProsConsSection({
  pros,
  cons,
  prosLabel,
  consLabel,
  showMoreLabel,
  showLessLabel,
}: {
  pros: ReactNode[];
  cons: ReactNode[];
  prosLabel: string;
  consLabel: string;
  showMoreLabel: string;
  showLessLabel: string;
}) {
  const [expanded, setExpanded] = useState(false);
  if (!pros.length && !cons.length) return null;

  const hidden =
    Math.max(0, pros.length - COLLAPSED_COUNT) + Math.max(0, cons.length - COLLAPSED_COUNT);
  const shownPros = expanded ? pros : pros.slice(0, COLLAPSED_COUNT);
  const shownCons = expanded ? cons : cons.slice(0, COLLAPSED_COUNT);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-2">
        <Side label={prosLabel} items={shownPros} tone="text-emerald-400" sign="+" />
        <Side label={consLabel} items={shownCons} tone="text-red-400" sign="−" />
      </div>

      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200"
        >
          {expanded ? showLessLabel : showMoreLabel}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      )}
    </div>
  );
}
