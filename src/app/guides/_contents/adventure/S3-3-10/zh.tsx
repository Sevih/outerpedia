'use client'

import { useState } from 'react'
import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import MiniBossDisplay from '@/app/components/MiniBossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function FatalGuide() {
    const [selectedMode, setSelectedMode] = useState('Story (Hard)')
    return (
        <GuideTemplate
            title="菲塔尔攻略指南"
            introduction="菲塔尔是一个致命的刺客Boss，在隐身时几乎无敌，造成大量伤害并复活队友。她会沉默火属性英雄，并在每次行动后延长所有队友增益效果。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Fatal'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4500266'
                                onModeChange={setSelectedMode}
                            />
                            <MiniBossDisplay
                                bosses={[
                                    { bossKey: "Sand Soldier Khopesh", defaultBossId: '4102201' },
                                    { bossKey: "Sand Soldier Khopesh", defaultBossId: '4102201' }
                                ]}
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                controlledMode={selectedMode}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "避免使用{E/Fire}英雄。",
                                "带一个快速英雄在菲塔尔行动前对敌人施加{D/BT_SEALED}（约270速度）。",
                                "带一个拥有{D/BT_STEAL_BUFF}或{D/BT_REMOVE_BUFF}的英雄来移除{B/BT_STEALTHED}。",
                                "{P/Caren}是这里的MVP，因为她的S2在{B/BT_STEALTHED}状态下仍能锁定菲塔尔。"
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
