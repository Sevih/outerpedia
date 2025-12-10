'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'

export default function MaxwellGuide() {
    return (
        <GuideTemplate
            title="맥스웰 공략 가이드"
            introduction="맥스웰은 오브를 처치하면 HP가 즉시 3%로 감소하는 독특한 보스입니다. 정밀한 타겟팅이 중요합니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Maxwell'
                                modeKey='Story (Normal)'
                                defaultBossId='4104007'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "오브를 파괴하면 맥스웰의 HP가 3%로 감소합니다. 광역 데미지 사용을 피하세요."
                            ]} />
                        </>
                    ),
                },
            }}
        />
    )
}
