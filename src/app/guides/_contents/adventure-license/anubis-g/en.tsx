'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import AnubisALTeamsData from './AnubisAL.json'
import type { TeamData } from '@/types/team'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import TacticalTips from '@/app/components/TacticalTips'
import { recommendedCharacters } from './recommendedCharacters'
import MiniBossDisplay from '@/app/components/MiniBossDisplay'

const AnubisALTeams = AnubisALTeamsData as Record<string, TeamData>

export default function AnubisGuardianGuide() {
    return (
        <GuideTemplate
            title="Anubis Guardian Adventure License Guide"
            introduction="Anubis Guardian features unique mechanics including resurrecting adds every turn, extending all buffs and debuffs on self, and requiring Fire units for optimal damage. Non-fire units remove all debuffs on the boss and deal half weakness gauge damage. The boss enrages at 50% HP and deals lethal damage after 3 turns. Can typically be cleared in 1-2 attempts with proper Fire team composition."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey="Iota World's Giant God Soldier" modeKey='Adventure License' defaultBossId='51000031' />
                            <MiniBossDisplay
                                bosses={[
                                    { bossKey: 'Sand Soldier Khopesh', defaultBossId: '51000032' },
                                    { bossKey: 'Sand Soldier Spear', defaultBossId: '51000033' }
                                ]}
                                modeKey={['Weekly Conquest - Anubis Guardian']}
                                defaultModeKey='Weekly Conquest - Anubis Guardian'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "Only use {E/Fire} units - non-fire units remove all debuffs from the boss and deal 50% less WG damage.",
                                    "The boss resurrects all adds every turn after attacking. Focus damage on the boss, not the adds.",
                                    "All buffs and debuffs on the boss are extended by 1 turn at the start of each turn. {D/BT_DOT_BURN} stacks are very effective.",
                                    "No WG damage is dealt when only the boss is alive - you must keep at least one add alive.",
                                    "At 50% HP, the boss enrages and will deal lethal damage after 3 turns. Push through quickly.",
                                    "Your party's {B/BT_STAT|ST_CRITICAL_RATE} is reduced to 0% - don't rely on crit-based builds."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={AnubisALTeams.anubisAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="fU0UUuHswKM"
                                title="Anubis Guardian - Adventure License - Stage 10 - 1 run clear (Auto) - by XuRenChao"
                                author="XuRenChao"
                                date="22/09/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
