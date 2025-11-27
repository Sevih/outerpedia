'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ForestKingALTeamsData from './ForestKingAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const ForestKingALTeams = ForestKingALTeamsData as Record<string, TeamData>

export default function ForestKingGuide() {
    return (
        <GuideTemplate
            title="Forest King Adventure License Guide"
            introduction="Forest King Adventure License features straightforward mechanics with debuff-focused attacks. Can be consistently cleared in a single attempt with proper team composition. Verified up to stage 10."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey='Forest King' modeKey='Adventure License' defaultBossId='51000017' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "Deals increased damage to {D/BT_STUN} targets with ultimate skill.",
                                    "When hit, reduces buff duration on all enemies by 1 turn.",
                                    "Greatly reduces damage taken from {C/Striker} enemies, but increases damage taken from {C/Mage} and {C/Ranger} enemies.",
                                    "{E/Dark} units suffer reduced {D/BT_STAT|ST_CRITICAL_RATE_IR}."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ForestKingALTeams.forestKingAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="o3-ytts1Kos"
                                title="Forest King - Adventure License - Stage 10 - 1 run clear (Auto)"
                                author="XuRenChao"
                                date="26/08/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
