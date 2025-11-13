'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'

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
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Strategy Overview</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li>Killing the orb will make Maxwell drop to 3% HP. Avoid using AoE damage.</li>
                            </ul>
                        </>
                    ),
                },
            }}
        />
    )
}
