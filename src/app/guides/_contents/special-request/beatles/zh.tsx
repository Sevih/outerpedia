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
            title="德克里尔&梅克里尔特殊委托攻略指南"
            introduction="如果使用非连锁的AoE技能，BOSS会获得{B/BT_STAT|ST_DEF}增益。推荐能施加{D/BT_REMOVE_BUFF}或{D/BT_STEAL_BUFF}的角色和单体DPS。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
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
                                "使用非连锁的AoE技能会给BOSS提供{B/BT_STAT|ST_DEF}。",
                                "角色被{D/BT_DOT_POISON}影响时，BOSS会在行动后立即反击。",
                                "主BOSS（右侧）是唯一攻击的。左侧BOSS持续增益{B/BT_STAT|ST_ATK}。",
                                "如果左侧BOSS被击杀，主BOSS获得{B/BT_INVINCIBLE}和{B/BT_STAT|ST_ATK}。",
                                "强烈推荐能施加{D/BT_REMOVE_BUFF}或{D/BT_STEAL_BUFF}的角色。",
                                "集中单体DPS以避免触发{B/BT_STAT|ST_DEF}。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={BeatlesTeams.beatlesSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="eQmB1Uw9qL8" title="德克里尔&梅克里尔战斗录像" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
