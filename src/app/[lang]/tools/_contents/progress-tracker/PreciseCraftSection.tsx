'use client';

/**
 * Section « fabrication précise » du Progress Tracker (sous le cycle mensuel).
 * Extrait de `ProgressTrackerBrowser.tsx` le 03/10/2026 (découpage mécanique,
 * contenu inchangé).
 */
import { formatDuration } from '@/lib/format-duration';
import { getNextPreciseCraftTime, isPreciseCraftAvailable, type UserProgress } from './tracker';
import type { TrackerLabels } from './contracts';

/** Fabrication précise : un seul « slot », cooldown 30 jours glissants. */
export function PreciseCraftSection({
  view,
  now,
  labels,
  craftIcon,
  onToggle,
}: {
  view: UserProgress;
  now: number;
  labels: TrackerLabels;
  craftIcon: string;
  onToggle: () => void;
}) {
  const available = isPreciseCraftAvailable(view, now);
  const nextTime = getNextPreciseCraftTime(view, now);
  const completed = view.preciseCraft.completedAt !== null && !available;
  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center gap-2">
        <img
          src={craftIcon}
          alt=""
          aria-hidden
          width={24}
          height={24}
          className="size-6 object-contain"
        />
        <h3 className="text-lg font-semibold text-purple-400">{labels.preciseCraft}</h3>
      </div>
      <button
        type="button"
        aria-pressed={completed}
        className={`flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-left transition-all ${
          completed
            ? 'bg-surface-raised/30 opacity-60'
            : available
              ? 'border border-purple-500/30 bg-purple-900/20 hover:bg-purple-900/30'
              : 'bg-surface-raised/50'
        }`}
        onClick={onToggle}
      >
        <div
          className={`flex size-6 items-center justify-center rounded-full border-2 transition-all ${
            completed ? 'border-purple-500 bg-purple-500' : 'border-line-strong'
          }`}
        >
          {completed && (
            <svg
              className="text-content-strong size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <span className={completed ? 'text-content-muted line-through' : 'text-content'}>
            {labels.preciseCraftItem}
          </span>
          {nextTime && (
            <div className="text-content-subtle mt-1 text-xs">
              {labels.availableIn}: {formatDuration(nextTime - now, labels.duration)}
            </div>
          )}
          {available && view.preciseCraft.completedAt === null && (
            <div className="mt-1 text-xs text-purple-400">{labels.availableNow}</div>
          )}
        </div>
      </button>
    </div>
  );
}
