'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import KOHMeteosTeamsData from './KOHMeteos.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharactersNov, recommendedCharactersMay } from './recommendedCharacters'

const KOHMeteosTeams = KOHMeteosTeamsData as Record<string, TeamData>

export default function KOHMeteosGuide() {
  return (
    <GuideTemplate
      title="Knight of Hope Meteos Joint Challenge Guide"
      introduction="Joint Challenge boss. The boss prioritizes the leftmost enemy and triggers a powerful AoE attack when killing with skills or attacking non-{C/Mage} units. {E/Light} allies gain 40% bonus penetration. The boss's defense stacks each turn but resets on break."
      defaultVersion="november2025"
      versions={{
        november2025: {
          label: 'November 2025 Version',
          content: (
            <>
              <BossDisplay bossKey='Knight of Hope Meteos' modeKey='Joint Challenge' defaultBossId='4176152' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "S1 prioritizes the leftmost enemy - place a {C/Mage} there to avoid triggering the passive AoE.",
                  "Triggers a defense-ignoring AoE when killing with S1/S2 or attacking non-{C/Mage} with S1.",
                  "Priority Gauge efficiency +100%, but Speed -50%.",
                  "Non-attack skills increase critical damage taken by 100% (max 3 stacks).",
                  "Boss defense +500 each turn, resets on break."
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersNov} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={KOHMeteosTeams.november2025} defaultStage="Recommended Team" />
            </>
          ),
        },
        may2025: {
          label: 'May 2025 Version',
          content: (
            <>
              <BossDisplay bossKey='Knight of Hope Meteos' modeKey='Joint Challenge' defaultBossId='4176152' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "S1 prioritizes the leftmost enemy - place a {C/Mage} there to avoid triggering the passive AoE.",
                  "Triggers a defense-ignoring AoE when killing with S1/S2 or attacking non-{C/Mage} with S1.",
                  "Priority Gauge efficiency +100%, but Speed -50%.",
                  "Non-attack skills increase critical damage taken by 100% (max 3 stacks).",
                  "Boss defense +500 each turn, resets on break."
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersMay} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={KOHMeteosTeams.may2025} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="g3LcTpm9fMo"
                title="Knight of Hope Meteos - Joint Challenge - Very Hard Mode"
                author="Sevih"
                date="15/05/2025"
              />
            </>
          ),
        },
        legacy2024: {
          label: 'Legacy (2024 Video)',
          content: (
            <>
              <CombatFootage
                videoId="X5bL_YZ73y4"
                title="Knight of Hope Meteos Joint Boss Max Score"
                author="Ducky"
                date="01/01/2024"
              />
            </>
          ),
        },
      }}
    />
  )
}
