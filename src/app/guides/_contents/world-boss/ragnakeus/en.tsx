'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import GuideHeading from '@/app/components/GuideHeading'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import { WorldBossDisplay } from '@/app/components/boss'
import RagnakeusTeamsData from './Ragnakeus.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { phase1Characters, phase2Characters } from './recommendedCharacters'

const RagnakeusTeams = RagnakeusTeamsData as Record<string, TeamData>

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
              <TacticalTips
                sections={[
                  {
                    title: "strategy",
                    tips: [
                      "The boss's main characteristic is its {B/BT_ACTION_GAUGE}. Fast units are recommended.",
                      "Anything that can limit priority gain is useful: {D/BT_DOT_POISON}, {D/BT_DOT_POISON2}, the {I-W/Sacreed Edge} weapon, or {P/Demiurge Vlada} (20% reduction at 4 stars, 50% at 5 stars).",
                      "Like most World Bosses, the best strategy is to break the boss as often as possible. Key focus areas are CP generation and Weakness Gauge damage."
                    ]
                  },
                  {
                    title: "phase1",
                    tips: [                    
                      "Bring {D/BT_SEALED}, {D/BT_STEAL_BUFF}, or {D/BT_EXTEND_BUFF} to counter boss {B/BT_STAT|ST_DEF}."
                    ]
                  },
                  {
                    title: "phase2",
                    tips: [
                      "Bring {D/BT_REMOVE_BUFF}, {D/BT_STEAL_BUFF}, or {D/BT_SEALED} to counter boss {B/BT_SHIELD_BASED_CASTER}.",
                      "{C/Defender} recommended to prevent the S3 reset if you want to bring {E/Fire}, {E/Earth}, {E/Water}."
                    ]
                  }
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList title="phase1" entries={phase1Characters} />
              <RecommendedCharacterList title="phase2" entries={phase2Characters} />             
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={RagnakeusTeams.december2025} defaultStage="Phase 1" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                  videoId="8SU0TH6_DY4"
                  title="Dragon of Death Ragnakeus - World Boss - SSS - Extreme League"
                  author="Sevih"
                  date="03/12/2025"
                />

            </>
          ),
        },
        october2024: {
          label: 'October 2024',
          content: (
            <>
              <div>
                <div className="mb-4">
                  <GuideHeading level={2}>Video Guide</GuideHeading>
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
