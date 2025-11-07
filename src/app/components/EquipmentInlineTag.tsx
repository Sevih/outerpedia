'use client'

import Image from 'next/image'
import * as HoverCard from '@radix-ui/react-hover-card'
import React from 'react'

import ee from '@/data/ee.json'
import talisman from '@/data/talisman.json'
import weapon from '@/data/weapon.json'
import amulet from '@/data/amulet.json'
import sets from '@/data/sets.json'
//TODO Utiliser les enums

import type { ExclusiveEquipment, Talisman, Weapon, Accessory, ArmorSet } from '@/types/equipment'

import { ClassIcon } from '@/app/components/ClassIcon'
import { ClassType } from '@/types/enums'

// i18n + localize
import { useI18n } from '@/lib/contexts/I18nContext'
import { l } from '@/lib/localize'

function isValidClass(c: unknown): c is ClassType {
  return typeof c === 'string' && ['Striker', 'Defender', 'Ranger', 'Healer', 'Mage'].includes(c)
}

type Props = {
  name: string
  type: 'ee' | 'talisman' | 'weapon' | 'amulet' | 'set'
}

type EquipmentUnion = ExclusiveEquipment | Talisman | Weapon | Accessory | ArmorSet

type Obtainable = {
  source?: string | null
  boss?: string | null
  mode?: string | null
}

function isObtainable(v: unknown): v is Obtainable {
  return !!v && typeof v === 'object' && ('source' in v || 'boss' in v || 'mode' in v)
}


export default function EquipmentInlineTag({ name, type }: Props) {
  const { lang, t } = useI18n() // TenantKey

  let item: EquipmentUnion | undefined
  let iconPath = ''
  let effectText = ''
  let subEffect = ''
  let displayName = name

  let customSetTooltip: React.ReactNode = null

  const obtain: { source?: string; bossOrMode?: string } | null = isObtainable(item)
  ? {
      source: item.source ?? undefined,
      bossOrMode: [item.boss, item.mode].filter(Boolean).join(' ') || undefined,
    }
  : null

  const hasObtain = !!(obtain && (obtain.source || obtain.bossOrMode))



  switch (type) {
    case 'ee': {
      const match = Object.values(ee).find((e) => (e as ExclusiveEquipment).name === name) as ExclusiveEquipment | undefined
      if (match) {
        item = match
        displayName = l(item, 'name', lang)
        // EE: icon_effect
        iconPath = `/images/characters/ex/${item.icon_effect}.webp`
        effectText = l(item, 'effect', lang)
        subEffect  = l(item, 'effect10', lang)
      }
      break
    }

    case 'talisman': {
      const match = (talisman as Talisman[]).find((t) => t.name === name)
      if (match) {
        item = match
        displayName = l(item, 'name', lang)
        // Talisman: image via icon_item
        iconPath = `/images/equipment/${item.image}.webp`
        effectText = l(item, 'effect_desc1', lang)
        subEffect  = l(item, 'effect_desc4', lang)
      }
      break
    }

    case 'weapon': {
      const match = (weapon as Weapon[]).find((w) => w.name === name)
      if (match) {
        item = match
        displayName = l(item, 'name', lang)
        iconPath = `/images/equipment/${item.image}.webp`
        subEffect  = l(item, 'effect_desc4', lang)
      }
      break
    }

    case 'amulet': { // Accessory
      const match = (amulet as Accessory[]).find((a) => a.name === name)
      if (match) {
        item = match
        displayName = l(item, 'name', lang)
        iconPath = `/images/equipment/${item.image}.webp`
        const tier4 = l(item, 'effect_desc4', lang)
        subEffect  = tier4 ? `${t('items.tier4')}: ${tier4}` : ''
      }
      break
    }

    case 'set': {
      const match = (sets as ArmorSet[]).find((s) => s.name === name)
      if (match) {
        // on garde un mini-objet pour footer; mais on peut aussi utiliser match directement
        item = match
        displayName = l(match as unknown as Record<string, unknown>, 'name', lang)
        iconPath = `/images/ui/effect/${match.set_icon}.webp`

        const lines2: React.ReactNode[] = []
        const lines4: React.ReactNode[] = []


        const e24 = l(match as unknown as Record<string, unknown>, 'effect_2_4', lang)
        const e44 = l(match as unknown as Record<string, unknown>, 'effect_4_4', lang)

        if (e24) lines2.push(
          <p key="2-4" className="text-amber-300 text-xs italic">{t('items.tier4')}: {e24}</p>
        )
        if (e44) lines4.push(
          <p key="4-4" className="text-amber-300 text-xs italic">{t('items.tier4')}: {e44}</p>
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
              alt={displayName}
              fill
              sizes="24px"
              className="object-contain relative z-10"
            />
          </span>
          <span>{displayName}</span>
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
              alt={displayName}
              width={28}
              height={28}
              style={{ width: 28, height: 28 }}
              className="object-contain"
            />
          </div>

          <div className="flex flex-col">
            <span className="font-bold text-white text-sm leading-tight">
              {displayName}
              {'class' in item && item.class && isValidClass(item.class) && (
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
                  <span className="text-white text-xs leading-snug whitespace-pre-line">
                    {effectText}
                  </span>
                )}
                {subEffect && (
                  <span className="text-xs text-amber-300 italic mt-1">
                    {subEffect}
                  </span>
                )}
              </>
            )}

            {hasObtain && (
  <div className="mt-2">
    <p className="text-gray-400 font-semibold text-xs">{t('items.obtained')}</p>
    <p className="text-gray-400 text-xs">
      {obtain?.source ?? ''}
      {obtain?.source && obtain?.bossOrMode ? <br /> : null}
      {obtain?.bossOrMode ?? ''}
    </p>
  </div>
)}

          </div>

          <HoverCard.Arrow className="fill-neutral-700 w-3 h-2" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  )
}
