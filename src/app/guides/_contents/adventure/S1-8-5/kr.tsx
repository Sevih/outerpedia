'use client'

import GuideHeading from '@/app/components/GuideHeading'

export default function S185Guide() {
    return (
        <div>
            <GuideHeading level={3}>전략 개요</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                오브를 파괴하면 맥스웰의 HP가 3%로 감소합니다. 광역 데미지 사용을 피하세요.
            </ul>
        </div>
    )
}
