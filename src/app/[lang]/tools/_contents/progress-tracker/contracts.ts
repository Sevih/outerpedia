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

/**
 * Lien vers le guide d'un boss, résolu au SERVEUR (href localisé, nom du boss
 * dans la langue) : donnée stable du build, choisie au client par son horloge.
 */
export interface TrackerGuideLink {
  href: string;
  name: string;
}

/** Une icône d'identité (élément ou classe) : sprite + nom dans la langue. */
export interface TrackerIcon {
  icon: string;
  name: string;
}

/**
 * Fiche du boss en cours (World Boss, Joint Challenge, guild raid, Singularity),
 * résolue au SERVEUR depuis la donnée du MODE (pas du guide) : portrait, nom
 * dans la langue, élément et classe. Choisie au client par son horloge.
 */
export interface TrackerBossCard {
  portrait: string;
  name: string;
  element: TrackerIcon;
  klass: TrackerIcon;
}

/**
 * EX Buff d'un créneau de Singularity, cible résolue au serveur : icône de
 * l'élément ou de la classe visés (absente pour une option inconnue),
 * « EX Buff · <cible> » et la `desc` du jeu, dans la langue.
 */
export interface TrackerExBuff {
  icon?: string;
  label: string;
  desc: string;
}

/**
 * Tables stables du suivi pour les liens de guide et les fiches de boss : le
 * client y choisit, par son horloge, l'entrée du boss en cours.
 */
export interface TrackerBossTables {
  /** Guide FIXE par id de tâche (tour Very Hard, poursuites). */
  fixedGuides: Record<string, TrackerGuideLink>;
  /** Guide par boss de Singularity (id du monstre `600000xx`). */
  singularityGuides: Record<string, TrackerGuideLink>;
  /** Fiche par boss de Singularity (id du monstre). */
  singularityBosses: Record<string, TrackerBossCard>;
  /** EX Buff par id de buff (`SingularityBoss.exBuff` du créneau). */
  singularityExBuffs: Record<string, TrackerExBuff>;
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
  /** « Guide: {name} » — `{name}` remplacé au client. */
  guideLink: string;
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
