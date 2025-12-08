'use client'

import Link from 'next/link'
import allCharacters from '@/data/_allCharacters.json'
import { toKebabCase } from '@/utils/formatText'
import { useTenant } from '@/lib/contexts/TenantContext'
import { l, lRec } from '@/lib/localize'
import { getT } from '@/i18n'
import { CharacterPortrait } from '@/app/components/CharacterPortrait'
import parseText from '@/utils/parseText'
import type { PartnerEntry } from '@/types/partners'

type Props = {
  /** Title override, defaults to i18n partners_title */
  title?: string
  partners: PartnerEntry[]
}

type ResolvedCharacter = {
  char: typeof allCharacters[0]
  localizedName: string
  slug: string
}

export default function PartnerList({ title, partners }: Props) {
  const { key: lang } = useTenant()
  const t = getT(lang)

  if (partners.length === 0) return null

  const resolvedTitle = title ?? t('partners_title')

  return (
    <section id="partners" className="mt-8">
      <h2 className="text-2xl font-bold text-white mb-4 flex justify-center gap-2">
        {resolvedTitle}
      </h2>
      <div className="flex flex-col gap-2 max-w-4xl mx-auto">
        {partners.map((entry, index) => {
          const characters = entry.hero.map(slug => {
            const char = allCharacters.find((c) => toKebabCase(c.Fullname) === slug)
            if (!char) return null
            return {
              char,
              localizedName: l(char, 'Fullname', lang),
              slug,
            }
          }).filter(Boolean) as ResolvedCharacter[]

          if (characters.length === 0) {
            return (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-neutral-800/50">
                <span className="text-red-500">{entry.hero.join(', ')}</span>
              </div>
            )
          }

          const reason = lRec(entry.reason, lang)?.trim() || ''

          return (
            <div key={index} className="rounded-lg bg-neutral-800/50 hover:bg-neutral-800 transition-colors p-2">
              {/* Mobile: grid 3 cols */}
              <div className="grid grid-cols-3 gap-x-1 gap-y-3 justify-items-center md:hidden">
                {characters.map(({ char, localizedName, slug }) => (
                  <Link
                    key={char.ID}
                    href={`/characters/${slug}`}
                    className="relative hover:z-10 transition-transform hover:scale-105"
                    title={localizedName}
                  >
                    <div className="relative w-[70px] h-[70px]">
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

              {/* Desktop: rows of 6 portraits + names inline */}
              <div className="hidden md:flex md:flex-col gap-1">
                {(() => {
                  const rows: ResolvedCharacter[][] = []
                  for (let i = 0; i < characters.length; i += 6) {
                    rows.push(characters.slice(i, i + 6))
                  }
                  return rows.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex items-center gap-3">
                      <div className="flex">
                        {row.map(({ char, localizedName, slug }) => (
                          <Link
                            key={char.ID}
                            href={`/characters/${slug}`}
                            className="relative hover:z-10 transition-transform hover:scale-105 mr-1"
                            title={localizedName}
                          >
                            <div className="relative w-[80px] h-[80px]">
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
                      <div className="flex flex-wrap gap-x-1">
                        {row.map(({ char, localizedName, slug }, idx) => (
                          <span key={char.ID}>
                            <Link
                              href={`/characters/${slug}`}
                              className="text-sky-400 hover:text-sky-300 font-medium text-sm transition-colors"
                            >
                              {localizedName}
                            </Link>
                            {idx < row.length - 1 && <span className="text-neutral-500">, </span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                })()}
              </div>

              {/* Description */}
              {reason && (
                <div className="text-sm text-neutral-300 leading-relaxed mt-2 pt-2 border-t border-neutral-700">
                  {parseText(reason)}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
