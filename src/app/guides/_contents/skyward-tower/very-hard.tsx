"use client"

import SkywardBossFight from "@/app/components/SkywardBossFightVeryHard"
import rawData from "@/data/skywardVeryHard.json"
import type { FloorData } from "@/app/components/SkywardBossFightVeryHard"

const data = rawData as FloorData[]

export default function SkywardTowerVeryHard() {
    return (
        <div className="space-y-6">
            <SkywardBossFight data={data} scale={0.5} />
        </div>
    )
}
