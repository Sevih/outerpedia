'use client'
import type {
  Accessory
} from '@/types/equipment'
import Image from 'next/image'

export function renderAccessory(accessory: Accessory) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{accessory.name}</h1>
      <Image
        src={`/images/items/${accessory.image}`}
        alt={accessory.name}
        width={64}
        height={64}
      />
    </div>
  )
}
