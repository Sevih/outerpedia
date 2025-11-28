'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ppuEpsilonALTeamsData from './ppuEpsilonAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const ppuEpsilonALTeams = ppuEpsilonALTeamsData as Record<string, TeamData>

export default function PpuEpsilonGuide() {
    return (
        <GuideTemplate
            title="Planet Purification Unit & Epsilon Adventure License Guide"
            introduction="Planet Purification Unit and its Epsilon minions feature constant resurrection mechanics. Kill both Epsilon adds first to remove the main boss's damage reduction and enable WG damage. Wait for the boss ultimate before killing foes together. Can be cleared in 1-2 attempts. Verified up to stage 10."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey='Planet Purification Unit' modeKey='Adventure License' defaultBossId='51000015' />
                                <BossDisplay bossKey='Epsilon' modeKey='Adventure License' defaultBossId='51000016' />
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "Kill both Epsilon miniboss first. While any Epsilon is alive, the main boss takes reduced damage and is immune to WG damage.",
                                    "All enemies can resurrect fallen allies - wait for the boss ultimate before killing foes together.",
                                    "When Epsilon dies, it reduces the other adds' HP by 30-70%.",
                                    "The main boss's ultimate resurrects all fallen allies with enhanced stats - wait for the boss ultimate before killing foes."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ppuEpsilonALTeams.ppuEpsilonAL} defaultStage="Classic Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="X-ZpolvLR5I"
                                title="Planet Purification Unit Epsilon - Adventure License - Stage 10 - 1 run clear (Auto)"
                                author="XuRenChao"
                                date="01/10/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
