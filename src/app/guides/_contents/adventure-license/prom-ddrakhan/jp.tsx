'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import BossDisplay from '@/app/components/BossDisplay'
import DdrakhanALTeamsData from './DdrakhanAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import CombatFootage from '@/app/components/CombatFootage'
import { recommendedCharacters } from './recommendedCharacters'

const DdrakhanALTeams = DdrakhanALTeamsData as Record<string, TeamData>

export default function DdrakhanPromotionGuide() {
    return (
        <GuideTemplate
            title="デミウルゴス ドレイカーン 昇級チャレンジ ガイド"
            introduction="一流冒険者昇級チャレンジ、{P/Demiurge Drakhan}と{P/Vlada}が登場。ゆっくり進むのがポイント（無敵、復活、蘇生）。{B/BT_INVINCIBLE_IR}フェーズ中にCPを溜めるために{I-T/Sage's Charm}がおすすめ。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey='Drakhan' modeKey='Challenge' defaultBossId='50000004' labelFilter={"First-Rate Adventurer Promotion Challenge"}/>
                                <BossDisplay bossKey='Vlada' modeKey='Challenge' defaultBossId='50000005' labelFilter={"First-Rate Adventurer Promotion Challenge"}/>
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "ドレイカーンは戦闘開始時と敵を倒した時に、味方全体に{B/BT_INVINCIBLE_IR}（3ターン）を付与。",
                                    "ドレイカーンへの会心攻撃を避けること - 必殺技のクールダウンがリセットされ、行動ゲージが35%上昇。",
                                    "ドレイカーンの必殺技は対象のHPが30%以下なら即死させる。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={DdrakhanALTeams.ddrakhanAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="EW0F4F3_5YY"
                                title="一流昇級 vs デミドレイカーン クリアガイド！"
                                author="Adjen"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
