'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import { WorldBossDisplay } from '@/app/components/boss'
import PrimordialSentinelTeamsData from './PrimordialSentinel.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { phase1Characters, phase2Characters } from './recommendedCharacters'
import GuideHeading from '@/app/components/GuideHeading'

const PrimordialSentinelTeams = PrimordialSentinelTeamsData as Record<string, TeamData>

const primordialSentinelNovember2025 = {
    boss1Key: 'Primordial Sentinel',
    boss2Key: 'Glorious Sentinel',
    boss1Ids: {
        'Normal': '4086007',
        'Very Hard': '4086009',
        'Extreme': '4086011'
    },
    boss2Ids: {
        'Hard': '4086008',
        'Very Hard': '4086010',
        'Extreme': '4086012'
    }
} as const

export default function PrimordialSentinelGuide() {
    return (
        <GuideTemplate
            title="始原の番人（栄光の番人）攻略ガイド"
            introduction="始原の番人は、チームの連携とタイミングが重要な2フェーズ制のワールドボスです。このガイドでは、エクストリームリーグまでの攻略方法を解説します。"
            defaultVersion="november2025"
            versions={{
                november2025: {
                    label: '2025年11月',
                    content: (
                        <>
                            <WorldBossDisplay config={primordialSentinelNovember2025} defaultMode="Extreme" />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                sections={[
                                    {
                                        title: "strategy",
                                        tips: [
                                            "この戦闘は行動順制御が全てです。フェーズ1では、行動順減少を最大限活用しましょう。",
                                            "フェーズ2では、ボスは行動順減少に免疫があるため、キャラクターをできるだけ速くする必要があります。",
                                            "スキルチェーンとCP生成のために賢者とローグのチャームを装備しましょう（ローグの会心率を忘れずに）。",
                                            "両フェーズで、{B/UNIQUE_DAHLIA_A}バフによる{D/BT_STAT|ST_SPEED}のために、少なくとも1人のヒーラーを編成しましょう。"
                                        ]
                                    },
                                    {
                                        title: "phase2",
                                        tips: [
                                            "チーム2に6凸の{P/Monad Eva}がいる場合、フェーズ1でCPを貯めてから終盤でチーム2に切り替えられます。",
                                            "{P/Monad Eva}が即座にボスに{D/BT_SEAL_ADDITIVE_ATTACK}を付与し、フェーズ1で貯めたCPを維持できます。"
                                        ]
                                    }
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList title="phase1" entries={phase1Characters} />
                            <RecommendedCharacterList title="phase2" entries={phase2Characters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={PrimordialSentinelTeams.november2025} defaultStage="Phase 1" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="4me_DqMftbs"
                                title="始原の番人 - ワールドボス - SSS - エクストリームリーグ"
                                author="Unknown"
                                date="01/11/2025"
                            />
                            <p className="mt-2 text-neutral-400 text-sm">
                                注：この動画はSSSエクストリームクリアを紹介しています。同じ戦略は低難易度にも適用できますが、一部のボスメカニクスが弱体化または無効化されている場合があります。エクストリームリーグ以前はスコアが無制限ではないため、フェーズ1でのチェーンポイント蓄積にそれほど集中する必要はありません。
                            </p>
                        </>
                    ),
                },
                july2024: {
                    label: '2024年7月',
                    content: (
                        <>
                            <TacticalTips
                                sections={[
                                    {
                                        title: "phase1",
                                        tips: [
                                            "{P/Valentine}のS3をできるだけ多く使用してください。",
                                            "{P/Iota}はS1のみを使用します。",
                                            "{P/Notia}は行動順プッシュのためにバフの稼働率を維持する必要があります。",
                                            "{P/Dianne}は{P/Iota}が最高ATKを持つ必要があり、S1で毎ターンプッシュします。",
                                            "P1でCPを貯め、{P/Iota}と{P/Valentine}の行動順減少でボスをロックダウンします。",
                                            "{P/Iota}を回復しないでください。自己消耗でHP1にさせます（迅速でSPDが上昇）。",
                                            "ボスを1回ブレイクし、WGを1-2に減らし、{P/Iota}のS3/S2B2で無敵を付与します。",
                                            "ブレイク後、ボスのHPが約120万で、10回のチェーン攻撃が準備できていることを確認してください。",
                                            "P1のダメージを閾値以上にプッシュしてP2ボスを出現させます。",
                                            "{P/Iota}（HP1、迅速）がP2ボスより先に行動します。チーム2に切り替えてください。"
                                        ]
                                    },
                                    {
                                        title: "phase2",
                                        tips: [
                                            "P2ボスはS2で{D/BT_DOT_LIGHTNING}を使用し、{P/Monad Eva}のS2で即座に解除します。",
                                            "解除 = 「ヒーラーアクション」であり、ボスに{D/BT_STAT|ST_SPEED}を付与します。",
                                            "チームは速度で勝り、ブレイク + コアエネルギーを除去できます。",
                                            "チェーン攻撃を連発してロックし、{P/Monad Eva}のS1でCP構築を補助します。"
                                        ]
                                    }
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <GuideHeading level={3}>重要な注意事項</GuideHeading>
                            <p className="text-neutral-300 mb-4">
                                この編成は6凸{'{P/Monad Eva}'}でのみ機能します。これを発見した<strong>Birdmouth</strong>に感謝します。
                                コアエネルギーバフは追加攻撃としてカウントされ、{'{P/Monad Eva}'}の戦闘開始時スキル封印でキャンセルできます。
                                これによりCPの損失を防ぎます。
                            </p>
                            <p className="text-neutral-300 mb-4">
                                代替案：フェーズ1中にチーム2に切り替えます。{'{E/Light}'}{'{E/Dark}'}ユニットはP1でWGを減少できないため、
                                チーム2に少なくとも1体の{'{E/Fire}'}{'{E/Water}'}{'{E/Earth}'}ユニットが必要です。これにより{'{P/Monad Eva}'}がP2に入る際にスキル封印を適用し、ローテーションを保護できます。
                            </p>
                            <p className="text-neutral-300">
                                別のオプション：{'{P/Stella}'}の代わりに{'{P/Demiurge Stella}'}を使用します。P1の終わりにチーム2に切り替え、1回のチェーンスキルで固定ダメージを発動してP2に移行します。
                            </p>
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="Kd-dKroOXEo"
                                title="栄光の番人 ワールドボス 2300万+ by Ducky"
                                author="Ducky"
                                date="01/07/2024"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
