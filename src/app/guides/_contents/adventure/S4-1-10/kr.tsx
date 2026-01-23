'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'
import CombatFootage from '@/app/components/CombatFootage'

export default function NellaGuide() {
    return (
        <GuideTemplate
            title="세 울음소리 공략 가이드"
            introduction="세 울음소리는 약화 효과가 적용되지 않으면 거의 무적이 되는 방어형 보스입니다. 팀 전체에 지속적으로 버프를 유지하여 해제 불가능한 {D/BT_DOT_BURN_IR}를 방지하고, {D/BT_FREEZE}를 적용하여 피해 감소를 무효화하고 체인 어택 버스트를 성공시키는 것이 중요합니다. 보스는 피격 시 행동 게이지가 빠르게 증가하며 매 턴마다 약화 효과를 해제하므로 정확한 타이밍이 매우 중요합니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Three Cries'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4114006'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "보스에게 쏟아붓기 전에 가능한 한 많은 체인 포인트를 축적하세요",
                                "S2/S3 공격 전에 버프를 준비하여 {D/BT_DOT_BURN}를 방지하세요",
                                "모든 체인 어택을 개시하고 브레이크하기 전에 {D/BT_FREEZE}를 적용하세요",
                                "팀의 속도를 조정하여 체인 어택 시작 전에 모든 유닛이 100% 우선도에 도달하도록 하세요. 이렇게 하면 피격으로 행동 게이지를 얻더라도 보스가 끼어들지 못합니다 (피격당 20% 획득)",
                                "{E/Light}와 {E/Dark} 유닛 사용을 피하여 보스가 자신을 정화하는 것을 방지하세요"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="i2ok2KIpvsQ"
                                title="Three Cries - Story Hard 4-1-10 clear (Auto) - by XuRenChao"
                                author="XuRenChao"
                                date="13/01/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
