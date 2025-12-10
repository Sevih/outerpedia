'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function AncientFoeGuide() {
    return (
        <GuideTemplate
            title="고대의 적 공략 가이드"
            introduction="고대의 적은 저주 디버프를 부여하고 면역을 무시하여 HP 70% 이하의 대상을 빙결시킬 수 있는 위험한 보스입니다. 적의 행동 10회마다 격노 단계에서 강력한 버프를 얻고 해제 불가 저주 중단 효과를 부여합니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Frozen Dragon of Phantasm Harshna'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4286026'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "보스가 {B/BT_STAT|ST_BUFF_CHANCE}를 얻는 것을 막기 위해 {D/BT_SEALED}를 가져가세요.",
                                "{D/BT_DOT_CURSE}와 {D/BT_FREEZE}에 대응하기 위해 {B/BT_IMMUNE}과 {B/BT_REMOVE_DEBUFF}를 가져가세요."
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
