'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function NellaGuide() {
    return (
        <GuideTemplate
            title="넬라 공략 가이드"
            introduction="넬라는 피해를 주기 위해 높은 관통력이 필요한 매우 어려운 보스입니다. 해제 불가 디버프 강화와 봉인 중단 효과를 부여하며, 30회 행동마다 격노하여 팀 전체를 처형합니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Nella'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4500352'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "고유 관통력을 가진 유닛과 관통력 기반 빌드가 필요합니다.",
                                "보스가 브레이크 직전일 때 {D/BT_STAT|ST_PIERCE_POWER_RATE}를 제거하기 위해 {B/BT_REMOVE_DEBUFF}도 필요합니다."
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
