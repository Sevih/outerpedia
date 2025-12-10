'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function GrandCalamariGuide() {
    return (
        <GuideTemplate
            title="巨型鱿鱼攻略指南"
            introduction="巨型鱿鱼是一个棘手的Boss，专门眩晕攻击力最高的英雄并延长减益持续时间。管理好狂暴阶段以避免其毁灭性的终极技能至关重要。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Grand Calamari'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4134003'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "在狂暴前积攒连锁点数。这样你可以快速击杀并跳过终极技能。",
                                "携带{B/BT_IMMUNE}和/或{B/BT_REMOVE_DEBUFF}来无效化{D/BT_STUN}机制。"
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
