'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import GustavALTeamsData from './GustavAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const GustavALTeams = GustavALTeamsData as Record<string, TeamData>

export default function GustavGuide() {
    return (
        <GuideTemplate
            title="Gustav Adventure License Guide"
            introduction="Orb management challenge with fixed damage mechanics. Can be cleared in 1-2 attempts. Verified up to stage 10."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey='Gustav' modeKey='Adventure License' defaultBossId='51000013' />
                            <BossDisplay bossKey='Spare Core' modeKey='Adventure License' defaultBossId='51000014' labelFilter={"Weekly Conquest - Gustav"} />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Orbs deal {D/BT_FIXED_DAMAGE} when attacked.",
                                "Use units with {B/BT_REMOVE_DEBUFF} or {B/BT_IMMUNE}.",
                                "Boss reduces damage taken when orbs are defeated.",
                                "Focus on single target damage to minimize orb retaliation.",
                                "{D/BT_IMMEDIATELY_BURN} ignores damage reduction from killing the orbs."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={GustavALTeams.gustavAL} defaultStage="Standard Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="U29t5k0bDfY" title="Gustav - Adventure License - Stage 10 - 1-run clear (Auto)" author="XuRenChao" date="19/08/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
