'use client'

import Link from 'next/link'
import allCharacters from '@/data/_allCharacters.json'
import { toKebabCase } from '@/utils/formatText'
import { useTenant } from '@/lib/contexts/TenantContext'
import { l, lRec, type LangMap } from '@/lib/localize'
import { getT } from '@/i18n'
import { CharacterPortrait } from '@/app/components/CharacterPortrait'
import GuideHeading from '@/app/components/GuideHeading'
import parseText from '@/utils/parseText'
import type { TenantKey } from '@/tenants/config'

// Presets disponibles (clés i18n)
const TITLE_PRESETS = ['default', 'phase1', 'phase2'] as const

type TitlePreset = typeof TITLE_PRESETS[number]

type CharacterRecommendation = {
  names: string | string[]
  reason: string | LangMap
}

type Props = {
  /** Preset key, custom LangMap, or false to hide the title. Defaults to 'default' (Recommended Characters) */
  title?: TitlePreset | LangMap | false
  entries: CharacterRecommendation[]
}

function isPreset(title: TitlePreset | LangMap): title is TitlePreset {
  return typeof title === 'string' && TITLE_PRESETS.includes(title as TitlePreset)
}

function resolveTitle(title: TitlePreset | LangMap, t: ReturnType<typeof getT>, lang: TenantKey): string {
  if (isPreset(title)) {
    if (title === 'default') {
      return t('guide.recommendedCharacters')
    }
    return t(`tips.${title}`)
  }
  return lRec(title as LangMap, lang)
}

export default function RecommendedCharacterList({ title = 'default', entries }: Props) {
  const { key: lang } = useTenant()
  const t = getT(lang)

  const resolvedTitle = title !== false ? resolveTitle(title, t, lang) : null

  return (
    <div>
      {resolvedTitle && <GuideHeading level={3}>{resolvedTitle}</GuideHeading>}
      <div className="flex flex-col gap-2">
      {entries.map((entry, index) => {
        const nameList = Array.isArray(entry.names) ? entry.names : [entry.names]

        const characters = nameList.map(name => {
          const fullName = name
          const char = allCharacters.find((c) => c.Fullname === fullName)
          if (!char) return null

          return {
            char,
            localizedName: l(char, 'Fullname', lang),
            slug: toKebabCase(char.Fullname),
          }
        }).filter(Boolean) as { char: typeof allCharacters[0], localizedName: string, slug: string }[]

        if (characters.length === 0) {
          return (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-neutral-800/50">
              <span className="text-red-500">{nameList.join(', ')}</span>
            </div>
          )
        }

        return (
          <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 transition-colors">
            {/* Character portraits */}
            <div className="flex">
              {characters.map(({ char, localizedName, slug }) => (
                <Link
                  key={char.ID}
                  href={`/characters/${slug}`}
                  className="relative hover:z-10 transition-transform hover:scale-105 mr-1"
                  title={localizedName}
                >
                  <div className="relative w-[70px] h-[70px] sm:w-[80px] sm:h-[80px]">
                    <CharacterPortrait
                      characterId={char.ID}
                      characterName={localizedName}
                      size={80}
                      className="rounded-lg border-2 border-gray-600 bg-gray-900"
                      showIcons
                      showStars
                    />
                  </div>
                </Link>
              ))}
            </div>

            {/* Names and description */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-x-1 mb-0.5">
                {characters.map(({ char, localizedName, slug }, idx) => (
                  <span key={char.ID}>
                    <Link
                      href={`/characters/${slug}`}
                      className="text-sky-400 hover:text-sky-300 font-medium transition-colors"
                    >
                      {localizedName}
                    </Link>
                    {idx < characters.length - 1 && <span className="text-neutral-500">, </span>}
                  </span>
                ))}
              </div>
              <div className="text-sm text-neutral-300 leading-relaxed">
                {parseText(lRec(entry.reason, lang))}
              </div>
            </div>
          </div>
        )
      })}
      </div>
    </div>
  )
}
