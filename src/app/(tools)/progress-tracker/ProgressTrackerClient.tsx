'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { ProgressTracker } from '@/lib/progressTracker'
import type { UserProgress, TaskProgress, UserSettings, TaskDefinition, TaskCategory, PreciseCraftProgress } from '@/types/progress'
import { useI18n } from '@/lib/contexts/I18nContext'
import {
  DAILY_TASK_DEFINITIONS,
  WEEKLY_TASK_DEFINITIONS,
  MONTHLY_TASK_DEFINITIONS,
} from '@/lib/taskDefinitions'
import ItemInlineDisplay from '@/app/components/ItemInline'

type TabType = 'daily' | 'weekly' | 'monthly'
type SettingsTabType = 'display' | 'game' | 'content' | 'craft' | 'shop'

export function ProgressTrackerClient() {
  const { t } = useI18n()
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [mounted, setMounted] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [importData, setImportData] = useState('')
  const [importError, setImportError] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('daily')
  const [settingsTab, setSettingsTab] = useState<SettingsTabType>('display')
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null)
  const lastClickTime = useRef<number>(0)

  // Debounce helper to prevent double-clicks
  const debounceClick = (callback: () => void) => {
    const now = Date.now()
    if (now - lastClickTime.current < 200) return
    lastClickTime.current = now
    callback()
  }

  // Hydration safety
  useEffect(() => {
    setMounted(true)
    setProgress(ProgressTracker.getProgress())
    setSettings(ProgressTracker.getSettings())
    setPortalElement(document.getElementById('portal-root'))
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
    debounceClick(() => {
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
    })
  }

  const handleToggleCompletion = (taskId: string, type: 'daily' | 'weekly' | 'monthly') => {
    debounceClick(() => {
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
    })
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

  const handleToggleElementalTowerCompletion = () => {
    ProgressTracker.toggleElementalTowerCompletion()
    setSettings(ProgressTracker.getSettings())
    setProgress(ProgressTracker.getProgress())
  }

  const handleSetDisplayMode = (mode: 'tabs' | 'single-page') => {
    ProgressTracker.setDisplayMode(mode)
    setSettings(ProgressTracker.getSettings())
  }

  const handleSweepAll = () => {
    ProgressTracker.toggleAllSweepContent()
    setProgress(ProgressTracker.getProgress())
  }

  const handleToggleAllShop = (type: 'daily' | 'weekly' | 'monthly') => {
    ProgressTracker.toggleAllShopPurchases(type)
    setProgress(ProgressTracker.getProgress())
  }

  const handleToggleAllCraft = (type: 'daily' | 'weekly' | 'monthly') => {
    ProgressTracker.toggleAllCraftItems(type)
    setProgress(ProgressTracker.getProgress())
  }

  const handleTogglePreciseCraft = () => {
    ProgressTracker.togglePreciseCraft()
    setProgress(ProgressTracker.getProgress())
  }

  const handleSetPreciseCraftTimer = (daysRemaining: number) => {
    ProgressTracker.setPreciseCraftTimer(daysRemaining)
    setProgress(ProgressTracker.getProgress())
  }

  const stats = ProgressTracker.getStats(progress)
  const dailyResetTime = ProgressTracker.getNextDailyReset()
  const weeklyResetTime = ProgressTracker.getNextWeeklyReset()
  const monthlyResetTime = ProgressTracker.getNextMonthlyReset()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">{t('tool.progress-tracker.name')}</h1>
        <p className="text-gray-400">{t('tool.progress-tracker.description')}</p>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setShowSettingsModal(true)}
          className="group flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition"
        >
          <div className="relative w-8 h-8 transition-transform group-hover:scale-110">
            <Image
              src="/images/ui/nav/CM_Agit_Facility.webp"
              alt={t('progress.settings')}
              fill
              sizes="32px"
              className="object-contain"
            />
          </div>
          <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">
            {t('progress.settings')}
          </span>
        </button>
        <button
          onClick={() => setShowExportModal(true)}
          className="group flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition"
        >
          <div className="relative w-8 h-8 transition-transform group-hover:scale-110">
            <Image
              src="/images/ui/nav/CM_Agit_Retention.webp"
              alt={t('progress.exportImport')}
              fill
              sizes="32px"
              className="object-contain"
            />
          </div>
          <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">
            {t('progress.exportImport')}
          </span>
        </button>
        <button
          onClick={handleReset}
          className="group flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition"
        >
          <div className="relative w-8 h-8 transition-transform group-hover:scale-110">
            <Image
              src="/images/ui/nav/CM_Guild_Management.webp"
              alt={t('progress.resetAll')}
              fill
              sizes="32px"
              className="object-contain"
            />
          </div>
          <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">
            {t('progress.resetAll')}
          </span>
        </button>
      </div>

      {/* Tab Cards - clickable in tabs mode, static summary in single-page mode */}
      {settings?.displayMode === 'tabs' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TabCard
            label={t('progress.daily')}
            completed={stats.dailyCompleted}
            total={stats.dailyTotal}
            percent={stats.dailyPercent}
            resetTime={ProgressTracker.formatTimeUntil(dailyResetTime)}
            resetLabel={t('progress.resetsIn')}
            isActive={activeTab === 'daily'}
            onClick={() => setActiveTab('daily')}
          />
          <TabCard
            label={t('progress.weekly')}
            completed={stats.weeklyCompleted}
            total={stats.weeklyTotal}
            percent={stats.weeklyPercent}
            resetTime={ProgressTracker.formatTimeUntil(weeklyResetTime)}
            resetLabel={t('progress.resetsIn')}
            isActive={activeTab === 'weekly'}
            onClick={() => setActiveTab('weekly')}
          />
          <TabCard
            label={t('progress.monthly')}
            completed={stats.monthlyCompleted}
            total={stats.monthlyTotal}
            percent={stats.monthlyPercent}
            resetTime={ProgressTracker.formatTimeUntil(monthlyResetTime)}
            resetLabel={t('progress.resetsIn')}
            isActive={activeTab === 'monthly'}
            onClick={() => setActiveTab('monthly')}
          />
        </div>
      ) : (
        /* Single-page mode: summary bar */
        <div className="flex flex-wrap gap-4 p-4 bg-gray-800/50 rounded-lg">
          <SummaryBadge
            label={t('progress.daily')}
            completed={stats.dailyCompleted}
            total={stats.dailyTotal}
            percent={stats.dailyPercent}
            resetTime={ProgressTracker.formatTimeUntil(dailyResetTime)}
          />
          <SummaryBadge
            label={t('progress.weekly')}
            completed={stats.weeklyCompleted}
            total={stats.weeklyTotal}
            percent={stats.weeklyPercent}
            resetTime={ProgressTracker.formatTimeUntil(weeklyResetTime)}
          />
          <SummaryBadge
            label={t('progress.monthly')}
            completed={stats.monthlyCompleted}
            total={stats.monthlyTotal}
            percent={stats.monthlyPercent}
            resetTime={ProgressTracker.formatTimeUntil(monthlyResetTime)}
          />
        </div>
      )}

      {/* Task List */}
      <section className="space-y-8">
        {/* Tabs mode: show only active tab */}
        {settings?.displayMode === 'tabs' ? (
          <>
            {activeTab === 'daily' && (
              <TaskListByCategory
                progress={progress.daily}
                definitions={DAILY_TASK_DEFINITIONS}
                type="daily"
                onIncrement={handleIncrement}
                onToggle={handleToggleCompletion}
                onSweepAll={handleSweepAll}
                onToggleAllShop={handleToggleAllShop}
                onToggleAllCraft={handleToggleAllCraft}
                t={t}
              />
            )}
            {activeTab === 'weekly' && (
              <TaskListByCategory
                progress={progress.weekly}
                definitions={WEEKLY_TASK_DEFINITIONS}
                type="weekly"
                onIncrement={handleIncrement}
                onToggle={handleToggleCompletion}
                onToggleAllShop={handleToggleAllShop}
                onToggleAllCraft={handleToggleAllCraft}
                t={t}
              />
            )}
            {activeTab === 'monthly' && (
              <>
                <TaskListByCategory
                  progress={progress.monthly || {}}
                  definitions={MONTHLY_TASK_DEFINITIONS}
                  type="monthly"
                  onIncrement={handleIncrement}
                  onToggle={handleToggleCompletion}
                  onToggleAllShop={handleToggleAllShop}
                  onToggleAllCraft={handleToggleAllCraft}
                  t={t}
                />
                <PreciseCraftSection
                  preciseCraft={progress.preciseCraft}
                  onToggle={handleTogglePreciseCraft}
                  t={t}
                />
              </>
            )}
          </>
        ) : (
          /* Single-page mode: show all sections */
          <>
            {/* Daily Section */}
            <div>
              <SectionHeader
                label={t('progress.daily')}
                completed={stats.dailyCompleted}
                total={stats.dailyTotal}
                resetTime={ProgressTracker.formatTimeUntil(dailyResetTime)}
                resetLabel={t('progress.resetsIn')}
              />
              <TaskListByCategory
                progress={progress.daily}
                definitions={DAILY_TASK_DEFINITIONS}
                type="daily"
                onIncrement={handleIncrement}
                onToggle={handleToggleCompletion}
                onSweepAll={handleSweepAll}
                onToggleAllShop={handleToggleAllShop}
                onToggleAllCraft={handleToggleAllCraft}
                t={t}
              />
            </div>

            {/* Weekly Section */}
            <div>
              <SectionHeader
                label={t('progress.weekly')}
                completed={stats.weeklyCompleted}
                total={stats.weeklyTotal}
                resetTime={ProgressTracker.formatTimeUntil(weeklyResetTime)}
                resetLabel={t('progress.resetsIn')}
              />
              <TaskListByCategory
                progress={progress.weekly}
                definitions={WEEKLY_TASK_DEFINITIONS}
                type="weekly"
                onIncrement={handleIncrement}
                onToggle={handleToggleCompletion}
                onToggleAllShop={handleToggleAllShop}
                onToggleAllCraft={handleToggleAllCraft}
                t={t}
              />
            </div>

            {/* Monthly Section */}
            <div>
              <SectionHeader
                label={t('progress.monthly')}
                completed={stats.monthlyCompleted}
                total={stats.monthlyTotal}
                resetTime={ProgressTracker.formatTimeUntil(monthlyResetTime)}
                resetLabel={t('progress.resetsIn')}
              />
              <TaskListByCategory
                progress={progress.monthly || {}}
                definitions={MONTHLY_TASK_DEFINITIONS}
                type="monthly"
                onIncrement={handleIncrement}
                onToggle={handleToggleCompletion}
                onToggleAllShop={handleToggleAllShop}
                onToggleAllCraft={handleToggleAllCraft}
                t={t}
              />
              <PreciseCraftSection
                preciseCraft={progress.preciseCraft}
                onToggle={handleTogglePreciseCraft}
                t={t}
              />
            </div>
          </>
        )}
      </section>

      {/* Export/Import Modal */}
      {showExportModal && portalElement && createPortal(
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
          style={{ zIndex: 99999 }}
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
        </div>,
        portalElement
      )}

      {/* Settings Modal */}
      {showSettingsModal && settings && portalElement && createPortal(
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
          style={{ zIndex: 99999 }}
          onClick={() => setShowSettingsModal(false)}
        >
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">{t('progress.settingsTitle')}</h3>

            {/* Settings Tabs */}
            <div className="flex gap-0.5 md:gap-2 mb-6 border-b border-gray-700 pb-2">
              {(['display', 'game', 'content', 'craft', 'shop'] as SettingsTabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSettingsTab(tab)}
                  className={`px-2 md:px-4 py-1.5 md:py-2 rounded-t text-xs md:text-sm font-medium transition ${
                    settingsTab === tab
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {t(`progress.settings.tab.${tab}`)}
                </button>
              ))}
            </div>

            {/* Display Tab */}
            {settingsTab === 'display' && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-700 rounded-lg">
                  <div className="mb-3">
                    <span className="font-medium">{t('progress.displayMode')}</span>
                    <p className="text-sm text-gray-400 mt-1">{t('progress.displayModeDesc')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSetDisplayMode('tabs')}
                      className={`flex-1 px-4 py-2 rounded transition ${
                        settings.displayMode === 'tabs'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      {t('progress.displayModeTabs')}
                    </button>
                    <button
                      onClick={() => handleSetDisplayMode('single-page')}
                      className={`flex-1 px-4 py-2 rounded transition ${
                        settings.displayMode === 'single-page'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      {t('progress.displayModeSinglePage')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Game Tab */}
            {settingsTab === 'game' && (
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
                      <p className="text-sm text-gray-400 mt-1">{t('progress.terminusSupportPackDesc')}</p>
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
                      <p className="text-sm text-gray-400 mt-1">{t('progress.veronicaPremiumPackDesc')}</p>
                    </div>
                  </label>
                </div>

                {/* Adventure License Section */}
                <div className="p-4 bg-gray-700 rounded-lg">
                  <div className="mb-3">
                    <span className="font-medium">{t('progress.adventureLicense')}</span>
                    <p className="text-sm text-gray-400 mt-1">{t('progress.adventureLicenseDesc')}</p>
                  </div>
                  <div className="space-y-2">
                    {([2, 3, 4] as const).map((n) => (
                      <label key={n} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="adventureLicense"
                          checked={settings.adventureLicenseCombatsPerStage === n}
                          onChange={() => handleAdventureLicenseChange(n)}
                          className="w-4 h-4 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="text-sm">{t(`progress.adventureLicenseCombats${n}`)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Elemental Tower Completion Toggle */}
                <div className="p-4 bg-gray-700 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.hasCompletedElementalTower}
                      onChange={handleToggleElementalTowerCompletion}
                      className="w-5 h-5 rounded border-gray-600 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="font-medium">{t('progress.elementalTowerCompleted')}</span>
                      <p className="text-sm text-gray-400 mt-1">{t('progress.elementalTowerCompletedDesc')}</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Content Tab - Optional non-shop tasks */}
            {settingsTab === 'content' && (
              <div className="space-y-6">
                <p className="text-sm text-gray-400">{t('progress.optionalContentDesc')}</p>

                {/* Daily Optional Content */}
                {Object.values(DAILY_TASK_DEFINITIONS).filter((def) => !def.permanent && def.category !== 'shop').length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 text-cyan-400">{t('progress.dailyTasks')}</p>
                    <div className="space-y-1">
                      {Object.values(DAILY_TASK_DEFINITIONS)
                        .filter((def) => !def.permanent && def.category !== 'shop')
                        .map((def) => (
                          <label key={def.id} className="flex items-center gap-3 p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-650 transition">
                            <input
                              type="checkbox"
                              checked={settings.enabledTasks.daily.includes(def.id)}
                              onChange={() => handleToggleTaskEnabled(def.id, 'daily')}
                              className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                            />
                            <span className="flex-1 text-sm">{t(def.labelKey)}</span>
                          </label>
                        ))}
                    </div>
                  </div>
                )}

                {/* Monthly Optional Content */}
                {Object.values(MONTHLY_TASK_DEFINITIONS).filter((def) => !def.permanent && def.category !== 'shop').length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 text-cyan-400">{t('progress.monthlyTasks')}</p>
                    <div className="space-y-1">
                      {Object.values(MONTHLY_TASK_DEFINITIONS)
                        .filter((def) => !def.permanent && def.category !== 'shop')
                        .map((def) => (
                          <label key={def.id} className="flex items-center gap-3 p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-650 transition">
                            <input
                              type="checkbox"
                              checked={settings.enabledTasks.monthly.includes(def.id)}
                              onChange={() => handleToggleTaskEnabled(def.id, 'monthly')}
                              className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                            />
                            <span className="flex-1 text-sm">{t(def.labelKey)}</span>
                          </label>
                        ))}
                    </div>
                  </div>
                )}

                {/* Danger Zone */}
                <div className="p-4 border border-red-500/30 rounded-lg">
                  <h4 className="text-base font-semibold mb-2 text-red-400">{t('progress.dangerZone')}</h4>
                  <p className="text-sm text-gray-400 mb-3">{t('progress.clearDataDesc')}</p>
                  <button
                    onClick={() => {
                      if (window.confirm(t('progress.clearDataConfirm'))) {
                        localStorage.clear()
                        window.location.reload()
                      }
                    }}
                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition"
                  >
                    {t('progress.clearData')}
                  </button>
                </div>
              </div>
            )}

            {/* Craft Tab - All craft items toggleable */}
            {settingsTab === 'craft' && (
              <div className="space-y-6">
                <p className="text-sm text-gray-400">{t('progress.craftSettingsDesc')}</p>

                {/* Precise Craft Timer Setting */}
                <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                  <p className="text-sm font-medium mb-3 text-purple-400">{t('progress.preciseCraft')}</p>
                  <p className="text-xs text-gray-400 mb-3">{t('progress.preciseCraftTimerDesc')}</p>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      defaultValue={
                        progress.preciseCraft.completedAt
                          ? Math.max(0, Math.ceil((progress.preciseCraft.completedAt + 30 * 24 * 60 * 60 * 1000 - Date.now()) / (24 * 60 * 60 * 1000)))
                          : 0
                      }
                      onChange={(e) => {
                        const days = parseInt(e.target.value, 10)
                        if (!isNaN(days) && days >= 0 && days <= 30) {
                          handleSetPreciseCraftTimer(days)
                        }
                      }}
                      className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-center text-white focus:border-purple-500 focus:outline-none"
                    />
                    <span className="text-sm text-gray-400">{t('progress.daysRemaining')}</span>
                  </div>
                </div>

                {/* Weekly Craft Items */}
                {Object.values(WEEKLY_TASK_DEFINITIONS).filter((def) => def.category === 'craft').length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 text-orange-400">{t('progress.weeklyTasks')}</p>
                    <div className="space-y-1">
                      {Object.values(WEEKLY_TASK_DEFINITIONS)
                        .filter((def) => def.category === 'craft')
                        .map((def) => (
                          <label key={def.id} className="flex items-center gap-3 p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-650 transition">
                            <input
                              type="checkbox"
                              checked={settings.enabledTasks.weekly.includes(def.id)}
                              onChange={() => handleToggleTaskEnabled(def.id, 'weekly')}
                              className="w-4 h-4 rounded border-gray-600 text-orange-500 focus:ring-orange-500 focus:ring-offset-0 cursor-pointer"
                            />
                            <span className="flex-1 flex items-center justify-between gap-2 text-sm">
                              {def.shopItemKey ? (
                                <span className="inline-flex items-center gap-1">
                                  {def.shopItemQuantity && <span className="text-gray-300">{def.shopItemQuantity} x</span>}
                                  <ItemInlineDisplay names={def.shopItemKey} size={16} />
                                </span>
                              ) : (
                                <span>{t(def.labelKey)}</span>
                              )}
                              {def.shopCategory && <span className="text-xs text-gray-500">{t(def.shopCategory)}</span>}
                            </span>
                          </label>
                        ))}
                    </div>
                  </div>
                )}

                {/* Monthly Craft Items */}
                {Object.values(MONTHLY_TASK_DEFINITIONS).filter((def) => def.category === 'craft').length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 text-orange-400">{t('progress.monthlyTasks')}</p>
                    <div className="space-y-1">
                      {Object.values(MONTHLY_TASK_DEFINITIONS)
                        .filter((def) => def.category === 'craft')
                        .map((def) => (
                          <label key={def.id} className="flex items-center gap-3 p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-650 transition">
                            <input
                              type="checkbox"
                              checked={settings.enabledTasks.monthly.includes(def.id)}
                              onChange={() => handleToggleTaskEnabled(def.id, 'monthly')}
                              className="w-4 h-4 rounded border-gray-600 text-orange-500 focus:ring-orange-500 focus:ring-offset-0 cursor-pointer"
                            />
                            <span className="flex-1 flex items-center justify-between gap-2 text-sm">
                              {def.shopItemKey ? (
                                <span className="inline-flex items-center gap-1">
                                  {def.shopItemQuantity && <span className="text-gray-300">{def.shopItemQuantity} x</span>}
                                  <ItemInlineDisplay names={def.shopItemKey} size={16} />
                                </span>
                              ) : (
                                <span>{t(def.labelKey)}</span>
                              )}
                              {def.shopCategory && <span className="text-xs text-gray-500">{t(def.shopCategory)}</span>}
                            </span>
                          </label>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Shop Tab - All shop items toggleable */}
            {settingsTab === 'shop' && (
              <div className="space-y-6">
                <p className="text-sm text-gray-400">{t('progress.shopSettingsDesc')}</p>

                {/* Daily Shop Items */}
                {Object.values(DAILY_TASK_DEFINITIONS).filter((def) => def.category === 'shop').length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 text-yellow-400">{t('progress.dailyTasks')}</p>
                    <div className="space-y-1">
                      {Object.values(DAILY_TASK_DEFINITIONS)
                        .filter((def) => def.category === 'shop')
                        .map((def) => (
                          <label key={def.id} className="flex items-center gap-3 p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-650 transition">
                            <input
                              type="checkbox"
                              checked={settings.enabledTasks.daily.includes(def.id)}
                              onChange={() => handleToggleTaskEnabled(def.id, 'daily')}
                              className="w-4 h-4 rounded border-gray-600 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-0 cursor-pointer"
                            />
                            <span className="flex-1 flex items-center justify-between gap-2 text-sm">
                              {def.shopItemKey ? (
                                <span className="inline-flex items-center gap-1">
                                  {def.shopItemQuantity && <span className="text-gray-300">{def.shopItemQuantity} x</span>}
                                  <ItemInlineDisplay names={def.shopItemKey} size={16} />
                                </span>
                              ) : (
                                <span>{t(def.labelKey)}</span>
                              )}
                              {def.shopSubcategory && <span className="text-xs text-gray-500">{t(def.shopSubcategory)}</span>}
                            </span>
                          </label>
                        ))}
                    </div>
                  </div>
                )}

                {/* Weekly Shop Items */}
                {Object.values(WEEKLY_TASK_DEFINITIONS).filter((def) => def.category === 'shop').length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 text-yellow-400">{t('progress.weeklyTasks')}</p>
                    <div className="space-y-1">
                      {Object.values(WEEKLY_TASK_DEFINITIONS)
                        .filter((def) => def.category === 'shop')
                        .map((def) => (
                          <label key={def.id} className="flex items-center gap-3 p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-650 transition">
                            <input
                              type="checkbox"
                              checked={settings.enabledTasks.weekly.includes(def.id)}
                              onChange={() => handleToggleTaskEnabled(def.id, 'weekly')}
                              className="w-4 h-4 rounded border-gray-600 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-0 cursor-pointer"
                            />
                            <span className="flex-1 flex items-center justify-between gap-2 text-sm">
                              {def.shopItemKey ? (
                                <span className="inline-flex items-center gap-1">
                                  {def.shopItemQuantity && <span className="text-gray-300">{def.shopItemQuantity} x</span>}
                                  <ItemInlineDisplay names={def.shopItemKey} size={16} />
                                </span>
                              ) : (
                                <span>{t(def.labelKey)}</span>
                              )}
                              {def.shopSubcategory && <span className="text-xs text-gray-500">{t(def.shopSubcategory)}</span>}
                            </span>
                          </label>
                        ))}
                    </div>
                  </div>
                )}

                {/* Monthly Shop Items */}
                {Object.values(MONTHLY_TASK_DEFINITIONS).filter((def) => def.category === 'shop').length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 text-yellow-400">{t('progress.monthlyTasks')}</p>
                    <div className="space-y-1">
                      {Object.values(MONTHLY_TASK_DEFINITIONS)
                        .filter((def) => def.category === 'shop')
                        .map((def) => (
                          <label key={def.id} className="flex items-center gap-3 p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-650 transition">
                            <input
                              type="checkbox"
                              checked={settings.enabledTasks.monthly.includes(def.id)}
                              onChange={() => handleToggleTaskEnabled(def.id, 'monthly')}
                              className="w-4 h-4 rounded border-gray-600 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-0 cursor-pointer"
                            />
                            <span className="flex-1 flex items-center justify-between gap-2 text-sm">
                              {def.shopItemKey ? (
                                <span className="inline-flex items-center gap-1">
                                  {def.shopItemQuantity && <span className="text-gray-300">{def.shopItemQuantity} x</span>}
                                  <ItemInlineDisplay names={def.shopItemKey} size={16} />
                                </span>
                              ) : (
                                <span>{t(def.labelKey)}</span>
                              )}
                              {def.shopSubcategory && <span className="text-xs text-gray-500">{t(def.shopSubcategory)}</span>}
                            </span>
                          </label>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setShowSettingsModal(false)}
              className="w-full mt-6 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition"
            >
              {t('progress.close')}
            </button>
          </div>
        </div>,
        portalElement
      )}
    </div>
  )
}

function getProgressColor(percent: number): { bar: string; border: string; glow: string } {
  if (percent >= 100) {
    return { bar: 'bg-green-500', border: 'border-green-500', glow: 'shadow-green-500/20' }
  } else if (percent >= 75) {
    return { bar: 'bg-lime-500', border: 'border-lime-500', glow: 'shadow-lime-500/20' }
  } else if (percent >= 50) {
    return { bar: 'bg-yellow-500', border: 'border-yellow-500', glow: 'shadow-yellow-500/20' }
  } else if (percent >= 25) {
    return { bar: 'bg-orange-500', border: 'border-orange-500', glow: 'shadow-orange-500/20' }
  } else {
    return { bar: 'bg-red-500', border: 'border-red-500', glow: 'shadow-red-500/20' }
  }
}

function TabCard({
  label,
  completed,
  total,
  percent,
  resetTime,
  resetLabel,
  isActive,
  onClick,
}: {
  label: string
  completed: number
  total: number
  percent: number
  resetTime: string
  resetLabel: string
  isActive: boolean
  onClick: () => void
}) {
  const colors = getProgressColor(percent)

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg transition-all select-none ${
        isActive
          ? `bg-gray-800 border-2 ${colors.border} shadow-lg ${colors.glow}`
          : 'bg-gray-800/50 border-2 border-transparent hover:bg-gray-800 hover:border-gray-700'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`font-semibold ${isActive ? 'text-white' : 'text-gray-300'}`}>
          {label}
        </span>
        <span className={`text-sm ${isActive ? 'text-gray-200' : 'text-gray-400'}`}>
          {completed}/{total}
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
        <div
          className={`${colors.bar} h-2 rounded-full transition-all`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className={`text-xs ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>
        {resetLabel}: {resetTime}
      </div>
    </button>
  )
}

// Type for shop hierarchy structure
interface ShopHierarchy {
  [category: string]: {
    [subcategory: string]: {
      [tab: string]: [string, TaskProgress][] // tab can be '_none' for direct items
    }
  }
}

function TaskListByCategory({
  progress,
  definitions,
  type,
  onIncrement,
  onToggle,
  onSweepAll,
  onToggleAllShop,
  onToggleAllCraft,
  t,
}: {
  progress: Record<string, TaskProgress>
  definitions: Record<string, TaskDefinition>
  type: 'daily' | 'weekly' | 'monthly'
  onIncrement: (taskId: string, type: 'daily' | 'weekly' | 'monthly') => void
  onToggle: (taskId: string, type: 'daily' | 'weekly' | 'monthly') => void
  onSweepAll?: () => void
  onToggleAllShop?: (type: 'daily' | 'weekly' | 'monthly') => void
  onToggleAllCraft?: (type: 'daily' | 'weekly' | 'monthly') => void
  t: (key: string) => string
}) {
  if (Object.keys(progress).length === 0) {
    return <div className="text-center text-gray-400 py-8">{t('progress.noTasks')}</div>
  }

  // Group tasks by category
  const categories: TaskCategory[] = ['task', 'recurring', 'craft', 'shop']
  const tasksByCategory: Record<TaskCategory, [string, TaskProgress][]> = {
    task: [],
    recurring: [],
    craft: [],
    shop: [],
  }

  Object.entries(progress).forEach(([key, task]) => {
    const def = definitions[key]
    const category = def?.category || 'task'
    tasksByCategory[category].push([key, task])
  })

  // Shop icons mapping (subcategory/tab key -> icon filename)
  const shopIcons: Record<string, string> = {
    'progress.shop.general': 'TI_Item_Credit',
    'progress.shop.star-memory': 'TI_Item_Memory_Of_Star',
    'progress.shop.friendship-point': 'TI_Item_FriendPoint',
    'progress.shop.arena-shop': 'TI_Item_PVP_Medal',
    'progress.shop.joint-challenge': 'TI_Item_BossEvent_Coin_01',
    'progress.shop.guild-shop': 'CM_Goods_Guild_Coin',
    'progress.shop.world-boss': 'TI_Item_World_Boss',
    'progress.shop.adventure-license': 'TI_Licence',
    'progress.shop.survey-hub': 'survey-contributions',
  }

  // Build shop hierarchy
  const shopHierarchy: ShopHierarchy = {}
  tasksByCategory.shop.forEach(([key, task]) => {
    const def = definitions[key]
    const categoryKey = def?.shopCategory || 'progress.shop.other'
    const subcategoryKey = def?.shopSubcategory || '_none'
    const tabKey = def?.shopTab || '_none'

    if (!shopHierarchy[categoryKey]) {
      shopHierarchy[categoryKey] = {}
    }
    if (!shopHierarchy[categoryKey][subcategoryKey]) {
      shopHierarchy[categoryKey][subcategoryKey] = {}
    }
    if (!shopHierarchy[categoryKey][subcategoryKey][tabKey]) {
      shopHierarchy[categoryKey][subcategoryKey][tabKey] = []
    }
    shopHierarchy[categoryKey][subcategoryKey][tabKey].push([key, task])
  })

  // Category labels and colors
  const categoryConfig: Record<TaskCategory, { labelKey: string; color: string }> = {
    task: { labelKey: 'progress.category.tasks', color: 'text-gray-400' },
    recurring: { labelKey: 'progress.category.recurring', color: 'text-purple-400' },
    craft: { labelKey: 'progress.category.craft', color: 'text-orange-400' },
    shop: { labelKey: 'progress.category.shop', color: 'text-yellow-400' },
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const tasks = tasksByCategory[category]
        if (tasks.length === 0) return null

        const config = categoryConfig[category]
        const def = tasks[0] ? definitions[tasks[0][0]] : null
        const resetInfo = category === 'recurring' && def?.resetIntervalDays
          ? ` (${def.resetIntervalDays}${t('progress.daysShort')})`
          : ''

        // Special rendering for craft category
        if (category === 'craft') {
          // Group craft tasks by shopCategory (e.g., Kate's Workshop)
          const craftGroups: Record<string, [string, TaskProgress][]> = {}
          tasks.forEach(([key, task]) => {
            const def = definitions[key]
            const groupKey = def?.shopCategory || 'progress.craft.other'
            if (!craftGroups[groupKey]) {
              craftGroups[groupKey] = []
            }
            craftGroups[groupKey].push([key, task])
          })

          return (
            <div key={category}>
              {/* Craft Category Header with Complete All button */}
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-sm font-medium ${config.color}`}>
                  {t(config.labelKey)}
                </span>
                <div className="flex-1 h-px bg-gray-700" />
                {onToggleAllCraft && (
                  <button
                    onClick={() => onToggleAllCraft(type)}
                    className="text-xs px-2 py-1 bg-orange-600/20 hover:bg-orange-600/40 text-orange-400 rounded transition"
                  >
                    {t('progress.completeAll')}
                  </button>
                )}
              </div>

              {/* Craft Groups */}
              <div className="space-y-3">
                {Object.entries(craftGroups).map(([groupKey, groupTasks]) => {
                  const firstDef = definitions[groupTasks[0]?.[0]]
                  return (
                    <div key={groupKey} className="bg-gray-800/50 rounded-lg p-3">
                      {/* Craft Group Header */}
                      <div className="flex items-center gap-1.5 text-sm font-medium text-orange-400 mb-2">
                        {firstDef?.icon && (
                          <Image
                            src={`/images/item/${firstDef.icon}.webp`}
                            alt=""
                            width={18}
                            height={18}
                            className="object-contain"
                          />
                        )}
                        {t(groupKey)}
                      </div>
                      {/* Craft Items */}
                      <div className="space-y-1 pl-3 border-l-2 border-orange-400/30">
                        {groupTasks.map(([key, task]) => (
                          <TaskItem
                            key={key}
                            task={task}
                            labelKey={`progress.task.${key}`}
                            onRowClick={() => onIncrement(key, type)}
                            onCheckboxChange={() => onToggle(key, type)}
                            t={t}
                            compact
                            definition={definitions[key]}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        }

        // Special rendering for shop category
        if (category === 'shop') {
          return (
            <div key={category}>
              {/* Shop Category Header with Complete All button */}
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-sm font-medium ${config.color}`}>
                  {t(config.labelKey)}
                </span>
                <div className="flex-1 h-px bg-gray-700" />
                {onToggleAllShop && (
                  <button
                    onClick={() => onToggleAllShop(type)}
                    className="text-xs px-2 py-1 bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400 rounded transition"
                  >
                    {t('progress.completeAll')}
                  </button>
                )}
              </div>

              {/* Shop Hierarchy */}
              <div className="space-y-3">
                {Object.entries(shopHierarchy).map(([categoryKey, subcategories]) => (
                  <div key={categoryKey} className="bg-gray-800/50 rounded-lg p-3">
                    {/* Shop Category */}
                    <div className="text-sm font-medium text-yellow-400 mb-2">
                      {t(categoryKey)}
                    </div>
                    <div className="space-y-2 pl-3 border-l-2 border-yellow-400/30">
                      {Object.entries(subcategories).map(([subcategoryKey, tabs]) => (
                        <div key={subcategoryKey}>
                          {/* Subcategory (only show if not _none) */}
                          {subcategoryKey !== '_none' && (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-1">
                              {shopIcons[subcategoryKey] && (
                                <Image
                                  src={`/images/item/${shopIcons[subcategoryKey]}.webp`}
                                  alt=""
                                  width={16}
                                  height={16}
                                  className="object-contain"
                                />
                              )}
                              {t(subcategoryKey)}
                            </div>
                          )}
                          <div className="space-y-1">
                            {Object.entries(tabs).map(([tabKey, items]) => (
                              <div key={tabKey}>
                                {/* Tab (only show if not _none) */}
                                {tabKey !== '_none' && (
                                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1 pl-2">
                                    {shopIcons[tabKey] && (
                                      <Image
                                        src={`/images/item/${shopIcons[tabKey]}.webp`}
                                        alt=""
                                        width={14}
                                        height={14}
                                        className="object-contain"
                                      />
                                    )}
                                    {t(tabKey)}
                                  </div>
                                )}
                                {/* Items */}
                                <div className="space-y-1">
                                  {items.map(([key, task]) => (
                                    <TaskItem
                                      key={key}
                                      task={task}
                                      labelKey={`progress.task.${key}`}
                                      onRowClick={() => onIncrement(key, type)}
                                      onCheckboxChange={() => onToggle(key, type)}
                                      t={t}
                                      compact
                                      definition={definitions[key]}
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        }

        // Check if this category has sweepable content (only for daily tasks)
        const sweepableTasks = [
          'bounty-hunter', 'bandit-chase', 'upgrade-stone-retrieval',
          'defeat-doppelganger', 'special-request-ecology', 'special-request-identification'
        ]
        const hasSweepableTasks = category === 'task' && type === 'daily' &&
          tasks.some(([key]) => sweepableTasks.includes(key))

        return (
          <div key={category}>
            {/* Category Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-sm font-medium ${config.color}`}>
                {t(config.labelKey)}{resetInfo}
              </span>
              <div className="flex-1 h-px bg-gray-700" />
              {hasSweepableTasks && onSweepAll && (
                <button
                  onClick={onSweepAll}
                  className="text-xs px-2 py-1 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-400 rounded transition"
                >
                  {t('progress.sweepAll')}
                </button>
              )}
            </div>

            {/* Tasks */}
            <div className="space-y-2">
              {tasks.map(([key, task]) => (
                <TaskItem
                  key={key}
                  task={task}
                  labelKey={`progress.task.${key}`}
                  onRowClick={() => onIncrement(key, type)}
                  onCheckboxChange={() => onToggle(key, type)}
                  t={t}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TaskItem({
  task,
  labelKey,
  onRowClick,
  onCheckboxChange,
  t,
  compact = false,
  definition,
}: {
  task: TaskProgress
  labelKey: string
  onRowClick: () => void
  onCheckboxChange: () => void
  t: (key: string) => string
  compact?: boolean
  definition?: TaskDefinition
}) {
  // Determine label content: ItemInlineDisplay for shop items with item key, otherwise translated label
  const renderLabel = () => {
    if (definition?.shopItemKey) {
      // Use opacity for completed state since line-through doesn't cascade through ItemInlineDisplay
      const completedClass = task.completed ? 'opacity-50' : ''
      return (
        <span className={`inline-flex items-center gap-1 ${completedClass}`}>
          {definition.shopItemQuantity && (
            <span className={task.completed ? 'text-gray-500 line-through' : 'text-gray-300'}>
              {definition.shopItemQuantity} x
            </span>
          )}
          <ItemInlineDisplay names={definition.shopItemKey} size={20} />
        </span>
      )
    }
    return t(labelKey)
  }

  return (
    <div
      className={`flex items-center gap-3 ${compact ? 'p-3 bg-gray-700/50' : 'p-4 bg-gray-800'} rounded-lg cursor-pointer hover:bg-gray-750 transition group select-none`}
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
        onTouchEnd={(e) => e.stopPropagation()}
        className="w-5 h-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
      />
      <span
        className={`flex-1 ${
          task.completed ? 'line-through text-gray-500' : 'text-gray-100'
        } group-hover:text-white transition`}
      >
        {renderLabel()}
      </span>
      {task.maxCount !== undefined && (
        <span className="text-sm text-gray-400">
          {task.count ?? 0}/{task.maxCount}
        </span>
      )}
    </div>
  )
}

// Summary badge for single-page mode
function SummaryBadge({
  label,
  completed,
  total,
  percent,
  resetTime,
}: {
  label: string
  completed: number
  total: number
  percent: number
  resetTime: string
}) {
  const colors = getProgressColor(percent)

  return (
    <div className="flex items-center gap-3 flex-1 min-w-[200px]">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-300">{label}</span>
          <span className="text-xs text-gray-400">{completed}/{total}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <div
            className={`${colors.bar} h-1.5 rounded-full transition-all`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">{resetTime}</div>
      </div>
    </div>
  )
}

// Section header for single-page mode
function SectionHeader({
  label,
  completed,
  total,
  resetTime,
  resetLabel,
}: {
  label: string
  completed: number
  total: number
  resetTime: string
  resetLabel: string
}) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0
  const colors = getProgressColor(percent)

  return (
    <div className={`flex items-center gap-4 p-4 mb-4 rounded-lg bg-gray-800 border-l-4 ${colors.border}`}>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">{label}</span>
          <span className="text-sm text-gray-400">{completed}/{total}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">{resetLabel}: {resetTime}</div>
      </div>
      <div className="w-16 h-16 relative">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-gray-700"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${percent * 1.76} 176`}
            className={colors.bar.replace('bg-', 'text-')}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
          {percent}%
        </span>
      </div>
    </div>
  )
}

// Precise Craft section (30-day timer)
function PreciseCraftSection({
  preciseCraft,
  onToggle,
  t,
}: {
  preciseCraft: PreciseCraftProgress
  onToggle: () => void
  t: (key: string) => string
}) {
  const isAvailable = ProgressTracker.isPreciseCraftAvailable()
  const nextAvailableTime = ProgressTracker.getNextPreciseCraftTime()
  const isCompleted = preciseCraft.completedAt !== null && !isAvailable

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="relative w-6 h-6">
          <Image
            src="/images/ui/nav/CM_Agit_Crafting.webp"
            alt="Precise Craft"
            fill
            sizes="24px"
            className="object-contain"
          />
        </div>
        <h3 className="text-lg font-semibold text-purple-400">{t('progress.preciseCraft')}</h3>
      </div>
      <div
        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
          isCompleted
            ? 'bg-gray-800/30 opacity-60'
            : isAvailable
            ? 'bg-purple-900/20 hover:bg-purple-900/30 border border-purple-500/30'
            : 'bg-gray-800/50'
        }`}
        onClick={onToggle}
      >
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            isCompleted
              ? 'border-purple-500 bg-purple-500'
              : 'border-gray-500'
          }`}
        >
          {isCompleted && (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <span className={isCompleted ? 'text-gray-400 line-through' : 'text-gray-200'}>
            {t('progress.preciseCraftItem')}
          </span>
          {nextAvailableTime && (
            <div className="text-xs text-gray-500 mt-1">
              {t('progress.availableIn')}: {ProgressTracker.formatTimeUntil(nextAvailableTime)}
            </div>
          )}
          {isAvailable && preciseCraft.completedAt === null && (
            <div className="text-xs text-purple-400 mt-1">
              {t('progress.availableNow')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
