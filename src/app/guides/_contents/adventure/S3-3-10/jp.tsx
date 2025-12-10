'use client'

import { useState } from 'react'
import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import MiniBossDisplay from '@/app/components/MiniBossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function FatalGuide() {
    const [selectedMode, setSelectedMode] = useState('Story (Hard)')
    return (
        <GuideTemplate
            title="フェイタル攻略ガイド"
            introduction="フェイタルはステルス中にほぼ無敵となり、大ダメージを与えて味方を蘇生させる致命的なアサシンボスです。火属性ヒーローを沈黙させ、行動ごとにすべての味方バフを延長します。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Fatal'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4500266'
                                onModeChange={setSelectedMode}
                            />
                            <MiniBossDisplay
                                bosses={[
                                    { bossKey: "Sand Soldier Khopesh", defaultBossId: '4102201' },
                                    { bossKey: "Sand Soldier Khopesh", defaultBossId: '4102201' }
                                ]}
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                controlledMode={selectedMode}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "{E/Fire}ヒーローの使用を避けましょう。",
                                "フェイタルが行動する前に敵に{D/BT_SEALED}を付与できる素早いヒーローを連れて行きましょう（約270スピード）。",
                                "{B/BT_STEALTHED}を解除するために{D/BT_STEAL_BUFF}または{D/BT_REMOVE_BUFF}を持つヒーローを連れて行きましょう。",
                                "{P/Caren}はS2が{B/BT_STEALTHED}中でもフェイタルをターゲットできるため、ここでのMVPです。"
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
