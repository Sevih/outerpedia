'use client'

import Image from 'next/image'

type Props = {
  element: string // 'fire', 'water', etc.
}

const ELEMENT_LABELS: Record<string, string> = {
  fire: 'Fire',
  water: 'Water',
  earth: 'Earth',
  light: 'Light',
  dark: 'Dark'
}

const ELEMENT_COLORS: Record<string, string> = {
  fire: 'text-red-400',
  water: 'text-blue-400',
  earth: 'text-emerald-400',
  light: 'text-yellow-300',
  dark: 'text-purple-400'
}

export default function ElementInlineTag({ element }: Props) {
  const key = element.toLowerCase()
  const label = ELEMENT_LABELS[key]
  const colorClass = ELEMENT_COLORS[key] || 'text-neutral-300'
  const iconPath = `/images/ui/elem/${key}.webp`

  if (!label) return <span className="text-red-500">{element}</span>

  return (
    <span className="inline-flex items-end gap-1 align-bottom">
      <span className="inline-block w-[28px] h-[28px] relative align-bottom">
        <Image
          src={iconPath}
          alt={label}
          fill
          sizes="28px"
          className="object-contain"
        />
      </span>
      <span className={`${colorClass}`}>{label}</span>
    </span>
  )
}
