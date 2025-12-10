'use client'

import { useState } from 'react'
import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import MiniBossDisplay from '@/app/components/MiniBossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'


export default function LeoGuide() {
    const [selectedMode, setSelectedMode] = useState('Story (Hard)')

    return (
        <GuideTemplate
            title="レオ攻略ガイド"
            introduction="レオは強力なシールドを獲得し、防御力に基づいてダメージを増加させる防御型ボスです。バフ状態でのS3は壊滅的なAoEダメージを与えるため、バフ管理が重要です。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Leo'
                                modeKey='Story (Hard)'
                                defaultBossId='400401111'
                                onModeChange={setSelectedMode}
                            />
                            <MiniBossDisplay
                                bosses={[
                                    { bossKey: 'Alpha', defaultBossId: '400401011' }
                                ]}
                                modeKey='Story (Hard)'
                                controlledMode={selectedMode}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "{B/BT_REMOVE_DEBUFF}や{B/BT_IMMUNE}を持参してAlphaを無効化しましょう。",
                                "{D/BT_STEAL_BUFF} {D/BT_SEALED} {D/BT_REMOVE_BUFF}を持参してレオのバフを阻止しましょう。",
                                "どの方法を使用しても、レオがS3を使用する時にバフがかかっていないことを確認してください。"
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
