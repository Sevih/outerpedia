'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import BossDisplay from '@/app/components/BossDisplay'
import DasteiALTeamsData from './DasteiAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'
import CombatFootage from '@/app/components/CombatFootage'

const DasteiALTeams = DasteiALTeamsData as Record<string, TeamData>

export default function DasteiPromotionGuide() {
    return (
        <GuideTemplate
            title="Demiurge Astei Promotion Challenge Guide"
            introduction="Senior Adventurer Promotion Challenge featuring {P/Demiurge Astei}. Applies {D/BT_STONE} and can convert it to {D/BT_STONE_IR}. Enrages at 50% HP with a team wipe after 3 turns. Use {D/BT_DOT_CURSE} or {D/BT_FIXED_DAMAGE} teams to bypass damage reduction. Typically cleared in a single attempt."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey='Astei' modeKey='Challenge' defaultBossId='50000002' />
                                <BossDisplay bossKey='Sterope' modeKey='Challenge' defaultBossId='50000003' />
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "Applies {D/BT_STONE} to a random enemy at end of turn. Can convert to {D/BT_STONE_IR} for 6 turns.",
                                    "Enrages at 50% HP. Wipes the team when Enrage ends after 3 turns.",
                                    "Use {D/BT_DOT_CURSE} or {D/BT_FIXED_DAMAGE} to bypass the damage reduction."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={DasteiALTeams.dasteiAL} defaultStage="Curse Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage />
                        </>
                    ),
                },
            }}
        />
    )
}
