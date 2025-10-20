'use client'

import GuideHeading from '@/app/components/GuideHeading'

export default function S185Guide() {
    return (
        <div>
            <GuideHeading level={3}>Strategy Overview</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                Killing the orb will make Maxwell drop to 3% HP. Avoid using AoE damage.
            </ul>
        </div>
    )
}
