'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function AbominationHunterBelialGuide() {
    return (
        <GuideTemplate
            title="혐오의 사냥꾼 벨리알 공략 가이드"
            introduction="혐오의 사냥꾼 벨리알은 화상 디버프를 폭발시켜 막대한 피해를 주는 파괴적인 보스입니다. 전투 시작 시 즉시 화상을 폭발시키고, 매 턴 비방어자에게 화상을 부여하며, 격노 시 팀 전체를 처형합니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Abomination Hunter Belial'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4114005'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "{D/BT_DOT_BURN}에 대응하기 위해 {B/BT_SHIELD_BASED_CASTER}와/또는 {B/BT_INVINCIBLE}을 가져가세요 (두 번째 전투 끝에 반드시 적용하세요).",
                                "첫 번째 {D/BT_IMMEDIATELY_2000092} 후에 {D/BT_DOT_BURN}을 막기 위해 {B/BT_IMMUNE}을 가져가세요.",
                                "첫 번째 {D/BT_IMMEDIATELY_2000092} 후 사망에서 회복하기 위해 {B/BT_RESURRECTION}을 가져가세요."
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
