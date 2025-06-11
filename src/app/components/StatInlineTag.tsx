'use client'

import Image from 'next/image'
import stats from '@/data/stats.json'

type Props = {
  name: keyof typeof stats;
  color?: string;
  abbr?: boolean
}

export default function StatInlineTag({ name, color = 'text-amber-400', abbr = false }: Props) {
  const stat = stats[name]

  if (!stat) return <span className="text-red-500">{name}</span>

  const iconPath = `/images/ui/effect/${stat.icon}`

  return (
    <span className="inline-flex items-end gap-1 align-bottom">
      <span className="inline-block w-[24px] h-[24px] relative align-bottom">
        <Image
          src={iconPath}
          alt={stat.label}
          fill
          sizes="24px"
          className="object-contain"
        />
      </span>
      <span className={color}>
        {abbr ? name.toUpperCase() : stat.label}
      </span>
    </span>

  )
}
