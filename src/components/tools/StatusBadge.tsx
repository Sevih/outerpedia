/**
 * Badge de statut d'un outil (glyphe + libellé mono). `coming-soon` neutre,
 * `hidden` (DEV) ambre, `unlisted` bleu. Portage V2 (neutres → tokens).
 */
export type ToolBadgeStatus = 'coming-soon' | 'hidden' | 'unlisted';

export function StatusBadge({
  status,
  comingSoonLabel,
}: {
  status: ToolBadgeStatus;
  comingSoonLabel: string;
}) {
  if (status === 'coming-soon') {
    return (
      <span className="border-line bg-surface-raised text-content-muted inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[9.5px] font-semibold tracking-[0.12em] uppercase">
        <ClockGlyph />
        {comingSoonLabel}
      </span>
    );
  }
  if (status === 'hidden') {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-500/50 bg-amber-500/10 px-2 py-0.5 font-mono text-[9.5px] font-semibold tracking-[0.12em] text-amber-300 uppercase">
        <span className="size-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)]" />
        DEV
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-sky-500/50 bg-sky-500/10 px-2 py-0.5 font-mono text-[9.5px] font-semibold tracking-[0.12em] text-sky-300 uppercase">
      <EyeOffGlyph />
      UNLISTED
    </span>
  );
}

function ClockGlyph() {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="6" cy="6" r="4.2" />
      <path d="M6 3.5V6l1.5 1.2" />
    </svg>
  );
}

function EyeOffGlyph() {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M2 6c1.5-2.5 3-4 4-4s2.5 1.5 4 4M2 6c1.5 2.5 3 4 4 4s2.5-1.5 4-4M2 2l8 8" />
    </svg>
  );
}
