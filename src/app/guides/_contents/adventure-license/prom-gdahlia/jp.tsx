'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import DahliaALTeamsData from './DahliaAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const DahliaALTeams = DahliaALTeamsData as Record<string, TeamData>

export default function DahliaGuide() {
    return (
        <GuideTemplate
            title="ダリア アドベンチャーライセンス ガイド"
            introduction="ダリアには25ターンの制限があります。毎ターン39,296～58,945のダメージを安定して与えられない場合、{D/BT_DOT_2000092}や{D/BT_DOT_BURN}によるDoTが最も確実な攻略法です。1回の攻撃で受けるダメージは最大HPの6%が上限です。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay bossKey='Dahlia' modeKey='Challenge' defaultBossId='50000010' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "1回の攻撃で受けるダメージは最大HPの6%が上限。",
                                    "会心ダメージを受けた場合、S1で反撃する。",
                                    "ボスは{D/BT_DOT_CURSE}と{D/BT_FIXED_DAMAGE}に免疫があるため、{D/BT_DOT_2000092}や{D/BT_DOT_BURN}でダメージ上限を回避。",
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={DahliaALTeams.dahliaAL} defaultStage="G.Beth Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="iOvGnQDYaCE"
                                title="ダリア - アドベンチャーライセンス：昇級チャレンジ"
                                author="XuRenChao"
                                date="25/08/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
