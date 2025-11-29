'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import DahliaALTeamsData from './DahliaAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const DahliaALTeams = DahliaALTeamsData as Record<string, TeamData>

export default function DahliaGuide() {
    return (
        <GuideTemplate
            title="Dahlia Adventure License Guide"
            introduction="Dahlia has a 25-turn limit. Unless your team can consistently deal between 39,296 and 58,945 damage per turn, the most reliable approach is DoT with {D/BT_DOT_2000092} or {D/BT_DOT_BURN}. Damage taken is capped at 6% of her Max Health per attack."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey='Dahlia' modeKey='Challenge' defaultBossId='50000010' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "Damage taken per attack is capped at 6% of her Max Health.",
                                    "Boss counterattacks with S1 when taking a critical hit.",
                                    "Boss is immune to {D/BT_DOT_CURSE} and {D/BT_FIXED_DAMAGE} so use {D/BT_DOT_2000092} or {D/BT_DOT_BURN} to bypass the damage cap.",
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={DahliaALTeams.dahliaAL} defaultStage="G.Beth Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="iOvGnQDYaCE"
                                title="Gnosis Dahlia - Adventure License: Promotion Challenge"
                                author="XuRenChao"
                                date="25/08/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
