// Task definitions for Progress Tracker
// All possible tasks with their configurations

import type { TaskDefinition } from '@/types/progress'

export const DAILY_TASK_DEFINITIONS: Record<string, TaskDefinition> = {
  'free-recruit-custom': {
    id: 'free-recruit-custom',
    type: 'daily',
    labelKey: 'progress.task.free-recruit-custom',
    permanent: true,
    maxCount: 1,
  },
  'free-recruit-demiurge': {
    id: 'free-recruit-demiurge',
    type: 'daily',
    labelKey: 'progress.task.free-recruit-demiurge',
    permanent: true,
    maxCount: 1,
  },
  'guild-security-area': {
    id: 'guild-security-area',
    type: 'daily',
    labelKey: 'progress.task.guild-security-area',
    permanent: true,
    maxCount: 1,
  },
  // Optional/Event tasks (not always available)
  'joint-challenge': {
    id: 'joint-challenge',
    type: 'daily',
    labelKey: 'progress.task.joint-challenge',
    permanent: false,
    maxCount: 2,
  },
  'guild-raid': {
    id: 'guild-raid',
    type: 'daily',
    labelKey: 'progress.task.guild-raid',
    permanent: false,
    maxCount: 2,
  },
  'world-boss': {
    id: 'world-boss',
    type: 'daily',
    labelKey: 'progress.task.world-boss',
    permanent: false,
    maxCount: 1,
  },
  'terminus-isle': {
    id: 'terminus-isle',
    type: 'daily',
    labelKey: 'progress.task.terminus-isle',
    permanent: true,
    maxCount: 1, // Can be increased to 2 with support pack
  },
  'bounty-hunter': {
    id: 'bounty-hunter',
    type: 'daily',
    labelKey: 'progress.task.bounty-hunter',
    permanent: true,
    maxCount: 3, // Can be increased to 4 with Veronica Premium Pack
  },
  'bandit-chase': {
    id: 'bandit-chase',
    type: 'daily',
    labelKey: 'progress.task.bandit-chase',
    permanent: true,
    maxCount: 3, // Can be increased to 4 with Veronica Premium Pack
  },
  'upgrade-stone-retrieval': {
    id: 'upgrade-stone-retrieval',
    type: 'daily',
    labelKey: 'progress.task.upgrade-stone-retrieval',
    permanent: true,
    maxCount: 3, // Can be increased to 4 with Veronica Premium Pack
  },
  'defeat-doppelganger': {
    id: 'defeat-doppelganger',
    type: 'daily',
    labelKey: 'progress.task.defeat-doppelganger',
    permanent: true,
    maxCount: 10,
  },
  'special-request-ecology': {
    id: 'special-request-ecology',
    type: 'daily',
    labelKey: 'progress.task.special-request-ecology',
    permanent: true,
    maxCount: 3,
  },
  'special-request-identification': {
    id: 'special-request-identification',
    type: 'daily',
    labelKey: 'progress.task.special-request-identification',
    permanent: true,
    maxCount: 3,
  },
  'elemental-tower': {
    id: 'elemental-tower',
    type: 'daily',
    labelKey: 'progress.task.elemental-tower',
    permanent: true,
    maxCount: 5,
  },
  'memorial-match': {
    id: 'memorial-match',
    type: 'daily',
    labelKey: 'progress.task.memorial-match',
    permanent: true,
    maxCount: 5,
  },
  'adventure-license': {
    id: 'adventure-license',
    type: 'daily',
    labelKey: 'progress.task.adventure-license',
    permanent: true,
    maxCount: 12, // Dynamic: 2/3/4 combats per stage × 3 stages = 6/9/12
  },
}

export const WEEKLY_TASK_DEFINITIONS: Record<string, TaskDefinition> = {
  'arena-battle': {
    id: 'arena-battle',
    type: 'weekly',
    labelKey: 'progress.task.arena-battle',
    permanent: true,
    maxCount: 30,
  },
}

export const MONTHLY_TASK_DEFINITIONS: Record<string, TaskDefinition> = {
  'skyward-tower-100': {
    id: 'skyward-tower-100',
    type: 'monthly',
    labelKey: 'progress.task.skyward-tower-100',
    permanent: true,
    maxCount: 1,
  },
  'skyward-tower-hard-40': {
    id: 'skyward-tower-hard-40',
    type: 'monthly',
    labelKey: 'progress.task.skyward-tower-hard-40',
    permanent: true,
    maxCount: 1,
  },
  'skyward-tower-vhard-20': {
    id: 'skyward-tower-vhard-20',
    type: 'monthly',
    labelKey: 'progress.task.skyward-tower-vhard-20',
    permanent: true,
    maxCount: 1,
  },
}

// Helper to get all task IDs
export function getAllDailyTaskIds(): string[] {
  return Object.keys(DAILY_TASK_DEFINITIONS)
}

export function getAllWeeklyTaskIds(): string[] {
  return Object.keys(WEEKLY_TASK_DEFINITIONS)
}

export function getAllMonthlyTaskIds(): string[] {
  return Object.keys(MONTHLY_TASK_DEFINITIONS)
}

// Helper to get only permanent task IDs (auto-enabled by default)
export function getPermanentDailyTaskIds(): string[] {
  return Object.values(DAILY_TASK_DEFINITIONS)
    .filter((def) => def.permanent)
    .map((def) => def.id)
}

export function getPermanentWeeklyTaskIds(): string[] {
  return Object.values(WEEKLY_TASK_DEFINITIONS)
    .filter((def) => def.permanent)
    .map((def) => def.id)
}

export function getPermanentMonthlyTaskIds(): string[] {
  return Object.values(MONTHLY_TASK_DEFINITIONS)
    .filter((def) => def.permanent)
    .map((def) => def.id)
}
