'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ShichifujaTeamsData from './ShichifujaJC.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharactersAug, recommendedCharactersFeb} from './recommendedCharacters'

const ShichifujaTeams = ShichifujaTeamsData as Record<string, TeamData>

export default function ShichifujaGuide() {
  return (
    <GuideTemplate
      title="Shichifuja Joint Challenge Guide"
      introduction="Joint Challenge boss. If leftmost unit isn't a {C/Mage}, boss fully recovers WG. Takes WG damage only from Burst, Dual Attacks, and Skill Chains - otherwise gains {B/BT_ACTION_GAUGE} +20% and reduces WG damage by 50%. Weak to {D/BT_FIXED_DAMAGE} via chain attacks."
      defaultVersion="feb2026"
      versions={{
         feb2026: {
          label: 'February 2026 Version',
          content: (
            <>
              <BossDisplay bossKey='Shichifuja' modeKey='Joint Challenge' defaultBossId='4634084' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "Reduces enemies' ATK by 90% but increases damage taken from {C/Mage}.",
                  "Non-Burst/Dual/Chain skills give boss {B/BT_ACTION_GAUGE} +20% and reduce WG damage by 50%."
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersFeb} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={ShichifujaTeams.feb2026} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="OmtZiNdwiGk"
                title="Shichifuja - Joint Challenge - Very Hard"
                author="Sevih"
                date="24/02/2026"
              />
            </>
          ),
        },
        august2025: {
          label: 'August 2025 Version',
          content: (
            <>
              <BossDisplay bossKey='Shichifuja' modeKey='Joint Challenge' defaultBossId='4634084' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "Reduces enemies' ATK by 90% but increases damage taken from {C/Mage}.",
                  "Non-Burst/Dual/Chain skills give boss {B/BT_ACTION_GAUGE} +20% and reduce WG damage by 50%."
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersAug} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={ShichifujaTeams.august2025} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="hcJ6L4DwjWA"
                title="Shichifuja - Joint Challenge - Very Hard"
                author="Sevih"
                date="19/08/2025"
              />
            </>
          ),
        },
        legacy2024: {
          label: 'Legacy (2024 Video)',
          content: (
            <>
              <CombatFootage
                videoId="EjCfC5roxiQ"
                title="Shichifuja Joint Challenge Max Score"
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
