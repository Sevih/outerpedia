'use client'

import * as HoverCard from '@radix-ui/react-hover-card'
import Image from 'next/image'
import parseText from '@/utils/parseText'

export type Geas = {
  effect: string
  ratio: string
  image: string
  bg: string
}

type Props = {
  geas: Geas
  type: "bonus" | "malus"
}

export default function GeasCard({ geas, type = "bonus" }: Props) {
  const color = type === "bonus" ? "blue" : "red"
  const iconClass = `geas-icon ${color}`
  const level = geas.bg

  return (
    <HoverCard.Root openDelay={0} closeDelay={0}>
      <HoverCard.Trigger asChild>
        <button
          type="button"
          className="relative w-10 h-10 rounded overflow-hidden cursor-pointer shrink-0"
        >
          {/* Image de fond */}
          {geas.bg && (
            <Image
              src={`/images/ui/geas/GD_Slot_Bg_0${geas.bg}.webp`}
              alt="geas background"
              width={40}
              height={40}
              style={{ width: 40, height: 40 }}
              className="object-cover"
            />
          )}

          {/* Texte Lv.X en bas, dans le cercle */}
          {level && (
            <div className="absolute bottom-0 left-0 right-0 text-[10px] text-white font-bold text-center leading-tight z-20 pointer-events-none drop-shadow-sm">
              Lv. {level}
            </div>
          )}

          {/* Icône centrée avec filtre */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="relative w-8 h-8">
              <Image
                src={`/images/ui/geas/GD_Geis_${geas.image}.webp`}
                alt={geas.image}
                width={32}
                height={32}
                style={{ width: 32, height: 32 }}
                className={`object-contain ${iconClass}`}
              />
            </div>
          </div>
        </button>
      </HoverCard.Trigger>

      <HoverCard.Portal>
        <HoverCard.Content
          side="top"
          align="center"
          sideOffset={8}
          className="z-50 px-3 py-2 rounded shadow-lg max-w-[265px] flex items-start gap-2 bg-neutral-900 outline-none"
        >
          <div className="relative w-10 h-10 rounded overflow-hidden shrink-0">
            {geas.bg && (
              <Image
                src={`/images/ui/geas/GD_Slot_Bg_0${geas.bg}.webp`}
                alt="geas background"
                width={40}
                height={40}
                style={{ width: 40, height: 40 }}
                className="object-cover"
              />
            )}
            {level && (
              <div className="absolute bottom-0 left-0 right-0 text-[10px] text-white font-bold text-center leading-tight z-20 pointer-events-none drop-shadow-sm">
                Lv. {level}
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="relative w-8 h-8">
                <Image
                  src={`/images/ui/geas/GD_Geis_${geas.image}.webp`}
                  alt={geas.image}
                  width={32}
                  height={32}
                  style={{ width: 32, height: 32 }}
                  className={`object-contain ${iconClass}`}
                />
              </div>
            </div>
          </div>

          <div className="text-neutral-200 text-sm">
            <div className="text-neutral-300">{parseText(geas.effect)}</div>
            {geas.ratio && (
              <div className="text-xs text-sky-300 mt-1 font-semibold">
                Point Ratio: {geas.ratio}
              </div>
            )}
          </div>

          <HoverCard.Arrow className="fill-neutral-900 w-3 h-2" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  )
}
