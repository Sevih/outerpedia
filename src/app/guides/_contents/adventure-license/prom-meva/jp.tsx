'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import EvaALTeamsData from './EvaAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const EvaALTeams = EvaALTeamsData as Record<string, TeamData>

export default function MonadEvaPromotionGuide() {
    return (
        <GuideTemplate
            title="モナド・エヴァ 昇級チャレンジ ガイド"
            introduction="{P/Monad Eva}と{P/K}が登場する特級冒険者昇級チャレンジ。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey='Eva' modeKey='Challenge' defaultBossId='50000008' />
                                <BossDisplay bossKey='K' modeKey='Challenge' defaultBossId='50000009' />
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "エヴァは単体攻撃を受けるとWGダメージを無効化し、受けるダメージを軽減する。全体攻撃を使用すること。",
                                    "{B/BT_CALL_BACKUP}のダメージが非常に高いため、耐えられるキャラか蘇生持ちを編成すること。",
                                    "両ボスの速度は220なので、全キャラを240以上にすること。",
                                    "ボスには{D/BT_DOT_CURSE}と{D/BT_FIXED_DAMAGE}が有効で、上限なし。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={EvaALTeams.evaAL} defaultStage="Fixed Damage Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="AOhLXfgLUzM"
                                title="モナド・エヴァ - 昇級チャレンジ"
                                author="XuRenChao"
                                date="09/06/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
