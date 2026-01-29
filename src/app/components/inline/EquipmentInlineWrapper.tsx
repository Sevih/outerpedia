'use client'

import * as HoverCard from '@radix-ui/react-hover-card'
import Image from 'next/image'
import type { ReactNode } from 'react'

// Taille par défaut: 18px pour respecter line-height de text-sm (20px)
export const INLINE_ICON_SIZE = 18

type Props = {
  iconPath: string
  bgPath: string
  label: string
  color?: string
  tooltipContent: ReactNode
}

export default function EquipmentInlineWrapper({
  iconPath,
  bgPath,
  label,
  color = 'text-amber-400',
  tooltipContent,
}: Props) {
  return (
    <HoverCard.Root openDelay={0} closeDelay={0}>
      <HoverCard.Trigger asChild>
        <button type="button">
          <span
            className="inline-block relative align-middle rounded overflow-hidden"
            style={{ width: INLINE_ICON_SIZE, height: INLINE_ICON_SIZE }}
          >
            <Image
              src={bgPath}
              alt=""
              fill
              sizes={`${INLINE_ICON_SIZE}px`}
              className="object-cover"
            />
            <Image
              src={iconPath}
              alt={label}
              fill
              sizes={`${INLINE_ICON_SIZE}px`}
              className="object-contain relative z-10"
            />
          </span>
          <span className={`ml-0.5 ${color} underline`}>{label}</span>
        </button>
      </HoverCard.Trigger>

      <HoverCard.Portal>
        <HoverCard.Content
          side="top"
          align="center"
          sideOffset={6}
          className="z-50 px-3 py-2 rounded shadow-lg max-w-[280px] bg-neutral-800 border border-white/10"
        >
          {tooltipContent}
          <HoverCard.Arrow className="fill-neutral-800" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  )
}
