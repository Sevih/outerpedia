'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import BossDisplay from '@/app/components/BossDisplay'
import VladiMaxALTeamsData from './VladiMaxAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const VladiMaxALTeams = VladiMaxALTeamsData as Record<string, TeamData>

export default function HeavyFixedVladiMaxGuide() {
    return (
        <GuideTemplate
            title="Vladi Max Adventure License Guide"
            introduction="Fully heals when hit by non-attack skills. Gains stacks on critical hits. Can be cleared with ETamamo carry or Rhona chain strategy. Confirmed clear up to stage 10."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey='Vladi Max' modeKey='Adventure License' defaultBossId='51000030' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Fully heals when enemy uses a non-attack skill.",
                                "Gains 2 stacks on critical hit, loses 1 on non-crit. {D/BT_KILL} if the boss plays when having 5 stacks.",
                                "No WG damage from critical hits.",
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={VladiMaxALTeams.vladiMaxAL} defaultStage="ETamamo Carry" />
                        </>
                    ),
                },
            }}
        />
    )
}
