'use client'

import Image from 'next/image'
import type {
  Talisman
} from '@/types/equipment'

export function renderTalisman(talisman: Talisman) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{talisman.name}</h1>
      <Image
        src={`/images/items/${talisman.effect_icon}`}
        alt={talisman.name}
        width={64}
        height={64}
      />
      <p><strong>Effect:</strong> {talisman.effect_desc1}</p>
      {talisman.effect_desc4 && <p><strong>Effect (Level 10):</strong> {talisman.effect_desc4}</p>}
    </div>
  )
}
