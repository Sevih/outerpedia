'use client'

import Image from 'next/image'
import type {
  ExclusiveEquipment as EE
} from '@/types/equipment'

export function renderEE(ee: EE) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{ee.name}</h1>
      <Image
        src={`/images/items/${ee.icon_effect}`}
        alt={ee.name}
        width={64}
        height={64}
      />
      <p><strong>Main Stat:</strong> {ee.mainStat}</p>
      <p><strong>Effect:</strong> {ee.effect}</p>
      {ee.effect10 && <p><strong>Effect (Level 10):</strong> {ee.effect10}</p>}
    </div>
  )
}
