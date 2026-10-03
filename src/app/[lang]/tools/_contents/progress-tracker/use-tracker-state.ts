'use client';

/**
 * État du Progress Tracker — extrait du composant principal (découpage du
 * 03/10/2026 — déplacement mécanique, logique inchangée). Le hook possède :
 *   - la progression et les réglages stockés (`useStoredState`), l'horloge
 *     `now` (tic de 60 s) et les deux vues qui en dérivent : `settings`
 *     (normalisés) et `view` (progression réconciliée) ;
 *   - l'état d'interface : onglet de cycle, onglet de réglages, modales
 *     ouvertes, saisie d'import ;
 *   - les gestes : `increment`, `toggle`, `toggleEnabled`, `handleImport`.
 * Le composant principal DESTRUCTURE le retour sous les MÊMES noms que les
 * anciens useState : le JSX n'a pas bougé.
 */
import { useEffect, useMemo, useState } from 'react';
import { useStoredState } from '@/lib/client-storage';
import { TASK_DEFINITIONS, type TaskType } from './tasks';
import {
  PROGRESS_SPEC,
  SETTINGS_SPEC,
  getTaskMaxCount,
  getVHTUnlockedPhase,
  importState,
  normalizeSettings,
  reconcileProgress,
  type SeasonWindows,
  withTaskCount,
} from './tracker';
import type { SettingsTab } from './contracts';

/** Anti double-tap (200 ms) — les lignes se cliquent en rafale sur mobile. */
let lastClick = 0;
export function debounced(fn: () => void) {
  const t = Date.now();
  if (t - lastClick < 200) return;
  lastClick = t;
  fn();
}

export function useTrackerState(seasonWindows: SeasonWindows) {
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

  return {
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
  };
}
