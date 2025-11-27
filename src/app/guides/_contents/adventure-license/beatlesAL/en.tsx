'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
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
                                    "Same skills as Special Request Stage 12.",
                                    "Only {E/Fire} units deal full damage - non-fire units deal reduced damage and take increased damage from both bosses.",
                                    "Mek'Ril greatly reduces all damage taken while alive. Kill Mek'Ril first to remove this protection.",
                                    "When Mek'Ril dies, Dek'Ril gains {B/BT_INVINCIBLE} and {B/BT_STAT|ST_ATK} for 1 turn - time your burst accordingly.",
                                    "Dek'Ril gains {B/BT_STAT|ST_AVOID} when hit by AoE attacks. Avoid using non-chain AoE skills.",
                                    "When Dek'Ril evades, he takes no WG damage and counterattacks with Atlas (AoE + {D/BT_DOT_POISON} + barrier).",
                                    "At 70% HP, Dek'Ril enrages for 4 turns. When enrage ends, he uses Actaeon dealing heavy single-target damage and inflicting irremovable {D/BT_SEALED_RECEIVE_HEAL} on all enemies.",
                                    "If Dek'Ril enrages within 2 turns of battle start, your team gains 80 CP."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={BeatlesALTeams.beatlesAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="mx8ml6X_RZI"
                                title="Dek'ril & Mek'ril - Adventure License - Stage 10 - 1 run clear (Auto)"
                                author="XuRenChao"
                                date="19/08/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
