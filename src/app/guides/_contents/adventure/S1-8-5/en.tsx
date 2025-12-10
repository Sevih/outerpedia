'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'

export default function MaxwellGuide() {
    return (
        <GuideTemplate
            title="Maxwell Strategy Guide"
            introduction="Maxwell is a unique boss encounter where killing the orb will instantly drop Maxwell to 3% HP, making precision targeting crucial."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Maxwell'
                                modeKey='Story (Normal)'
                                defaultBossId='4104007'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Killing the orb will make Maxwell drop to 3% HP. Avoid using AoE damage."
                            ]} />
                        </>
                    ),
                },
            }}
        />
    )
}
