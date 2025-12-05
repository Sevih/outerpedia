'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import chimeraTeamsData from './Chimera.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const chimeraTeams = chimeraTeamsData as Record<string, TeamData>

export default function ChimeraGuide() {
    return (
        <GuideTemplate
            title="Unidentified Chimera Special Request Guide"
            introduction="THE boss you want to conquer as fast as possible to get that sweet speed gear and critical strike. Chimera's kit is not overly complex — this is more of a DPS race than anything. Can be cleared in 1-2 attempts per stage once you have the right units."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey='Unidentified Chimera' modeKey='Special Request: Ecology Study' defaultBossId='403400262' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Only takes WG damage from {E/Fire} units. Reduces WG damage from non-{E/Fire} enemies by 50%.",
                                "Has relatively low Health but significantly higher Defense. Use units with {D/BT_STAT|ST_DEF} debuff.",
                                "Passive reduces your team's Critical Damage by 85% but gives all units 100% Critical Hit Chance.",
                                "Do not build Critical Hit Chance on your units. Focus purely on Attack and Critical Damage.",
                                "Boss gains 10% Action Gauge whenever attacked. Speed is crucial — aim for 175+ Speed for Stage 12 (185+ for Stage 13).",
                                "Becomes Enraged every 4 turns. If you can't kill her before she enrages, you'll have a much harder time surviving."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={chimeraTeams.chimeraSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="eHRErCHZmp4" title="Chimera Combat Footage" author="Community" date="01/01/2024" />
                        </>
                    ),
                },
            }}
        />
    )
}
