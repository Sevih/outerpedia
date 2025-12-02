'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import GuideInProgress from '@/app/components/GuideInProgress'
//import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import { WorldBossDisplay } from '@/app/components/boss'
//import RagnakeusTeamsData from './Ragnakeus.json'
//import type { TeamData } from '@/types/team'
//import TacticalTips from '@/app/components/TacticalTips'
//import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
//import { phase1Characters, phase2Characters } from './recommendedCharacters'

//const RagnakeusTeams = RagnakeusTeamsData as Record<string, TeamData>

const ragnakeusDecember2025 = {
  boss1Key: 'Dragon of Death Ragnakeus',
  boss2Key: 'Mecha Dragon of Death Ragnakeus',
  boss1Ids: {
    'Normal': '4086037',
    'Very Hard': '4086039',
    'Extreme': '4086041'
  },
  boss2Ids: {
    'Hard': '4086038',
    'Very Hard': '4086040',
    'Extreme': '4086042'
  }
} as const

export default function RagnakeusGuide() {
  return (
    <GuideTemplate
      title="Dragon of Death Ragnakeus Strategy"
      introduction="Dragon of Death Ragnakeus is a challenging two-phase world boss that requires precise team coordination and timing. This guide covers strategies for defeating this boss up to the Extreme League."
      defaultVersion="december2025"
      versions={{
        december2025: {
          label: 'December 2025',
          content: (
            <>
              <WorldBossDisplay config={ragnakeusDecember2025} defaultMode="Extreme" />
              <hr className="my-6 border-neutral-700" />
              <GuideInProgress />
              {/**<TacticalTips
                sections={[

                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList title="phase1" entries={phase1Characters} />
              <RecommendedCharacterList title="phase2" entries={phase2Characters} />             
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={RagnakeusTeams.december2025} defaultStage="Recommended Team" />*/}

            </>
          ),
        },
        october2024: {
          label: 'October 2024',
          content: (
            <>
              <div>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold mb-2">Video Guide</h2>
                  <p className="mb-2 text-neutral-300">
                    No full written guide has been made yet. For now, we recommend watching this excellent video by <strong>Ducky</strong>:
                  </p>
                </div>
                <hr className="my-6 border-neutral-700" />
                <CombatFootage
                  videoId="vR_FaPyptRk"
                  title="15mil Ragnakeus World Boss Guide"
                  author="Ducky"
                  date="01/12/2025"
                />
              </div>
            </>
          ),
        },
      }}
    />
  )
}
