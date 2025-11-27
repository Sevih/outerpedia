'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import GlicysALTeamsData from './GlicysAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const GlicysALTeams = GlicysALTeamsData as Record<string, TeamData>

export default function GlicysGuide() {
  return (
    <GuideTemplate
      title="Glicys Adventure License Guide"
      introduction="Same skills as Special Request Stage 12. Glicys gains Invincibility for 1 turn and increased Effectiveness for 3 turns at 60% HP. Can be cleared in 1-2 attempts. Verified up to stage 10."
      defaultVersion="default"
      versions={{
        default: {
          label: 'Guide',
          content: (
            <>
              <BossDisplay bossKey='Glicys' modeKey='Adventure License' defaultBossId='51000009' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips tips={[
                "Glicys takes 70% reduced damage when she has no underlings. Keep at least one underling alive to deal full damage to her.",
                "Becomes Enraged at 60% HP, gaining {B/BT_INVINCIBLE_IR} for 1 turn. Starting a second attempt below 60% HP skips the invincibility phase."
              ]} />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharacters} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={GlicysALTeams.glicysAL} defaultStage="Team 1 – Icebreaker" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage videoId="gufhBKd9kXw" title="Glicys - Adventure License - Stage 10 - 1 run clear (Auto)" author="XuRenChao" date="26/08/2025" />
            </>
          ),
        },
      }}
    />
  )
}
