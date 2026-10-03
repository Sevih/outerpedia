'use client';

/**
 * Briques d'affichage du Progress Tracker — composants de présentation
 * partagés entre le composant principal, la liste de tâches et les deux
 * modales (bouton d'action, interrupteur de réglage, jauges par cycle, libellé
 * de tâche). Extrait de `ProgressTrackerBrowser.tsx` le 03/10/2026 (découpage
 * mécanique, contenu inchangé).
 */
import type { TaskDefinition } from './tasks';
import type { TrackerAssets, TrackerLabels } from './contracts';

/** Couleurs de jauge par palier de complétion (palette conservée). */
function progressColor(percent: number): { bar: string; border: string; glow: string } {
  if (percent >= 100)
    return { bar: 'bg-green-500', border: 'border-green-500', glow: 'shadow-green-500/20' };
  if (percent >= 75)
    return { bar: 'bg-lime-500', border: 'border-lime-500', glow: 'shadow-lime-500/20' };
  if (percent >= 50)
    return { bar: 'bg-yellow-500', border: 'border-yellow-500', glow: 'shadow-yellow-500/20' };
  if (percent >= 25)
    return { bar: 'bg-orange-500', border: 'border-orange-500', glow: 'shadow-orange-500/20' };
  return { bar: 'bg-red-500', border: 'border-red-500', glow: 'shadow-red-500/20' };
}

/** Panneau des deux modales (export/import, réglages) — seule la largeur change. */
export const MODAL_PANEL = 'bg-surface-raised max-h-[80vh] w-full overflow-y-auto rounded-lg p-6';

export function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group bg-surface-raised/50 hover:bg-surface-raised flex items-center justify-center gap-2 rounded-lg p-2 transition"
    >
      <img
        src={icon}
        alt=""
        aria-hidden
        width={32}
        height={32}
        className="size-8 object-contain transition-transform group-hover:scale-110"
      />
      <span className="text-content-muted group-hover:text-content text-sm transition-colors">
        {label}
      </span>
    </button>
  );
}

export function SettingToggle({
  checked,
  title,
  desc,
  onChange,
}: {
  checked: boolean;
  title: string;
  desc: string;
  onChange: () => void;
}) {
  return (
    <div className="bg-surface-overlay rounded-lg p-4">
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="size-5 accent-sky-500"
        />
        <div className="flex-1">
          <span className="font-medium">{title}</span>
          <p className="text-content-muted mt-1 text-sm">{desc}</p>
        </div>
      </label>
    </div>
  );
}

interface CycleStatsView {
  completed: number;
  total: number;
  percent: number;
}

export function TabCard({
  label,
  stats,
  resetText,
  isActive,
  onClick,
}: {
  label: string;
  stats: CycleStatsView;
  resetText: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const colors = progressColor(stats.percent);
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg p-4 text-left transition-all select-none ${
        isActive
          ? `bg-surface-raised border-2 ${colors.border} shadow-lg ${colors.glow}`
          : 'bg-surface-raised/50 hover:bg-surface-raised hover:border-line border-2 border-transparent'
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span
          className={`font-semibold ${isActive ? 'text-content-strong' : 'text-content-muted'}`}
        >
          {label}
        </span>
        <span className="text-content-muted text-sm">
          {stats.completed}/{stats.total}
        </span>
      </div>
      <div className="bg-surface-overlay mb-2 h-2 w-full rounded-full">
        <div
          className={`${colors.bar} h-2 rounded-full transition-all`}
          style={{ width: `${stats.percent}%` }}
        />
      </div>
      <div className="text-content-subtle text-xs">{resetText}</div>
    </button>
  );
}

export function SummaryBadge({
  label,
  stats,
  resetText,
}: {
  label: string;
  stats: CycleStatsView;
  resetText: string;
}) {
  const colors = progressColor(stats.percent);
  return (
    <div className="min-w-50 flex-1">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-content-muted text-sm font-medium">{label}</span>
        <span className="text-content-subtle text-xs">
          {stats.completed}/{stats.total}
        </span>
      </div>
      <div className="bg-surface-overlay h-1.5 w-full rounded-full">
        <div
          className={`${colors.bar} h-1.5 rounded-full transition-all`}
          style={{ width: `${stats.percent}%` }}
        />
      </div>
      <div className="text-content-subtle mt-1 text-xs">{resetText}</div>
    </div>
  );
}

export function SectionHeader({
  label,
  stats,
  resetText,
}: {
  label: string;
  stats: CycleStatsView;
  resetText: string;
}) {
  const colors = progressColor(stats.percent);
  return (
    <div
      className={`bg-surface-raised mb-4 flex items-center gap-4 rounded-lg border-l-4 p-4 ${colors.border}`}
    >
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">{label}</span>
          <span className="text-content-muted text-sm">
            {stats.completed}/{stats.total}
          </span>
        </div>
        <div className="text-content-subtle mt-1 text-xs">{resetText}</div>
      </div>
      <div className="relative size-16">
        <svg className="size-full -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-surface-overlay"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${stats.percent * 1.76} 176`}
            className={colors.bar.replace('bg-', 'text-')}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
          {stats.percent}%
        </span>
      </div>
    </div>
  );
}

/** Libellé d'une entrée : item du catalogue (qté + sprite + nom) ou i18n. */
export function TaskLabel({
  def,
  completed,
  labels,
  assets,
}: {
  def: TaskDefinition;
  completed: boolean;
  labels: TrackerLabels;
  assets: TrackerAssets;
}) {
  if (!def.shopItemKey) return <>{labels.tasks[def.id]}</>;
  const item = assets.items[def.shopItemKey];
  return (
    <span className="inline-flex items-center gap-1">
      {def.shopItemQuantity !== undefined && (
        <span className={completed ? 'text-content-subtle line-through' : 'text-content-muted'}>
          {def.shopItemQuantity} x
        </span>
      )}
      {item?.icon && (
        <img src={item.icon} alt="" aria-hidden width={18} height={18} className="object-contain" />
      )}
      <span>{item?.name ?? def.shopItemKey}</span>
    </span>
  );
}
