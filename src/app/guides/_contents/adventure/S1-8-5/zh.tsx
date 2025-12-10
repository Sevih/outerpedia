'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'

export default function MaxwellGuide() {
    return (
        <GuideTemplate
            title="麦克斯韦攻略指南"
            introduction="麦克斯韦是一个独特的Boss，击杀光球会立即使麦克斯韦的HP降至3%，因此精准的目标选择至关重要。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Maxwell'
                                modeKey='Story (Normal)'
                                defaultBossId='4104007'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "击杀光球会使麦克斯韦的HP降至3%。避免使用范围伤害。"
                            ]} />
                        </>
                    ),
                },
            }}
        />
    )
}
