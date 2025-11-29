'use client'

import * as HoverCard from '@radix-ui/react-hover-card'
import Image from 'next/image'
import type { CSSProperties } from 'react'
import talismansRaw from '@/data/talisman.json'
import type { Talisman } from '@/types/equipment'
import { useTenant } from '@/lib/contexts/TenantContext'
import formatEffectText from '@/utils/formatText'
import { l } from '@/lib/localize'

type Props = {
  name: string
  triggerStyle?: CSSProperties
  showLabel?: boolean
  size?: number
}

export default function TalismanInlineTag({
  name,
  triggerStyle,
  showLabel = true,
  size = 24,
}: Props) {
  const { key: lang } = useTenant()

  const talismans = talismansRaw as Talisman[]
  const talisman = talismans.find(t => t.name === name)
  if (!talisman) return <span className="text-red-500">{name}</span>

  const label = l(talisman, 'name', lang)

  const effectDesc1 = l(talisman, 'effect_desc1', lang)
  const effectDesc4 = l(talisman, 'effect_desc4', lang)
  const effectName = l(talisman, 'effect_name', lang)

  const rarity = (talisman.rarity || 'Legendary').toLowerCase()
  const bgPath = `/images/bg/CT_Slot_${rarity}.webp`

  const defaultAlignClass = triggerStyle?.verticalAlign ? '' : 'align-bottom'
  const sizePx = `${size}px`

  return (
    <HoverCard.Root openDelay={0} closeDelay={0}>
      <HoverCard.Trigger asChild>
        <button
          type="button"
          className={`inline-flex items-end gap-1 ${defaultAlignClass}`}
          style={triggerStyle}
        >
          <div
            className="rounded shadow-md shrink-0"
            style={{
              width: size,
              height: size,
              backgroundImage: `url(${bgPath})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="relative w-full h-full">
              <Image
                src={`/images/equipment/${talisman.image}.webp`}
                alt={label}
                fill
                className="object-contain"
                sizes={sizePx}
              />
            </div>
          </div>
          {showLabel && <span className="underline text-amber-400">{label}</span>}
        </button>
      </HoverCard.Trigger>

      <HoverCard.Portal>
        <HoverCard.Content
          side="top"
          align="center"
          sideOffset={8}
          className="z-50 px-3 py-2 rounded shadow-lg max-w-[280px] bg-[#1a1a1a] border border-white/10 flex items-start gap-2"
        >
          <div className="flex flex-col gap-1.5 text-white">
            {effectName && <span className="text-xs text-sky-300">{effectName}</span>}

            {effectDesc1 && (
              <div className="text-xs">
                <span className="text-gray-400">Lv1: </span>
                <span className="leading-snug whitespace-pre-line">
                  {formatEffectText(effectDesc1)}
                </span>
              </div>
            )}

            {effectDesc4 && (
              <div className="text-xs">
                <span className="text-amber-400">Lv10: </span>
                <span className="leading-snug whitespace-pre-line">
                  {formatEffectText(effectDesc4)}
                </span>
              </div>
            )}
          </div>
          <HoverCard.Arrow className="fill-[#333]" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  )
}
