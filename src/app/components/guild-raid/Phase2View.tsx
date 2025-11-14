'use client'

import parseText from '@/utils/parseText'
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
        <div>
          <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-3">
            Phase 2 — Overview
          </h3>

          <ul className="list-disc list-inside text-neutral-300 mb-4">
            {phase2Data.overview.filter(line => line.trim() !== '').map((line, index) => (
              <li key={index}>{parseText(line)}</li>
            ))}
          </ul>
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
