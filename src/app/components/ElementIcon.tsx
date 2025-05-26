'use client'

import Image from 'next/image'
import type { ElementType } from '@/types/enums'

type Props = {
  element: ElementType
  size?: number
}

export function ElementIcon({ element, size = 24 }: Props) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <Image
        src={`/images/ui/elem/${element.toLowerCase()}.webp`}
        alt={element}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="object-contain"
        loading="lazy"
      />
    </div>
  )
}
