'use client'

import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import RecommendedTeam from '@/app/components/RecommendedTeamCarousel'
import TacticalTips from '@/app/components/TacticalTips'
import CombatFootage from '@/app/components/CombatFootage'
import { Phase1Boss } from '@/schemas/guild-raid.schema'

type Props = {
  boss: Phase1Boss
}

/**
 * Boss Strategy Component
 * Displays recommended units, teams, notes, and videos
 */
export function BossStrategy({ boss }: Props) {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Strategy Tips */}
      {boss.notes && boss.notes.length > 0 && boss.notes.some(note => note.trim() !== '') && (
        <TacticalTips
          title="strategy"
          tips={boss.notes.filter(note => note.trim() !== '')}
        />
      )}

      {/* Recommended Units */}
      {boss.recommended && boss.recommended.length > 0 && (
        <RecommendedCharacterList entries={boss.recommended} />
      )}

      {/* Recommended Team Composition */}
      {boss.team && boss.team.length > 0 && (
        <RecommendedTeam team={boss.team} />
      )}

      {/* Video Guide */}
      {boss.video && (
        <CombatFootage
          videoId={boss.video.videoId}
          title={boss.video.title}
          author={boss.video.author}
          date={boss.video.date}
        />
      )}
    </div>
  )
}
