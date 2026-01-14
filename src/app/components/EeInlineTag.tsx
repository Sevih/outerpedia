'use client'

import * as HoverCard from '@radix-ui/react-hover-card'
import Image from 'next/image'
import type { CSSProperties } from 'react'
import eeRaw from '@/data/ee.json'
import type { ExclusiveEquipment } from '@/types/equipment'
import { useTenant } from '@/lib/contexts/TenantContext'
import formatEffectText from '@/utils/formatText'
import { l } from '@/lib/localize'

type Props = {
  name: string
  triggerStyle?: CSSProperties
  showLabel?: boolean
  size?: number
}

export default function EeInlineTag({
  name,
  triggerStyle,
  showLabel = true,
  size = 24,
}: Props) {
  const { key: lang } = useTenant()

  const eeData = eeRaw as Record<string, ExclusiveEquipment>
  const entry = Object.entries(eeData).find(([, e]) => e.name === name)
  if (!entry) return <span className="text-red-500">{name}</span>

  const [slug, ee] = entry
  const label = l(ee, 'name', lang)

  const effectDesc = l(ee, 'effect', lang)
  const effectDesc10 = l(ee, 'effect10', lang)

  const bgPath = `/images/bg/CT_Slot_legendary.webp`

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
                src={`/images/characters/ex/${slug}.webp`}
                alt={label}
                fill
                className="object-contain"
                sizes={sizePx}
              />
            </div>
          </div>
          {showLabel && <span className="underline text-red-400">{label}</span>}
        </button>
      </HoverCard.Trigger>

      <HoverCard.Portal>
        <HoverCard.Content
          side="top"
          align="center"
          sideOffset={8}
          className="z-50 px-3 py-2 rounded shadow-lg max-w-[280px] bg-[#1a1a1a] border border-white/10 flex items-start gap-2"
        >
          <div className="flex flex-col gap-1 text-white">
            <span className="font-semibold text-red-400">{label}</span>
            {effectDesc && (
              <span className="text-xs leading-snug whitespace-pre-line">
                {formatEffectText(effectDesc)}
              </span>
            )}
            {effectDesc10 && (
              <span className="text-xs leading-snug whitespace-pre-line text-amber-300 italic">
                +10: {formatEffectText(effectDesc10)}
              </span>
            )}
          </div>
          <HoverCard.Arrow className="fill-[#333]" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  )
}
