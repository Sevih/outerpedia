'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import BossDisplay from '@/app/components/BossDisplay'
import BeatlesALTeamsData from './BeatlesAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const BeatlesALTeams = BeatlesALTeamsData as Record<string, TeamData>

export default function DekrilMekrilGuide() {
    return (
        <GuideTemplate
            title="Dek'Ril & Mek'Ril Adventure License Guide"
            introduction="Dek'Ril & Mek'Ril Adventure License features the same skills as Special Request Stage 12. This sibling duo encounter can be consistently cleared in a single attempt with the right team composition. The strategy has been verified up to stage 9."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey="Dek'Ril" modeKey='Adventure License' defaultBossId='51000007' />
                                <BossDisplay bossKey="Mek'Ril" modeKey='Adventure License' defaultBossId='51000008' />
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "If you use AoE skills that aren't chain skills, boss gains an {B/BT_STAT|ST_DEF}.",
                                    "If a character is afflicted with {D/BT_DOT_POISON}, the boss will counterattacks just after he played.",
                                    "Main boss (right side) is the only one attacking. The left boss constantly buffs {B/BT_STAT|ST_ATK}.",
                                    "If the left boss is killed, main boss gains {B/BT_INVINCIBLE} and {B/BT_STAT|ST_ATK}.",
                                    "Characters that can inflict {D/BT_REMOVE_BUFF} or {D/BT_STEAL_BUFF} are highly recommended.",
                                    "Focus on single-target DPS to avoid triggering {B/BT_STAT|ST_DEF}."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={BeatlesALTeams.beatlesAL} defaultStage="Recommended Team" />
                        </>
                    ),
                },
            }}
        />
    )
}
