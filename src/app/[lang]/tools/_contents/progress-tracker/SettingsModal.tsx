'use client';

/**
 * Modale des réglages du Progress Tracker (cinq onglets : affichage, jeu,
 * contenu optionnel, atelier, boutique) — extraite du composant principal
 * (découpage du 03/10/2026 — JSX déplacé tel quel ; l'état reste au parent,
 * via `useTrackerState`).
 */
import { Modal } from '@/components/ui/Modal';
import { TASK_DEFINITIONS, isSeasonalTask, type TaskDefinition, type TaskType } from './tasks';
import {
  EMPTY_PROGRESS,
  createDefaultSettings,
  isSeasonLive,
  type SeasonWindows,
  withPreciseCraftDays,
  type UserProgress,
  type UserSettings,
} from './tracker';
import type { SettingsTab, TrackerAssets, TrackerLabels } from './contracts';
import { MODAL_PANEL, SettingToggle, TaskLabel } from './ui';

const DAY_MS = 86_400_000;

export function SettingsModal({
  labels,
  assets,
  seasonWindows,
  cycles,
  view,
  settings,
  now,
  settingsTab,
  setSettingsTab,
  setSettings,
  setProgress,
  setShowSettings,
  toggleEnabled,
}: {
  labels: TrackerLabels;
  assets: TrackerAssets;
  seasonWindows: SeasonWindows;
  cycles: TaskType[];
  view: UserProgress;
  settings: UserSettings;
  now: number;
  settingsTab: SettingsTab;
  setSettingsTab: (next: SettingsTab) => void;
  setSettings: (next: UserSettings) => void;
  setProgress: (next: UserProgress) => void;
  setShowSettings: (next: boolean) => void;
  toggleEnabled: (taskId: string, type: TaskType) => void;
}) {
  return (
    <Modal
      label={labels.settingsTitle}
      className={`${MODAL_PANEL} max-w-2xl`}
      onClose={() => setShowSettings(false)}
    >
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
          <SettingToggle
            checked={settings.hasAllRegularHeroesSixStar}
            title={labels.allRegularHeroesSixStar}
            desc={labels.allRegularHeroesSixStarDesc}
            onChange={() =>
              setSettings({
                ...settings,
                hasAllRegularHeroesSixStar: !settings.hasAllRegularHeroesSixStar,
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
                <p className="mb-2 text-sm font-medium text-cyan-400">{labels.cycleTasks[type]}</p>
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
                            className={`text-2xs rounded px-1.5 py-0.5 font-semibold uppercase ${
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
                // Remise à zéro des DONNÉES courantes (progression + réglages). Les
                // clés héritées ne sont jamais touchées (filet de retour
                // arrière) — mais comme la clé courante réécrite prime sur
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
