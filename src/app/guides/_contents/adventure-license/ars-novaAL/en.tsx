'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ArsNovaALTeamsData from './ArsNovaAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const ArsNovaALTeams = ArsNovaALTeamsData as Record<string, TeamData>

export default function ArsNovaGuide() {
    return (
        <GuideTemplate
            title="Ars Nova Adventure License Guide"
            introduction="Ars Nova Adventure License features the same skills as Special Request Stage 12. This encounter can be consistently cleared in a single attempt with the right team composition. The strategy has been verified up to stage 10."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey="Ars Nova" modeKey='Adventure License' defaultBossId='51000024' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "Same skills as Special Request Stage 12.",
                                    "Only {E/Dark} units deal full WG damage - non-dark units deal 50% less WG damage.",
                                    "The boss does not take WG damage when your team has 150+ CP. Keep your CP below this threshold.",
                                    "The boss summons Inferior Cores after each attack. Each surviving core increases the boss's fixed damage by 1500.",
                                    "Killing cores grants 15 CP each - useful for chain skills but be careful not to exceed 150 CP.",
                                    "At 30% HP, the boss enrages for 3 turns and then uses Cantata dealing lethal damage. Defeat it or break it before Cantata triggers.",
                                    "If the boss enrages within 4 turns of battle start, your team gains 80 CP - this can help trigger chain skills faster."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ArsNovaALTeams.arsNovaAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="Gb-649eighM"
                                title="Ars Nova - Adventure License - Stage 10 - 1 run clear"
                                author="Sevih"
                                date="10/07/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
