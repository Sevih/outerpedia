'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ChimeraALTeamsData from './ChimeraAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const ChimeraALTeams = ChimeraALTeamsData as Record<string, TeamData>

export default function UnidentifiedChimeraGuide() {
    return (
        <GuideTemplate
            title="Unidentified Chimera Adventure License Guide"
            introduction="Unidentified Chimera Adventure License features the same skills as Special Request Stage 12. Can be consistently cleared in 1 attempt with the right team composition. Verified up to stage 10."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey='Unidentified Chimera' modeKey='Adventure License' defaultBossId='51000006' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "Boss removes 2 debuffs per turn, so avoid relying only on debuffs.",
                                    "Critical Damage is reduced by 85% for all units."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ChimeraALTeams.chimeraAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="lil6XEE0VUE"
                                title="Unidentified Chimera - Adventure License - Stage 10 - 1 run clear (Auto)"
                                author="XuRenChao"
                                date="25/11/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
