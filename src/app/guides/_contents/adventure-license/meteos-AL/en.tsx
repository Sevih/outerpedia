'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import MeteosALTeamsData from './MeteosAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const MeteosALTeams = MeteosALTeamsData as Record<string, TeamData>

export default function BlazingKnightMeteosGuide() {
    return (
        <GuideTemplate
            title="Blazing Knight Meteos Adventure License Guide"
            introduction="Blazing Knight Meteos Adventure License features the same skills as Special Request Stage 12, but only has the 1st enrage phase. Can be consistently cleared in 1 to 2 attempts with the right team composition. Verified up to stage 10."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey='Blazing Knight Meteos' modeKey='Adventure License' defaultBossId='51000012' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "Reduces WG damage taken from non-{E/Water} enemies by 50%.",
                                    "Boss deals reduced damage to targets with {B/BT_SHIELD_BASED_CASTER}.",
                                    "Use {B/BT_REMOVE_DEBUFF} to counter {D/BT_SEALED}."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={MeteosALTeams.meteosAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="Do7Vyjz3odI"
                                title="Blazing Knight Meteos - Adventure License - Stage 10 - 1 run clear"
                                author="XuRenChao"
                                date="11/08/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
