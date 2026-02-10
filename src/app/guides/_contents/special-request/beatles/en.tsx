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
            introduction="If you use AoE skills that aren't chain skills, this boss will gain {B/BT_STAT|ST_DEF} buffs. Characters that can inflict {D/BT_REMOVE_BUFF} or {D/BT_STEAL_BUFF} are highly recommended, along with single-target DPS."
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
                                "If you use AoE skills that aren't chain skills, boss gains an {B/BT_STAT|ST_DEF}.",
                                "If a character is afflicted with {D/BT_DOT_POISON}, the boss will counterattacks just after he played.",
                                "Main boss (right side) is the only one attacking. The left boss constantly buffs {B/BT_STAT|ST_ATK}.",
                                "If the left boss is killed, main boss gains {B/BT_INVINCIBLE} and {B/BT_STAT|ST_ATK}.",
                                "Characters that can inflict {D/BT_REMOVE_BUFF} or {D/BT_STEAL_BUFF} are highly recommended.",
                                "Focus on single-target DPS to avoid triggering {B/BT_STAT|ST_DEF}."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={BeatlesTeams.beatlesSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="eQmB1Uw9qL8" title="Dek'Ril & Mek'Ril Combat Footage" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
