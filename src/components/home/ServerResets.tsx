'use client';

import { useNow } from '@/hooks/useNow';

/**
 * Comptes à rebours des resets serveur (daily 00:00 UTC, weekly lundi, monthly
 * 1er). Purement calculé depuis l'horloge partagée — aucune donnée. Placeholder
 * tant que `now === null` (SSR / avant montage), pour l'accord d'hydratation.
 */
type ResetTimers = { daily: number; weekly: number; monthly: number };

function computeTimers(now: number): ResetTimers {
  const nextDaily = new Date(now);
  nextDaily.setUTCHours(24, 0, 0, 0);

  const nextWeekly = new Date(now);
  const dayOfWeek = nextWeekly.getUTCDay(); // 0=dim, 1=lun
  const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 7 : 8 - dayOfWeek;
  nextWeekly.setUTCDate(nextWeekly.getUTCDate() + daysUntilMonday);
  nextWeekly.setUTCHours(0, 0, 0, 0);
  if (nextWeekly.getTime() <= now) nextWeekly.setUTCDate(nextWeekly.getUTCDate() + 7);

  const nextMonthly = new Date(now);
  nextMonthly.setUTCMonth(nextMonthly.getUTCMonth() + 1, 1);
  nextMonthly.setUTCHours(0, 0, 0, 0);
  if (nextMonthly.getTime() <= now) nextMonthly.setUTCMonth(nextMonthly.getUTCMonth() + 1);

  return {
    daily: nextDaily.getTime() - now,
    weekly: nextWeekly.getTime() - now,
    monthly: nextMonthly.getTime() - now,
  };
}

function formatTime(ms: number): string {
  if (ms <= 0) return '0s';
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

export function ServerResets({
  title,
  labels,
}: {
  title: string;
  labels: { daily: string; weekly: string; monthly: string };
}) {
  const now = useNow();
  const timers = now === null ? null : computeTimers(now);

  const rows = [
    { label: labels.daily, ms: timers?.daily, color: 'text-emerald-400' },
    { label: labels.weekly, ms: timers?.weekly, color: 'text-cyan-400' },
    { label: labels.monthly, ms: timers?.monthly, color: 'text-amber-400' },
  ];

  return (
    <div className="card-interactive flex flex-col justify-center gap-2 p-4">
      <p className="text-content-muted text-xs font-semibold tracking-wide uppercase">{title}</p>
      {rows.map(({ label, ms, color }) => (
        <div key={label} className="flex items-center justify-between gap-4">
          <span className={`text-sm font-semibold ${color}`}>{label}</span>
          {ms === undefined ? (
            <span className="bg-surface-raised inline-block h-5 w-24 rounded" />
          ) : (
            <span className="text-content font-mono text-sm tabular-nums">{formatTime(ms)}</span>
          )}
        </div>
      ))}
    </div>
  );
}
