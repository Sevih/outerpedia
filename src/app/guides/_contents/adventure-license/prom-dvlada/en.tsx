'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import VladaALTeamsData from './VladaAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const VladaALTeams = VladaALTeamsData as Record<string, TeamData>

export default function VladaGuide() {
    return (
        <GuideTemplate
            title="Demiurge Vlada Adventure License Guide"
            introduction="Demiurge Vlada and Drakhan heal 15% HP when inflicting debuffs and deal increased damage based on total debuff count. {D/BT_DOT_CURSE} and {D/BT_FIXED_DAMAGE} are allowed and uncapped. This setup typically requires 2 attempts."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey='Vlada' modeKey='Challenge' defaultBossId='50000006' labelFilter={"Supreme Adventurer Promotion Challenge 1"}/>
                                <BossDisplay bossKey='Drakhan' modeKey='Challenge' defaultBossId='50000007' labelFilter={"Supreme Adventurer Promotion Challenge 1"}/>
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "Both enemies heal 15% of all allies' HP when inflicting debuffs.",
                                    "Both enemies deal increased damage based on total debuff count on the target.",
                                    "{D/BT_DOT_CURSE} and {D/BT_FIXED_DAMAGE} are allowed and uncapped."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={VladaALTeams.vladaAL} defaultStage="Curse Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="JIx2mVtXufA"
                                title="Demiurge Vlada - Adventure License: Promotion Challenge"
                                author="Sevih"
                                date="09/07/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
