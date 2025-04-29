'use client'

import Image from 'next/image'
import type { ClassType } from '@/types/enums'

export function ClassIcon({ className }: { className: ClassType }) {
  return (
    <Image
      src={`/images/ui/class/${className.toLowerCase()}.webp`}
      alt={className}
      width={24}
      height={24}
      style={{ width: 24, height: 24 }}
      className="inline-block"
      loading="lazy"
    />
  )
}
