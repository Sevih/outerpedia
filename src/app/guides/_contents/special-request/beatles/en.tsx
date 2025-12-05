'use client'

import { useState, useCallback } from 'react'
import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import MiniBossDisplay from '@/app/components/MiniBossDisplay'
import BeatlesTeamsData from './Beatles.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const BeatlesTeams = BeatlesTeamsData as Record<string, TeamData>

export default function BeatlesGuide() {
    const [selectedMode, setSelectedMode] = useState('Special Request: Identification')
    const [miniBossId, setMiniBossId] = useState('407600462')

    const handleBossChange = useCallback((dekrilId: string) => {
        // Dek'Ril IDs are 4076003XX, Mek'Ril IDs are 4076004XX (just +100)
        const mekrilId = String(Number(dekrilId) + 100)
        setMiniBossId(mekrilId)
    }, [])

    return (
        <GuideTemplate
            title="Dek'Ril & Mek'Ril Special Request Guide"
            introduction="This boss's main gimmick is evasion. If you use AoE skills that aren't chain skills, it will gain an evasion buff. Characters that can inflict {D/BT_STAT|ST_AVOID} are recommended, along with single-target DPS."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay
                                bossKey="Dek'Ril"
                                modeKey='Special Request: Identification'
                                onModeChange={setSelectedMode}
                                onBossChange={handleBossChange}
                                defaultBossId='407600362' />
                            <MiniBossDisplay
                                bosses={[
                                    { bossKey: "Mek'Ril", defaultBossId: miniBossId }
                                ]}
                                modeKey='Special Request: Identification'
                                controlledMode={selectedMode}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "If you use AoE skills that aren't chain skills, boss gains an evasion buff.",
                                "If boss evades an attack, it counterattacks and inflicts {D/BT_DOT_POISON}.",
                                "Main boss (right side) is the only one attacking. The left boss constantly buffs evasion.",
                                "If the left boss is killed, main boss gains {B/BT_INVINCIBLE}.",
                                "Characters that can inflict {D/BT_STAT|ST_AVOID} are highly recommended.",
                                "Focus on single-target DPS to avoid triggering evasion buffs."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={BeatlesTeams.beatlesSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="eQmB1Uw9qL8" title="Dek'Ril & Mek'Ril Combat Footage" author="Sevih" date="01/01/2024" />
                        </>
                    ),
                },
            }}
        />
    )
}
