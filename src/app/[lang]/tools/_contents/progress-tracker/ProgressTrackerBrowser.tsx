'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useStoredState } from '@/lib/client-storage';
import {
  SWEEPABLE_TASK_IDS,
  TASK_DEFINITIONS,
  isSeasonalTask,
  type TaskCategory,
  type TaskDefinition,
  type TaskType,
} from './tasks';
import {
  EMPTY_PROGRESS,
  PROGRESS_SPEC,
  SETTINGS_SPEC,
  createDefaultSettings,
  exportState,
  formatTimeUntil,
  getNextPreciseCraftTime,
  getNextReset,
  getNextVHTUnlockTime,
  getStats,
  getTaskMaxCount,
  getVHTUnlockedPhase,
  importState,
  isPreciseCraftAvailable,
  normalizeSettings,
  isSeasonLive,
  reconcileProgress,
  type SeasonWindows,
  withCategoryToggled,
  withPreciseCraftDays,
  withPreciseCraftToggled,
  withSweepToggled,
  withTaskCount,
  type UserProgress,
  type UserSettings,
} from './tracker';

export interface TrackerItem {
  name: string;
  /** URL du sprite (null si l'item n'est pas au catalogue). */
  icon: string | null;
}

export interface TrackerLabels {
  /** Libellé par id de tâche (défs SANS `shopItemKey`). */
  tasks: Record<string, string>;
  /** Libellé par clé i18n de la hiérarchie boutique/atelier. */
  shopKeys: Record<string, string>;
  cycles: Record<TaskType, string>;
  cycleTasks: Record<TaskType, string>;
  categories: Record<TaskCategory, string>;
  settingsTabs: Record<SettingsTab, string>;
  settings: string;
  settingsTitle: string;
  exportImport: string;
  resetAll: string;
  resetConfirm: string;
  resetsIn: string;
  export: string;
  import: string;
  copyToClipboard: string;
  exportDesc: string;
  pasteHere: string;
  importButton: string;
  importError: string;
  close: string;
  noTasks: string;
  optionalContentDesc: string;
  preciseCraft: string;
  preciseCraftItem: string;
  preciseCraftTimerDesc: string;
  daysRemaining: string;
  availableIn: string;
  availableNow: string;
  vhtFloors: string;
  vhtNextUnlock: string;
  adventureLicense: string;
  adventureLicenseDesc: string;
  adventureLicenseCombats: Record<2 | 3 | 4, string>;
  terminusSupportPack: string;
  terminusSupportPackDesc: string;
  veronicaPremiumPack: string;
  veronicaPremiumPackDesc: string;
  elementalTowerCompleted: string;
  elementalTowerCompletedDesc: string;
  displayMode: string;
  displayModeDesc: string;
  displayModeTabs: string;
  displayModeSinglePage: string;
  completeAll: string;
  sweepAll: string;
  craftSettingsDesc: string;
  shopSettingsDesc: string;
  dangerZone: string;
  clearData: string;
  clearDataDesc: string;
  clearDataConfirm: string;
  autoSeasonal: string;
  autoSeasonalDesc: string;
  autoSeasonalLive: string;
  autoSeasonalOff: string;
}

export interface TrackerAssets {
  navSettings: string;
  navExport: string;
  navReset: string;
  navCraft: string;
  /** Sprite de monnaie par clé i18n de sous-catégorie/onglet boutique. */
  shopIcons: Record<string, string>;
  /** Item résolu par `shopItemKey`. */
  items: Record<string, TrackerItem>;
}

type SettingsTab = 'display' | 'game' | 'content' | 'craft' | 'shop';

/** Couleurs de jauge par palier de complétion (parité V2). */
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

const DAY_MS = 86_400_000;

/** Anti double-tap (200 ms) — les lignes se cliquent en rafale sur mobile. */
let lastClick = 0;
function debounced(fn: () => void) {
  const t = Date.now();
  if (t - lastClick < 200) return;
  lastClick = t;
  fn();
}

/**
 * Progress tracker (portage V2, état réécrit) : suivi local des tâches
 * daily/weekly/monthly du jeu. La progression STOCKÉE n'est jamais lue telle
 * quelle : chaque rendu passe par `reconcileProgress` (synchro réglages +
 * resets dus) et toute mutation part de cette vue réconciliée — les resets
 * sont donc persistés au premier geste, sans effet de synchro.
 */
export function ProgressTrackerBrowser({
  labels,
  assets,
  seasonWindows,
}: {
  labels: TrackerLabels;
  assets: TrackerAssets;
  /**
   * Fenêtres jouables des contenus saisonniers, servies par la page. On reçoit
   * des BORNES, pas un « c'est ouvert » calculé au rendu : un booléen se serait
   * figé dans le cache ISR et aurait menti jusqu'à la purge suivante, alors que
   * des bornes se comparent au tic d'horloge local (60 s).
   */
  seasonWindows: SeasonWindows;
}) {
  const [storedProgress, setProgress, progressReady] = useStoredState(PROGRESS_SPEC);
  const [storedSettings, setSettings, settingsReady] = useStoredState(SETTINGS_SPEC);
  // Valeur inutilisée tant que `ready` est faux → aucun mismatch d'hydratation.
  const [now, setNow] = useState(() => Date.now());
  const [activeTab, setActiveTab] = useState<TaskType>('daily');
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('display');
  const [showSettings, setShowSettings] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [importData, setImportData] = useState('');
  const [importError, setImportError] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Les réglages stockés peuvent précéder de nouvelles définitions : on
  // normalise à la lecture (permanents forcés, obsolètes écartés, ordre).
  const settings = useMemo(() => normalizeSettings(storedSettings), [storedSettings]);
  const view = useMemo(
    () => reconcileProgress(storedProgress, settings, now, seasonWindows),
    [storedProgress, settings, now, seasonWindows],
  );

  const ready = progressReady && settingsReady;

  const increment = (taskId: string, type: TaskType) =>
    debounced(() => {
      const task = view[type][taskId];
      const def = TASK_DEFINITIONS[type][taskId];
      if (!task || !def) return;
      if (def.hasProgressiveUnlock) {
        const phase = getVHTUnlockedPhase(now);
        const target = task.count >= phase ? 0 : Math.min(task.count + 1, phase);
        setProgress(withTaskCount(view, type, taskId, target, settings, now));
        return;
      }
      const max = getTaskMaxCount(taskId, type, settings);
      setProgress(
        withTaskCount(view, type, taskId, task.count >= max ? 0 : task.count + 1, settings, now),
      );
    });

  const toggle = (taskId: string, type: TaskType) =>
    debounced(() => {
      const task = view[type][taskId];
      const def = TASK_DEFINITIONS[type][taskId];
      if (!task || !def) return;
      if (def.hasProgressiveUnlock) {
        const phase = getVHTUnlockedPhase(now);
        setProgress(
          withTaskCount(view, type, taskId, task.count >= phase ? 0 : phase, settings, now),
        );
        return;
      }
      const max = getTaskMaxCount(taskId, type, settings);
      setProgress(withTaskCount(view, type, taskId, task.count >= max ? 0 : max, settings, now));
    });

  const toggleEnabled = (taskId: string, type: TaskType) => {
    const list = settings.enabledTasks[type];
    setSettings({
      ...settings,
      enabledTasks: {
        ...settings.enabledTasks,
        [type]: list.includes(taskId) ? list.filter((id) => id !== taskId) : [...list, taskId],
      },
    });
  };

  const handleImport = () => {
    const imported = importState(importData);
    if (!imported) {
      setImportError(true);
      return;
    }
    setProgress(imported.progress);
    if (imported.settings) setSettings(imported.settings);
    setImportData('');
    setImportError(false);
    setShowExport(false);
  };

  if (!ready) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-content-muted">…</div>
      </div>
    );
  }

  const stats = getStats(view, settings, now);
  const resetTimes: Record<TaskType, string> = {
    daily: formatTimeUntil(getNextReset('daily', now), now),
    weekly: formatTimeUntil(getNextReset('weekly', now), now),
    monthly: formatTimeUntil(getNextReset('monthly', now), now),
  };
  const cycles: TaskType[] = ['daily', 'weekly', 'monthly'];

  const taskList = (type: TaskType) => (
    <TaskList
      type={type}
      view={view}
      settings={settings}
      now={now}
      labels={labels}
      assets={assets}
      onIncrement={increment}
      onToggle={toggle}
      onSweepAll={() => debounced(() => setProgress(withSweepToggled(view, settings, now)))}
      onToggleAllShop={() =>
        debounced(() => setProgress(withCategoryToggled(view, type, 'shop', settings, now)))
      }
      onToggleAllCraft={() =>
        debounced(() => setProgress(withCategoryToggled(view, type, 'craft', settings, now)))
      }
    />
  );

  const preciseCraftSection = (
    <PreciseCraftSection
      view={view}
      now={now}
      labels={labels}
      craftIcon={assets.navCraft}
      onToggle={() => debounced(() => setProgress(withPreciseCraftToggled(view, now)))}
    />
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Actions */}
      <div className="grid grid-cols-3 gap-4">
        <ActionButton
          icon={assets.navSettings}
          label={labels.settings}
          onClick={() => setShowSettings(true)}
        />
        <ActionButton
          icon={assets.navExport}
          label={labels.exportImport}
          onClick={() => setShowExport(true)}
        />
        <ActionButton
          icon={assets.navReset}
          label={labels.resetAll}
          onClick={() => {
            if (window.confirm(labels.resetConfirm)) setProgress(EMPTY_PROGRESS);
          }}
        />
      </div>

      {/* Résumé par cycle : cartes-onglets, ou badges en mode page unique */}
      {settings.displayMode === 'tabs' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {cycles.map((type) => (
            <TabCard
              key={type}
              label={labels.cycles[type]}
              stats={stats[type]}
              resetText={`${labels.resetsIn}: ${resetTimes[type]}`}
              isActive={activeTab === type}
              onClick={() => setActiveTab(type)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-surface-raised/50 flex flex-wrap gap-4 rounded-lg p-4">
          {cycles.map((type) => (
            <SummaryBadge
              key={type}
              label={labels.cycles[type]}
              stats={stats[type]}
              resetText={resetTimes[type]}
            />
          ))}
        </div>
      )}

      {/* Listes de tâches */}
      <section className="space-y-8">
        {settings.displayMode === 'tabs' ? (
          <>
            {taskList(activeTab)}
            {activeTab === 'monthly' && preciseCraftSection}
          </>
        ) : (
          cycles.map((type) => (
            <div key={type}>
              <SectionHeader
                label={labels.cycles[type]}
                stats={stats[type]}
                resetText={`${labels.resetsIn}: ${resetTimes[type]}`}
              />
              {taskList(type)}
              {type === 'monthly' && preciseCraftSection}
            </div>
          ))
        )}
      </section>

      {/* Modale export / import */}
      {showExport && (
        <Modal
          onClose={() => {
            setShowExport(false);
            setImportData('');
            setImportError(false);
          }}
        >
          <h3 className="mb-4 text-xl font-bold">{labels.exportImport}</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">{labels.export}</label>
              <button
                onClick={() => {
                  void navigator.clipboard.writeText(exportState(view, settings));
                  setShowExport(false);
                }}
                className="w-full rounded bg-blue-600 px-4 py-2 transition hover:bg-blue-700"
              >
                {labels.copyToClipboard}
              </button>
              <p className="text-content-muted mt-1 text-xs">{labels.exportDesc}</p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">{labels.import}</label>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                className="bg-surface-overlay h-32 w-full rounded px-3 py-2 font-mono text-sm"
                placeholder={labels.pasteHere}
              />
              {importError && <p className="text-danger mt-1 text-sm">{labels.importError}</p>}
              <button
                onClick={handleImport}
                disabled={!importData.trim()}
                className="disabled:bg-surface-overlay mt-2 w-full rounded bg-green-600 px-4 py-2 transition hover:bg-green-700 disabled:cursor-not-allowed"
              >
                {labels.importButton}
              </button>
            </div>
          </div>
          <button
            onClick={() => {
              setShowExport(false);
              setImportData('');
              setImportError(false);
            }}
            className="bg-surface-overlay hover:bg-surface-overlay/70 mt-4 w-full rounded px-4 py-2 transition"
          >
            {labels.close}
          </button>
        </Modal>
      )}

      {/* Modale réglages */}
      {showSettings && (
        <Modal onClose={() => setShowSettings(false)} wide>
          <h3 className="mb-4 text-xl font-bold">{labels.settingsTitle}</h3>
          <div className="border-line mb-6 flex gap-0.5 border-b pb-2 md:gap-2">
            {(['display', 'game', 'content', 'craft', 'shop'] as SettingsTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setSettingsTab(tab)}
                className={`rounded-t px-2 py-1.5 text-xs font-medium transition md:px-4 md:py-2 md:text-sm ${
                  settingsTab === tab
                    ? 'bg-surface-overlay text-content-strong'
                    : 'text-content-muted hover:text-content'
                }`}
              >
                {labels.settingsTabs[tab]}
              </button>
            ))}
          </div>

          {settingsTab === 'display' && (
            <div className="bg-surface-overlay rounded-lg p-4">
              <div className="mb-3">
                <span className="font-medium">{labels.displayMode}</span>
                <p className="text-content-muted mt-1 text-sm">{labels.displayModeDesc}</p>
              </div>
              <div className="flex gap-2">
                {(['tabs', 'single-page'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSettings({ ...settings, displayMode: mode })}
                    className={`flex-1 rounded px-4 py-2 transition ${
                      settings.displayMode === mode
                        ? 'text-content-strong bg-blue-600'
                        : 'bg-surface-raised text-content-muted hover:bg-surface-raised/70'
                    }`}
                  >
                    {mode === 'tabs' ? labels.displayModeTabs : labels.displayModeSinglePage}
                  </button>
                ))}
              </div>
            </div>
          )}

          {settingsTab === 'game' && (
            <div className="space-y-3">
              <SettingToggle
                checked={settings.hasTerminusSupportPack}
                title={labels.terminusSupportPack}
                desc={labels.terminusSupportPackDesc}
                onChange={() =>
                  setSettings({
                    ...settings,
                    hasTerminusSupportPack: !settings.hasTerminusSupportPack,
                  })
                }
              />
              <SettingToggle
                checked={settings.hasVeronicaPremiumPack}
                title={labels.veronicaPremiumPack}
                desc={labels.veronicaPremiumPackDesc}
                onChange={() =>
                  setSettings({
                    ...settings,
                    hasVeronicaPremiumPack: !settings.hasVeronicaPremiumPack,
                  })
                }
              />
              <div className="bg-surface-overlay rounded-lg p-4">
                <div className="mb-3">
                  <span className="font-medium">{labels.adventureLicense}</span>
                  <p className="text-content-muted mt-1 text-sm">{labels.adventureLicenseDesc}</p>
                </div>
                <div className="space-y-2">
                  {([2, 3, 4] as const).map((n) => (
                    <label key={n} className="flex cursor-pointer items-center gap-3">
                      <input
                        type="radio"
                        name="adventureLicense"
                        checked={settings.adventureLicenseCombatsPerStage === n}
                        onChange={() =>
                          setSettings({ ...settings, adventureLicenseCombatsPerStage: n })
                        }
                        className="size-4 accent-sky-500"
                      />
                      <span className="text-sm">{labels.adventureLicenseCombats[n]}</span>
                    </label>
                  ))}
                </div>
              </div>
              <SettingToggle
                checked={settings.hasCompletedElementalTower}
                title={labels.elementalTowerCompleted}
                desc={labels.elementalTowerCompletedDesc}
                onChange={() =>
                  setSettings({
                    ...settings,
                    hasCompletedElementalTower: !settings.hasCompletedElementalTower,
                  })
                }
              />
            </div>
          )}

          {settingsTab === 'content' && (
            <div className="space-y-6">
              <SettingToggle
                checked={settings.autoSeasonalTasks}
                title={labels.autoSeasonal}
                desc={labels.autoSeasonalDesc}
                onChange={() =>
                  setSettings({ ...settings, autoSeasonalTasks: !settings.autoSeasonalTasks })
                }
              />
              <p className="text-content-muted text-sm">{labels.optionalContentDesc}</p>
              {(['daily', 'monthly'] as TaskType[]).map((type) => {
                const optional = Object.values(TASK_DEFINITIONS[type]).filter(
                  (def) => !def.permanent && def.category !== 'shop',
                );
                if (optional.length === 0) return null;
                return (
                  <div key={type}>
                    <p className="mb-2 text-sm font-medium text-cyan-400">
                      {labels.cycleTasks[type]}
                    </p>
                    <div className="space-y-1">
                      {optional.map((def) => {
                        // Piloté par le calendrier : la case ne ment pas, elle
                        // affiche l'état RÉEL et se coupe (sinon on cliquerait
                        // sans effet).
                        const auto = settings.autoSeasonalTasks && isSeasonalTask(def.id);
                        const live = isSeasonLive(seasonWindows, def.id, now);
                        return (
                          <label
                            key={def.id}
                            className={`bg-surface-overlay flex items-center gap-3 rounded p-2 transition ${
                              auto ? 'cursor-default' : 'hover:bg-surface-overlay/70 cursor-pointer'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={auto ? live : settings.enabledTasks[type].includes(def.id)}
                              disabled={auto}
                              onChange={() => !auto && toggleEnabled(def.id, type)}
                              className="size-4 accent-sky-500 disabled:opacity-60"
                            />
                            <span className="flex-1 text-sm">{labels.tasks[def.id]}</span>
                            {auto && (
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                                  live
                                    ? 'bg-cat-emerald-fg/15 text-cat-emerald-fg'
                                    : 'text-content-subtle bg-surface-raised'
                                }`}
                              >
                                {live ? labels.autoSeasonalLive : labels.autoSeasonalOff}
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              <div className="border-danger/30 rounded-lg border p-4">
                <h4 className="text-danger mb-2 text-base font-semibold">{labels.dangerZone}</h4>
                <p className="text-content-muted mb-3 text-sm">{labels.clearDataDesc}</p>
                <button
                  onClick={() => {
                    // Remise à zéro des DONNÉES V3 (progression + réglages). Les
                    // clés V2 héritées ne sont jamais touchées (filet de retour
                    // arrière) — mais comme la clé V3 réécrite prime sur
                    // l'absorption legacy, le reset tient bien.
                    if (window.confirm(labels.clearDataConfirm)) {
                      setProgress(EMPTY_PROGRESS);
                      setSettings(createDefaultSettings());
                      setShowSettings(false);
                    }
                  }}
                  className="bg-danger-deep hover:bg-danger-strong w-full rounded px-4 py-2 transition"
                >
                  {labels.clearData}
                </button>
              </div>
            </div>
          )}

          {settingsTab === 'craft' && (
            <div className="space-y-6">
              <p className="text-content-muted text-sm">{labels.craftSettingsDesc}</p>
              <div className="rounded-lg border border-purple-500/30 bg-purple-900/20 p-4">
                <p className="mb-3 text-sm font-medium text-purple-400">{labels.preciseCraft}</p>
                <p className="text-content-muted mb-3 text-xs">{labels.preciseCraftTimerDesc}</p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    max={30}
                    defaultValue={
                      view.preciseCraft.completedAt === null
                        ? 0
                        : Math.max(
                            0,
                            Math.ceil((view.preciseCraft.completedAt + 30 * DAY_MS - now) / DAY_MS),
                          )
                    }
                    onChange={(e) => {
                      const days = Number.parseInt(e.target.value, 10);
                      if (!Number.isNaN(days) && days >= 0 && days <= 30)
                        setProgress(withPreciseCraftDays(view, days, now));
                    }}
                    className="bg-surface-overlay border-line w-20 rounded border px-3 py-2 text-center focus:border-purple-500 focus:outline-none"
                  />
                  <span className="text-content-muted text-sm">{labels.daysRemaining}</span>
                </div>
              </div>
              {(['weekly', 'monthly'] as TaskType[]).map((type) => {
                const crafts = Object.values(TASK_DEFINITIONS[type]).filter(
                  (d) => d.category === 'craft',
                );
                if (crafts.length === 0) return null;
                return (
                  <EnabledTaskPicker
                    key={type}
                    title={labels.cycleTasks[type]}
                    titleClass="text-orange-400"
                    defs={crafts}
                    type={type}
                    settings={settings}
                    labels={labels}
                    assets={assets}
                    sideKey="shopCategory"
                    onToggle={toggleEnabled}
                  />
                );
              })}
            </div>
          )}

          {settingsTab === 'shop' && (
            <div className="space-y-6">
              <p className="text-content-muted text-sm">{labels.shopSettingsDesc}</p>
              {cycles.map((type) => {
                const shops = Object.values(TASK_DEFINITIONS[type]).filter(
                  (d) => d.category === 'shop',
                );
                if (shops.length === 0) return null;
                return (
                  <EnabledTaskPicker
                    key={type}
                    title={labels.cycleTasks[type]}
                    titleClass="text-yellow-400"
                    defs={shops}
                    type={type}
                    settings={settings}
                    labels={labels}
                    assets={assets}
                    sideKey="shopSubcategory"
                    onToggle={toggleEnabled}
                  />
                );
              })}
            </div>
          )}

          <button
            onClick={() => setShowSettings(false)}
            className="bg-surface-overlay hover:bg-surface-overlay/70 mt-6 w-full rounded px-4 py-2 transition"
          >
            {labels.close}
          </button>
        </Modal>
      )}
    </div>
  );
}

/* ─── Briques ─────────────────────────────────────────────────────────────── */

function Modal({
  children,
  onClose,
  wide = false,
}: {
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div
      className="bg-scrim/60 fixed inset-0 z-100 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`bg-surface-raised max-h-[80vh] w-full overflow-y-auto rounded-lg p-6 ${wide ? 'max-w-2xl' : 'max-w-md'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function ActionButton({
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

function SettingToggle({
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

function TabCard({
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

function SummaryBadge({
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

function SectionHeader({
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
function TaskLabel({
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
      <span
        className={`flex-1 ${completed ? 'text-content-subtle line-through' : 'text-content'} group-hover:text-content-strong transition`}
      >
        <TaskLabel def={def} completed={completed} labels={labels} assets={assets} />
      </span>
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
        <span
          className={`flex-1 ${fullyCompleted ? 'text-content-subtle line-through' : 'text-content'} group-hover:text-content-strong transition`}
        >
          {labels.tasks[def.id]}
        </span>
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
            {labels.vhtNextUnlock}: {formatTimeUntil(nextUnlock, now)}
          </span>
        </div>
      )}
    </div>
  );
}

/** Liste d'un cycle groupée par catégorie (task / craft / shop). */
function TaskList({
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

/** Fabrication précise : un seul « slot », cooldown 30 jours glissants. */
function PreciseCraftSection({
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
      <div
        className={`flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-all ${
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
              {labels.availableIn}: {formatTimeUntil(nextTime, now)}
            </div>
          )}
          {available && view.preciseCraft.completedAt === null && (
            <div className="mt-1 text-xs text-purple-400">{labels.availableNow}</div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Liste de cases à cocher activant/désactivant des entrées boutique/atelier. */
function EnabledTaskPicker({
  title,
  titleClass,
  defs,
  type,
  settings,
  labels,
  assets,
  sideKey,
  onToggle,
}: {
  title: string;
  titleClass: string;
  defs: TaskDefinition[];
  type: TaskType;
  settings: UserSettings;
  labels: TrackerLabels;
  assets: TrackerAssets;
  /** Champ affiché à droite (repère de provenance). */
  sideKey: 'shopCategory' | 'shopSubcategory';
  onToggle: (taskId: string, type: TaskType) => void;
}) {
  return (
    <div>
      <p className={`mb-2 text-sm font-medium ${titleClass}`}>{title}</p>
      <div className="space-y-1">
        {defs.map((def) => (
          <label
            key={def.id}
            className="bg-surface-overlay hover:bg-surface-overlay/70 flex cursor-pointer items-center gap-3 rounded p-2 transition"
          >
            <input
              type="checkbox"
              checked={settings.enabledTasks[type].includes(def.id)}
              onChange={() => onToggle(def.id, type)}
              className="size-4 shrink-0 accent-sky-500"
            />
            <span className="flex flex-1 items-center justify-between gap-2 text-sm">
              <TaskLabel def={def} completed={false} labels={labels} assets={assets} />
              {def[sideKey] && (
                <span className="text-content-subtle text-xs">
                  {labels.shopKeys[def[sideKey]] ?? ''}
                </span>
              )}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
