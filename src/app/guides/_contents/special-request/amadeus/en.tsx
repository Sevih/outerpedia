'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import AmadeusTeamsData from './Amadeus.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const AmadeusTeams = AmadeusTeamsData as Record<string, TeamData>

export default function Amadeus13Guide() {
    return (
        <GuideTemplate
            title="Amadeus Special Request Guide"
            introduction="Amadeus is a challenging encounter that requires careful debuff management and strategic character selection. The boss is immune to weakness gauge damage unless debuffed and applies random debuffs that bypass immunity, making cleansing and debuff application crucial for success. Can be cleared in 1-2 attempts per stage with proper debuff management."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey='Amadeus' modeKey='Special Request: Identification' defaultBossId='407600962' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Immune to {D/BT_WG_REVERSE_HEAL} if not debuffed. Keep applying debuffs constantly.",
                                "Applies random debuffs that bypass {D/BT_IMMUNE}. Cleansing is crucial after they land.",
                                "Using non-attack skills gives boss {D/BT_STAT|ST_CRITICAL_RATE_IR}. Do not use characters with non-attack skills.",
                                "Immune to {D/BT_SEALED}.",
                                "Boss extends party debuffs by 1 turn each round. Plan your cleanses accordingly.",
                                "Boss buffs can be reversed by Kuro into long-duration debuffs. Use S3 after boss self-buffs.",
                                "Only takes WG damage from {E/Light} units.",
                                "Dianne is ideal as both her heals are attacks, and she can cleanse without triggering boss mechanic.",
                                "Drakhan and Gnosis Beth are MVPs thanks to their repeated debuffs.",
                                "Akari works even without {D/BT_SEALED} thanks to her broad debuff kit."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={AmadeusTeams.amadeusSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="2lbN-rK89xI" title="Amadeus 13 – Clean Run Showcase" author="Sevih" date="01/01/2024" />
                        </>
                    ),
                },
            }}
        />
    )
}
