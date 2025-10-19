'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import SkywardBossFight from "@/app/components/SkywardBossFightVeryHard"
import rawData from "@/data/skywardVeryHard.json"
import type { FloorData } from "@/app/components/SkywardBossFightVeryHard"

const data = rawData as FloorData[]

export default function SkywardTowerVeryHard() {
    return (
        <GuideTemplate
            title="Skyward Tower Very Hard Guide"
            introduction="Skyward Tower Very Hard mode features randomized floors and conditions with varying boss encounters. Floor and condition are random (choose between 3-4 sets for every player). Floors 5, 10, and 15 have randomized positions featuring Demiurge Stella, Demiurge Drakhan, and Demiurge Vlada. Floor 20 can alternate between 2 sets of bosses."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <div className="space-y-6">
                                <SkywardBossFight data={data} scale={0.5} />
                            </div>
                        </>
                    ),
                },
            }}
        />
    )
}