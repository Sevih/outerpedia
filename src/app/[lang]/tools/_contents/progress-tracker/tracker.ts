/**
 * Progress tracker — LOGIQUE PURE (portage V2 `progressTracker.ts`). Aucune
 * lecture d'horloge ni de storage ici : chaque fonction reçoit `now` et rend
 * une nouvelle valeur — le composant client branche le tout sur
 * `useStoredState` et un tick de 60 s.
 *
 * Modèle V3 : `count` est LA source de vérité d'une tâche (« complétée » =
 * count ≥ max, le max étant TOUJOURS dérivé des réglages — la V2 stockait
 * `completed`/`maxCount` en doublon et les resynchronisait sans cesse).
 * Resets calés sur le serveur du jeu : quotidien 00:00 UTC, hebdo lundi
 * 00:00 UTC, mensuel le 1er 00:00 UTC.
 */

import type { StoreSpec } from '@/lib/client-storage';
import {
  DAILY_TASK_DEFINITIONS,
  TASK_DEFINITIONS,
  TASK_TYPES,
  SWEEPABLE_TASK_IDS,
  defaultCategoryTaskIds,
  permanentTaskIds,
  type TaskType,
} from './tasks';

export interface TaskProgress {
  count: number;
  /** Timestamp de la dernière action — référence du cycle des récurrentes. */
  lastUpdated: number;
}

export interface UserProgress {
  daily: Record<string, TaskProgress>;
  weekly: Record<string, TaskProgress>;
  monthly: Record<string, TaskProgress>;
  /** Fabrication précise (30 j glissants) : timestamp, null = disponible. */
  preciseCraft: { completedAt: number | null };
  lastDailyReset: number;
  lastWeeklyReset: number;
  lastMonthlyReset: number;
}

export interface UserSettings {
  enabledTasks: Record<TaskType, string[]>;
  /** Terminus Isle : 1 → 2 entrées/jour. */
  hasTerminusSupportPack: boolean;
  /** Hypnotic Frog Hall + Ark Raid : 3 → 4 entrées/jour. */
  hasVeronicaPremiumPack: boolean;
  /** Adventure license : combats par étage (× 3 étages). */
  adventureLicenseCombatsPerStage: 2 | 3 | 4;
  /** Tour élémentaire finie une fois pour toutes → tâche masquée. */
  hasCompletedElementalTower: boolean;
  displayMode: 'tabs' | 'single-page';
}

const DAY_MS = 86_400_000;
/** Fenêtre de la fabrication précise : 30 jours glissants. */
export const PRECISE_CRAFT_COOLDOWN_MS = 30 * DAY_MS;

/* ------------------------------------------------------------------------ */
/* Réglages                                                                  */
/* ------------------------------------------------------------------------ */

/**
 * Normalise des réglages de provenance quelconque (V3 stockés, clé V2
 * absorbée, import) vers le schéma courant : ids obsolètes écartés,
 * permanents ré-ajoutés, listes remises dans l'ordre des définitions,
 * champs manquants défaultés. Idempotente.
 */
export function normalizeSettings(raw: unknown): UserSettings {
  const d = (raw && typeof raw === 'object' ? raw : {}) as Partial<UserSettings> & {
    enabledTasks?: Partial<Record<TaskType, unknown>>;
  };

  const enabledTasks = {} as Record<TaskType, string[]>;
  for (const type of TASK_TYPES) {
    const validIds = Object.keys(TASK_DEFINITIONS[type]);
    const stored = d.enabledTasks?.[type];
    // Liste absente = premier passage : tout ce qui est actif par défaut.
    // Liste présente : on la respecte (boutique/atelier désactivés RESTENT
    // désactivés), on ne force que les permanentes.
    const base = Array.isArray(stored)
      ? stored.filter((id): id is string => typeof id === 'string')
      : [
          ...permanentTaskIds(type),
          ...defaultCategoryTaskIds(type, 'craft'),
          ...defaultCategoryTaskIds(type, 'shop'),
        ];
    const enabled = new Set(base);
    for (const id of permanentTaskIds(type)) enabled.add(id);
    enabledTasks[type] = validIds.filter((id) => enabled.has(id));
  }

  const combats = d.adventureLicenseCombatsPerStage;
  return {
    enabledTasks,
    hasTerminusSupportPack: d.hasTerminusSupportPack === true,
    hasVeronicaPremiumPack: d.hasVeronicaPremiumPack === true,
    adventureLicenseCombatsPerStage: combats === 3 || combats === 4 ? combats : 2,
    hasCompletedElementalTower: d.hasCompletedElementalTower === true,
    displayMode: d.displayMode === 'single-page' ? 'single-page' : 'tabs',
  };
}

export function createDefaultSettings(): UserSettings {
  return normalizeSettings(undefined);
}

/** Max effectif d'une tâche : base des définitions, modulée par les réglages. */
export function getTaskMaxCount(taskId: string, type: TaskType, settings: UserSettings): number {
  if (taskId === 'terminus-isle') return settings.hasTerminusSupportPack ? 2 : 1;
  if (taskId === 'hypnotic-frog-hall' || taskId === 'ark-raid')
    return settings.hasVeronicaPremiumPack ? 4 : 3;
  if (taskId === 'adventure-license') return settings.adventureLicenseCombatsPerStage * 3;
  return TASK_DEFINITIONS[type][taskId]?.maxCount ?? 1;
}

export function isTaskCompleted(task: TaskProgress, maxCount: number): boolean {
  return task.count >= maxCount;
}

/* ------------------------------------------------------------------------ */
/* Disponibilité calendaire                                                  */
/* ------------------------------------------------------------------------ */

/** Singularité dimensionnelle : ouverte mercredi 00:00 → samedi 23:59 UTC. */
export function isDimensionalSingularityActive(now: number): boolean {
  const day = new Date(now).getUTCDay();
  return day >= 3 && day <= 6;
}

/** Ids activés et RÉELLEMENT disponibles maintenant (filtres calendaires). */
export function activeTaskIds(type: TaskType, settings: UserSettings, now: number): string[] {
  return settings.enabledTasks[type].filter((id) => {
    if (id === 'elemental-tower' && settings.hasCompletedElementalTower) return false;
    if (id === 'dimensional-singularity' && !isDimensionalSingularityActive(now)) return false;
    return true;
  });
}

/* ------------------------------------------------------------------------ */
/* Synchro réglages ⇄ progression, resets                                    */
/* ------------------------------------------------------------------------ */

/**
 * Reconstruit chaque liste à partir des ids actifs (ordre des définitions) :
 * tâches désactivées écartées, nouvelles ajoutées à zéro, counts re-bornés au
 * max effectif (un pack désactivé fait retomber le surplus).
 */
export function syncProgressWithSettings(
  progress: UserProgress,
  settings: UserSettings,
  now: number,
): UserProgress {
  const next = { ...progress };
  for (const type of TASK_TYPES) {
    const list: Record<string, TaskProgress> = {};
    for (const id of activeTaskIds(type, settings, now)) {
      const prev = progress[type][id];
      const max = getTaskMaxCount(id, type, settings);
      list[id] = prev
        ? { count: Math.min(prev.count, max), lastUpdated: prev.lastUpdated }
        : { count: 0, lastUpdated: now };
    }
    next[type] = list;
  }
  return next;
}

/** 00:00 UTC du jour du timestamp (l'époque Unix tombe à 00:00 UTC). */
function startOfUtcDay(ts: number): number {
  return ts - (ts % DAY_MS);
}

/** Lundi 00:00 UTC de la semaine du timestamp. */
function startOfUtcWeek(ts: number): number {
  const day = new Date(ts).getUTCDay();
  return startOfUtcDay(ts) - ((day - 1 + 7) % 7) * DAY_MS;
}

/** 1er du mois, 00:00 UTC. */
function startOfUtcMonth(ts: number): number {
  const d = new Date(ts);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
}

/**
 * Applique les resets dus depuis la dernière visite. Les récurrentes
 * (couloir infini) ne retombent que `resetIntervalDays` jours — comptés en
 * jours UTC — après leur complétion.
 */
export function checkAndResetProgress(
  progress: UserProgress,
  settings: UserSettings,
  now: number,
): UserProgress {
  let next = progress;

  if (progress.lastDailyReset < startOfUtcDay(now)) {
    const daily: Record<string, TaskProgress> = {};
    for (const [id, task] of Object.entries(next.daily)) {
      const def = DAILY_TASK_DEFINITIONS[id];
      if (def?.resetIntervalDays && isTaskCompleted(task, getTaskMaxCount(id, 'daily', settings))) {
        const resetAt = startOfUtcDay(task.lastUpdated) + def.resetIntervalDays * DAY_MS;
        daily[id] = now >= resetAt ? { ...task, count: 0 } : task;
      } else {
        daily[id] = { ...task, count: 0 };
      }
    }
    next = { ...next, daily, lastDailyReset: now };
  }

  if (progress.lastWeeklyReset < startOfUtcWeek(now)) {
    const weekly = Object.fromEntries(
      Object.entries(next.weekly).map(([id, task]) => [id, { ...task, count: 0 }]),
    );
    next = { ...next, weekly, lastWeeklyReset: now };
  }

  if (progress.lastMonthlyReset < startOfUtcMonth(now)) {
    const monthly = Object.fromEntries(
      Object.entries(next.monthly).map(([id, task]) => [id, { ...task, count: 0 }]),
    );
    next = { ...next, monthly, lastMonthlyReset: now };
  }

  return next;
}

/**
 * Vue à jour de la progression : synchro avec les réglages puis resets dus.
 * Idempotente à `now` figé — le client compare au stocké pour ré-écrire.
 */
export function reconcileProgress(
  progress: UserProgress,
  settings: UserSettings,
  now: number,
): UserProgress {
  return checkAndResetProgress(syncProgressWithSettings(progress, settings, now), settings, now);
}

export function getNextReset(type: TaskType, now: number): number {
  if (type === 'daily') return startOfUtcDay(now) + DAY_MS;
  if (type === 'weekly') return startOfUtcWeek(now) + 7 * DAY_MS;
  const d = new Date(now);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1);
}

/** Prochain reset d'une récurrente complétée (null si non complétée). */
export function getNextRecurringTaskReset(
  progress: UserProgress,
  taskId: string,
  settings: UserSettings,
): number | null {
  const task = progress.daily[taskId];
  const def = DAILY_TASK_DEFINITIONS[taskId];
  if (!task || !def?.resetIntervalDays) return null;
  if (!isTaskCompleted(task, getTaskMaxCount(taskId, 'daily', settings))) return null;
  return startOfUtcDay(task.lastUpdated) + def.resetIntervalDays * DAY_MS;
}

/* ------------------------------------------------------------------------ */
/* Tour céleste very hard : déblocage progressif                             */
/* ------------------------------------------------------------------------ */

export const VHT_PHASE_LABELS = ['1-5', '6-10', '11-15', '16-20'];

/** Phases débloquées selon le jour du mois : 1er/8/15/22 → 1/2/3/4. */
export function getVHTUnlockedPhase(now: number): number {
  const dayOfMonth = new Date(now).getUTCDate();
  if (dayOfMonth >= 22) return 4;
  if (dayOfMonth >= 15) return 3;
  if (dayOfMonth >= 8) return 2;
  return 1;
}

export function getNextVHTUnlockTime(now: number): number | null {
  const phase = getVHTUnlockedPhase(now);
  if (phase >= 4) return null;
  const unlockDay = [1, 8, 15, 22][phase];
  const d = new Date(now);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), unlockDay);
}

/* ------------------------------------------------------------------------ */
/* Fabrication précise (30 jours glissants)                                  */
/* ------------------------------------------------------------------------ */

export function isPreciseCraftAvailable(progress: UserProgress, now: number): boolean {
  const { completedAt } = progress.preciseCraft;
  return completedAt === null || now >= completedAt + PRECISE_CRAFT_COOLDOWN_MS;
}

export function getNextPreciseCraftTime(progress: UserProgress, now: number): number | null {
  const { completedAt } = progress.preciseCraft;
  if (completedAt === null) return null;
  const nextAvailable = completedAt + PRECISE_CRAFT_COOLDOWN_MS;
  return now >= nextAvailable ? null : nextAvailable;
}

export function withPreciseCraftToggled(progress: UserProgress, now: number): UserProgress {
  return {
    ...progress,
    preciseCraft: { completedAt: progress.preciseCraft.completedAt === null ? now : null },
  };
}

/** Cale le timer sur « disponible dans N jours » (saisie manuelle). */
export function withPreciseCraftDays(
  progress: UserProgress,
  daysRemaining: number,
  now: number,
): UserProgress {
  const completedAt =
    daysRemaining <= 0 ? null : now + daysRemaining * DAY_MS - PRECISE_CRAFT_COOLDOWN_MS;
  return { ...progress, preciseCraft: { completedAt } };
}

/* ------------------------------------------------------------------------ */
/* Mutations de progression                                                  */
/* ------------------------------------------------------------------------ */

export function withTaskCount(
  progress: UserProgress,
  type: TaskType,
  taskId: string,
  count: number,
  settings: UserSettings,
  now: number,
): UserProgress {
  if (!progress[type][taskId]) return progress;
  const max = getTaskMaxCount(taskId, type, settings);
  const clamped = Math.max(0, Math.min(count, max));
  return {
    ...progress,
    [type]: { ...progress[type], [taskId]: { count: clamped, lastUpdated: now } },
  };
}

/** Bascule groupée : tout compléter, ou tout remettre à zéro si tout l'est. */
function withIdsToggled(
  progress: UserProgress,
  type: TaskType,
  ids: string[],
  settings: UserSettings,
  now: number,
): UserProgress {
  const present = ids.filter((id) => progress[type][id]);
  if (present.length === 0) return progress;
  const allCompleted = present.every((id) =>
    isTaskCompleted(progress[type][id], getTaskMaxCount(id, type, settings)),
  );
  const list = { ...progress[type] };
  for (const id of present) {
    list[id] = {
      count: allCompleted ? 0 : getTaskMaxCount(id, type, settings),
      lastUpdated: now,
    };
  }
  return { ...progress, [type]: list };
}

/** Contenus sweepables du daily (bouton « tout balayer »). */
export function withSweepToggled(
  progress: UserProgress,
  settings: UserSettings,
  now: number,
): UserProgress {
  return withIdsToggled(progress, 'daily', SWEEPABLE_TASK_IDS, settings, now);
}

/** Toutes les entrées boutique (ou atelier) d'un cycle, d'un coup. */
export function withCategoryToggled(
  progress: UserProgress,
  type: TaskType,
  category: 'shop' | 'craft',
  settings: UserSettings,
  now: number,
): UserProgress {
  const ids = Object.values(TASK_DEFINITIONS[type])
    .filter((def) => def.category === category)
    .map((def) => def.id);
  return withIdsToggled(progress, type, ids, settings, now);
}

/* ------------------------------------------------------------------------ */
/* Statistiques, affichage                                                   */
/* ------------------------------------------------------------------------ */

export interface CycleStats {
  completed: number;
  total: number;
  percent: number;
}

/** Complétion par cycle — la fabrication précise compte dans le mensuel. */
export function getStats(
  progress: UserProgress,
  settings: UserSettings,
  now: number,
): Record<TaskType, CycleStats> {
  const stats = {} as Record<TaskType, CycleStats>;
  for (const type of TASK_TYPES) {
    let completed = Object.entries(progress[type]).filter(([id, task]) =>
      isTaskCompleted(task, getTaskMaxCount(id, type, settings)),
    ).length;
    let total = Object.keys(progress[type]).length;
    if (type === 'monthly') {
      completed += isPreciseCraftAvailable(progress, now) ? 0 : 1;
      total += 1;
    }
    stats[type] = {
      completed,
      total,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }
  return stats;
}

/** « 2d 4h 12m » / « 4h 12m » jusqu'au timestamp. */
export function formatTimeUntil(timestamp: number, now: number): string {
  const diff = timestamp - now;
  if (diff <= 0) return '0h 0m';
  const days = Math.floor(diff / DAY_MS);
  const hours = Math.floor((diff % DAY_MS) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  return days > 0 ? `${days}d ${hours}h ${minutes}m` : `${hours}h ${minutes}m`;
}

/* ------------------------------------------------------------------------ */
/* Storage : specs V3 + interprétation du schéma V2                          */
/* ------------------------------------------------------------------------ */

/**
 * Interprète une progression de provenance quelconque — schéma V2
 * (`outerplane:progress` : tâches `{completed, count?, maxCount?}`) ou export
 * V3 — vers le schéma courant. `undefined` si la forme n'est pas plausible.
 */
export function coerceProgress(data: unknown): UserProgress | undefined {
  if (!data || typeof data !== 'object') return undefined;
  const d = data as {
    daily?: unknown;
    weekly?: unknown;
    monthly?: unknown;
    preciseCraft?: { completedAt?: unknown };
    lastDailyReset?: unknown;
    lastWeeklyReset?: unknown;
    lastMonthlyReset?: unknown;
  };
  if (!d.daily || typeof d.daily !== 'object' || !d.weekly || typeof d.weekly !== 'object')
    return undefined;

  const tasks = (rec: unknown): Record<string, TaskProgress> => {
    const out: Record<string, TaskProgress> = {};
    if (!rec || typeof rec !== 'object') return out;
    for (const [id, t] of Object.entries(
      rec as Record<
        string,
        { completed?: unknown; count?: unknown; maxCount?: unknown; lastUpdated?: unknown }
      >,
    )) {
      if (!t || typeof t !== 'object') continue;
      const stored = typeof t.count === 'number' ? Math.max(0, t.count) : 0;
      // V2 « case cochée » sans count (vieux schéma) : préserver la complétion.
      const count =
        t.completed === true
          ? Math.max(stored, typeof t.maxCount === 'number' ? t.maxCount : 1)
          : stored;
      out[id] = { count, lastUpdated: typeof t.lastUpdated === 'number' ? t.lastUpdated : 0 };
    }
    return out;
  };
  const ts = (v: unknown): number => (typeof v === 'number' ? v : 0);

  return {
    daily: tasks(d.daily),
    weekly: tasks(d.weekly),
    monthly: tasks(d.monthly),
    preciseCraft: {
      completedAt:
        typeof d.preciseCraft?.completedAt === 'number' ? d.preciseCraft.completedAt : null,
    },
    lastDailyReset: ts(d.lastDailyReset),
    lastWeeklyReset: ts(d.lastWeeklyReset),
    lastMonthlyReset: ts(d.lastMonthlyReset),
  };
}

/** Progression vierge — `reconcileProgress` peuple les listes au premier rendu. */
export const EMPTY_PROGRESS: UserProgress = {
  daily: {},
  weekly: {},
  monthly: {},
  preciseCraft: { completedAt: null },
  lastDailyReset: 0,
  lastWeeklyReset: 0,
  lastMonthlyReset: 0,
};

export const PROGRESS_SPEC: StoreSpec<UserProgress> = {
  key: 'outerpedia:progress-tracker',
  version: 1,
  fallback: EMPTY_PROGRESS,
  legacyKeys: ['outerplane:progress'],
  fromLegacy: coerceProgress,
};

export const SETTINGS_SPEC: StoreSpec<UserSettings> = {
  key: 'outerpedia:progress-tracker:settings',
  version: 1,
  fallback: createDefaultSettings(),
  legacyKeys: ['outerplane:settings'],
  fromLegacy: (data) => (data && typeof data === 'object' ? normalizeSettings(data) : undefined),
};

/* ------------------------------------------------------------------------ */
/* Export / import                                                           */
/* ------------------------------------------------------------------------ */

export function exportState(progress: UserProgress, settings: UserSettings): string {
  return JSON.stringify({ progress, settings }, null, 2);
}

/**
 * Lit un export V3 (`{progress, settings}`) ou un export V2 (progression
 * brute). `null` si illisible ; `settings` absent d'un export V2.
 */
export function importState(
  raw: string,
): { progress: UserProgress; settings: UserSettings | null } | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (data && typeof data === 'object' && 'progress' in data) {
    const d = data as { progress: unknown; settings?: unknown };
    const progress = coerceProgress(d.progress);
    if (!progress) return null;
    return {
      progress,
      settings: d.settings && typeof d.settings === 'object' ? normalizeSettings(d.settings) : null,
    };
  }
  const progress = coerceProgress(data);
  return progress ? { progress, settings: null } : null;
}
