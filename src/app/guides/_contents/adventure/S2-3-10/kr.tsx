'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function SacreedGuardianGuide() {
    return (
        <GuideTemplate
            title="신성한 수호자 공략 가이드"
            introduction="신성한 수호자는 S3로 공격력이 가장 높은 영웅을 즉사시키고 5턴마다 격노하는 위험한 보스입니다. 격노 중에는 약점 피해만 유효하므로 타이밍과 군중 제어가 중요합니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Sacreed Guardian'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4144003'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "보스는 면역이 없으므로 {D/BT_STUN} {D/BT_FREEZE} {D/BT_STONE} {D/BT_COOL_CHARGE} {D/BT_SILENCE} 같은 하드 CC를 가져가세요.",
                                "{B/BT_RESURRECTION}를 가져가면 도움이 됩니다.",
                                "{D/BT_ACTION_GAUGE} {B/BT_ACTION_GAUGE} {D/BT_STAT|ST_SPEED} {B/BT_STAT|ST_SPEED}로 보스의 턴을 줄이고 격노를 지연시킬 수 있습니다.",
                                "보스가 격노할 때까지 체인을 아껴두세요.",
                                "{D/BT_FIXED_DAMAGE} 체인 공격으로 한 번에 처치할 수도 있습니다."
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
