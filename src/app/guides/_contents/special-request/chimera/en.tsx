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
            introduction="THE boss you want to conquer as fast as possible to get that sweet speed gear and critical strike. Chimera's kit is not overly complex — this is more of a DPS race than anything."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey='Unidentified Chimera' modeKey='Special Request: Ecology Study' defaultBossId='403400262' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "If you can't kill her before she enrages, you'll have a much harder time surviving.",
                                "Thankfully, the {E/Fire} element nowadays has so many good tools to deal with this boss.",
                                "Chimera has relatively low Health but significantly higher Defense so {D/BT_STAT|ST_DEF} is pretty much required.",
                                "Having your DPS units on Penetration % accessories will greatly improve your damage.",
                                "Chimera's passive significantly reduces your team's Crit Damage by 85% but in return gives all units 100% Crit Chance.",
                                "To take advantage of this, you DO NOT need to put any crit chance on your units. Focus purely on Attack and Crit Damage.",
                                "Abuse {I-T/Rogue's Charm} on every unit since they will proc CP generation every time. {I-T/Sage's Charm} on {E/Fire} units work as well.",
                                "Speed is important due to the boss's ability to gain 10% {B/BT_ACTION_GAUGE} whenever attacked.",
                                "Ideally, you want your entire team to be above 175 Speed for Stage 12 (185 for Stage 13)."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={chimeraTeams.chimeraSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="eHRErCHZmp4" title="Chimera Combat Footage" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
