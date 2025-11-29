'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import BossDisplay from '@/app/components/BossDisplay'
import DasteiALTeamsData from './DasteiAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'
import CombatFootage from '@/app/components/CombatFootage'

const DasteiALTeams = DasteiALTeamsData as Record<string, TeamData>

export default function DasteiPromotionGuide() {
    return (
        <GuideTemplate
            title="デミウルゴス アステ 昇級チャレンジ ガイド"
            introduction="首席冒険者昇級チャレンジ（{P/Demiurge Astei}）。{D/BT_STONE}を付与し、{D/BT_STONE_IR}に変換可能。HPが50%以下で狂暴化し、3ターン後に全滅攻撃。{D/BT_DOT_CURSE}または{D/BT_FIXED_DAMAGE}チームでダメージ軽減を無視。通常1回でクリア可能。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey='Astei' modeKey='Challenge' defaultBossId='50000002' />
                                <BossDisplay bossKey='Sterope' modeKey='Challenge' defaultBossId='50000003' />
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "ターン終了時にランダムな敵に{D/BT_STONE}を付与。{D/BT_STONE_IR}に変換可能（6ターン）。",
                                    "HPが50%で狂暴化。3ターン後に全滅攻撃。",
                                    "{D/BT_DOT_CURSE}または{D/BT_FIXED_DAMAGE}でダメージ軽減を無視。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={DasteiALTeams.dasteiAL} defaultStage="Curse Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage />
                        </>
                    ),
                },
            }}
        />
    )
}
