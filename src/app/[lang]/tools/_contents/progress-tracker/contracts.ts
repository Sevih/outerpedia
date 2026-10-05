/**
 * Contrats du Progress Tracker — les TYPES du pont wrapper serveur → client
 * (`TrackerLabels`, `TrackerAssets`, `TrackerItem`) et l'onglet de réglages
 * (`SettingsTab`), partagé entre le hook d'état et la modale. Extrait de
 * `ProgressTrackerBrowser.tsx` le 03/10/2026 (découpage mécanique, contenu
 * inchangé).
 */
import type { DurationUnits } from '@/lib/format-duration';
import type { TaskCategory, TaskType } from './tasks';

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
  duration: DurationUnits;
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
  terminusSupportPack: string;
  terminusSupportPackDesc: string;
  veronicaPremiumPack: string;
  veronicaPremiumPackDesc: string;
  elementalTowerCompleted: string;
  elementalTowerCompletedDesc: string;
  allRegularHeroesSixStar: string;
  allRegularHeroesSixStarDesc: string;
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

export type SettingsTab = 'display' | 'game' | 'content' | 'craft' | 'shop';
