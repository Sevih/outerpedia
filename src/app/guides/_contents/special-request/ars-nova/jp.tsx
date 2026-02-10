'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ArsNovaTeamsData from './Ars-Nova.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const ArsNovaTeams = ArsNovaTeamsData as Record<string, TeamData>

export default function ArsNova13Guide() {
    return (
        <GuideTemplate
            title="アルスノヴァ特殊依頼攻略ガイド"
            introduction="アルスノヴァはバフ管理とAoEダメージによるコア処理が求められます。ボスは{B/BT_STAT|ST_COUNTER_RATE}バフを獲得し、除去または奪取する必要があります。毎ターン固定ダメージが増加し、チェインゲージが150以上になると弱点ゲージダメージを受けなくなります。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay bossKey='Ars Nova' modeKey='Special Request: Identification' defaultBossId='407600862' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "{E/Dark}ユニットのみフルWGダメージを与えられます。闇以外のユニットはWGダメージが50%減少します。",
                                "チームのCPが150以上の場合、ボスはWGダメージを受けません。CPをこの閾値以下に保ちましょう。",
                                "ボスは攻撃するたびにインフェリアコアを召喚します。生存しているコア1体につき、ボスの固定ダメージが1500増加します。",
                                "コアを倒すとCPが15ずつ減少します。",
                                "HP30%で3ターンの激怒状態に入り、その後カンタータで致命的なダメージを与えます。発動前に倒すかブレイクしてください。",
                                "戦闘開始から4ターン以内に激怒した場合、チームはCP80を獲得します。チェインスキルの早期発動に活用できます。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ArsNovaTeams.arsNovaSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="vsR7eGIbuFE" title="アルスノヴァ13 – クリアラン映像" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
