'use client'

import { useState, useCallback } from 'react'
import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import MiniBossDisplay from '@/app/components/MiniBossDisplay'
import SacreedTeamsData from './Sacreed.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const SacreedTeams = SacreedTeamsData as Record<string, TeamData>

export default function SacreedGuardian13Guide() {
    const [miniBossId, setMiniBossId] = useState('404400462')

    // Mapping: Sacreed Guardian boss ID → Deformed Inferior Core boss ID
    const handleBossChange = useCallback((sacreedBossId: string) => {
        const bossIdMap: Record<string, string> = {
            '404400362': '404400462', // Stage 13
            '404400361': '404400461', // Stage 12
            '404400360': '404400460', // Stage 11
            '404400359': '404400459', // Stage 10
        }
        // Stage 9 et moins utilisent tous 404400450
        setMiniBossId(bossIdMap[sacreedBossId] || '404400450')
    }, [])

    return (
        <GuideTemplate
            title="圣域守护者特殊委托攻略指南"
            introduction="圣域守护者免疫{D/BT_SEALED}，需要使用{D/BT_REMOVE_BUFF}、{D/BT_STEAL_BUFF}或{D/BT_STATBUFF_CONVERT_TO_STATDEBUFF}。如果BOSS带有任何增益时迎来回合，会眩晕你的队伍并获得无敌。宝珠每回合给予3个增益，必须加以控制。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Sacreed Guardian'
                                modeKey='Special Request: Ecology Study'
                                defaultBossId='404400362'
                                onBossChange={handleBossChange}
                            />
                            <MiniBossDisplay
                                bosses={[
                                    { bossKey: 'Deformed Inferior Core', defaultBossId: miniBossId }
                                ]}
                                modeKey='Special Request: Ecology Study'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "免疫{D/BT_SEALED}。请使用{D/BT_STEAL_BUFF}、{D/BT_STATBUFF_CONVERT_TO_STATDEBUFF}或{D/BT_REMOVE_BUFF}代替。",
                                "BOSS带有增益时迎来回合，会对队伍施加{D/BT_STUN}并获得{B/BT_INVINCIBLE}。",
                                "战斗开始时用快速角色移除BOSS的初始{B/BT_STAT|ST_SPEED}增益。",
                                "第11阶段之前{C/Healer}角色不会被眩晕。",
                                "治疗是可选的。在BOSS获得增益之前专注于控制和爆发。",
                                "第12阶段：当{B/SYS_BUFF_REVENGE}、{B/BT_RUN_PASSIVE_SKILL_ON_TURN_END_DEFENDER_NO_CHECK}和{B/BT_STAT|ST_COUNTER_RATE}被触发时，BOSS会回复。",
                                "第13阶段：BOSS无效化{B/SYS_BUFF_REVENGE}、{B/BT_RUN_PASSIVE_SKILL_ON_TURN_END_DEFENDER_NO_CHECK}和{B/BT_STAT|ST_COUNTER_RATE}。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={SacreedTeams.sacreedSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="fLdbR9Sa7G0" title="圣域守护者13 – 通关录像" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
