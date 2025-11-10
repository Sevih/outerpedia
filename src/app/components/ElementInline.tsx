'use client'

import Image from 'next/image'
import { useI18n } from '@/lib/contexts/I18nContext'

type Props = {
  element: string // 'fire', 'water', etc.
  notext?: boolean
}

const ELEMENT_COLORS: Record<string, string> = {
  fire: 'text-red-400',
  water: 'text-blue-400',
  earth: 'text-emerald-400',
  light: 'text-yellow-300',
  dark: 'text-purple-400'
}

export default function ElementInlineTag({ element, notext = false }: Props) {
  const key = element.toLowerCase()
  const { t }= useI18n()
  const colorClass = ELEMENT_COLORS[key] || 'text-neutral-300'
  const iconPath = `/images/ui/elem/${key}.webp`
   const translationKey = `SYS_ELEMENT_NAME_${key.toUpperCase()}`
  const label = t(translationKey, { defaultValue: key.charAt(0).toUpperCase() + key.slice(1) })

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
      {!notext && <span className={`${colorClass}`}>{label}</span>}
    </span>
  )
}
