'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function AsteiDemiurgeGuide() {
    return (
        <GuideTemplate
            title="아스테이(데미우르고스) 공략 가이드"
            introduction="데미우르고스 아스테이는 치명적 버프를 연쇄시켜 모든 적에게 석화를 부여하고, 면역 무시로 업그레이드하는 강력한 보스입니다. 격노 시 약점 피해만 유효하며, 격노 궁극기는 치명적인 피해를 줍니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Astei'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4500047'
                                labelFilter={["Snapped Back to Reality", "Doll Garden's Caretaker"]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "{B/BT_REMOVE_DEBUFF}와 {B/BT_IMMUNE}를 가진 캐릭터 2명으로 {D/BT_STONE} 메커니즘에 대응하세요.",
                                "피해가 문제라면 {D/BT_SEALED}로 보스의 버프를 방지할 수 있는 캐릭터를 데려가세요."
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
