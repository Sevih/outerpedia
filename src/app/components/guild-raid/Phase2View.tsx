'use client'

import TacticalTips from '@/app/components/TacticalTips'
import TeamTabSelectorWithGeas from '@/app/components/TeamTabSelectorWithGeas'
import RaidBossDisplay from './RaidBossDisplay'
import { Phase2, Phase1Boss } from '@/schemas/guild-raid.schema'
import { useTenant } from '@/lib/contexts/TenantContext'

type Props = {
  phase2Data: Phase2
  phase1Bosses: Phase1Boss[]
}

/**
 * Resolve localized overview based on current language
 * Falls back to English if localized version doesn't exist
 */
function resolveOverview(phase2Data: Phase2, lang: string): string[] {
  if (lang !== 'en') {
    const localizedKey = `overview_${lang}` as keyof Phase2
    const localizedOverview = phase2Data[localizedKey] as string[] | undefined
    if (localizedOverview && localizedOverview.length > 0) {
      return localizedOverview
    }
  }
  return phase2Data.overview
}

/**
 * Phase 2 View - Main Boss
 * Displays boss overview and team strategies
 */
export function Phase2View({ phase2Data, phase1Bosses }: Props) {
  const { key: lang } = useTenant()
  const overview = resolveOverview(phase2Data, lang)

  return (
    <div>
      {/* Boss Info */}
      <RaidBossDisplay bossKey={phase2Data.id} />

      {/* Boss Overview - Only show if not empty */}
      {overview && overview.length > 0 && overview.some(line => line.trim() !== '') && (
        <div className="my-4">
          <TacticalTips
            tips={overview.filter(line => line.trim() !== '')}
          />
        </div>
      )}

      {/* Team Strategies */}
      <TeamTabSelectorWithGeas
        teams={phase2Data.teams}
        bosses={phase1Bosses}
      />
    </div>
  )
}
