'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function SphinxGuardianGuide() {
    return (
        <GuideTemplate
            title="スフィンクスガーディアン攻略ガイド"
            introduction="スフィンクスガーディアンはチームに少なくとも1人のレンジャーが必要な難しいボスです。S1でレンジャーを処刑し、レンジャーがいないチームは速度を0にされます。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Sphinx Guardian'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4144008'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "少なくとも1人の{C/Ranger}を使用しましょう。",
                                "{D/BT_COOL_CHARGE}の使用は避けましょう。",
                                "ボスは{D/BT_AGGRO}に弱いです。"
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
