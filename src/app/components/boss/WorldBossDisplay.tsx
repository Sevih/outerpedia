'use client'

import { useEffect, useState, useCallback } from 'react'
import { useI18n } from '@/lib/contexts/I18nContext'
import { lRec } from '@/lib/localize'
import { BossPortrait, BossHeader, BossImmunities, BossSkillList } from './index'
import slugToCharJson from '@/data/_SlugToChar.json'
import type { BossData } from '@/types/boss'
import type { SlugToCharMap } from '@/types/pull'

const SLUG_TO_CHAR = slugToCharJson as SlugToCharMap

/**
 * World Boss difficulty modes
 * - Normal: Boss 1 only
 * - Hard: Boss 2 only
 * - Very Hard: Boss 1 + Boss 2
 * - Extreme: Boss 1 + Boss 2
 */
type WorldBossMode = 'Normal' | 'Hard' | 'Very Hard' | 'Extreme'

type WorldBossConfig = {
  boss1Key: string
  boss2Key: string
  // Mapping of mode to boss IDs: { 'Normal': 'id1', 'Hard': 'id2', ... }
  boss1Ids: Partial<Record<WorldBossMode, string>>
  boss2Ids: Partial<Record<WorldBossMode, string>>
}

type Props = {
  config: WorldBossConfig
  defaultMode?: WorldBossMode
  onModeChange?: (mode: WorldBossMode) => void
}

type BossState = {
  data: BossData | null
  error: string | null
  loading: boolean
}

export default function WorldBossDisplay({ config, defaultMode = 'Extreme', onModeChange }: Props) {
  const { lang } = useI18n()
  const [selectedMode, setSelectedMode] = useState<WorldBossMode>(defaultMode)
  const [boss1State, setBoss1State] = useState<BossState>({ data: null, error: null, loading: true })
  const [boss2State, setBoss2State] = useState<BossState>({ data: null, error: null, loading: true })

  // Determine which bosses to show based on mode
  const showBoss1 = selectedMode === 'Normal' || selectedMode === 'Very Hard' || selectedMode === 'Extreme'
  const showBoss2 = selectedMode === 'Hard' || selectedMode === 'Very Hard' || selectedMode === 'Extreme'

  // Get available modes based on config
  const availableModes = (['Normal', 'Hard', 'Very Hard', 'Extreme'] as WorldBossMode[]).filter(mode => {
    if (mode === 'Normal' || mode === 'Very Hard' || mode === 'Extreme') {
      return config.boss1Ids[mode] !== undefined
    }
    if (mode === 'Hard') {
      return config.boss2Ids[mode] !== undefined
    }
    return false
  })

  const loadBoss = useCallback(async (bossId: string | undefined, setBossState: React.Dispatch<React.SetStateAction<BossState>>) => {
    if (!bossId) {
      setBossState({ data: null, error: null, loading: false })
      return
    }

    setBossState(prev => ({ ...prev, loading: true }))

    try {
      const mod = await import(`@/data/boss/${bossId}.json`)
      setBossState({ data: mod.default || mod, error: null, loading: false })
    } catch (err) {
      console.error(`[WorldBossDisplay] Error loading boss ${bossId}`, err)
      setBossState({ data: null, error: `Boss data not found: ${bossId}`, loading: false })
    }
  }, [])

  useEffect(() => {
    // Load boss 1 data
    const boss1Id = config.boss1Ids[selectedMode] || config.boss1Ids['Extreme'] || config.boss1Ids['Very Hard']
    loadBoss(boss1Id, setBoss1State)

    // Load boss 2 data
    const boss2Id = config.boss2Ids[selectedMode] || config.boss2Ids['Extreme'] || config.boss2Ids['Very Hard']
    loadBoss(boss2Id, setBoss2State)
  }, [selectedMode, config.boss1Ids, config.boss2Ids, loadBoss])

  const handleModeChange = (mode: WorldBossMode) => {
    setSelectedMode(mode)
    onModeChange?.(mode)
  }

  const renderBossCard = (bossState: BossState, isPrimary: boolean) => {
    if (bossState.error) {
      return (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-400">
          {bossState.error}
        </div>
      )
    }

    if (bossState.loading || !bossState.data) {
      return (
        <div className="bg-neutral-800 rounded-lg p-4 animate-pulse">
          <div className="h-8 bg-neutral-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-neutral-700 rounded w-2/3"></div>
        </div>
      )
    }

    const data = bossState.data
    const bossName = lRec(data.Name, lang)
    const bossSurname = lRec(data.Surname, lang)
    const isCharacterPortrait = data.icons.startsWith('2')
    const characterFullName = isCharacterPortrait && SLUG_TO_CHAR[data.icons]
      ? lRec(SLUG_TO_CHAR[data.icons].Fullname, lang)
      : bossName

    return (
      <div className="rounded-lg overflow-hidden">
        <div className="relative bg-neutral-900/30 p-4 rounded-lg border border-neutral-700/30">
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0">
            <div className="row-span-2">
              <BossPortrait
                icons={data.icons}
                bossName={bossName}
                characterFullName={characterFullName}
                size={isPrimary ? 'lg' : 'md'}
              />
            </div>
            <BossHeader
              bossName={bossName}
              bossSurname={bossSurname}
              className={data.class}
              element={data.element}
              level={data.level}
              compact={!isPrimary}
            />
          </div>

          <div className="mt-3">
            <BossImmunities
              buffImmune={data.BuffImmune}
              statBuffImmune={data.StatBuffImmune}
            />
          </div>
        </div>

        <div className="mt-4">
          <BossSkillList skills={data.skills} compact={!isPrimary} />
        </div>
      </div>
    )
  }

  // Determine grid layout
  const showBothBosses = showBoss1 && showBoss2
  const gridClass = showBothBosses ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''

  return (
    <div className="space-y-4">
      {/* Mode Selector */}
      {availableModes.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {availableModes.map((mode) => (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedMode === mode
                  ? 'bg-sky-600 text-white'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      )}

      {/* Boss Cards */}
      <div className={gridClass}>
        {showBoss1 && renderBossCard(boss1State, !showBoss2)}
        {showBoss2 && renderBossCard(boss2State, !showBoss1)}
      </div>
    </div>
  )
}