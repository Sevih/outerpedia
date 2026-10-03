'use client';

/**
 * Liste des tâches d'un cycle du Progress Tracker (groupée task / craft /
 * shop) et ses deux lignes : `TaskItem`, et `VHTTaskItem` pour la tour à
 * déblocage progressif. Extrait de `ProgressTrackerBrowser.tsx` le 03/10/2026
 * (découpage mécanique, contenu inchangé) ; la progression et ses mutations
 * restent au parent, via `useTrackerState`.
 */
import type { ReactNode } from 'react';
import { formatDuration } from '@/lib/format-duration';
import {
  SWEEPABLE_TASK_IDS,
  TASK_DEFINITIONS,
  type TaskCategory,
  type TaskDefinition,
  type TaskType,
} from './tasks';
import {
  getNextVHTUnlockTime,
  getTaskMaxCount,
  getVHTUnlockedPhase,
  type UserProgress,
  type UserSettings,
} from './tracker';
import type { TrackerAssets, TrackerLabels } from './contracts';
import { TaskLabel } from './ui';

function TaskItem({
  def,
  count,
  max,
  labels,
  assets,
  compact = false,
  onRowClick,
  onCheckboxChange,
}: {
  def: TaskDefinition;
  count: number;
  max: number;
  labels: TrackerLabels;
  assets: TrackerAssets;
  compact?: boolean;
  onRowClick: () => void;
  onCheckboxChange: () => void;
}) {
  const completed = count >= max;
  return (
    <div
      className={`flex items-center gap-3 ${compact ? 'bg-surface-overlay/50 p-3' : 'bg-surface-raised p-4'} ${completed ? 'opacity-60' : ''} group hover:bg-surface-overlay/70 cursor-pointer rounded-lg transition select-none`}
      onClick={onRowClick}
    >
      <input
        type="checkbox"
        checked={completed}
        onChange={(e) => {
          e.stopPropagation();
          onCheckboxChange();
        }}
        onClick={(e) => e.stopPropagation()}
        className="size-5 shrink-0 cursor-pointer accent-sky-500"
      />
      {/* Le libellé est le point d'entrée CLAVIER du +1 : un bouton sans
          gestionnaire propre, dont le clic remonte au `onClick` de la ligne (qui
          ne peut pas être un bouton, elle contient la case à cocher). */}
      <button
        type="button"
        className={`flex-1 cursor-pointer text-left ${completed ? 'text-content-subtle line-through' : 'text-content'} group-hover:text-content-strong transition`}
      >
        <TaskLabel def={def} completed={completed} labels={labels} assets={assets} />
      </button>
      <span className="text-content-muted text-sm">
        {count}/{max}
      </span>
    </div>
  );
}

/** Tour céleste very hard : 4 phases de 5 étages débloquées au fil du mois. */
function VHTTaskItem({
  def,
  count,
  max,
  now,
  labels,
  onRowClick,
  onCheckboxChange,
}: {
  def: TaskDefinition;
  count: number;
  max: number;
  now: number;
  labels: TrackerLabels;
  onRowClick: () => void;
  onCheckboxChange: () => void;
}) {
  const phase = getVHTUnlockedPhase(now);
  const nextUnlock = getNextVHTUnlockTime(now);
  const fullyCompleted = count >= phase;
  return (
    <div
      className={`bg-surface-raised ${fullyCompleted ? 'opacity-60' : ''} group hover:bg-surface-overlay/70 cursor-pointer rounded-lg p-4 transition select-none`}
      onClick={onRowClick}
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={fullyCompleted}
          onChange={(e) => {
            e.stopPropagation();
            onCheckboxChange();
          }}
          onClick={(e) => e.stopPropagation()}
          className="size-5 shrink-0 cursor-pointer accent-sky-500"
        />
        {/* Point d'entrée clavier du +1, comme dans `TaskItem`. */}
        <button
          type="button"
          className={`flex-1 cursor-pointer text-left ${fullyCompleted ? 'text-content-subtle line-through' : 'text-content'} group-hover:text-content-strong transition`}
        >
          {labels.tasks[def.id]}
        </button>
        <span className="text-xs text-cyan-400/80">
          {labels.vhtFloors} 1-{phase * 5}
        </span>
        <span className="text-content-muted min-w-8 text-right text-sm">
          {count}/{max}
        </span>
      </div>
      {nextUnlock && (
        <div className="mt-2 ml-8 flex items-center gap-1.5 text-xs text-amber-400/80">
          <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            {labels.vhtNextUnlock}: {formatDuration(nextUnlock - now, labels.duration)}
          </span>
        </div>
      )}
    </div>
  );
}

/** Liste d'un cycle groupée par catégorie (task / craft / shop). */
export function TaskList({
  type,
  view,
  settings,
  now,
  labels,
  assets,
  onIncrement,
  onToggle,
  onSweepAll,
  onToggleAllShop,
  onToggleAllCraft,
}: {
  type: TaskType;
  view: UserProgress;
  settings: UserSettings;
  now: number;
  labels: TrackerLabels;
  assets: TrackerAssets;
  onIncrement: (taskId: string, type: TaskType) => void;
  onToggle: (taskId: string, type: TaskType) => void;
  onSweepAll: () => void;
  onToggleAllShop: () => void;
  onToggleAllCraft: () => void;
}) {
  const entries = Object.keys(view[type]);
  if (entries.length === 0) {
    return <div className="text-content-muted py-8 text-center">{labels.noTasks}</div>;
  }

  const defs = TASK_DEFINITIONS[type];
  const byCategory: Record<TaskCategory, string[]> = { task: [], craft: [], shop: [] };
  for (const id of entries) byCategory[defs[id]?.category ?? 'task'].push(id);

  const categoryColor: Record<TaskCategory, string> = {
    task: 'text-content-muted',
    craft: 'text-orange-400',
    shop: 'text-yellow-400',
  };

  const item = (id: string, compact = false) => {
    const def = defs[id];
    const max = getTaskMaxCount(id, type, settings);
    const count = view[type][id].count;
    if (def.hasProgressiveUnlock) {
      return (
        <VHTTaskItem
          key={id}
          def={def}
          count={count}
          max={max}
          now={now}
          labels={labels}
          onRowClick={() => onIncrement(id, type)}
          onCheckboxChange={() => onToggle(id, type)}
        />
      );
    }
    return (
      <TaskItem
        key={id}
        def={def}
        count={count}
        max={max}
        labels={labels}
        assets={assets}
        compact={compact}
        onRowClick={() => onIncrement(id, type)}
        onCheckboxChange={() => onToggle(id, type)}
      />
    );
  };

  const header = (category: TaskCategory, suffix: string, action?: ReactNode) => (
    <div className="mb-2 flex items-center gap-2">
      <span className={`text-sm font-medium ${categoryColor[category]}`}>
        {labels.categories[category]}
        {suffix}
      </span>
      <div className="bg-line/50 h-px flex-1" />
      {action}
    </div>
  );

  // Boutique : hiérarchie catégorie > sous-catégorie > onglet (ordre d'arrivée).
  const shopHierarchy = new Map<string, Map<string, Map<string, string[]>>>();
  for (const id of byCategory.shop) {
    const def = defs[id];
    const cat = def.shopCategory ?? '_none';
    const sub = def.shopSubcategory ?? '_none';
    const tab = def.shopTab ?? '_none';
    if (!shopHierarchy.has(cat)) shopHierarchy.set(cat, new Map());
    const subMap = shopHierarchy.get(cat)!;
    if (!subMap.has(sub)) subMap.set(sub, new Map());
    const tabMap = subMap.get(sub)!;
    if (!tabMap.has(tab)) tabMap.set(tab, []);
    tabMap.get(tab)!.push(id);
  }

  // Atelier : groupé par `shopCategory` (atelier de Kate).
  const craftGroups = new Map<string, string[]>();
  for (const id of byCategory.craft) {
    const key = defs[id].shopCategory ?? '_none';
    if (!craftGroups.has(key)) craftGroups.set(key, []);
    craftGroups.get(key)!.push(id);
  }

  const hasSweepable =
    type === 'daily' && byCategory.task.some((id) => SWEEPABLE_TASK_IDS.includes(id));

  return (
    <div className="space-y-4">
      {byCategory.task.length > 0 && (
        <div>
          {header(
            'task',
            '',
            hasSweepable ? (
              <button
                onClick={onSweepAll}
                className="rounded bg-cyan-600/20 px-2 py-1 text-xs text-cyan-400 transition hover:bg-cyan-600/40"
              >
                {labels.sweepAll}
              </button>
            ) : undefined,
          )}
          <div className="space-y-2">{byCategory.task.map((id) => item(id))}</div>
        </div>
      )}

      {byCategory.craft.length > 0 && (
        <div>
          {header(
            'craft',
            '',
            <button
              onClick={onToggleAllCraft}
              className="rounded bg-orange-600/20 px-2 py-1 text-xs text-orange-400 transition hover:bg-orange-600/40"
            >
              {labels.completeAll}
            </button>,
          )}
          <div className="space-y-3">
            {[...craftGroups.entries()].map(([groupKey, ids]) => (
              <div key={groupKey} className="bg-surface-raised/50 rounded-lg p-3">
                <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-orange-400">
                  <img
                    src={assets.navCraft}
                    alt=""
                    aria-hidden
                    width={18}
                    height={18}
                    className="object-contain"
                  />
                  {labels.shopKeys[groupKey] ?? ''}
                </div>
                <div className="space-y-1 border-l-2 border-orange-400/30 pl-3">
                  {ids.map((id) => item(id, true))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {byCategory.shop.length > 0 && (
        <div>
          {header(
            'shop',
            '',
            <button
              onClick={onToggleAllShop}
              className="rounded bg-yellow-600/20 px-2 py-1 text-xs text-yellow-400 transition hover:bg-yellow-600/40"
            >
              {labels.completeAll}
            </button>,
          )}
          <div className="space-y-3">
            {[...shopHierarchy.entries()].map(([catKey, subMap]) => (
              <div key={catKey} className="bg-surface-raised/50 rounded-lg p-3">
                <div className="mb-2 text-sm font-medium text-yellow-400">
                  {labels.shopKeys[catKey] ?? ''}
                </div>
                <div className="space-y-2 border-l-2 border-yellow-400/30 pl-3">
                  {[...subMap.entries()].map(([subKey, tabMap]) => (
                    <div key={subKey}>
                      {subKey !== '_none' && (
                        <div className="text-content-muted mb-1 flex items-center gap-1.5 text-xs font-medium">
                          {assets.shopIcons[subKey] && (
                            <img
                              src={assets.shopIcons[subKey]}
                              alt=""
                              aria-hidden
                              width={16}
                              height={16}
                              className="object-contain"
                            />
                          )}
                          {labels.shopKeys[subKey] ?? ''}
                        </div>
                      )}
                      <div className="space-y-1">
                        {[...tabMap.entries()].map(([tabKey, ids]) => (
                          <div key={tabKey}>
                            {tabKey !== '_none' && (
                              <div className="text-content-subtle mb-1 flex items-center gap-1.5 pl-2 text-xs">
                                {assets.shopIcons[tabKey] && (
                                  <img
                                    src={assets.shopIcons[tabKey]}
                                    alt=""
                                    aria-hidden
                                    width={14}
                                    height={14}
                                    className="object-contain"
                                  />
                                )}
                                {labels.shopKeys[tabKey] ?? ''}
                              </div>
                            )}
                            <div className="space-y-1">{ids.map((id) => item(id, true))}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
