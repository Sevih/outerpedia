'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function MutatedWyvreGuide() {
    return (
        <GuideTemplate
            title="变异双足飞龙攻略指南"
            introduction="与变异双足飞龙的战斗围绕着增益效果，它拥有的增益越多就造成越高的伤害且受到的伤害也越低。因此策略是集中移除它的增益来削弱它。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Mutated Wyvre'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4314003'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                'Boss在异型怪猎人前更脆弱（如{P/Caren}和{P/Rey}）。',
                                '{D/BT_REMOVE_BUFF}和{B/BT_IMMUNE}是应对它的关键。'
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
