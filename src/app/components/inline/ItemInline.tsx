'use client'

import * as HoverCard from '@radix-ui/react-hover-card'
import Image from 'next/image'
import rawItems from '@/data/items.json'
import { useI18n } from '@/lib/contexts/I18nContext'
import { l, lRec } from '@/lib/localize'
import { getAvailableLanguages, type TenantKey } from '@/tenants/config'
import type { Item } from '@/types/item'

const INLINE_ICON_SIZE = 18

type Lng = TenantKey
type LangMap = Record<Lng, string>

const items = rawItems as Item[]

type Props = {
  name: string
}

function toKebabCase(str: string) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '')
    .toLowerCase()
}

function isLangMap(v: unknown): v is LangMap {
  if (!v || typeof v !== 'object') return false
  const m = v as Record<string, unknown>
  const availableLanguages = getAvailableLanguages()
  return availableLanguages.every(k => typeof m[k] === 'string')
}

export default function ItemInline({ name }: Props) {
  const { lang } = useI18n()

  const item = items.find(i => i.name === name)
  if (!item) return <span className="text-red-500">{name}</span>

  const iconBase = item.icon
    ? `/images/item/${item.icon}.webp`
    : `/images/items/${toKebabCase(item.name)}.webp`

  const label = l(item, 'name', lang as Lng)
  const description = isLangMap(item.description)
    ? lRec(item.description, lang as Lng, { allowEmpty: true })
    : l(item, 'description', lang as Lng, { allowEmpty: true })

  const bgPath = `/images/bg/CT_Slot_${item.rarity}.webp`

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
              src={iconBase}
              alt={label}
              fill
              sizes={`${INLINE_ICON_SIZE}px`}
              className="object-contain relative z-10"
            />
          </span>
          <span className="ml-0.5 underline">{label}</span>
        </button>
      </HoverCard.Trigger>

      <HoverCard.Portal>
        <HoverCard.Content
          side="top"
          align="center"
          sideOffset={6}
          className="z-50 px-3 py-2 rounded shadow-lg max-w-[265px] bg-neutral-800 border border-white/10"
        >
          <div className="flex items-start gap-2">
            <span
              className="relative rounded shrink-0"
              style={{ width: 40, height: 40 }}
            >
              <Image
                src={bgPath}
                alt=""
                fill
                sizes="40px"
                className="object-cover rounded"
              />
              <Image
                src={iconBase}
                alt={label}
                fill
                sizes="40px"
                className="object-contain relative z-10"
              />
            </span>
            <div className="flex flex-col text-white">
              <span className="font-bold text-sm leading-tight">{label}</span>
              <span className="text-xs leading-snug whitespace-pre-line">
                {description.replace(/\\n/g, '\n')}
              </span>
            </div>
          </div>
          <HoverCard.Arrow className="fill-neutral-800" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  )
}
