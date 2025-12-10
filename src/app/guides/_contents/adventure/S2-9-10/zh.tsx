'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function VladiMaxGuide() {
    return (
        <GuideTemplate
            title="弗拉迪麦克斯攻略指南"
            introduction="弗拉迪麦克斯是一个危险的Boss，会吸取连锁点数并对防御降低的目标造成必中眩晕。他的攻击无视反击、复仇和防御者被动。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Vladi Max'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4144004'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "使用拥有{B/BT_IMMUNE}、{B/BT_REMOVE_DEBUFF}的角色。"
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
