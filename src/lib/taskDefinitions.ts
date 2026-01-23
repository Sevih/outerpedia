// Task definitions for Progress Tracker
// All possible tasks with their configurations

import type { TaskDefinition } from '@/types/progress'

export const DAILY_TASK_DEFINITIONS: Record<string, TaskDefinition> = {
  // Regular tasks
  'free-recruit-custom': {
    id: 'free-recruit-custom',
    type: 'daily',
    category: 'task',
    labelKey: 'progress.task.free-recruit-custom',
    permanent: true,
    maxCount: 1,
  },
  'free-recruit-demiurge': {
    id: 'free-recruit-demiurge',
    type: 'daily',
    category: 'task',
    labelKey: 'progress.task.free-recruit-demiurge',
    permanent: true,
    maxCount: 1,
  },
  'guild-security-area': {
    id: 'guild-security-area',
    type: 'daily',
    category: 'task',
    labelKey: 'progress.task.guild-security-area',
    permanent: true,
    maxCount: 1,
  },
  // Optional/Event tasks (not always available)
  'joint-challenge': {
    id: 'joint-challenge',
    type: 'daily',
    category: 'task',
    labelKey: 'progress.task.joint-challenge',
    permanent: false,
    maxCount: 2,
  },
  'guild-raid': {
    id: 'guild-raid',
    type: 'daily',
    category: 'task',
    labelKey: 'progress.task.guild-raid',
    permanent: false,
    maxCount: 2,
  },
  'world-boss': {
    id: 'world-boss',
    type: 'daily',
    category: 'task',
    labelKey: 'progress.task.world-boss',
    permanent: false,
    maxCount: 1,
  },
  'terminus-isle': {
    id: 'terminus-isle',
    type: 'daily',
    category: 'task',
    labelKey: 'progress.task.terminus-isle',
    permanent: true,
    maxCount: 1, // Can be increased to 2 with support pack
  },
  'bounty-hunter': {
    id: 'bounty-hunter',
    type: 'daily',
    category: 'task',
    labelKey: 'progress.task.bounty-hunter',
    permanent: true,
    maxCount: 3, // Can be increased to 4 with Veronica Premium Pack
  },
  'bandit-chase': {
    id: 'bandit-chase',
    type: 'daily',
    category: 'task',
    labelKey: 'progress.task.bandit-chase',
    permanent: true,
    maxCount: 3, // Can be increased to 4 with Veronica Premium Pack
  },
  'upgrade-stone-retrieval': {
    id: 'upgrade-stone-retrieval',
    type: 'daily',
    category: 'task',
    labelKey: 'progress.task.upgrade-stone-retrieval',
    permanent: true,
    maxCount: 3, // Can be increased to 4 with Veronica Premium Pack
  },
  'defeat-doppelganger': {
    id: 'defeat-doppelganger',
    type: 'daily',
    category: 'task',
    labelKey: 'progress.task.defeat-doppelganger',
    permanent: true,
    maxCount: 10,
  },
  'special-request-ecology': {
    id: 'special-request-ecology',
    type: 'daily',
    category: 'task',
    labelKey: 'progress.task.special-request-ecology',
    permanent: true,
    maxCount: 3,
  },
  'special-request-identification': {
    id: 'special-request-identification',
    type: 'daily',
    category: 'task',
    labelKey: 'progress.task.special-request-identification',
    permanent: true,
    maxCount: 3,
  },
  'elemental-tower': {
    id: 'elemental-tower',
    type: 'daily',
    category: 'task',
    labelKey: 'progress.task.elemental-tower',
    permanent: true,
    maxCount: 5,
  },
  'memorial-match': {
    id: 'memorial-match',
    type: 'daily',
    category: 'task',
    labelKey: 'progress.task.memorial-match',
    permanent: true,
    maxCount: 5,
  },
  // Recurring tasks (special cycle)
  'infinite-corridor': {
    id: 'infinite-corridor',
    type: 'daily',
    category: 'recurring',
    labelKey: 'progress.task.infinite-corridor',
    permanent: true,
    maxCount: 1,
    resetIntervalDays: 3, // Resets every 3 days
  },
  // Shop tasks
  'shop-daily-free-gift': {
    id: 'shop-daily-free-gift',
    type: 'daily',
    category: 'shop',
    labelKey: 'progress.task.shop-daily-free-gift',
    permanent: true,
    maxCount: 1,
    shopCategory: 'progress.shop.resource-shop',
    shopSubcategory: 'progress.shop.daily-weekly-monthly',
  },
  'shop-event-jc-stamina': {
    id: 'shop-event-jc-stamina',
    type: 'daily',
    category: 'shop',
    labelKey: '', // Not used when shopItemKey is set
    permanent: true,
    maxCount: 1,
    shopCategory: 'progress.shop.contents',
    shopSubcategory: 'progress.shop.event-shop',
    shopTab: 'progress.shop.joint-challenge',
    shopItemKey: 'Stamina',
    shopItemQuantity: 50,
  },
  'shop-fp-stamina': {
    id: 'shop-fp-stamina',
    type: 'daily',
    category: 'shop',
    labelKey: '', // Not used when shopItemKey is set
    permanent: true,
    maxCount: 4,
    shopCategory: 'progress.shop.contents',
    shopSubcategory: 'progress.shop.friendship-point',
    shopItemKey: 'Stamina',
    shopItemQuantity: 30,
  },
  'shop-fp-gold': {
    id: 'shop-fp-gold',
    type: 'daily',
    category: 'shop',
    labelKey: '', // Not used when shopItemKey is set
    permanent: true,
    maxCount: 1,
    shopCategory: 'progress.shop.contents',
    shopSubcategory: 'progress.shop.friendship-point',
    shopItemKey: 'Gold',
    shopItemQuantity: 10000,
  },
  'shop-fp-arena-ticket': {
    id: 'shop-fp-arena-ticket',
    type: 'daily',
    category: 'shop',
    labelKey: '', // Not used when shopItemKey is set
    permanent: false, // Optional - some players don't need arena tickets
    maxCount: 5,
    shopCategory: 'progress.shop.contents',
    shopSubcategory: 'progress.shop.friendship-point',
    shopItemKey: 'Arena Ticket',
    shopItemQuantity: 1,
  },
  'shop-arena-stamina': {
    id: 'shop-arena-stamina',
    type: 'daily',
    category: 'shop',
    labelKey: '', // Not used when shopItemKey is set
    permanent: true,
    maxCount: 3,
    shopCategory: 'progress.shop.contents',
    shopSubcategory: 'progress.shop.arena-shop',
    shopItemKey: 'Stamina',
    shopItemQuantity: 50,
  },
  'shop-arena-gold': {
    id: 'shop-arena-gold',
    type: 'daily',
    category: 'shop',
    labelKey: '', // Not used when shopItemKey is set
    permanent: true,
    maxCount: 1,
    shopCategory: 'progress.shop.contents',
    shopSubcategory: 'progress.shop.arena-shop',
    shopItemKey: 'Gold',
    shopItemQuantity: 10000,
  },
  'shop-starmem-stamina': {
    id: 'shop-starmem-stamina',
    type: 'daily',
    category: 'shop',
    labelKey: '', // Not used when shopItemKey is set
    permanent: true,
    maxCount: 3,
    shopCategory: 'progress.shop.contents',
    shopSubcategory: 'progress.shop.star-memory',
    shopItemKey: 'Stamina',
    shopItemQuantity: 150,
  },
  'shop-starmem-ticket': {
    id: 'shop-starmem-ticket',
    type: 'daily',
    category: 'shop',
    labelKey: '', // Not used when shopItemKey is set
    permanent: true,
    maxCount: 1,
    shopCategory: 'progress.shop.contents',
    shopSubcategory: 'progress.shop.star-memory',
    shopItemKey: 'Special Recruitment Ticket (Event)',
    shopItemQuantity: 1,
  },
  'shop-starmem-gold': {
    id: 'shop-starmem-gold',
    type: 'daily',
    category: 'shop',
    labelKey: '', // Not used when shopItemKey is set
    permanent: false, // Optional
    maxCount: 3,
    shopCategory: 'progress.shop.contents',
    shopSubcategory: 'progress.shop.star-memory',
    shopItemKey: 'Gold',
    shopItemQuantity: 200000,
  },
  'shop-starmem-arena': {
    id: 'shop-starmem-arena',
    type: 'daily',
    category: 'shop',
    labelKey: '', // Not used when shopItemKey is set
    permanent: false, // Optional
    maxCount: 1,
    shopCategory: 'progress.shop.contents',
    shopSubcategory: 'progress.shop.star-memory',
    shopItemKey: 'Arena Ticket',
    shopItemQuantity: 5,
  },
  'shop-guild-gold': {
    id: 'shop-guild-gold',
    type: 'daily',
    category: 'shop',
    labelKey: '', // Not used when shopItemKey is set
    permanent: false, // Optional
    maxCount: 5,
    shopCategory: 'progress.shop.guild',
    shopSubcategory: 'progress.shop.guild-shop',
    shopTab: 'progress.shop.daily-products',
    shopItemKey: 'Gold',
    shopItemQuantity: 10000,
  },
}

export const WEEKLY_TASK_DEFINITIONS: Record<string, TaskDefinition> = {
  // Regular tasks
  'arena-battle': {
    id: 'arena-battle',
    type: 'weekly',
    category: 'task',
    labelKey: 'progress.task.arena-battle',
    permanent: true,
    maxCount: 30,
  },
  'monad-gates-exploration': {
    id: 'monad-gates-exploration',
    type: 'weekly',
    category: 'task',
    labelKey: 'progress.task.monad-gates-exploration',
    permanent: true,
    maxCount: 1,
  },
  'adventure-license': {
    id: 'adventure-license',
    type: 'weekly',
    category: 'task',
    labelKey: 'progress.task.adventure-license',
    permanent: true,
    maxCount: 12, // Dynamic: 2/3/4 combats per stage × 3 stages = 6/9/12
  },
}

export const MONTHLY_TASK_DEFINITIONS: Record<string, TaskDefinition> = {
  // Regular tasks
  'skyward-tower-100': {
    id: 'skyward-tower-100',
    type: 'monthly',
    category: 'task',
    labelKey: 'progress.task.skyward-tower-100',
    permanent: true,
    maxCount: 1,
  },
  'skyward-tower-hard-40': {
    id: 'skyward-tower-hard-40',
    type: 'monthly',
    category: 'task',
    labelKey: 'progress.task.skyward-tower-hard-40',
    permanent: true,
    maxCount: 1,
  },
  'skyward-tower-vhard-20': {
    id: 'skyward-tower-vhard-20',
    type: 'monthly',
    category: 'task',
    labelKey: 'progress.task.skyward-tower-vhard-20',
    permanent: true,
    maxCount: 1,
  },
  'irregular-floor-3': {
    id: 'irregular-floor-3',
    type: 'monthly',
    category: 'task',
    labelKey: 'progress.task.irregular-floor-3',
    permanent: true,
    maxCount: 1,
  },
  'irregular-point-exchange': {
    id: 'irregular-point-exchange',
    type: 'monthly',
    category: 'task',
    labelKey: 'progress.task.irregular-point-exchange',
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
