// Progress Tracker - Client-side storage service for daily/weekly/monthly task tracking
// Uses localStorage only - no tracking, no invasive data collection

import type { UserProgress, DailyTaskType, WeeklyTaskType, MonthlyTaskType, TaskProgress, UserSettings } from '@/types/progress'
import {
  DAILY_TASK_DEFINITIONS,
  WEEKLY_TASK_DEFINITIONS,
  MONTHLY_TASK_DEFINITIONS,
  getPermanentDailyTaskIds,
  getPermanentWeeklyTaskIds,
  getPermanentMonthlyTaskIds,
} from './taskDefinitions'

const STORAGE_KEY = 'outerplane:progress'
const SETTINGS_KEY = 'outerplane:settings'
const CURRENT_VERSION = 1

// Outerplane reset times (aligned with game server resets)
// Daily reset: 00:00 UTC (1h du matin en France UTC+1, 2h en UTC+2)
// Weekly reset: Tuesday 00:00 UTC (Mardi 1h du matin en France UTC+1, 2h en UTC+2)
const DAILY_RESET_HOUR_UTC = 0
const WEEKLY_RESET_DAY = 2 // Tuesday (0 = Sunday, 1 = Monday, 2 = Tuesday)

export const ProgressTracker = {
  /**
   * Get current progress, with auto-reset if needed
   */
  getProgress(): UserProgress {
    if (typeof window === 'undefined') {
      return this.createEmptyProgress()
    }

    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return this.createEmptyProgress()

    try {
      const progress: UserProgress = JSON.parse(stored)

      // Sync progress with current settings (in case new tasks were added)
      const settings = this.getSettings()
      this.syncProgressWithSettings(progress, settings)

      return this.checkAndResetProgress(progress)
    } catch {
      // Corrupted data, reset
      return this.createEmptyProgress()
    }
  },

  /**
   * Get user settings (enabled tasks)
   */
  getSettings(): UserSettings {
    if (typeof window === 'undefined') {
      return this.createDefaultSettings()
    }

    const stored = localStorage.getItem(SETTINGS_KEY)
    if (!stored) return this.createDefaultSettings()

    try {
      const settings = JSON.parse(stored) as UserSettings

      // Migration: ensure all permanent tasks are in the enabled list
      const permanentDaily = getPermanentDailyTaskIds()
      const permanentWeekly = getPermanentWeeklyTaskIds()
      const permanentMonthly = getPermanentMonthlyTaskIds()

      let needsUpdate = false

      // Ensure monthly tasks array exists (migration)
      if (!settings.enabledTasks.monthly) {
        settings.enabledTasks.monthly = []
        needsUpdate = true
      }

      // Add missing permanent daily tasks
      permanentDaily.forEach((taskId) => {
        if (!settings.enabledTasks.daily.includes(taskId)) {
          settings.enabledTasks.daily.push(taskId)
          needsUpdate = true
        }
      })

      // Add missing permanent weekly tasks
      permanentWeekly.forEach((taskId) => {
        if (!settings.enabledTasks.weekly.includes(taskId)) {
          settings.enabledTasks.weekly.push(taskId)
          needsUpdate = true
        }
      })

      // Add missing permanent monthly tasks
      permanentMonthly.forEach((taskId) => {
        if (!settings.enabledTasks.monthly.includes(taskId)) {
          settings.enabledTasks.monthly.push(taskId)
          needsUpdate = true
        }
      })

      // Ensure hasTerminusSupportPack exists (migration from old settings)
      if (settings.hasTerminusSupportPack === undefined) {
        settings.hasTerminusSupportPack = false
        needsUpdate = true
      }

      // Ensure hasVeronicaPremiumPack exists (migration from old settings)
      if (settings.hasVeronicaPremiumPack === undefined) {
        settings.hasVeronicaPremiumPack = false
        needsUpdate = true
      }

      // Ensure adventureLicenseCombatsPerStage exists (migration from old settings)
      if (settings.adventureLicenseCombatsPerStage === undefined) {
        settings.adventureLicenseCombatsPerStage = 2
        needsUpdate = true
      }

      if (needsUpdate) {
        this.saveSettings(settings)
      }

      return settings
    } catch {
      return this.createDefaultSettings()
    }
  },

  /**
   * Create default settings (only permanent tasks enabled)
   */
  createDefaultSettings(): UserSettings {
    return {
      enabledTasks: {
        daily: getPermanentDailyTaskIds(),
        weekly: getPermanentWeeklyTaskIds(),
        monthly: getPermanentMonthlyTaskIds(),
      },
      hasTerminusSupportPack: false,
      hasVeronicaPremiumPack: false,
      adventureLicenseCombatsPerStage: 2,
    }
  },

  /**
   * Save settings
   */
  saveSettings(settings: UserSettings): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  },

  /**
   * Toggle task enabled state
   */
  toggleTaskEnabled(taskId: string, type: 'daily' | 'weekly' | 'monthly'): void {
    const settings = this.getSettings()
    const taskList = type === 'daily'
      ? settings.enabledTasks.daily
      : type === 'weekly'
      ? settings.enabledTasks.weekly
      : settings.enabledTasks.monthly
    const index = taskList.indexOf(taskId)

    if (index >= 0) {
      // Disable task
      taskList.splice(index, 1)
    } else {
      // Enable task
      taskList.push(taskId)
    }

    this.saveSettings(settings)

    // Sync progress data with settings
    const progress = this.getProgress()
    this.syncProgressWithSettings(progress, settings)
    this.saveProgress(progress)
  },

  /**
   * Toggle Terminus Support Pack setting
   */
  toggleTerminusSupportPack(): void {
    const settings = this.getSettings()
    settings.hasTerminusSupportPack = !settings.hasTerminusSupportPack
    this.saveSettings(settings)

    // Update Terminus Isle task maxCount if it exists
    const progress = this.getProgress()
    if (progress.daily['terminus-isle']) {
      const newMaxCount = settings.hasTerminusSupportPack ? 2 : 1
      progress.daily['terminus-isle'].maxCount = newMaxCount
      // If current count exceeds new maxCount, clamp it
      if (progress.daily['terminus-isle'].count !== undefined && progress.daily['terminus-isle'].count! > newMaxCount) {
        progress.daily['terminus-isle'].count = newMaxCount
      }
      progress.daily['terminus-isle'].completed = (progress.daily['terminus-isle'].count ?? 0) >= newMaxCount
      this.saveProgress(progress)
    }
  },

  /**
   * Toggle Veronica Premium Pack setting
   */
  toggleVeronicaPremiumPack(): void {
    const settings = this.getSettings()
    settings.hasVeronicaPremiumPack = !settings.hasVeronicaPremiumPack
    this.saveSettings(settings)

    // Update affected tasks maxCount
    const progress = this.getProgress()
    const affectedTasks = ['bounty-hunter', 'bandit-chase', 'upgrade-stone-retrieval']
    const newMaxCount = settings.hasVeronicaPremiumPack ? 4 : 3

    affectedTasks.forEach((taskId) => {
      if (progress.daily[taskId]) {
        progress.daily[taskId].maxCount = newMaxCount
        // If current count exceeds new maxCount, clamp it
        if (progress.daily[taskId].count !== undefined && progress.daily[taskId].count! > newMaxCount) {
          progress.daily[taskId].count = newMaxCount
        }
        progress.daily[taskId].completed = (progress.daily[taskId].count ?? 0) >= newMaxCount
      }
    })

    this.saveProgress(progress)
  },

  /**
   * Set Adventure License combats per stage (2, 3, or 4)
   */
  setAdventureLicenseCombatsPerStage(combatsPerStage: 2 | 3 | 4): void {
    const settings = this.getSettings()
    settings.adventureLicenseCombatsPerStage = combatsPerStage
    this.saveSettings(settings)

    // Update Adventure License task maxCount
    const progress = this.getProgress()
    if (progress.daily['adventure-license']) {
      const newMaxCount = combatsPerStage * 3
      progress.daily['adventure-license'].maxCount = newMaxCount
      // If current count exceeds new maxCount, clamp it
      if (progress.daily['adventure-license'].count !== undefined && progress.daily['adventure-license'].count! > newMaxCount) {
        progress.daily['adventure-license'].count = newMaxCount
      }
      progress.daily['adventure-license'].completed = (progress.daily['adventure-license'].count ?? 0) >= newMaxCount
      this.saveProgress(progress)
    }
  },

  /**
   * Get maxCount for a task, considering settings
   */
  getTaskMaxCount(taskId: string, type: 'daily' | 'weekly' | 'monthly'): number | undefined {
    const def = type === 'daily'
      ? DAILY_TASK_DEFINITIONS[taskId]
      : type === 'weekly'
      ? WEEKLY_TASK_DEFINITIONS[taskId]
      : MONTHLY_TASK_DEFINITIONS[taskId]
    if (!def?.maxCount) return undefined

    const settings = this.getSettings()

    // Special case: Terminus Isle with support pack
    if (taskId === 'terminus-isle') {
      return settings.hasTerminusSupportPack ? 2 : 1
    }

    // Special case: Bounty Hunter, Bandit Chase, Upgrade Stone Retrieval with Veronica Premium Pack
    if (['bounty-hunter', 'bandit-chase', 'upgrade-stone-retrieval'].includes(taskId)) {
      return settings.hasVeronicaPremiumPack ? 4 : 3
    }

    // Special case: Adventure License (combats per stage × 3 stages)
    if (taskId === 'adventure-license') {
      return settings.adventureLicenseCombatsPerStage * 3
    }

    return def.maxCount
  },

  /**
   * Sync progress data with current settings
   * Adds missing enabled tasks, removes disabled tasks
   */
  syncProgressWithSettings(progress: UserProgress, settings: UserSettings): void {
    const now = Date.now()

    // Sync daily tasks
    const currentDailyIds = Object.keys(progress.daily)
    const enabledDailyIds = settings.enabledTasks.daily

    // Remove disabled tasks
    currentDailyIds.forEach((id) => {
      if (!enabledDailyIds.includes(id)) {
        delete progress.daily[id]
      }
    })

    // Add newly enabled tasks
    enabledDailyIds.forEach((id) => {
      if (!progress.daily[id]) {
        const maxCount = this.getTaskMaxCount(id, 'daily')
        progress.daily[id] = {
          id,
          completed: false,
          lastUpdated: now,
          maxCount,
          count: maxCount ? 0 : undefined,
        }
      } else {
        // Update maxCount for existing tasks (e.g., Terminus Isle when support pack changes)
        const maxCount = this.getTaskMaxCount(id, 'daily')
        if (maxCount !== undefined) {
          progress.daily[id].maxCount = maxCount
          // Clamp count if it exceeds new maxCount
          if (progress.daily[id].count !== undefined && progress.daily[id].count! > maxCount) {
            progress.daily[id].count = maxCount
          }
          progress.daily[id].completed = (progress.daily[id].count ?? 0) >= maxCount
        }
      }
    })

    // Sync weekly tasks
    const currentWeeklyIds = Object.keys(progress.weekly)
    const enabledWeeklyIds = settings.enabledTasks.weekly

    // Remove disabled tasks
    currentWeeklyIds.forEach((id) => {
      if (!enabledWeeklyIds.includes(id)) {
        delete progress.weekly[id]
      }
    })

    // Add newly enabled tasks
    enabledWeeklyIds.forEach((id) => {
      if (!progress.weekly[id]) {
        const maxCount = this.getTaskMaxCount(id, 'weekly')
        progress.weekly[id] = {
          id,
          completed: false,
          lastUpdated: now,
          maxCount,
          count: maxCount ? 0 : undefined,
        }
      } else {
        // Update maxCount for existing tasks
        const maxCount = this.getTaskMaxCount(id, 'weekly')
        if (maxCount !== undefined) {
          progress.weekly[id].maxCount = maxCount
          // Clamp count if it exceeds new maxCount
          if (progress.weekly[id].count !== undefined && progress.weekly[id].count! > maxCount) {
            progress.weekly[id].count = maxCount
          }
          progress.weekly[id].completed = (progress.weekly[id].count ?? 0) >= maxCount
        }
      }
    })

    // Ensure monthly tasks object exists (migration)
    if (!progress.monthly) {
      progress.monthly = {}
    }

    // Sync monthly tasks
    const currentMonthlyIds = Object.keys(progress.monthly)
    const enabledMonthlyIds = settings.enabledTasks.monthly

    // Remove disabled tasks
    currentMonthlyIds.forEach((id) => {
      if (!enabledMonthlyIds.includes(id)) {
        delete progress.monthly[id]
      }
    })

    // Add newly enabled tasks
    enabledMonthlyIds.forEach((id) => {
      if (!progress.monthly[id]) {
        const maxCount = this.getTaskMaxCount(id, 'monthly')
        progress.monthly[id] = {
          id,
          completed: false,
          lastUpdated: now,
          maxCount,
          count: maxCount ? 0 : undefined,
        }
      } else {
        // Update maxCount for existing tasks
        const maxCount = this.getTaskMaxCount(id, 'monthly')
        if (maxCount !== undefined) {
          progress.monthly[id].maxCount = maxCount
          // Clamp count if it exceeds new maxCount
          if (progress.monthly[id].count !== undefined && progress.monthly[id].count! > maxCount) {
            progress.monthly[id].count = maxCount
          }
          progress.monthly[id].completed = (progress.monthly[id].count ?? 0) >= maxCount
        }
      }
    })
  },

  /**
   * Create empty progress with enabled tasks from settings
   */
  createEmptyProgress(): UserProgress {
    const now = Date.now()
    const settings = this.getSettings()

    const daily: Record<string, TaskProgress> = {}
    settings.enabledTasks.daily.forEach((id) => {
      const maxCount = this.getTaskMaxCount(id, 'daily')
      daily[id] = {
        id,
        completed: false,
        lastUpdated: now,
        maxCount,
        count: maxCount ? 0 : undefined,
      }
    })

    const weekly: Record<string, TaskProgress> = {}
    settings.enabledTasks.weekly.forEach((id) => {
      const maxCount = this.getTaskMaxCount(id, 'weekly')
      weekly[id] = {
        id,
        completed: false,
        lastUpdated: now,
        maxCount,
        count: maxCount ? 0 : undefined,
      }
    })

    const monthly: Record<string, TaskProgress> = {}
    settings.enabledTasks.monthly.forEach((id) => {
      const maxCount = this.getTaskMaxCount(id, 'monthly')
      monthly[id] = {
        id,
        completed: false,
        lastUpdated: now,
        maxCount,
        count: maxCount ? 0 : undefined,
      }
    })

    return {
      daily: daily as Record<DailyTaskType, TaskProgress>,
      weekly: weekly as Record<WeeklyTaskType, TaskProgress>,
      monthly: monthly as Record<MonthlyTaskType, TaskProgress>,
      lastDailyReset: now,
      lastWeeklyReset: now,
      lastMonthlyReset: now,
      version: CURRENT_VERSION,
    }
  },

  /**
   * Check if resets are needed and apply them
   */
  checkAndResetProgress(progress: UserProgress): UserProgress {
    const now = new Date()
    let needsSave = false

    // Check if daily reset has passed
    const todayResetTime = new Date(now)
    todayResetTime.setUTCHours(DAILY_RESET_HOUR_UTC, 0, 0, 0)

    // If we're past today's reset time and the last reset was before today's reset
    if (now >= todayResetTime && progress.lastDailyReset < todayResetTime.getTime()) {
      Object.values(progress.daily).forEach((task) => {
        task.completed = false
        task.count = task.maxCount ? 0 : undefined
      })
      progress.lastDailyReset = Date.now()
      needsSave = true
    }

    // Check if weekly reset has passed (Tuesday 00:00 UTC)
    const currentWeekTuesday = new Date(now)
    currentWeekTuesday.setUTCHours(DAILY_RESET_HOUR_UTC, 0, 0, 0)
    const currentDay = currentWeekTuesday.getUTCDay()
    const daysToSubtract = currentDay < 2 ? currentDay + 5 : currentDay - 2 // Get to Tuesday
    currentWeekTuesday.setUTCDate(currentWeekTuesday.getUTCDate() - daysToSubtract)

    // If we're past this week's Tuesday reset and last reset was before this Tuesday
    if (now >= currentWeekTuesday && progress.lastWeeklyReset < currentWeekTuesday.getTime()) {
      Object.values(progress.weekly).forEach((task) => {
        task.completed = false
        task.count = task.maxCount ? 0 : undefined
      })
      progress.lastWeeklyReset = Date.now()
      needsSave = true
    }

    // Ensure lastMonthlyReset exists (migration)
    if (!progress.lastMonthlyReset) {
      progress.lastMonthlyReset = Date.now()
      needsSave = true
    }

    // Check if monthly reset has passed (1st of month at 00:00 UTC)
    const currentMonthReset = new Date(now)
    currentMonthReset.setUTCDate(1)
    currentMonthReset.setUTCHours(DAILY_RESET_HOUR_UTC, 0, 0, 0)

    // If we're past this month's reset and last reset was before this month's 1st
    if (now >= currentMonthReset && progress.lastMonthlyReset < currentMonthReset.getTime()) {
      Object.values(progress.monthly || {}).forEach((task) => {
        task.completed = false
        task.count = task.maxCount ? 0 : undefined
      })
      progress.lastMonthlyReset = Date.now()
      needsSave = true
    }

    if (needsSave) {
      this.saveProgress(progress)
    }

    return progress
  },

  /**
   * Calculate next daily reset time (00:00 UTC)
   * Returns the next occurrence of 00:00 UTC from now
   */
  getNextDailyReset(): number {
    const now = new Date()
    const next = new Date(now)

    // Set to next 00:00 UTC
    next.setUTCHours(DAILY_RESET_HOUR_UTC, 0, 0, 0)

    // If we're already past today's reset, move to tomorrow
    if (next.getTime() <= now.getTime()) {
      next.setUTCDate(next.getUTCDate() + 1)
    }

    return next.getTime()
  },

  /**
   * Calculate next weekly reset time (Tuesday 00:00 UTC)
   * Returns the next occurrence of Tuesday 00:00 UTC from now
   */
  getNextWeeklyReset(): number {
    const now = new Date()

    // Start from now and find next Tuesday 00:00 UTC
    const next = new Date(now)
    const currentDay = now.getUTCDay()

    // Calculate days until next Tuesday (2 = Tuesday)
    let daysUntilTuesday = (WEEKLY_RESET_DAY - currentDay + 7) % 7

    // If it's 0, it means we're on Tuesday
    if (daysUntilTuesday === 0) {
      // Check if we're before or after the reset time today
      const todayReset = new Date(now)
      todayReset.setUTCHours(DAILY_RESET_HOUR_UTC, 0, 0, 0)

      if (now < todayReset) {
        // We're on Tuesday but before the reset, use today
        return todayReset.getTime()
      } else {
        // We're on Tuesday after the reset, go to next Tuesday
        daysUntilTuesday = 7
      }
    }

    // Set to the target Tuesday at 00:00 UTC
    next.setUTCDate(next.getUTCDate() + daysUntilTuesday)
    next.setUTCHours(DAILY_RESET_HOUR_UTC, 0, 0, 0)

    return next.getTime()
  },

  /**
   * Calculate next monthly reset time (1st of month 00:00 UTC)
   * Returns the next occurrence of 1st of month 00:00 UTC from now
   */
  getNextMonthlyReset(): number {
    const now = new Date()
    const next = new Date(now)

    // Set to the 1st day of current month at 00:00 UTC
    next.setUTCDate(1)
    next.setUTCHours(DAILY_RESET_HOUR_UTC, 0, 0, 0)

    // If we're already past this month's reset, move to next month
    if (next.getTime() <= now.getTime()) {
      next.setUTCMonth(next.getUTCMonth() + 1)
    }

    return next.getTime()
  },

  /**
   * Format time remaining until timestamp
   */
  formatTimeUntil(timestamp: number): string {
    const diff = timestamp - Date.now()
    if (diff <= 0) return '0h 0m'

    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    return `${hours}h ${minutes}m`
  },

  /**
   * Toggle task completion
   */
  toggleTask(taskId: string, type: 'daily' | 'weekly'): void {
    const progress = this.getProgress()
    if (type === 'daily') {
      const task = progress.daily[taskId as DailyTaskType]
      if (task) {
        task.completed = !task.completed
        task.lastUpdated = Date.now()
        this.saveProgress(progress)
      }
    } else {
      const task = progress.weekly[taskId as WeeklyTaskType]
      if (task) {
        task.completed = !task.completed
        task.lastUpdated = Date.now()
        this.saveProgress(progress)
      }
    }
  },

  /**
   * Update task count (for tasks with counters)
   */
  updateTaskCount(taskId: string, type: 'daily' | 'weekly' | 'monthly', count: number): void {
    const progress = this.getProgress()
    if (type === 'daily') {
      const task = progress.daily[taskId as DailyTaskType]
      if (task && task.maxCount !== undefined) {
        task.count = Math.max(0, Math.min(count, task.maxCount))
        task.completed = task.count >= task.maxCount
        task.lastUpdated = Date.now()
        this.saveProgress(progress)
      }
    } else if (type === 'weekly') {
      const task = progress.weekly[taskId as WeeklyTaskType]
      if (task && task.maxCount !== undefined) {
        task.count = Math.max(0, Math.min(count, task.maxCount))
        task.completed = task.count >= task.maxCount
        task.lastUpdated = Date.now()
        this.saveProgress(progress)
      }
    } else {
      const task = progress.monthly[taskId as MonthlyTaskType]
      if (task && task.maxCount !== undefined) {
        task.count = Math.max(0, Math.min(count, task.maxCount))
        task.completed = task.count >= task.maxCount
        task.lastUpdated = Date.now()
        this.saveProgress(progress)
      }
    }
  },

  /**
   * Increment task count by 1
   */
  incrementTaskCount(taskId: string, type: 'daily' | 'weekly' | 'monthly'): void {
    const progress = this.getProgress()
    if (type === 'daily') {
      const task = progress.daily[taskId as DailyTaskType]
      if (task && task.maxCount !== undefined) {
        const newCount = (task.count ?? 0) + 1
        this.updateTaskCount(taskId, type, newCount)
      }
    } else if (type === 'weekly') {
      const task = progress.weekly[taskId as WeeklyTaskType]
      if (task && task.maxCount !== undefined) {
        const newCount = (task.count ?? 0) + 1
        this.updateTaskCount(taskId, type, newCount)
      }
    } else {
      const task = progress.monthly[taskId as MonthlyTaskType]
      if (task && task.maxCount !== undefined) {
        const newCount = (task.count ?? 0) + 1
        this.updateTaskCount(taskId, type, newCount)
      }
    }
  },

  /**
   * Save progress to localStorage
   */
  saveProgress(progress: UserProgress): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  },

  /**
   * Export progress as JSON string (for backup)
   */
  exportProgress(): string {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem(STORAGE_KEY) || ''
  },

  /**
   * Import progress from JSON string
   */
  importProgress(data: string): boolean {
    try {
      const progress = JSON.parse(data) as UserProgress
      // Basic validation
      if (!progress.daily || !progress.weekly || !progress.version) {
        return false
      }
      this.saveProgress(progress)
      return true
    } catch {
      return false
    }
  },

  /**
   * Reset all progress manually
   */
  resetAll(): void {
    const empty = this.createEmptyProgress()
    this.saveProgress(empty)
  },

  /**
   * Get completion stats
   */
  getStats(progress: UserProgress): {
    dailyCompleted: number
    dailyTotal: number
    weeklyCompleted: number
    weeklyTotal: number
    monthlyCompleted: number
    monthlyTotal: number
    dailyPercent: number
    weeklyPercent: number
    monthlyPercent: number
  } {
    const dailyTasks = Object.values(progress.daily)
    const weeklyTasks = Object.values(progress.weekly)
    const monthlyTasks = Object.values(progress.monthly || {})

    const dailyCompleted = dailyTasks.filter((t) => t.completed).length
    const dailyTotal = dailyTasks.length

    const weeklyCompleted = weeklyTasks.filter((t) => t.completed).length
    const weeklyTotal = weeklyTasks.length

    const monthlyCompleted = monthlyTasks.filter((t) => t.completed).length
    const monthlyTotal = monthlyTasks.length

    return {
      dailyCompleted,
      dailyTotal,
      weeklyCompleted,
      weeklyTotal,
      monthlyCompleted,
      monthlyTotal,
      dailyPercent: dailyTotal > 0 ? Math.round((dailyCompleted / dailyTotal) * 100) : 0,
      weeklyPercent: weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 0,
      monthlyPercent: monthlyTotal > 0 ? Math.round((monthlyCompleted / monthlyTotal) * 100) : 0,
    }
  },
}
