'use client'

import Image from 'next/image'
import type { ElementType } from '@/types/enums'

export function ElementIcon({ element }: { element: ElementType }) {
  return (
    <div className="w-6 h-6 relative">
      <Image
        src={`/images/ui/elem/${element.toLowerCase()}.webp`}
        alt={element}
        width={24}
        height={24}
        style={{ width: 24, height: 24 }}
        className="object-contain"
        loading="lazy"
      />
    </div>
  )
}
