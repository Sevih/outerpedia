'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function AbyssalCalamityApophisGuide() {
    return (
        <GuideTemplate
            title="深渊灾厄阿波菲斯攻略指南"
            introduction="深渊灾厄阿波菲斯是一个危险的Boss，会施加毁灭性的毒和沉默减益。它的机制会对有减益的目标造成大量固定伤害和无视防御攻击。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Abyssal Calamity Apophis'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4184001'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "带{B/BT_IMMUNE}和{B/BT_STAT|ST_BUFF_RESIST}来防止被{D/BT_DOT_POISON_IR}。",
                                "或者利用Boss对{D/BT_COOL3_CHARGE}的弱点让它永远无法使用S3。"
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
