'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import GustavALTeamsData from './GustavAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const GustavALTeams = GustavALTeamsData as Record<string, TeamData>

export default function GustavGuide() {
    return (
        <GuideTemplate
            title="グスタフ 冒険者ライセンス ガイド"
            introduction="固定ダメージメカニクスを伴うオーブ管理チャレンジ。1〜2回の試行でクリア可能。ステージ10まで検証済み。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay bossKey='Gustav' modeKey='Adventure License' defaultBossId='51000013' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "オーブは攻撃時に{D/BT_FIXED_DAMAGE}を与える。",
                                "{B/BT_REMOVE_DEBUFF}または{B/BT_IMMUNE}を持つユニットを使用。",
                                "ボスはオーブが倒された時、受けるダメージを減少させる。",
                                "オーブの反撃を最小限に抑えるため、単体ダメージに集中する。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={GustavALTeams.gustavAL} defaultStage="Standard Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="U29t5k0bDfY" title="グスタフ - 冒険者ライセンス - ステージ10 - 1回クリア (オート)" author="XuRenChao" date="19/08/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
