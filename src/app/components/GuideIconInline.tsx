'use client'

import Image from 'next/image'

type Props = {
  name: string
  text?: string
  size?: number
}

export default function GuideIconInline({ name, text, size = 30 }: Props) {
  const formattedName = (name: string) => name.replace(/-/g, ' ')

  return (
    <>
      <span
        className="inline-block relative align-bottom mr-1"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <Image
          src={`/images/guides/general-guides/${name}.webp`}
          alt={formattedName(name)}
          fill
          sizes={`${size}px`}
          className="object-contain"
        />
      </span>
      <span className="inline-block">
        {text ?? formattedName(name)}
      </span>
    </>
  )
}
