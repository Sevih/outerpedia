'use client'

import * as HoverCard from '@radix-ui/react-hover-card'
import Image from 'next/image'
import type { CSSProperties } from 'react'
import { useTenant } from '@/lib/contexts/TenantContext'
import { l } from '@/lib/localize'
import type { BuffName, DebuffName } from '@/types/effect-names'
import type { WithLocalizedFields } from '@/types/common'
import buffs from '@/data/buffs.json'
import debuffs from '@/data/debuffs.json'

type Props =
  | {
      name: BuffName
      type: 'buff'
      triggerStyle?: CSSProperties
    }
  | {
      name: DebuffName
      type: 'debuff'
      triggerStyle?: CSSProperties
    }

type BaseEffect = {
  name: string
  type: 'buff' | 'debuff'
  label: string
  description: string
  icon: string
}

type Effect = WithLocalizedFields<WithLocalizedFields<BaseEffect, 'label'>, 'description'>

export default function EffectInlineTag({ name, type, triggerStyle }: Props) {
  const { key: lang } = useTenant()
  const effects: Effect[] = (type === 'buff' ? buffs : debuffs).map(e => ({ ...e, type }))
  const effect = effects.find((e) => e.name === name)

  if (!effect) {
    // TypeScript garantit que cette branche ne devrait jamais être atteinte
    throw new Error(`Effect not found: ${name} (${type})`)
  }

  const label = l(effect, 'label', lang)
  const description = l(effect, 'description', lang)

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
