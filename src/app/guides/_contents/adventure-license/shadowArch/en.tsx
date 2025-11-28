'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ShadowArchALTeamsData from './ShadowArchAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const ShadowArchALTeams = ShadowArchALTeamsData as Record<string, TeamData>

export default function ShadowOfTheArchdemonGuide() {
    return (
        <GuideTemplate
            title="Shadow of the Archdemon Adventure License Guide"
            introduction="Shadow of the Archdemon reduces Speed to 0 for non-{E/Fire} units. The boss does not take WG damage while buffed, and applying any debuff restores its WG completely."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey='Shadow of the Archdemon' modeKey='Adventure License' defaultBossId='51000027' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "Only {E/Fire} units can act - non-{E/Fire} enemies have their Speed fully reduced.",
                                    "Does not take WG damage while buffed.",
                                    "Applying any debuff to the boss restores its WG completely.",
                                    "Inflicts {D/BT_STUN} for 5 turns on enemies with removable stat debuffs. This ignores Resilience."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ShadowArchALTeams.shadowArchAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="bRSHzurhoV0"
                                title="Shadow of the Archdemon - Adventure License - Stage 10 - 1 run clear (Auto)"
                                author="XuRenChao"
                                date="26/08/2024"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
