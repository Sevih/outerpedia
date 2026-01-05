'use client'

import Image from 'next/image'
import * as Tooltip from '@radix-ui/react-tooltip'
import tags from '@/data/tags.json'
import { useI18n } from '@/lib/contexts/I18nContext'
import { l } from '@/lib/localize'
import type { WithLocalizedFields } from '@/types/common'

type BaseTag = {
  label: string
  image: string
  desc: string
  type: string
}

type Tag = WithLocalizedFields<WithLocalizedFields<BaseTag, 'label'>, 'desc'>

type TagDisplayMiniProps = {
  tags?: string[] | string
}

export default function TagDisplayMini({ tags: input = [] }: TagDisplayMiniProps) {
  const { lang } = useI18n()
  const normalized = Array.isArray(input) ? input : input ? [input] : []

  const tagList: Array<{ key: string; def: Tag }> = normalized
    .map((key) => {
      const def = (tags as Record<string, Tag>)[key]
      return def ? { key, def } : null
    })
    .filter((v): v is { key: string; def: Tag } => !!v)

  const renderTag = ({ key, def }: { key: string; def: Tag }, idx: number) => {
    const localizedLabel = l(def, 'label', lang)
    const localizedDesc = l(def, 'desc', lang)

    return (
      <Tooltip.Provider delayDuration={1} skipDelayDuration={0} disableHoverableContent={false} key={`${key}-${idx}`}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <div className="flex items-center p-0 rounded cursor-pointer mr-1 mb-1">
              <Image
                src={def.image}
                alt={localizedLabel}
                width={24}
                height={24}
                style={{ width: 24, height: 24 }}
                className={`object-contain`}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <p className='pl-1'>{localizedLabel}</p>
            </div>
          </Tooltip.Trigger>

          <Tooltip.Portal>
            <Tooltip.Content
              side="top"
              align="center"
              className={`z-50 px-3 py-2 rounded shadow-lg max-w-[260px] flex items-start gap-2 bg-gray-700 border-1 mb-3`}
            >
              <div className="relative w-[28px] h-[28px] p-1 rounded shrink-0">
                <Image
                  src={def.image}
                  alt={localizedLabel}
                  fill
                  sizes="28px"
                  className="object-contain"
                />
              </div>

              <div className="flex flex-col">
                <span className="text-white text-xs leading-snug whitespace-pre-line">{localizedDesc}</span>
              </div>
              <Tooltip.Arrow className="fill-gray-700" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    )
  }

  if (tagList.length === 0) return null

  return <div className="flex flex-wrap">{tagList.map(renderTag)}</div>
}
