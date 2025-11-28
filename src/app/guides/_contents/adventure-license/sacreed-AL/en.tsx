'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import SacreedALTeamsData from './SacreedAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const SacreedALTeams = SacreedALTeamsData as Record<string, TeamData>

export default function SacreedGuardianGuide() {
    return (
        <GuideTemplate
            title="Sacreed Guardian Adventure License Guide"
            introduction="Sacreed Guardian Adventure License features the same skills as Special Request Stage 12. The boss gains Invincibility when ending its turn with a buff, making {D/BT_REMOVE_BUFF} or {D/BT_STUN} lock essential. This encounter can be cleared in 1 to 2 attempts with the right team composition. The strategy has been verified up to stage 10."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey='Sacreed Guardian' modeKey='Adventure License' defaultBossId='51000021' />
                                <BossDisplay bossKey='Deformed Inferior Core' modeKey='Adventure License' defaultBossId='51000022' labelFilter={"Weekly Conquest - Sacreed Guardian"} />
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "If the boss ends its turn with any buff, it inflicts {D/BT_STUN} on all non-{C/Healer} units and gains {B/BT_INVINCIBLE}. Use {D/BT_REMOVE_BUFF} or {D/BT_STUN} to prevent this.",
                                    "Boss enrages every 4 turns, gaining irremovable Attack and damage reduction buffs."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={SacreedALTeams.sacreedAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="1ui7TcwD7po"
                                title="Sacreed Guardian - Adventure License - Stage 10 - 1 run clear (Auto)"
                                author="XuRenChao"
                                date="06/10/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
