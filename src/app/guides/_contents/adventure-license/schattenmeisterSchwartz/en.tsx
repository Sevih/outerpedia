'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import SchattenmeisterSchwartzALTeamsData from './SchattenmeisterSchwartzAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const SchattenmeisterSchwartzALTeams = SchattenmeisterSchwartzALTeamsData as Record<string, TeamData>

export default function SchattenmeisterSchwartzGuide() {
    return (
        <GuideTemplate
            title="Schattenmeister Schwartz Adventure License Guide"
            introduction="Schattenmeister Schwartz inflicts irremovable {D/IG_Buff_Effect_Sealed_Interruption_D} and summons Shadow Beasts. The boss deals low damage when alone but increases damage while Shadow Beasts are alive. Focus on AoE to clear adds quickly. Verified up to stage 10."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey='Schattenmeister Schwartz' modeKey='Adventure License' defaultBossId='51000019' />
                                <BossDisplay bossKey='Shadow Beast Fire-Breather' modeKey='Adventure License' defaultBossId='51000020' labelFilter={"Weekly Conquest - Schattenmeister Schwartz"} />
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "Always inflicts irremovable {D/IG_Buff_Effect_Sealed_Interruption_D} on all enemies.",
                                    "Use AoE attacks to clear Shadow Beasts quickly."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={SchattenmeisterSchwartzALTeams.schattenmeisterSchwartzAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="glWpGZRH4xc"
                                title="Schattenmeister Schwartz - Adventure License - Stage 10 - 1 run clear (Auto)"
                                author="XuRenChao"
                                date="01/09/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
