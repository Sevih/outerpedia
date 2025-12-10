'use client'

import { useState } from 'react'
import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import MiniBossDisplay from '@/app/components/MiniBossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'


export default function LeoGuide() {
    const [selectedMode, setSelectedMode] = useState('Story (Hard)')

    return (
        <GuideTemplate
            title="里欧攻略指南"
            introduction="里欧是一个防御型Boss，会获得强力护盾并根据防御力增加伤害。当有增益状态时，他的S3可以造成毁灭性的范围伤害，因此增益控制至关重要。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Leo'
                                modeKey='Story (Hard)'
                                defaultBossId='400401111'
                                onModeChange={setSelectedMode}
                            />
                            <MiniBossDisplay
                                bosses={[
                                    { bossKey: 'Alpha', defaultBossId: '400401011' }
                                ]}
                                modeKey='Story (Hard)'
                                controlledMode={selectedMode}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "携带{B/BT_REMOVE_DEBUFF}和/或{B/BT_IMMUNE}来无效化Alpha。",
                                "携带{D/BT_STEAL_BUFF} {D/BT_SEALED} {D/BT_REMOVE_BUFF}来阻止里欧给自己上增益。",
                                "无论使用哪种方法，确保里欧在释放S3时没有增益状态。"
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
