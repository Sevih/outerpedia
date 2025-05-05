'use client'

import Image from 'next/image'
import type { ClassType } from '@/types/enums'

type Props = {
  className: ClassType
  size?: number
}

export function ClassIcon({ className, size = 24 }: Props) {
  return (
    <Image
      src={`/images/ui/class/${className.toLowerCase()}.webp`}
      alt={className}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="inline-block object-contain"
      loading="lazy"
    />
  )
}
