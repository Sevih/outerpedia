'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ToddlerALTeamsData from './ToddlerAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const ToddlerALTeams = ToddlerALTeamsData as Record<string, TeamData>

export default function TyrantToddlerGuide() {
    return (
        <GuideTemplate
            title="Tyrant Toddler Adventure License Guide"
            introduction="Same skills as Special Request Stage 12. Can be cleared in 1 to 2 attempts. Verified up to stage 10."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey='Tyrant Toddler' modeKey='Adventure License' defaultBossId='51000004' />
                                <BossDisplay bossKey='Deformed Inferior Core' modeKey='Adventure License' defaultBossId='51000005' labelFilter={"Weekly Conquest - Tyrant Toddler"} />
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Only takes WG damage from Burst Skills, Dual Attacks, and Skill Chains.",
                                "{C/Healer} and {C/Defender} allies get +50% Speed and deal increased damage based on Defense."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ToddlerALTeams.toddlerAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="i7HvX6Gzic8" title="Tyrant Toddler - Adventure License - Stage 10 - 1 run clear" author="XuRenChao" date="11/08/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
