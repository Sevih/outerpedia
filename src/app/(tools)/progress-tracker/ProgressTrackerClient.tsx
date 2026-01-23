'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ProgressTracker } from '@/lib/progressTracker'
import type { UserProgress, TaskProgress, UserSettings } from '@/types/progress'
import { useI18n } from '@/lib/contexts/I18nContext'
import {
  DAILY_TASK_DEFINITIONS,
  WEEKLY_TASK_DEFINITIONS,
  MONTHLY_TASK_DEFINITIONS,
} from '@/lib/taskDefinitions'

export function ProgressTrackerClient() {
  const { t } = useI18n()
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [mounted, setMounted] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [importData, setImportData] = useState('')
  const [importError, setImportError] = useState('')

  // Hydration safety
  useEffect(() => {
    setMounted(true)
    setProgress(ProgressTracker.getProgress())
    setSettings(ProgressTracker.getSettings())
  }, [])

  // Auto-refresh timer every minute to update countdown
  useEffect(() => {
    if (!mounted) return
    const interval = setInterval(() => {
      setProgress(ProgressTracker.getProgress())
    }, 60000) // 1 minute
    return () => clearInterval(interval)
  }, [mounted])

  if (!mounted || !progress) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  const handleIncrement = (taskId: string, type: 'daily' | 'weekly' | 'monthly') => {
    const currentProgress = ProgressTracker.getProgress()
    const task =
      type === 'daily'
        ? currentProgress.daily[taskId]
        : type === 'weekly'
        ? currentProgress.weekly[taskId]
        : currentProgress.monthly[taskId]

    if (!task || task.maxCount === undefined) return

    // If task is completed (count === maxCount), reset to 0
    // Otherwise increment by 1
    if (task.count === task.maxCount) {
      ProgressTracker.updateTaskCount(taskId, type, 0)
    } else {
      ProgressTracker.incrementTaskCount(taskId, type)
    }

    setProgress(ProgressTracker.getProgress())
  }

  const handleToggleCompletion = (taskId: string, type: 'daily' | 'weekly' | 'monthly') => {
    const currentProgress = ProgressTracker.getProgress()
    const task =
      type === 'daily'
        ? currentProgress.daily[taskId]
        : type === 'weekly'
        ? currentProgress.weekly[taskId]
        : currentProgress.monthly[taskId]

    if (!task || task.maxCount === undefined) return

    // Toggle between 0 and maxCount
    if (task.completed) {
      ProgressTracker.updateTaskCount(taskId, type, 0)
    } else {
      ProgressTracker.updateTaskCount(taskId, type, task.maxCount)
    }

    setProgress(ProgressTracker.getProgress())
  }

  const handleExport = () => {
    const data = ProgressTracker.exportProgress()
    navigator.clipboard.writeText(data)
    setShowExportModal(false)
    // Could add a toast notification here
  }

  const handleImport = () => {
    setImportError('')
    const success = ProgressTracker.importProgress(importData)
    if (success) {
      setProgress(ProgressTracker.getProgress())
      setImportData('')
      setShowExportModal(false)
    } else {
      setImportError(t('progress.importError'))
    }
  }

  const handleReset = () => {
    if (confirm(t('progress.resetConfirm'))) {
      ProgressTracker.resetAll()
      setProgress(ProgressTracker.getProgress())
    }
  }

  const handleToggleTaskEnabled = (taskId: string, type: 'daily' | 'weekly' | 'monthly') => {
    ProgressTracker.toggleTaskEnabled(taskId, type)
    setSettings(ProgressTracker.getSettings())
    setProgress(ProgressTracker.getProgress())
  }

  const handleToggleTerminusPack = () => {
    ProgressTracker.toggleTerminusSupportPack()
    setSettings(ProgressTracker.getSettings())
    setProgress(ProgressTracker.getProgress())
  }

  const handleToggleVeronicaPack = () => {
    ProgressTracker.toggleVeronicaPremiumPack()
    setSettings(ProgressTracker.getSettings())
    setProgress(ProgressTracker.getProgress())
  }

  const handleAdventureLicenseChange = (combats: 2 | 3 | 4) => {
    ProgressTracker.setAdventureLicenseCombatsPerStage(combats)
    setSettings(ProgressTracker.getSettings())
    setProgress(ProgressTracker.getProgress())
  }

  const stats = ProgressTracker.getStats(progress)
  const dailyResetTime = ProgressTracker.getNextDailyReset()
  const weeklyResetTime = ProgressTracker.getNextWeeklyReset()
  const monthlyResetTime = ProgressTracker.getNextMonthlyReset()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('tool.progress-tracker.name')}</h1>
        <p className="text-gray-400">{t('tool.progress-tracker.description')}</p>
      </div>

      {/* Stats Overview and Actions */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Stats */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{t('progress.daily')}</h3>
              <span className="text-sm text-gray-400">
                {stats.dailyCompleted}/{stats.dailyTotal}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-blue-500 h-2.5 rounded-full transition-all"
                style={{ width: `${stats.dailyPercent}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-400">
              {t('progress.resetsIn')}: {ProgressTracker.formatTimeUntil(dailyResetTime)}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{t('progress.weekly')}</h3>
              <span className="text-sm text-gray-400">
                {stats.weeklyCompleted}/{stats.weeklyTotal}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-purple-500 h-2.5 rounded-full transition-all"
                style={{ width: `${stats.weeklyPercent}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-400">
              {t('progress.resetsIn')}: {ProgressTracker.formatTimeUntil(weeklyResetTime)}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{t('progress.monthly')}</h3>
              <span className="text-sm text-gray-400">
                {stats.monthlyCompleted}/{stats.monthlyTotal}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-green-500 h-2.5 rounded-full transition-all"
                style={{ width: `${stats.monthlyPercent}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-400">
              {t('progress.resetsIn')}: {ProgressTracker.formatTimeUntil(monthlyResetTime)}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex md:flex-col gap-3 justify-center md:justify-start">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="group relative flex flex-col items-center"
          >
            <div className="relative w-10 h-10 transition-transform group-hover:scale-110">
              <Image
                src="/images/ui/nav/CM_Agit_Facility.webp"
                alt={t('progress.settings')}
                fill
                sizes="40px"
                className="object-contain"
              />
            </div>
            <span className="text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {t('progress.settings')}
            </span>
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="group relative flex flex-col items-center"
          >
            <div className="relative w-10 h-10 transition-transform group-hover:scale-110">
              <Image
                src="/images/ui/nav/CM_Agit_Retention.webp"
                alt={t('progress.exportImport')}
                fill
                sizes="40px"
                className="object-contain"
              />
            </div>
            <span className="text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {t('progress.exportImport')}
            </span>
          </button>
          <button
            onClick={handleReset}
            className="group relative flex flex-col items-center"
          >
            <div className="relative w-10 h-10 transition-transform group-hover:scale-110">
              <Image
                src="/images/ui/nav/CM_Guild_Management.webp"
                alt={t('progress.resetAll')}
                fill
                sizes="40px"
                className="object-contain"
              />
            </div>
            <span className="text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {t('progress.resetAll')}
            </span>
          </button>
        </div>
      </div>

      {/* Daily Tasks */}
      <section>
        <h2 className="text-2xl font-bold mb-4">{t('progress.dailyTasks')}</h2>
        {Object.keys(progress.daily).length === 0 ? (
          <div className="text-center text-gray-400 py-8">{t('progress.noTasks')}</div>
        ) : (
          <div className="space-y-2">
            {Object.entries(progress.daily).map(([key, task]) => (
              <TaskItem
                key={key}
                task={task}
                labelKey={`progress.task.${key}`}
                onRowClick={() => handleIncrement(key, 'daily')}
                onCheckboxChange={() => handleToggleCompletion(key, 'daily')}
                t={t}
              />
            ))}
          </div>
        )}
      </section>

      {/* Weekly Tasks */}
      <section>
        <h2 className="text-2xl font-bold mb-4">{t('progress.weeklyTasks')}</h2>
        {Object.keys(progress.weekly).length === 0 ? (
          <div className="text-center text-gray-400 py-8">{t('progress.noTasks')}</div>
        ) : (
          <div className="space-y-2">
            {Object.entries(progress.weekly).map(([key, task]) => (
              <TaskItem
                key={key}
                task={task}
                labelKey={`progress.task.${key}`}
                onRowClick={() => handleIncrement(key, 'weekly')}
                onCheckboxChange={() => handleToggleCompletion(key, 'weekly')}
                t={t}
              />
            ))}
          </div>
        )}
      </section>

      {/* Monthly Tasks */}
      <section>
        <h2 className="text-2xl font-bold mb-4">{t('progress.monthlyTasks')}</h2>
        {Object.keys(progress.monthly || {}).length === 0 ? (
          <div className="text-center text-gray-400 py-8">{t('progress.noTasks')}</div>
        ) : (
          <div className="space-y-2">
            {Object.entries(progress.monthly).map(([key, task]) => (
              <TaskItem
                key={key}
                task={task}
                labelKey={`progress.task.${key}`}
                onRowClick={() => handleIncrement(key, 'monthly')}
                onCheckboxChange={() => handleToggleCompletion(key, 'monthly')}
                t={t}
              />
            ))}
          </div>
        )}
      </section>

      {/* Export/Import Modal */}
      {showExportModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowExportModal(false)
            setImportData('')
            setImportError('')
          }}
        >
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">{t('progress.exportImport')}</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('progress.export')}</label>
                <button
                  onClick={handleExport}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition"
                >
                  {t('progress.copyToClipboard')}
                </button>
                <p className="text-xs text-gray-400 mt-1">{t('progress.exportDesc')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('progress.import')}</label>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  className="w-full bg-gray-700 rounded px-3 py-2 text-sm font-mono h-32"
                  placeholder={t('progress.pasteHere')}
                />
                {importError && <p className="text-red-400 text-sm mt-1">{importError}</p>}
                <button
                  onClick={handleImport}
                  disabled={!importData.trim()}
                  className="w-full mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition"
                >
                  {t('progress.importButton')}
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setShowExportModal(false)
                setImportData('')
                setImportError('')
              }}
              className="w-full mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition"
            >
              {t('progress.close')}
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && settings && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSettingsModal(false)}
        >
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-6">{t('progress.settingsTitle')}</h3>

            {/* Game Configuration Section */}
            <div className="mb-6">
              <h4 className="text-base font-semibold mb-4 text-cyan-400">{t('progress.gameConfiguration')}</h4>
              <div className="space-y-3">

              {/* Terminus Support Pack Toggle */}
              <div className="p-4 bg-gray-700 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.hasTerminusSupportPack}
                    onChange={handleToggleTerminusPack}
                    className="w-5 h-5 rounded border-gray-600 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="font-medium">{t('progress.terminusSupportPack')}</span>
                    <p className="text-sm text-gray-400 mt-1">
                      {t('progress.terminusSupportPackDesc')}
                    </p>
                  </div>
                </label>
              </div>

              {/* Veronica Premium Pack Toggle */}
              <div className="p-4 bg-gray-700 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.hasVeronicaPremiumPack}
                    onChange={handleToggleVeronicaPack}
                    className="w-5 h-5 rounded border-gray-600 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="font-medium">{t('progress.veronicaPremiumPack')}</span>
                    <p className="text-sm text-gray-400 mt-1">
                      {t('progress.veronicaPremiumPackDesc')}
                    </p>
                  </div>
                </label>
              </div>

              {/* Adventure License Section */}
              <div className="p-4 bg-gray-700 rounded-lg">
                <div className="mb-3">
                  <span className="font-medium">{t('progress.adventureLicense')}</span>
                  <p className="text-sm text-gray-400 mt-1">
                    {t('progress.adventureLicenseDesc')}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="adventureLicense"
                      checked={settings.adventureLicenseCombatsPerStage === 2}
                      onChange={() => handleAdventureLicenseChange(2)}
                      className="w-4 h-4 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm">{t('progress.adventureLicenseCombats2')}</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="adventureLicense"
                      checked={settings.adventureLicenseCombatsPerStage === 3}
                      onChange={() => handleAdventureLicenseChange(3)}
                      className="w-4 h-4 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm">{t('progress.adventureLicenseCombats3')}</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="adventureLicense"
                      checked={settings.adventureLicenseCombatsPerStage === 4}
                      onChange={() => handleAdventureLicenseChange(4)}
                      className="w-4 h-4 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm">{t('progress.adventureLicenseCombats4')}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Optional Tasks Section */}
            {(Object.values(DAILY_TASK_DEFINITIONS).filter((def) => !def.permanent).length > 0 ||
              Object.values(WEEKLY_TASK_DEFINITIONS).filter((def) => !def.permanent).length > 0 ||
              Object.values(MONTHLY_TASK_DEFINITIONS).filter((def) => !def.permanent).length > 0) && (
              <div className="mb-6">
                <h4 className="text-base font-semibold mb-4 text-cyan-400">{t('progress.optionalTasks')}</h4>
                <p className="text-sm text-gray-400 mb-4">{t('progress.optionalTasksDesc')}</p>

                {/* Daily Optional */}
                {Object.values(DAILY_TASK_DEFINITIONS).filter((def) => !def.permanent).length >
                  0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">{t('progress.dailyTasks')}</p>
                    <div className="space-y-2">
                      {Object.values(DAILY_TASK_DEFINITIONS)
                        .filter((def) => !def.permanent)
                        .map((def) => (
                          <label
                            key={def.id}
                            className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-650 transition"
                          >
                            <input
                              type="checkbox"
                              checked={settings.enabledTasks.daily.includes(def.id)}
                              onChange={() => handleToggleTaskEnabled(def.id, 'daily')}
                              className="w-5 h-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                            />
                            <span className="flex-1">{t(def.labelKey)}</span>
                          </label>
                        ))}
                    </div>
                  </div>
                )}

                {/* Weekly Optional */}
                {Object.values(WEEKLY_TASK_DEFINITIONS).filter((def) => !def.permanent).length >
                  0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">{t('progress.weeklyTasks')}</p>
                    <div className="space-y-2">
                      {Object.values(WEEKLY_TASK_DEFINITIONS)
                        .filter((def) => !def.permanent)
                        .map((def) => (
                          <label
                            key={def.id}
                            className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-650 transition"
                          >
                            <input
                              type="checkbox"
                              checked={settings.enabledTasks.weekly.includes(def.id)}
                              onChange={() => handleToggleTaskEnabled(def.id, 'weekly')}
                              className="w-5 h-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                            />
                            <span className="flex-1">{t(def.labelKey)}</span>
                          </label>
                        ))}
                    </div>
                  </div>
                )}

                {/* Monthly Optional */}
                {Object.values(MONTHLY_TASK_DEFINITIONS).filter((def) => !def.permanent).length >
                  0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">{t('progress.monthlyTasks')}</p>
                    <div className="space-y-2">
                      {Object.values(MONTHLY_TASK_DEFINITIONS)
                        .filter((def) => !def.permanent)
                        .map((def) => (
                          <label
                            key={def.id}
                            className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-650 transition"
                          >
                            <input
                              type="checkbox"
                              checked={settings.enabledTasks.monthly.includes(def.id)}
                              onChange={() => handleToggleTaskEnabled(def.id, 'monthly')}
                              className="w-5 h-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                            />
                            <span className="flex-1">{t(def.labelKey)}</span>
                          </label>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setShowSettingsModal(false)}
              className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition"
            >
              {t('progress.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function TaskItem({
  task,
  labelKey,
  onRowClick,
  onCheckboxChange,
  t,
}: {
  task: TaskProgress
  labelKey: string
  onRowClick: () => void
  onCheckboxChange: () => void
  t: (key: string) => string
}) {
  return (
    <div
      className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition group"
      onClick={onRowClick}
    >
      <input
        type="checkbox"
        checked={task.completed}
        onChange={(e) => {
          e.stopPropagation()
          onCheckboxChange()
        }}
        onClick={(e) => e.stopPropagation()}
        className="w-5 h-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
      />
      <span
        className={`flex-1 ${
          task.completed ? 'line-through text-gray-500' : 'text-gray-100'
        } group-hover:text-white transition`}
      >
        {t(labelKey)}
      </span>
      {task.maxCount !== undefined && (
        <span className="text-sm text-gray-400">
          {task.count ?? 0}/{task.maxCount}
        </span>
      )}
    </div>
  )
}
