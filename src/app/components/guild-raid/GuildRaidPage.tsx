'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/contexts/I18nContext'
import { GuildRaidData } from '@/schemas/guild-raid.schema'
import VersionSelector from '@/app/components/VersionSelector'
import { PhaseNavigator } from './PhaseNavigator'
import { Phase1View } from './Phase1View'
import { Phase2View } from './Phase2View'

type Props = {
  data: GuildRaidData
}

/**
 * Main Guild Raid Page Component
 * Handles version selection and phase navigation
 */
export function GuildRaidPage({ data }: Props) {
  const { lang } = useI18n()
  const versionKeys = Object.keys(data)
  const [selectedVersion, setSelectedVersion] = useState(versionKeys[0])
  const [currentPhase, setCurrentPhase] = useState<'phase1' | 'phase2'>('phase1')
  const [phase2BossName, setPhase2BossName] = useState<string>('')

  const version = data[selectedVersion]

  // Load Phase 2 boss name
  useEffect(() => {
    const bossId = version.phase2.id
    import(`@/data/boss/${bossId}.json`)
      .then((mod) => {
        const bossData = mod.default || mod
        setPhase2BossName(bossData.Name[lang] || bossData.Name.en || 'Main Boss')
      })
      .catch(() => {
        setPhase2BossName('Main Boss')
      })
  }, [version.phase2.id, lang])

  return (
    <div>
      {/* Version Selector */}
      <VersionSelector
        versions={Object.fromEntries(
          versionKeys.map((key) => [key, { label: data[key].label }])
        )}
        selected={selectedVersion}
        onSelect={setSelectedVersion}
      />

      {/* Phase Navigation Tabs */}
      <PhaseNavigator
        currentPhase={currentPhase}
        onPhaseChange={setCurrentPhase}
        phase2BossName={phase2BossName}
      />

      {/* Phase Content */}
      {currentPhase === 'phase1' && (
        <Phase1View phase1Data={version.phase1} />
      )}

      {currentPhase === 'phase2' && (
        <Phase2View
          phase2Data={version.phase2}
          phase1Bosses={version.phase1.bosses}
        />
      )}
    </div>
  )
}
