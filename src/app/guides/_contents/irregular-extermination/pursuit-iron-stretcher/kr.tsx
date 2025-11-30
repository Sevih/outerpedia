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
            title="아이언 스트레쳐 공략 가이드"
            introduction="아이언 스트레쳐는 매 턴 증원을 소환하며, 증원이 생존 중에는 WG 피해를 받지 않는다. 보스는 궁극기로 5턴의 {B/BT_INVINCIBLE}를 획득하므로, 버프 탈취와 봉인이 핵심 전략이다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
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
                                "공격 후 이레귤러 기관총을 소환한다. 증원이 생존 중에는 보스가 WG 피해를 받지 않는다.",
                                "보스는 궁극기로 5턴의 {B/BT_INVINCIBLE}를 획득한다. {D/BT_STEAL_BUFF}, {D/BT_REMOVE_BUFF}, 또는 {D/BT_SEALED}로 대응하라.",
                                "{D/BT_DOT_CURSE}와 고정 피해는 5,000을 초과하지 않는다.",
                                "이레귤러 기관총은 사망 시 적 전체에게 1턴의 {D/BT_SEALED}를 부여한다."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={IronStretcherPOTeams.ironStretcherPO} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="Enqp_g7xCqw" title="아이언 스트레쳐 - 추격 섬멸전 - 1회 클리어" author="Sevih" date="01/01/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
