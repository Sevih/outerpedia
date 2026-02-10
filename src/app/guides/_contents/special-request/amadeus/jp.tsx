'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import AmadeusTeamsData from './Amadeus.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const AmadeusTeams = AmadeusTeamsData as Record<string, TeamData>

export default function Amadeus13Guide() {
    return (
        <GuideTemplate
            title="アマデウス特殊依頼攻略ガイド"
            introduction="アマデウスはデバフ管理と戦略的なキャラクター選択が求められる高難度ボスです。デバフが付与されていない状態では弱点ゲージダメージが無効化され、免疫を無視するランダムデバフを付与してくるため、クレンズとデバフの付与が攻略の鍵となります。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay bossKey='Amadeus' modeKey='Special Request: Identification' defaultBossId='407600962' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "デバフがない状態では{D/BT_WG_REVERSE_HEAL}が無効。常にデバフを付与し続けてください。",
                                "{B/BT_IMMUNE}を無視する{D/BT_RANDOM}を付与。付与後のクレンズが重要です。",
                                "非攻撃スキルを使用するとボスに{D/BT_STAT|ST_CRITICAL_RATE_IR}が付与されます。非攻撃スキル持ちのキャラクターは使用しないでください。",
                                "{D/BT_SEALED}無効。",
                                "ボスは毎ラウンド、パーティのデバフを1ターン延長します。クレンズを計画的に行いましょう。",
                                "ボスのバフはKuroによって長時間のデバフに変換できます。",
                                "{E/Light}ユニットのみWGダメージを与えられます。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={AmadeusTeams.amadeusSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="2lbN-rK89xI" title="アマデウス13 – クリアラン映像" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
