'use client'

import { useState, useCallback } from 'react'
import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import IronStretcherPOTeamsData from './IronStretcherPO.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'
import MiniBossDisplay from '@/app/components/MiniBossDisplay'

const IronStretcherPOTeams = IronStretcherPOTeamsData as Record<string, TeamData>

export default function IronStretcherGuide() {
    const [miniBossLabel, setMiniBossLabel] = useState('Iron Stretcher (Very Hard)')

    const handleBossChange = useCallback((bossId: string) => {
        const labelMap: Record<string, string> = {
            '51202001': 'Iron Stretcher (Very Hard)',
            '51201001': 'Iron Stretcher (Hard)',
            '51200001': 'Iron Stretcher (Normal)',
        }
        setMiniBossLabel(labelMap[bossId] || 'Iron Stretcher (Very Hard)')
    }, [])

    return (
        <GuideTemplate
            title="铁血伸张者 攻略指南"
            introduction="铁血伸张者每回合召唤增援，增援存活时不受WG伤害。Boss使用大招可获得5回合的{B/BT_INVINCIBLE}，因此夺取Buff和封印是关键策略。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Iron Stretcher'
                                modeKey='Pursuit Operation'
                                defaultBossId='51202001'
                                onBossChange={handleBossChange}
                            />
                            <MiniBossDisplay
                                bosses={[
                                    { bossKey: 'Irregular Machine Gun', labelFilter: miniBossLabel }
                                ]}
                                modeKey='Pursuit Operation'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "攻击后召唤机关枪异型怪。增援存活时，Boss不受WG伤害。",
                                "Boss使用大招可获得5回合的{B/BT_INVINCIBLE}。使用{D/BT_STEAL_BUFF}、{D/BT_REMOVE_BUFF}或{D/BT_SEALED}来应对。",
                                "{D/BT_DOT_CURSE}和固定伤害不超过5,000。",
                                "机关枪异型怪死亡时，对全体敌人施加1回合的{D/BT_SEALED}。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={IronStretcherPOTeams.ironStretcherPO} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="Enqp_g7xCqw" title="铁血伸张者 - 追击歼灭战 - 1次通关" author="Sevih" date="01/01/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
