'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function AncientFoeGuide() {
    return (
        <GuideTemplate
            title="远古之敌攻略指南"
            introduction="远古之敌是一个危险的Boss，会施加诅咒减益，并能无视免疫冻结HP低于70%的目标。每10次敌方行动进入狂暴阶段获得强力增益，并施加不可移除的诅咒中断效果。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Frozen Dragon of Phantasm Harshna'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4286026'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "带{D/BT_SEALED}来阻止Boss获得{B/BT_STAT|ST_BUFF_CHANCE}。",
                                "带{B/BT_IMMUNE}和{B/BT_REMOVE_DEBUFF}来应对{D/BT_DOT_CURSE}和{D/BT_FREEZE}。"
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
