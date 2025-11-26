'use client'

import { useState, useEffect } from 'react'
import { Phase1 } from '@/schemas/guild-raid.schema'
import { BossSelector } from './BossSelector'
import { GeasPanel } from './GeasPanel'
import { BossStrategy } from './BossStrategy'
import { RaidBossDisplay } from './index'
import { useTenant } from '@/lib/contexts/TenantContext'
import { lRec } from '@/lib/localize'
import parseText from '@/utils/parseText'
import type { Localized } from '@/types/common'

type Props = {
  phase1Data: Phase1
}

type BossData = {
  Name: Localized
  [key: string]: unknown
}

/**
 * Phase 1 View - Geas Bosses
 * Displays boss selection, geas configuration, and strategies
 */
export function Phase1View({ phase1Data }: Props) {
  const [activeBossIndex, setActiveBossIndex] = useState(0)
  const [bossDataList, setBossDataList] = useState<BossData[]>([])
  const activeBoss = phase1Data.bosses[activeBossIndex]
  const { key: langKey } = useTenant()

  // Load all boss data once
  useEffect(() => {
    const loadAllBossData = async () => {
      try {
        const loadPromises = phase1Data.bosses.map(async (boss) => {
          const bossData = (await import(
            `@/data/boss/${boss.bossId}.json`
          )) as { default: BossData }
          return bossData.default
        })

        const allBossData = await Promise.all(loadPromises)
        setBossDataList(allBossData)
      } catch (error) {
        console.error('Failed to load boss data:', error)
        setBossDataList([])
      }
    }

    loadAllBossData()
  }, [phase1Data.bosses])

  const currentBossData = bossDataList[activeBossIndex]
  const bossName = currentBossData ? lRec(currentBossData.Name, langKey) : ``

  return (
    <div className="flex flex-col md:flex-row gap-8 mb-8">
      {/* Left Column: Boss Selection + Geas */}
      <div className="flex flex-col items-center md:items-start w-full md:max-w-[280px] shrink-0">
        {/* Boss Name loaded from boss data */}
        <div className="text-white text-lg font-bold mb-2 text-center w-full">
          {bossName || ``}
        </div>

        {/* Boss Selection */}
        <BossSelector
          bosses={phase1Data.bosses}
          activeBossIndex={activeBossIndex}
          onBossSelect={setActiveBossIndex}
        />

        {/* Geas Panel */}
        <GeasPanel geasConfig={activeBoss.geas} />
      </div>

      {/* Right Column: Boss Data + Strategy */}
      <div className="flex flex-col gap-6 w-full">
        {/* Boss Display with skills from boss data - bossId is the full filename */}
        <RaidBossDisplay bossKey={activeBoss.bossId} />

        {/* Notes if present */}
        {activeBoss.notes && activeBoss.notes.length > 0 && activeBoss.notes.some(note => note.trim() !== '') && (
          <div>
            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-3">
              Notes
            </h3>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
              {activeBoss.notes.filter(note => note.trim() !== '').map((note, index) => (
                <li key={index}>{parseText(note)}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Strategy from raid data */}
        <BossStrategy boss={activeBoss} />
      </div>
    </div>
  )
}
