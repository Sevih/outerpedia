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
  taskBossCard,
  taskGuideLink,
  type SeasonWindows,
  type UserProgress,
  type UserSettings,
} from './tracker';
import type {
  TrackerAssets,
  TrackerBossCard,
  TrackerBossTables,
  TrackerExBuff,
  TrackerGuideLink,
  TrackerLabels,
} from './contracts';
import { TaskLabel } from './ui';

/**
 * Lien « guide du boss en cours » (livre ouvert). Nouvel onglet : le suivi reste
 * ouvert. La ligne entière vaut +1 → le clic sur le lien ne remonte pas.
 */
function GuideLinkIcon({ guide, labels }: { guide: TrackerGuideLink; labels: TrackerLabels }) {
  const label = labels.guideLink.replace('{name}', guide.name);
  return (
    <a
      href={guide.href}
      target="_blank"
      rel="noopener"
      title={label}
      aria-label={label}
      onClick={(e) => e.stopPropagation()}
      className="text-content-muted hover:text-content-strong shrink-0 transition"
    >
      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    </a>
  );
}

/**
 * Fiche du boss en cours, après le libellé : portrait, puis élément et classe
 * empilés, puis l'EX Buff du créneau (Singularity). Pas de lien ni de geste
 * propre : un clic remonte à la ligne (+1), comme sur le libellé. Le portrait
 * porte seul le nom du boss (le libellé dit le MODE) → `alt` descriptif.
 */
function BossCard({ card, exBuff }: { card: TrackerBossCard; exBuff?: TrackerExBuff }) {
  return (
    <span className="flex shrink-0 items-center gap-1">
      <img
        src={card.portrait}
        alt={card.name}
        title={card.name}
        width={28}
        height={28}
        className="border-line-subtle size-7 rounded-md border object-cover"
        loading="lazy"
      />
      <span className="flex flex-col gap-0.5">
        {[card.element, card.klass].map((i) => (
          <img
            key={i.icon}
            src={i.icon}
            alt={i.name}
            title={i.name}
            width={14}
            height={14}
            className="size-3.5 object-contain"
          />
        ))}
      </span>
      {exBuff && (
        <span
          title={`${exBuff.label} — ${exBuff.desc}`}
          className="border-accent/50 bg-accent/5 ml-0.5 inline-flex h-5 items-center gap-0.5 rounded-md border px-1"
        >
          <span
            className="text-accent font-mono text-[9.5px] font-bold tracking-[0.14em] uppercase"
            aria-hidden
          >
            EX
          </span>
          {exBuff.icon && (
            <img
              src={exBuff.icon}
              alt=""
              aria-hidden
              width={14}
              height={14}
              className="size-3.5 object-contain"
            />
          )}
          <span className="sr-only">{`${exBuff.label} · ${exBuff.desc}`}</span>
        </span>
      )}
    </span>
  );
}

function TaskItem({
  def,
  count,
  max,
  labels,
  assets,
  compact = false,
  guide,
  boss,
  onRowClick,
  onCheckboxChange,
}: {
  def: TaskDefinition;
  count: number;
  max: number;
  labels: TrackerLabels;
  assets: TrackerAssets;
  compact?: boolean;
  /** Guide du boss en cours (World Boss, Joint Challenge, guild raid, Singularity) ou guide fixe. */
  guide?: TrackerGuideLink;
  /** Fiche du boss en cours (World Boss, Joint Challenge, guild raid, Singularity). */
  boss?: { card: TrackerBossCard; exBuff?: TrackerExBuff };
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
        className={`min-w-0 flex-1 cursor-pointer text-left wrap-break-word ${completed ? 'text-content-subtle line-through' : 'text-content'} group-hover:text-content-strong transition`}
      >
        <TaskLabel def={def} completed={completed} labels={labels} assets={assets} />
      </button>
      {boss && <BossCard card={boss.card} exBuff={boss.exBuff} />}
      {guide && <GuideLinkIcon guide={guide} labels={labels} />}
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
  guide,
  onRowClick,
  onCheckboxChange,
}: {
  def: TaskDefinition;
  count: number;
  max: number;
  now: number;
  labels: TrackerLabels;
  /** Guide fixe de la tour Very Hard. */
  guide?: TrackerGuideLink;
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
        {guide && <GuideLinkIcon guide={guide} labels={labels} />}
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
  seasonWindows,
  bossTables,
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
  seasonWindows: SeasonWindows;
  bossTables: TrackerBossTables;
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
          guide={taskGuideLink(
            id,
            now,
            seasonWindows,
            bossTables.singularityGuides,
            bossTables.fixedGuides,
          )}
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
        guide={taskGuideLink(
          id,
          now,
          seasonWindows,
          bossTables.singularityGuides,
          bossTables.fixedGuides,
        )}
        boss={taskBossCard(
          id,
          now,
          seasonWindows,
          bossTables.singularityBosses,
          bossTables.singularityExBuffs,
        )}
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
