'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function GrandCalamariGuide() {
    return (
        <GuideTemplate
            title="그랜드 칼라마리 공략 가이드"
            introduction="그랜드 칼라마리는 공격력이 가장 높은 영웅을 기절시키고 디버프 지속 시간을 연장하는 까다로운 보스입니다. 치명적인 궁극기를 피하기 위해 격노 페이즈 관리가 중요합니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Grand Calamari'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4134003'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "격노 전에 체인 포인트를 쌓아두세요. 이렇게 하면 한 번에 처치하고 궁극기를 건너뛸 수 있습니다.",
                                "{B/BT_IMMUNE}나 {B/BT_REMOVE_DEBUFF}를 가져가 {D/BT_STUN} 메커니즘을 무효화하세요."
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
