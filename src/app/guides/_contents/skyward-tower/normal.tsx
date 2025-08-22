"use client"

import SkywardBossFight from "@/app/components/SkywardBossFight"
import rawData from "@/data/skywardNormal.json"
import type { FloorData } from "@/app/components/SkywardBossFight"

const data = rawData as FloorData[]

export default function SkywardTowerNormal() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Skyward Tower – Normal Mode</h1>
      <p>100 floors with fixed enemies and conditions.</p>
      <SkywardBossFight data={data} scale={0.5} />
    </div>
  )
}
