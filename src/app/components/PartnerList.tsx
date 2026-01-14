'use client'

import Image from 'next/image'
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
  type: 'character'
  char: typeof allCharacters[0]
  localizedName: string
  slug: string
}

type ResolvedFamily = {
  type: 'class' | 'element'
  value: string
  label: string
}

type ResolvedHero = ResolvedCharacter | ResolvedFamily

function parseInlineTag(hero: string): ResolvedFamily | null {
  const classMatch = hero.match(/^\{C\/(.+)\}$/)
  if (classMatch) {
    return { type: 'class', value: classMatch[1].toLowerCase(), label: classMatch[1] }
  }
  const elemMatch = hero.match(/^\{E\/(.+)\}$/)
  if (elemMatch) {
    return { type: 'element', value: elemMatch[1].toLowerCase(), label: elemMatch[1] }
  }
  return null
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
          const heroes: ResolvedHero[] = entry.hero.map(heroStr => {
            // Check if it's an inline tag (class or element family)
            const family = parseInlineTag(heroStr)
            if (family) return family

            // Otherwise treat as character slug
            const char = allCharacters.find((c) => toKebabCase(c.Fullname) === heroStr)
            if (!char) return null
            return {
              type: 'character' as const,
              char,
              localizedName: l(char, 'Fullname', lang),
              slug: heroStr,
            }
          }).filter(Boolean) as ResolvedHero[]

          if (heroes.length === 0) {
            return (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-neutral-800/50">
                <span className="text-red-500">{entry.hero.join(', ')}</span>
              </div>
            )
          }

          const reason = lRec(entry.reason, lang)?.trim() || ''

          const renderHeroPortrait = (hero: ResolvedHero, size: number) => {
            if (hero.type === 'character') {
              return (
                <Link
                  key={hero.char.ID}
                  href={`/characters/${hero.slug}`}
                  className="relative hover:z-10 transition-transform hover:scale-105"
                  title={hero.localizedName}
                >
                  <div className="relative" style={{ width: size, height: size }}>
                    <CharacterPortrait
                      characterId={hero.char.ID}
                      characterName={hero.localizedName}
                      size={size}
                      className="rounded-lg border-2 border-gray-600 bg-gray-900"
                      showIcons
                      showStars
                    />
                  </div>
                </Link>
              )
            }
            // Family (class or element)
            const iconPath = hero.type === 'class'
              ? `/images/ui/class/${hero.value}.webp`
              : `/images/ui/elem/${hero.value}.webp`
            return (
              <div
                key={`${hero.type}-${hero.value}`}
                className="relative flex items-center justify-center rounded-lg border-2 border-gray-600 bg-gray-900"
                style={{ width: size, height: size }}
                title={hero.label}
              >
                <Image
                  src={iconPath}
                  alt={hero.label}
                  width={size * 0.6}
                  height={size * 0.6}
                  className="object-contain"
                />
              </div>
            )
          }

          const renderHeroName = (hero: ResolvedHero) => {
            if (hero.type === 'character') {
              return (
                <Link
                  href={`/characters/${hero.slug}`}
                  className="text-sky-400 hover:text-sky-300 font-medium text-sm transition-colors"
                >
                  {hero.localizedName}
                </Link>
              )
            }
            // Family: just display the label with appropriate color
            const colorClass = hero.type === 'class' ? 'text-orange-400' : 'text-sky-400'
            return <span className={`font-medium text-sm ${colorClass}`}>{hero.label}</span>
          }

          return (
            <div key={index} className="rounded-lg bg-neutral-800/50 hover:bg-neutral-800 transition-colors p-2">
              {/* Mobile: grid 3 cols */}
              <div className="grid grid-cols-3 gap-x-1 gap-y-3 justify-items-center md:hidden">
                {heroes.map((hero, idx) => (
                  <div key={hero.type === 'character' ? hero.char.ID : `${hero.type}-${hero.value}-${idx}`}>
                    {renderHeroPortrait(hero, 70)}
                  </div>
                ))}
              </div>

              {/* Desktop: rows of 6 portraits + names inline */}
              <div className="hidden md:flex md:flex-col gap-1">
                {(() => {
                  const rows: ResolvedHero[][] = []
                  for (let i = 0; i < heroes.length; i += 6) {
                    rows.push(heroes.slice(i, i + 6))
                  }
                  return rows.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {row.map((hero, idx) => (
                          <div key={hero.type === 'character' ? hero.char.ID : `${hero.type}-${hero.value}-${idx}`}>
                            {renderHeroPortrait(hero, 80)}
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-x-1">
                        {row.map((hero, idx) => (
                          <span key={hero.type === 'character' ? hero.char.ID : `${hero.type}-${hero.value}-${idx}`}>
                            {renderHeroName(hero)}
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
