'use client'

import { useState } from 'react'
import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import MiniBossDisplay from '@/app/components/MiniBossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function AsteiGuide() {
    const [selectedMode, setSelectedMode] = useState('Story (Hard)')

    return (
        <GuideTemplate
            title="阿斯忒攻略指南"
            introduction="阿斯忒是一个强大的辅助型Boss，会治疗队友、提升攻击力，并在狂暴时复活队伍。她的同伴斯忒洛佩会在玩家使用非攻击技能时恢复Boss队伍的资源。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <div className="bg-yellow-100 text-black px-2 py-1 rounded-lg shadow-md text-sm text-center border border-yellow-100 mb-4">
                                本指南也适用于S2 Hard 5-9关卡
                            </div>
                            <BossDisplay
                                bossKey='Astei'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4500045'
                                labelFilter='An Unpleasant Reunion'
                                onModeChange={setSelectedMode}
                            />
                            <MiniBossDisplay
                                bosses={[
                                    { bossKey: 'Sterope', defaultBossId: '4500046', labelFilter: 'An Unpleasant Reunion' }
                                ]}
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                controlledMode={selectedMode}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Boss没有免疫，所以携带{D/BT_SEALED_RECEIVE_HEAL}。",
                                "尽量避免使用带有非攻击技能的角色。"
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
