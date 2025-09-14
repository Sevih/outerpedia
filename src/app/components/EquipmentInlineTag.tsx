'use client'

import Image from 'next/image'
import * as HoverCard from '@radix-ui/react-hover-card'; // ✅ On utilise HoverCard directement
import React from 'react'

import ee from '@/data/ee.json'
import talisman from '@/data/talisman.json'
import weapon from '@/data/weapon.json'
import amulet from '@/data/amulet.json'
import sets from '@/data/sets.json'
import { ClassIcon } from '@/app/components/ClassIcon'

import { ClassType } from '@/types/enums'

function isValidClass(c: unknown): c is ClassType {
  return typeof c === 'string' && ['Striker', 'Defender', 'Ranger', 'Healer', 'Mage'].includes(c)
}



type Props = {
  name: string
  type: 'ee' | 'talisman' | 'weapon' | 'amulet' | 'set'
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
  class?: string | null
  source?: string | null
  boss?: string | null
  mode?: string | null
}

export default function EquipmentInlineTag({ name, type }: Props) {
  let item: BaseItem | undefined
  let iconPath = ''
  let effectText = ''
  let subEffect = ''

  let customSetTooltip = null

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
        effectText = item.effect_desc1 || ''
        subEffect = item.effect_desc4 || ''
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

    case 'set': {
      const match = sets.find((s) => s.name === name)
      if (match) {
        item = {
          name: match.name,
          source: match.source ?? null,
          boss: match.boss ?? null,
          mode: match.mode ?? null,
        }
        iconPath = `/images/ui/effect/TI_Icon_Set_Enchant_${match.set_icon}.webp`

        const lines2 = []
        const lines4 = []


        if (match.effect_2_1) lines2.push(
          <p key="2-0" className="text-white text-xs">Tier 0: {match.effect_2_1}</p>
        )
        if (match.effect_2_4) lines2.push(
          <p key="2-4" className="text-amber-300 text-xs italic">Tier 4: {match.effect_2_4}</p>
        )
        if (match.effect_4_1) lines4.push(
          <p key="4-0" className="text-white text-xs">Tier 0: {match.effect_4_1}</p>
        )
        if (match.effect_4_4) lines4.push(
          <p key="4-4" className="text-amber-300 text-xs italic">Tier 4: {match.effect_4_4}</p>
        )

        customSetTooltip = (
          <div className="flex flex-col gap-1">
            {lines2.length > 0 && (
              <div>
                <p className="underline text-white text-sm font-semibold">2 pieces</p>
                {lines2}
              </div>
            )}
            {lines4.length > 0 && (
              <div className="mt-2">
                <p className="underline text-white text-sm font-semibold">4 pieces</p>
                {lines4}
              </div>
            )}
          </div>
        )
      }
      break
    }
  }

  if (!item) return <span className="text-red-500">{name}</span>

  return (
    <HoverCard.Root openDelay={0} closeDelay={0}>
      <HoverCard.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-end gap-1 align-bottom cursor-pointer underline text-red-500"
        >
          <span className="inline-block w-[24px] h-[24px] relative align-bottom">
            <Image
              src={iconPath}
              alt={item.name}
              fill
              sizes="24px"
              className="object-contain relative z-10"
            />
          </span>
          <span>{item.name}</span>
        </button>
      </HoverCard.Trigger>

      <HoverCard.Portal>
        <HoverCard.Content
          side="top"
          align="center"
          sideOffset={8}
          className="z-50 px-3 py-2 rounded shadow-lg max-w-[300px] flex items-start gap-2 bg-neutral-800 outline-none"
        >
          <div className="bg-black p-1 rounded shrink-0">
            <Image
              src={iconPath}
              alt={item.name}
              width={28}
              height={28}
              style={{ width: 28, height: 28 }}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white text-sm leading-tight">
              {item.name}
              {item.class && isValidClass(item.class) && (
                <span className="inline-block ml-1 align-middle">
                  <ClassIcon className={item.class} />
                </span>
              )}
            </span>

            {type === 'set' ? (
              customSetTooltip
            ) : (
              <>
                {effectText && (
                  <span className="text-white text-xs leading-snug whitespace-pre-line">{effectText}</span>
                )}
                {subEffect && (
                  <span className="text-xs text-amber-300 italic mt-1">{subEffect}</span>
                )}
              </>
            )}

            {/* BLOC AJOUTÉ */}
            <div className="mt-2">
              <p className="text-gray-400 font-semibold text-xs">Obtained from : </p>
              <p className="text-gray-400 text-xs">
                {item.source} <br />
                {item.boss || item.mode}
              </p>
            </div>

          </div>
          <HoverCard.Arrow className="fill-neutral-700 w-3 h-2" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  )
}
