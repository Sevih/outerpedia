'use client'

import { useState } from 'react'
import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import MiniBossDisplay from '@/app/components/MiniBossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function HildeGuide() {
    const [selectedMode, setSelectedMode] = useState('Story (Hard)')

    return (
        <GuideTemplate
            title="ヒルデ攻略ガイド"
            introduction="ヒルデは援護の味方を呼び出し、倒れた仲間を蘇生する複雑なボスです。最初に回避した味方に解除不可の挑発を付与し、デバフのかかっていない味方を攻撃するとアクションゲージが満タンになります。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Hilde'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4500283'
                                labelFilter={"Top Fiend Officer"}
                                onModeChange={setSelectedMode}
                            />
                            <MiniBossDisplay
                                bosses={[
                                    { bossKey: 'Maxie', defaultBossId: '4500281' },
                                    { bossKey: 'Roxie', defaultBossId: '4500282' }
                                ]}
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                controlledMode={selectedMode}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "ボスからの大ダメージを生き残るためにダメージ軽減キャラクターを連れて行きましょう。",
                                "{D/BT_AGGRO}を受けてしまった場合、S1で回復できるヒーラーが役立ちます。"
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
