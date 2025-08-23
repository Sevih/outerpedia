"use client"

import SkywardBossFight from "@/app/components/SkywardBossFight"
import rawData from "@/data/skywardHard.json"
import type { FloorData } from "@/app/components/SkywardBossFight"
import { Card, CardContent } from "@/app/components/ui/card"

const data = rawData as FloorData[]

export default function SkywardTowerHard() {
  return (
    <div className="space-y-6">
      <div className="text-sm leading-relaxed space-y-1">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm leading-relaxed space-y-1">
              <p>30 floors with fixed enemies and conditions.</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <SkywardBossFight data={data} scale={0.5} />
    </div>
  )
}
