'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function VladiMaxGuide() {
    return (
        <GuideTemplate
            title="블라디 맥스 공략 가이드"
            introduction="블라디 맥스는 체인 포인트를 흡수하고 방어력이 감소된 대상에게 확정 기절을 부여하는 위험한 보스입니다. 그의 공격은 반격, 복수, 방어자 패시브를 무시합니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Vladi Max'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4144004'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "{B/BT_IMMUNE}, {B/BT_REMOVE_DEBUFF}를 가진 캐릭터를 사용하세요."
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
