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

type CharacterRecommendation = {
  names: string | string[]
  reason: string | LangMap
}

type Props = {
  entries: CharacterRecommendation[]
}

export default function RecommendedCharacterList({ entries }: Props) {
  const { key: lang } = useTenant()
  const t = getT(lang)

  return (
    <div>
      <GuideHeading level={3}>{t('guide.recommendedCharacters')}</GuideHeading>
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