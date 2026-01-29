'use client'

import * as HoverCard from '@radix-ui/react-hover-card'
import Image from 'next/image'
import type { ReactNode } from 'react'

// Taille par défaut: 18px pour respecter line-height de text-sm (20px)
export const INLINE_ICON_SIZE = 18

type BaseProps = {
  icon: string
  label: string
  color?: string
  underline?: boolean
  showLabel?: boolean
  imageClassName?: string
}

type WithoutHoverCard = BaseProps & {
  tooltip?: false
}

type WithHoverCard = BaseProps & {
  tooltip: true
  tooltipContent: ReactNode
  tooltipBg?: string
  arrowFill?: string
}

type Props = WithoutHoverCard | WithHoverCard

export default function InlineWrapper(props: Props) {
  const {
    icon,
    label,
    color = 'text-white',
    underline = false,
    showLabel = true,
    imageClassName = '',
  } = props

  const iconElement = (
    <span
      className="inline-block relative align-middle"
      style={{ width: INLINE_ICON_SIZE, height: INLINE_ICON_SIZE }}
    >
      <Image
        src={icon}
        alt={label}
        fill
        sizes={`${INLINE_ICON_SIZE}px`}
        className={`object-contain ${imageClassName}`}
      />
    </span>
  )

  const labelElement = showLabel ? (
    <span className={`ml-0.5 ${color} ${underline ? 'underline' : ''}`}>
      {label}
    </span>
  ) : null

  // Sans tooltip: simple span
  if (!props.tooltip) {
    return (
      <span>
        {iconElement}
        {labelElement}
      </span>
    )
  }

  // Avec tooltip: HoverCard + button
  const { tooltipContent, tooltipBg = 'bg-neutral-800', arrowFill = 'fill-neutral-800' } = props

  return (
    <HoverCard.Root openDelay={0} closeDelay={0}>
      <HoverCard.Trigger asChild>
        <button type="button" className="cursor-help">
          {iconElement}
          {labelElement}
        </button>
      </HoverCard.Trigger>

      <HoverCard.Portal>
        <HoverCard.Content
          side="top"
          align="center"
          sideOffset={6}
          className={`z-50 px-3 py-2 rounded shadow-lg max-w-[280px] ${tooltipBg} border border-white/10`}
        >
          {tooltipContent}
          <HoverCard.Arrow className={arrowFill} />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  )
}
