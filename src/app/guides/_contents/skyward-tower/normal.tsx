'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import SkywardBossFight from "@/app/components/SkywardBossFight"
import rawData from "@/data/skywardNormal.json"
import type { FloorData } from "@/app/components/SkywardBossFight"

const data = rawData as FloorData[]

export default function SkywardTowerNormal() {
  return (
    <GuideTemplate
      title="Skyward Tower Normal Guide"
      introduction="Skyward Tower Normal mode features 100 floors with fixed enemies and conditions. Each floor presents progressively challenging encounters that test your team building and strategic skills. Complete all floors to earn valuable rewards and prove your mastery."
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