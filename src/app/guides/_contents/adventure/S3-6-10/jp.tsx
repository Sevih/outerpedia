'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function AncientFoeGuide() {
    return (
        <GuideTemplate
            title="古の敵攻略ガイド"
            introduction="古の敵は呪いデバフを付与し、HP70%以下のターゲットを免疫を無視して凍結させる危険なボスです。敵の行動10回ごとに激怒フェーズで強力なバフを獲得し、解除不可の呪い中断効果を付与します。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Frozen Dragon of Phantasm Harshna'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4286026'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "ボスが{B/BT_STAT|ST_BUFF_CHANCE}を獲得するのを防ぐために{D/BT_SEALED}を持っていきましょう。",
                                "{D/BT_DOT_CURSE}と{D/BT_FREEZE}に対処するために{B/BT_IMMUNE}と{B/BT_REMOVE_DEBUFF}を持っていきましょう。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                        </>
                    ),
                },
            }}
        />
    )
}
