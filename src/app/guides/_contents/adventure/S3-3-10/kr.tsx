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
            title="페이탈 공략 가이드"
            introduction="페이탈은 은신 중 거의 무적이 되어 막대한 피해를 주고 아군을 부활시키는 치명적인 암살자 보스입니다. 화염 영웅을 침묵시키고 매 행동 후 모든 아군 버프를 연장합니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
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
                                "{E/Fire} 영웅 사용을 피하세요.",
                                "페이탈이 행동하기 전에 적에게 {D/BT_SEALED}를 부여할 수 있는 빠른 영웅을 데려가세요 (약 270 스피드).",
                                "{B/BT_STEALTHED}를 제거하기 위해 {D/BT_STEAL_BUFF} 또는 {D/BT_REMOVE_BUFF}를 가진 영웅을 데려가세요.",
                                "{P/Caren}은 S2가 {B/BT_STEALTHED} 상태에서도 페이탈을 타겟할 수 있어 여기서 MVP입니다."
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
