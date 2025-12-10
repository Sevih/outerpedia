'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function AsteiDemiurgeGuide() {
    return (
        <GuideTemplate
            title="阿斯忒(造物主)攻略指南"
            introduction="造物主阿斯忒是一个强大的Boss，会连锁暴击增益对所有敌人施加石化，然后升级为无视免疫。狂暴时只受弱点伤害，狂暴终极技造成致命伤害。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Astei'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4500047'
                                labelFilter={["Snapped Back to Reality", "Doll Garden's Caretaker"]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "使用2个角色通过{B/BT_REMOVE_DEBUFF}和{B/BT_IMMUNE}来应对{D/BT_STONE}机制。",
                                "如果伤害是问题，尝试携带能用{D/BT_SEALED}阻止Boss获得增益的角色。"
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
