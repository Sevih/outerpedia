'use client';

import { formatDuration } from '@/lib/format-duration';
import type { TaskType } from './tasks';
import {
  EMPTY_PROGRESS,
  getNextReset,
  getStats,
  type SeasonWindows,
  withCategoryToggled,
  withPreciseCraftToggled,
  withSweepToggled,
} from './tracker';
import type { TrackerAssets, TrackerLabels } from './contracts';
import { ExportModal } from './ExportModal';
import { PreciseCraftSection } from './PreciseCraftSection';
import { SettingsModal } from './SettingsModal';
import { TaskList } from './TaskList';
import { ActionButton, SectionHeader, SummaryBadge, TabCard } from './ui';
import { debounced, useTrackerState } from './use-tracker-state';

/**
 * Progress tracker (porté de l'ancien site, état réécrit) : suivi local des tâches
 * daily/weekly/monthly du jeu. La progression STOCKÉE n'est jamais lue telle
 * quelle : chaque rendu passe par `reconcileProgress` (synchro réglages +
 * resets dus) et toute mutation part de cette vue réconciliée — les resets
 * sont donc persistés au premier geste, sans effet de synchro.
 *
 * Ce composant garde la composition et le câblage (découpage du 03/10/2026) :
 * les types sont dans `contracts.ts`, l'état et les gestes dans
 * `use-tracker-state.ts`, les briques dans `ui.tsx`, et les sections dans
 * `TaskList.tsx`, `PreciseCraftSection.tsx`, `ExportModal.tsx` et
 * `SettingsModal.tsx`.
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
  // État, vues dérivées et gestes : dans `useTrackerState`, destructuré sous
  // les MÊMES noms que les anciens useState — le JSX n'a pas bougé.
  const {
    setProgress,
    setSettings,
    now,
    activeTab,
    setActiveTab,
    settingsTab,
    setSettingsTab,
    showSettings,
    setShowSettings,
    showExport,
    setShowExport,
    importData,
    setImportData,
    importError,
    setImportError,
    settings,
    view,
    ready,
    increment,
    toggle,
    toggleEnabled,
    handleImport,
  } = useTrackerState(seasonWindows);

  if (!ready) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-content-muted">…</div>
      </div>
    );
  }

  const stats = getStats(view, settings, now);
  const resetTimes: Record<TaskType, string> = {
    daily: formatDuration(getNextReset('daily', now) - now, labels.duration),
    weekly: formatDuration(getNextReset('weekly', now) - now, labels.duration),
    monthly: formatDuration(getNextReset('monthly', now) - now, labels.duration),
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
        <ExportModal
          labels={labels}
          view={view}
          settings={settings}
          importData={importData}
          setImportData={setImportData}
          importError={importError}
          setImportError={setImportError}
          setShowExport={setShowExport}
          handleImport={handleImport}
        />
      )}

      {/* Modale réglages */}
      {showSettings && (
        <SettingsModal
          labels={labels}
          assets={assets}
          seasonWindows={seasonWindows}
          cycles={cycles}
          view={view}
          settings={settings}
          now={now}
          settingsTab={settingsTab}
          setSettingsTab={setSettingsTab}
          setSettings={setSettings}
          setProgress={setProgress}
          setShowSettings={setShowSettings}
          toggleEnabled={toggleEnabled}
        />
      )}
    </div>
  );
}
