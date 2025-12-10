'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function NellaGuide() {
    return (
        <GuideTemplate
            title="妮拉攻略指南"
            introduction="妮拉是一个极具挑战性的Boss，需要高穿透才能造成伤害。她会施加不可移除的减益增强和封印中断效果，每30次行动进入狂暴并处决整个队伍。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
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
                                "需要自带穿透的角色和穿透配装。",
                                "在Boss即将破防时，还需要{B/BT_REMOVE_DEBUFF}来移除{D/BT_STAT|ST_PIERCE_POWER_RATE}。"
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
