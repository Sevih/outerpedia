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
      width={0}
      height={0}
      sizes={`${size}px`}
      //className="absolute drop-shadow-md z-10"
      className={`w-[${size}px] h-[${size}px] inline-block object-contain drop-shadow-md`}
    />

  )
}
