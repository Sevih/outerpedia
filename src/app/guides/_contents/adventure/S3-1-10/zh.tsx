'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function SphinxGuardianGuide() {
    return (
        <GuideTemplate
            title="狮身人面守护者攻略指南"
            introduction="狮身人面守护者是一个需要队伍中至少有一名游侠才能行动的挑战性Boss。它会用S1处决游侠，没有游侠的队伍会被速度降为0。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
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
                                "至少使用一名{C/Ranger}。",
                                "避免使用{D/BT_COOL_CHARGE}。",
                                "Boss对{D/BT_AGGRO}有弱点。"
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
