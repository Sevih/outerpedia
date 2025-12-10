'use client'

import TacticalTips from '@/app/components/TacticalTips'
import TeamTabSelectorWithGeas from '@/app/components/TeamTabSelectorWithGeas'
import RaidBossDisplay from './RaidBossDisplay'
import { Phase2, Phase1Boss } from '@/schemas/guild-raid.schema'

type Props = {
  phase2Data: Phase2
  phase1Bosses: Phase1Boss[]
}

/**
 * Phase 2 View - Main Boss
 * Displays boss overview and team strategies
 */
export function Phase2View({ phase2Data, phase1Bosses }: Props) {
  return (
    <div>
      {/* Boss Info */}
      <RaidBossDisplay bossKey={phase2Data.id} />

      {/* Boss Overview - Only show if not empty */}
      {phase2Data.overview && phase2Data.overview.length > 0 && phase2Data.overview.some(line => line.trim() !== '') && (
        <div className="my-4">
          <TacticalTips
            tips={phase2Data.overview.filter(line => line.trim() !== '')}
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
