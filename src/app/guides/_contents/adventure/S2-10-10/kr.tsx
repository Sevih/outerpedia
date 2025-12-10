'use client'

import { useState } from 'react'
import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import MiniBossDisplay from '@/app/components/MiniBossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function DrakhanGuide() {
    const [selectedMode, setSelectedMode] = useState('Story (Hard)')

    return (
        <GuideTemplate
            title="드라칸 공략 가이드"
            introduction="데미우르고스 드라칸은 비율 기반 고정 피해를 주고 저체력 대상을 즉사시킬 수 있는 매우 강력한 보스입니다. 격노 시 약점 게이지 피해 면역이 되고 처형 스킬이 광역으로 업그레이드됩니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Drakhan'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4500182'
                                labelFilter={"Conqueror and Destroyer"}
                                onModeChange={setSelectedMode}
                            />
                            <MiniBossDisplay
                                bosses={[
                                    { bossKey: 'Vlada', defaultBossId: '4500184', labelFilter: 'Conqueror and Destroyer' }
                                ]}
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                controlledMode={selectedMode}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "강력한 광역 힐 스킬을 가진 캐릭터를 사용하세요.",
                                "속도 디버프가 너무 쌓이기 전에 데미우르고스 블라다를 빠르게 처치하세요."
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
