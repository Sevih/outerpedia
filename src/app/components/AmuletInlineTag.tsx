'use client'

import * as HoverCard from '@radix-ui/react-hover-card'
import Image from 'next/image'
import type { CSSProperties } from 'react'
import amuletsRaw from '@/data/amulet.json'
import type { Accessory } from '@/types/equipment'
import { useTenant } from '@/lib/contexts/TenantContext'
import formatEffectText from '@/utils/formatText'

type Props = {
  name: string
  triggerStyle?: CSSProperties
  showLabel?: boolean
  size?: number
}

export default function AmuletInlineTag({
  name,
  triggerStyle,
  showLabel = true,
  size = 24,
}: Props) {
  const { key } = useTenant()
  const lang: 'en' | 'jp' | 'kr' = key === 'jp' ? 'jp' : key === 'kr' ? 'kr' : 'en'

  const amulets = amuletsRaw as Accessory[]
  const amulet = amulets.find(a => a.name === name)
  if (!amulet) return <span className="text-red-500">{name}</span>

  const pick = (base?: string, jp?: string, kr?: string) =>
    lang === 'jp' ? (jp ?? base ?? '') : lang === 'kr' ? (kr ?? base ?? '') : (base ?? '')

  const label = pick(amulet.name, amulet.name_jp, amulet.name_kr)

  // On privilégie la description Lv4 si dispo, sinon Lv1
  const effectText = pick(
    amulet.effect_desc4 || amulet.effect_desc1,
    amulet.effect_desc4_jp || amulet.effect_desc1_jp,
    amulet.effect_desc4_kr || amulet.effect_desc1_kr
  )

  const effectName = pick(amulet.effect_name, amulet.effect_name_jp, amulet.effect_name_kr)

  const rarity = (amulet.rarity || 'Legendary').toLowerCase()
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
                src={`/images/equipment/${amulet.image}.webp`}
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
          <div className="flex flex-col gap-0.5 text-white">
            {effectName && <span className="text-xs text-sky-300">{effectName}</span>}

            <span className="text-xs leading-snug whitespace-pre-line">
              {formatEffectText(effectText)}
            </span>
          </div>
          <HoverCard.Arrow className="fill-[#333]" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  )
}
