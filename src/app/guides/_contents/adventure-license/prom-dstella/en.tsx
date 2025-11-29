'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import StellaALTeamsData from './StellaAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const StellaALTeams = StellaALTeamsData as Record<string, TeamData>

export default function DemiurgeStellaPromotionGuide() {
  return (
    <GuideTemplate
      title="Demiurge Stella Promotion Challenge Guide"
      introduction="Professional Adventurer Promotion Challenge featuring {P/Demiurge Stella}. Reduces damage taken from skills other than Burst Skills, Dual Attacks, and Skill Chains by 90%. Inflicts {D/BT_DOT_CURSE} every turn and detonates all stacks with Ultimate. Use {B/BT_REMOVE_DEBUFF} to cleanse {D/BT_DOT_CURSE} before detonation."
      defaultVersion="default"
      versions={{
        default: {
          label: 'Guide',
          content: (
            <>
              <BossDisplay bossKey='Stella' modeKey='Challenge' defaultBossId='50000001' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "Reduces WG damage taken by 90% when not Enraged.",
                  "Inflicts {D/BT_DOT_CURSE} on all enemies at the start of each turn. {D/BT_IMMEDIATELY_CURSE} with Ultimate."
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharacters} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={StellaALTeams.stellaAL} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="V3wBW16PUBk"
                title="Promotion Battle vs DStella - Adventure License!"
                author="adjen"
              />
            </>
          ),
        },
      }}
    />
  )
}
