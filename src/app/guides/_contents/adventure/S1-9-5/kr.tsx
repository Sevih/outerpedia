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
            title="레오 공략 가이드"
            introduction="레오는 강력한 보호막을 획득하고 방어력에 따라 피해를 증가시키는 방어형 보스입니다. 버프 상태에서 S3는 치명적인 광역 피해를 줄 수 있어 버프 관리가 필수적입니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
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
                                "{B/BT_REMOVE_DEBUFF}나 {B/BT_IMMUNE}를 가져가 Alpha를 무효화하세요.",
                                "{D/BT_STEAL_BUFF} {D/BT_SEALED} {D/BT_REMOVE_BUFF}를 가져가 레오의 버프를 방지하세요.",
                                "어떤 방법을 사용하든 레오가 S3를 사용할 때 버프가 없는지 확인하세요."
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
