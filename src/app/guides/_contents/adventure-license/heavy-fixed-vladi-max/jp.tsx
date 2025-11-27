'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import VladiMaxALTeamsData from './VladiMaxAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const VladiMaxALTeams = VladiMaxALTeamsData as Record<string, TeamData>

export default function HeavyFixedVladiMaxGuide() {
    return (
        <GuideTemplate
            title="ブラッディマックス 冒険者ライセンスガイド"
            introduction="攻撃以外のスキルを受けるとHPが全回復する。会心ダメージでスタックが溜まる。ETamamo単騎またはロナチェーン戦略でクリア可能。ステージ10までクリア確認済み。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay bossKey='Vladi Max' modeKey='Adventure License' defaultBossId='51000030' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "敵が攻撃以外のスキルを使用するとHPが全回復する。",
                                "会心ダメージで2スタック獲得、非会心で1スタック減少。5スタック時にボスが行動すると{D/BT_KILL}。",
                                "会心ダメージではWGダメージを与えられない。",
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={VladiMaxALTeams.vladiMaxAL} defaultStage="ETamamo Carry" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="lpQkc37S0zo" title="固定砲台ブラッディマックス - 冒険者ライセンス - ステージ10 - 1回クリア (オート)" author="XuRenChao" date="01/10/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
