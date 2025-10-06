'use client'

import * as HoverCard from '@radix-ui/react-hover-card'
import Image from 'next/image'
import buffs from '@/data/buffs.json'
import debuffs from '@/data/debuffs.json'
import type { CSSProperties } from 'react'
import { useTenant } from '@/lib/contexts/TenantContext'

type Props = {
  name: string
  type: 'buff' | 'debuff'
  triggerStyle?: CSSProperties // ← nouveau prop
}

type Effect = {
  name: string
  type: 'buff' | 'debuff'
  label: string
  label_jp?: string
  label_kr?: string
  description: string
  description_jp?: string
  description_kr?: string
  icon: string
}

export default function EffectInlineTag({ name, type, triggerStyle }: Props) {
  const { key } = useTenant()
  const lang: 'en' | 'jp' | 'kr' = key === 'jp' ? 'jp' : key === 'kr' ? 'kr' : 'en'
  const effects: Effect[] = (type === 'buff' ? buffs : debuffs).map(e => ({ ...e, type }))
  const effect = effects.find((e) => e.name === name)

  if (!effect) return <span className="text-red-500">{name}</span>

  const label =
    lang === 'jp' ? (effect.label_jp ?? effect.label)
      : lang === 'kr' ? (effect.label_kr ?? effect.label)
        : effect.label

  const description =
    lang === 'jp' ? (effect.description_jp ?? effect.description)
      : lang === 'kr' ? (effect.description_kr ?? effect.description)
        : effect.description

  const iconPath = `/images/ui/effect/${effect.icon}.webp`
  const color = type === 'buff' ? 'text-sky-400' : 'text-red-400'
  const tooltipBg = type === 'buff' ? 'bg-[#1a69a7]' : 'bg-[#a72a27]'
  const arrowFill = type === 'buff' ? 'fill-[#2196f3]' : 'fill-[#e53935]'
  const showEffectColor = !effect.description.toLowerCase().includes('cannot be removed')
  const imageClass = showEffectColor ? effect.type : ''
  const defaultAlignClass = triggerStyle?.verticalAlign ? '' : 'align-bottom'

  return (
    <HoverCard.Root openDelay={0} closeDelay={0}>
      <HoverCard.Trigger asChild>
        <button
          type="button"
          className={`inline-flex items-end gap-1 ${defaultAlignClass}`}
          style={triggerStyle}
        >
          <span className="inline-block w-[24px] h-[24px] relative">
            <Image
              src={iconPath}
              alt={label}
              fill
              sizes="24px"
              className={`object-contain ${imageClass}`}
            />
          </span>
          <span className={`underline ${color}`}>{label}</span>
        </button>
      </HoverCard.Trigger>

      <HoverCard.Portal>
        <HoverCard.Content
          side="top"
          align="center"
          className={`z-50 px-3 py-2 rounded shadow-lg max-w-[260px] flex items-start gap-2 ${tooltipBg}`}
        >
          <div className="relative w-[28px] h-[28px] bg-black p-1 rounded shrink-0">
            <Image
              src={iconPath}
              alt={label}
              fill
              sizes="28px"
              className={`object-contain ${imageClass}`}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white text-sm leading-tight">{label}</span>
            <span className="text-white text-xs leading-snug whitespace-pre-line">
              {description}
            </span>
          </div>
          <HoverCard.Arrow className={arrowFill} />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  )
}
