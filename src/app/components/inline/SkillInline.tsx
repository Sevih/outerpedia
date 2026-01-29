'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import * as HoverCard from '@radix-ui/react-hover-card'
import { toKebabCase } from '@/utils/formatText'
import abbrevData from '@/data/abbrev.json'
import { useI18n } from '@/lib/contexts/I18nContext'
import { l, lRec, lEnhancement } from '@/lib/localize'
import type { Localized } from '@/types/common'

type AbbrevEntry = string | Localized
const abbrev = abbrevData as Record<string, AbbrevEntry>

const INLINE_ICON_SIZE = 18

type Props = {
  character: string
  skill: 'S1' | 'S2' | 'S3' | 'Passive' | 'Chain'
  showIcon?: boolean
  showEnhancements?: boolean
}

const skillMap: Record<Props['skill'], string> = {
  S1: 'SKT_FIRST',
  S2: 'SKT_SECOND',
  S3: 'SKT_ULTIMATE',
  Passive: 'SKT_CHAIN_PASSIVE',
  Chain: 'SKT_CHAIN_PASSIVE',
}

function formatColorTags(input: string) {
  return input
    .replace(/<color=#(.*?)>(.*?)<\/color>/g, (_m, color, text) => {
      return `<span style="color:#${color}">${text}</span>`
    })
    .replace(/\\n/g, '<br />')
}

export default function SkillInline({ character, skill, showIcon = true, showEnhancements = false }: Props) {
  const { lang, t } = useI18n()
  const [data, setData] = useState<null | {
    name: string
    displayName: string
    desc: string
    icon: string
    cd?: string | number
    wgr?: number
    enhancement?: Record<string, string[]>
    charFullEn: string
    charFullLocalized: string
  }>(null)

  const slug = toKebabCase(character)
  const skillKey = skillMap[skill]

  useEffect(() => {
    import(`@/data/char/${slug}.json`)
      .then((mod) => {
        const rawSkill = mod.skills?.[skillKey]
        if (!rawSkill) return

        const isChainOrPassive = skill === 'Chain' || skill === 'Passive'

        const displayName =
          skill === 'Passive'
            ? t('skills.dualAttack')
            : l(rawSkill, 'name', lang)

        let rawDesc = l(rawSkill, 'true_desc', lang) || '—'
        if (isChainOrPassive) {
          const parts = rawDesc.split('\\n\\n')
          rawDesc = skill === 'Chain' ? parts[0] : parts[1] || parts[0]
        }

        const desc = formatColorTags(rawDesc)
        const enhancement = lEnhancement(rawSkill.enhancement as Record<string, string[]> | undefined, lang)
        const icon = isChainOrPassive
          ? `/images/characters/chain/Skill_ChainPassive_${mod.Element}_${mod.Chain_Type}.webp`
          : `/images/characters/skills/${rawSkill.IconName}.webp`

        setData({
          name: l(rawSkill, 'name', lang),
          displayName,
          desc,
          icon,
          cd: rawSkill.cd ?? undefined,
          wgr: rawSkill.wgr ?? undefined,
          enhancement,
          charFullEn: mod.Fullname,
          charFullLocalized: l(mod, 'Fullname', lang),
        })
      })
      .catch((err) => {
        console.error(`[SkillInline] Error loading ${slug}.json`, err)
      })
  }, [slug, skillKey, skill, lang, t])

  if (!data) return <span className="text-red-500">[{character} {skill}]</span>

  const fallbackIcon = data.icon.replace('.webp', '.png')

  const abEntry = abbrev[data.charFullEn]
  const abbr = abEntry
    ? (typeof abEntry === 'string' ? abEntry : lRec(abEntry, lang))
    : data.charFullLocalized

  const tooltipContent = (
    <div className="flex flex-col text-white text-xs w-full">
      {/* Header: skill icon + name + character info */}
      <div className="flex items-start gap-2">
        <span className="relative w-10 h-10 shrink-0">
          <Image
            src={data.icon}
            alt={data.name}
            fill
            className="object-contain"
            sizes="40px"
            onError={(e) => {
              const img = e.currentTarget
              img.onerror = null
              img.src = fallbackIcon
            }}
          />
          {/* Skill level badge */}
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
            1
          </span>
        </span>

        <div className="flex-1">
          <div className="font-bold text-sm">{data.displayName}</div>
          <div className="text-neutral-400 text-[11px]">{abbr} {skill}</div>
          {data.wgr !== undefined && (
            <div className="text-neutral-300">{t('weakness_gauge_reduction')}: {data.wgr}</div>
          )}
          {data.cd && (
            <div className="text-neutral-300">{t('cooldown')}: {data.cd} {t('turn_s')}</div>
          )}
        </div>
      </div>

      {/* Description */}
      <span
        className="whitespace-pre-line text-xs leading-snug mt-2"
        dangerouslySetInnerHTML={{ __html: data.desc }}
      />

      {/* Enhancements */}
      {data.enhancement && showEnhancements && (
        <div className="pt-2">
          <span className="text-neutral-300 font-semibold block mb-1">
            {t('enhancements_label')}
          </span>
          <div className="font-mono space-y-1">
            {Object.entries(data.enhancement).map(([level, lines]) => (
              <div key={level} className="flex items-start gap-2">
                <div className="text-white font-semibold w-10 shrink-0">+{level}:</div>
                <div className="flex flex-col space-y-0.5">
                  {lines.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <HoverCard.Root openDelay={0} closeDelay={0}>
      <HoverCard.Trigger asChild>
        <span className="cursor-help">
          {showIcon && (
            <span
              className="inline-block relative align-middle rounded overflow-hidden"
              style={{ width: INLINE_ICON_SIZE, height: INLINE_ICON_SIZE }}
            >
              <Image
                src={data.icon}
                alt={data.name}
                fill
                sizes={`${INLINE_ICON_SIZE}px`}
                className="object-contain"
                onError={(e) => {
                  const img = e.currentTarget
                  img.onerror = null
                  img.src = fallbackIcon
                }}
              />
            </span>
          )}
          <span className={`text-amber-400 underline underline-offset-2${showIcon ? ' ml-0.5' : ''}`}>
            {data.displayName}
          </span>
        </span>
      </HoverCard.Trigger>

      <HoverCard.Portal>
        <HoverCard.Content
          side="top"
          align="center"
          sideOffset={6}
          className="z-50 px-3 py-2 rounded shadow-lg max-w-[300px] bg-neutral-800 border border-white/10"
        >
          {tooltipContent}
          <HoverCard.Arrow className="fill-neutral-800" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  )
}
