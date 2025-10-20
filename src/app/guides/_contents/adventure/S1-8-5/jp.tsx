'use client'

import GuideHeading from '@/app/components/GuideHeading'

export default function S185Guide() {
    return (
        <div>
            <GuideHeading level={3}>戦略概要</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                オーブを倒すとマクスウェルのHPが3%まで減少します。AoEダメージの使用は避けてください。
            </ul>
        </div>
    )
}
