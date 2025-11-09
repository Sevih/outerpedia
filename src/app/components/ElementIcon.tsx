'use client'

import Image from 'next/image'
import type { ElementType } from '@/types/enums'

type Props = {
  element: ElementType
  size?: number
}

export function ElementIcon({ element, size = 24 }: Props) {
  return (
    <Image
      src={`/images/ui/elem/${element.toLowerCase()}.webp`}
      alt={element}
      width={0}
      height={0}
      sizes={`${size}px`}
      //className="absolute drop-shadow-md z-10"
      className={`w-[${size}px] h-[${size}px] inline-block object-contain drop-shadow-md`}
    />
  )
}
