'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function NellaGuide() {
    return (
        <GuideTemplate
            title="ネラ攻略ガイド"
            introduction="ネラはダメージを与えるために高い貫通力が必要な非常に難しいボスです。解除不可のデバフ強化と封印中断効果を付与し、30回の行動ごとに激怒してチーム全体を処刑します。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Nella'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4500352'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "固有の貫通力を持つユニットと貫通力ベースのビルドが必要です。",
                                "ボスがブレイク寸前の時に{D/BT_STAT|ST_PIERCE_POWER_RATE}を解除するために{B/BT_REMOVE_DEBUFF}も必要です。"
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
