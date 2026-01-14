'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'
import CombatFootage from '@/app/components/CombatFootage'

export default function NellaGuide() {
    return (
        <GuideTemplate
            title="三つの鳴き声 攻略ガイド"
            introduction="三つの鳴き声は、弱体効果が適用されていない場合にほぼ無敵になる防御型ボスです。チーム全体に常時バフを維持して解除不可の{D/BT_DOT_BURN_IR}を防ぎ、{D/BT_FREEZE}を適用してダメージ軽減を無効化し、チェーンアタックバーストを決めることが重要です。ボスは被弾時に行動ゲージが急速に増加し、毎ターン弱体効果を解除するため、正確なタイミングが不可欠です。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Three Cries'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4114006'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "ボスに放つ前に、可能な限り多くのチェーンポイントを蓄積する",
                                "S2/S3攻撃の前にバフを準備して{D/BT_DOT_BURN}を防ぐ",
                                "すべてのチェーンアタックを開始してブレイクする前に{D/BT_FREEZE}を適用する",
                                "チームのスピードを調整し、チェーンアタック開始前に全ユニットが100%優先度に到達するようにする。これにより、被弾時に行動ゲージを獲得してもボスが割り込むのを防ぐ（1ヒットあたり20%獲得）",
                                "{I-T/Sage's Charm} +10は、チェーンの最後のユニットが装備している場合、チェーンアタックダメージを50%増加させる",
                                "{E/Light}と{E/Dark}ユニットの使用を避け、ボスが自身を浄化するのを防ぐ"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="i2ok2KIpvsQ"
                                title="Three Cries - Story Hard 4-1-10 clear (Auto) - by XuRenChao"
                                author="XuRenChao"
                                date="13/01/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
