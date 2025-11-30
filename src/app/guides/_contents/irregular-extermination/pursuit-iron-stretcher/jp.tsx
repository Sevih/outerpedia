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
            title="アイアンストレッチャー 攻略ガイド"
            introduction="アイアンストレッチャーは毎ターン増援を召喚し、増援が生存中はWGダメージを受けない。ボスはアルティメットで5ターンの{B/BT_INVINCIBLE}を獲得するため、バフ奪取や封印が重要な戦略となる。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
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
                                "攻撃後にイレギュラー機関銃を召喚する。増援が生存中、ボスはWGダメージを受けない。",
                                "ボスはアルティメットで5ターンの{B/BT_INVINCIBLE}を獲得する。{D/BT_STEAL_BUFF}、{D/BT_REMOVE_BUFF}、または{D/BT_SEALED}で対処せよ。",
                                "{D/BT_DOT_CURSE}と固定ダメージは5,000を超えない。",
                                "イレギュラー機関銃は死亡時、敵全体に1ターンの{D/BT_SEALED}を付与する。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={IronStretcherPOTeams.ironStretcherPO} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="Enqp_g7xCqw" title="アイアンストレッチャー - 追撃殲滅戦 - 1回クリア" author="Sevih" date="01/01/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
