'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'

export default function MaxwellGuide() {
    return (
        <GuideTemplate
            title="マクスウェル攻略ガイド"
            introduction="マクスウェルはオーブを倒すと即座にHPが3%まで減少するユニークなボスです。精密なターゲティングが重要です。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Maxwell'
                                modeKey='Story (Normal)'
                                defaultBossId='4104007'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "オーブを倒すとマクスウェルのHPが3%まで減少します。AoEダメージの使用は避けてください。"
                            ]} />
                        </>
                    ),
                },
            }}
        />
    )
}