'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import BossDisplay from '@/app/components/BossDisplay'
import CalamariALTeamsData from './CalamariAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const CalamariALTeams = CalamariALTeamsData as Record<string, TeamData>

export default function CalamariALGuide() {
    return (
        <GuideTemplate
            title="Grand Calamari Adventure License Guide"
            introduction="Same skills as Special Request Stage 12, can be cleared in 1-2 attempts. Verified up to stage 10."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey='Grand Calamari' modeKey='Adventure License' defaultBossId='51000023' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Boss reduces WG damage taken by 100% when it has buffs active, so use {D/BT_STEAL_BUFF}, {D/BT_STATBUFF_CONVERT_TO_STATDEBUFF} and/or {D/BT_SEALED}.",
                                "Boss takes increased damage from {E/Light} units and reduced WG damage from non-{E/Light} units."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={CalamariALTeams.calamariAL} defaultStage="Recommended Team" />
                        </>
                    ),
                },
            }}
        />
    )
}
