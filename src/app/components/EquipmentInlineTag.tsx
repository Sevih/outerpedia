'use client'

import Image from 'next/image'
import * as Tooltip from '@radix-ui/react-tooltip'

import ee from '@/data/ee.json'
import talisman from '@/data/talisman.json'
import weapon from '@/data/weapon.json'
import amulet from '@/data/amulet.json'

type Props = {
  name: string
  type: 'ee' | 'talisman' | 'weapon' | 'amulet'
}

type BaseItem = {
  name: string
  icon?: string
  image?: string
  effect?: string
  effect10?: string
  icon_effect?: string
  effect_desc1?: string
  effect_desc4?: string
}

export default function EquipmentInlineTag({ name, type }: Props) {
  let item: BaseItem | undefined
  let iconPath = ''
  let effectText = ''
  let subEffect = ''

  switch (type) {
    case 'ee': {
      const match = Object.values(ee).find((e) => (e as BaseItem).name === name) as BaseItem | undefined
      if (match) {
        item = match
        iconPath = `/images/characters/ex/TI_Equipment_EX_${item.icon}.png`
        effectText = item.effect || ''
        subEffect = item.effect10 || ''
      }
      break
    }

    case 'talisman': {
      item = talisman.find((t) => t.name === name)
      if (item) {
        iconPath = `/images/equipment/TI_Equipment_Talisman_${item.icon}.webp`
        effectText = item.effect || ''
        subEffect = item.effect10 || ''
      }
      break
    }

    case 'weapon': {
      item = weapon.find((w) => w.name === name)
      if (item) {
        iconPath = `/images/equipment/${item.image}`
        effectText = item.effect || ''
      }
      break
    }

    case 'amulet': {
      item = amulet.find((a) => a.name === name)
      if (item) {
        iconPath = `/images/equipment/${item.image}`
        effectText = `Tier 0: ${item.effect_desc1 ?? ''}`
        subEffect = `Tier 4: ${item.effect_desc4 ?? ''}`
      }
      break
    }
  }

  if (!item) return <span className="text-red-500">{name}</span>

  return (
    <Tooltip.Provider delayDuration={0}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span className="inline-flex items-end gap-1 align-bottom">
            <span className="inline-block w-[24px] h-[24px] relative align-bottom">
              <Image
                src={iconPath}
                alt={item.name}
                fill
                sizes="24px"
                className="object-contain relative z-10"
              />
            </span>
            <span className="underline text-red-500">{item.name}</span>
          </span>
        </Tooltip.Trigger>

        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            align="center"
            className="z-50 px-3 py-2 rounded shadow-lg max-w-[260px] flex items-start gap-2 bg-neutral-800"
          >
            <div className="flex flex-col">
              <span className="font-bold text-red-500 text-sm leading-tight">{item.name}</span>
              {effectText && (
                <span className="text-white text-xs leading-snug whitespace-pre-line">{effectText}</span>
              )}
              {subEffect && (
                <span className="text-xs text-amber-300 italic mt-1">{subEffect}</span>
              )}
            </div>
            <Tooltip.Arrow className="fill-neutral-700" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
