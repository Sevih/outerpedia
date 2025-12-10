'use client'

import { useState } from 'react'
import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import MiniBossDisplay from '@/app/components/MiniBossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function HildeGuide() {
    const [selectedMode, setSelectedMode] = useState('Story (Hard)')

    return (
        <GuideTemplate
            title="힐데 공략 가이드"
            introduction="힐데는 지원 아군을 소환하고 쓰러진 아군을 부활시키는 복잡한 보스입니다. 처음으로 회피한 아군에게 해제 불가 도발을 부여하고, 디버프가 없는 아군을 공격하면 행동 게이지가 가득 찹니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Hilde'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4500283'
                                labelFilter={"Top Fiend Officer"}
                                onModeChange={setSelectedMode}
                            />
                            <MiniBossDisplay
                                bosses={[
                                    { bossKey: 'Maxie', defaultBossId: '4500281' },
                                    { bossKey: 'Roxie', defaultBossId: '4500282' }
                                ]}
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                controlledMode={selectedMode}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "보스의 높은 피해를 버티기 위해 피해 감소 캐릭터를 데려가세요.",
                                "{D/BT_AGGRO}에 걸렸을 때 S1에 힐이 있는 힐러가 도움이 됩니다."
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
