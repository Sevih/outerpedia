'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import SkywardBossFight from "@/app/components/SkywardBossFight"
import rawData from "@/data/skywardHard.json"
import type { FloorData } from "@/app/components/SkywardBossFight"

const data = rawData as FloorData[]

export default function SkywardTowerHard() {
  return (
    <GuideTemplate
      title="Skyward Tower Hard Guide"
      introduction="Skyward Tower Hard mode features 30 floors with fixed enemies and conditions. Each floor presents unique challenges with specific boss encounters and team requirements. Plan your team compositions carefully to progress through all floors."
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