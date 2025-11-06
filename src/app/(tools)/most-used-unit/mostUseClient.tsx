'use client'

import { useState, useMemo } from 'react'
import type { Character } from '@/types/character'
import Image from 'next/image'
import Link from 'next/link'
import { ElementIcon } from '@/app/components/ElementIcon'
import { ClassIcon } from '@/app/components/ClassIcon'
import { CharacterPortrait } from '@/app/components/CharacterPortrait'
import type { ElementType } from '@/types/enums'
import type { ClassType as classtipe } from '@/types/enums'
import { toKebabCase } from '@/utils/formatText'
import GuidesRaw from '@/data/guides/guides-ref.json'
import { useI18n } from '@/lib/contexts/I18nContext'
import { l } from '@/lib/localize'
import type { Localized } from '@/types/common'

const GUIDES = GuidesRaw as unknown as Record<string, Guide>
// Using a flexible character type that allows for missing skills property
type CharacterData = Omit<Character, 'skills'> & { skills?: Character['skills'] }

interface CharacterUsage {
  character: CharacterData
  count: number
  guides: string[]
  categories: Set<string>
}

interface GuideData {
  category: string
  guideId: string
  characters: string[]
}

interface MostUsedClientProps {
  charactersData: CharacterData[]
  guideUsageData: Record<string, GuideData>
}

// ---- Types & utils
type Guide = {
  category: string
  title: string | Localized
  description: string | Localized
  icon: string
  last_updated: string
  author: string
  second_image?: string
}

const ELEMENTS: (ElementType | 'All')[] = ['All', 'Fire', 'Water', 'Earth', 'Light', 'Dark']
const CLASSES: (classtipe | 'All')[] = ['All', 'Striker', 'Defender', 'Ranger', 'Healer', 'Mage']
const RARITIES = [1, 2, 3] as const
type Rarity = typeof RARITIES[number]

function isRarity(x: unknown): x is Rarity {
  return RARITIES.includes(x as Rarity)
}



// Categories will be translated via i18n using 'categories.{key}'

//helper :
const cleanGuideWord = (s: string): string =>
  s
    // EN
    .replace(/\bGuides?\b/gi, '')
    // JP
    .replace(/ガイド/gi, '')
    // KR
    .replace(/가이드/gi, '')
    // Nettoyage espaces / séparateurs résiduels
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s\-–—:·•]+|[\s\-–—:·•]+$/g, '')
    .trim();


export default function MostUsedClient({ charactersData, guideUsageData }: MostUsedClientProps) {
  const { lang, t } = useI18n()
  const tLoc = (v: string | Localized | undefined): string => {
    if (!v) return ''
    return typeof v === 'string' ? v : (v[lang as keyof typeof v] ?? v.en ?? '')
  }

  // Helper to get localized character name
  const getCharName = (char: CharacterData) => l(char, 'Fullname', lang)

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [elementFilter, setElementFilter] = useState<ElementType[]>([])
  const [classFilter, setClassFilter] = useState<classtipe[]>([])
  const [rarityFilter, setRarityFilter] = useState<Rarity[]>([])
  const [includeLimited, setIncludeLimited] = useState<boolean>(false)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const countInCategory = (
    usage: CharacterUsage,
    selectedCategory: string,
    guideUsageData: Record<string, GuideData>
  ) => {
    if (selectedCategory === 'all') return usage.count;
    let n = 0;
    for (const g of usage.guides) {
      if (guideUsageData[g]?.category === selectedCategory) n++;
    }
    return n;
  };

  const characterUsageMap = useMemo(() => {
    const usageMap = new Map<string, CharacterUsage>()

    Object.entries(guideUsageData).forEach(([guideId, guideData]) => {
      guideData.characters.forEach((charName) => {
        const character = charactersData.find(
          (c) => c.Fullname === charName || c.ID === charName
        )

        if (character) {
          const existing = usageMap.get(character.ID)
          if (existing) {
            existing.count++
            existing.guides.push(guideId)
            existing.categories.add(guideData.category)
          } else {
            usageMap.set(character.ID, {
              character,
              count: 1,
              guides: [guideId],
              categories: new Set([guideData.category]),
            })
          }
        }
      })
    })

    return usageMap
  }, [charactersData, guideUsageData])

  const filteredAndSorted = useMemo(() => {
    let filtered = Array.from(characterUsageMap.values())

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((usage) => usage.categories.has(selectedCategory))
    }

    if (elementFilter.length > 0) {
      filtered = filtered.filter((usage) => elementFilter.includes(usage.character.Element as ElementType))
    }

    if (classFilter.length > 0) {
      filtered = filtered.filter((usage) => classFilter.includes(usage.character.Class as classtipe))
    }

    if (rarityFilter.length > 0) {
      filtered = filtered.filter((usage) => isRarity(usage.character.Rarity) && rarityFilter.includes(usage.character.Rarity))
    }

    if (!includeLimited) {
      filtered = filtered.filter((usage) => !usage.character.limited)
    }

    return filtered.sort(
      (a, b) =>
        countInCategory(b, selectedCategory, guideUsageData) -
        countInCategory(a, selectedCategory, guideUsageData)
    );
  }, [characterUsageMap, selectedCategory, guideUsageData, elementFilter, classFilter, rarityFilter, includeLimited])

  const categories = useMemo(() => {
    const cats = new Set<string>()
    Object.values(guideUsageData).forEach((guide) => cats.add(guide.category))
    return Array.from(cats).sort()
  }, [guideUsageData])




  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-4xl font-bold mb-8 text-center">{t('mostUsedUnit.h1')}</h1>

      {/* Disclaimer */}
      <div className="mb-8 p-4 bg-gray-800 border border-gray-700 rounded-lg">
        <p className="text-sm text-gray-300 leading-relaxed">
          {t('mostUsedUnit.disclaimer.intro')}
        </p>
        <p className="text-sm text-gray-300 leading-relaxed mt-2">
          {t('mostUsedUnit.disclaimer.note')}
        </p>
      </div>

      {/* Filters - Style Tier List */}
      <div className="space-y-6 mb-8">
        {/* Category & Limited Filters */}
        <div className="flex justify-center gap-4 flex-wrap items-center">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white"
          >
            <option value="all">{t('mostUsedUnit.filters.allCategories')}</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {t(`categories.${cat}`) || cat}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 px-4 py-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeLimited}
              onChange={(e) => setIncludeLimited(e.target.checked)}
              className="w-4 h-4 cursor-pointer"
            />
            <span className="text-white">{t('mostUsedUnit.filters.includeLimited')}</span>
          </label>
        </div>

        {/* Rarity Filter */}
        <div className="flex justify-center gap-2">
          {[null, ...RARITIES].map((r) => (
            <button
              key={String(r)}
              onClick={() => {
                if (r === null) {
                  setRarityFilter([])
                } else if (isRarity(r)) {
                  setRarityFilter(prev =>
                    prev.includes(r) ? prev.filter(v => v !== r) : [...prev, r]
                  )
                }
              }}
              className={`flex items-center justify-center ${(r === null && rarityFilter.length === 0) ||
                (r !== null && rarityFilter.includes(r))
                ? 'bg-cyan-500'
                : 'bg-gray-700'
                } hover:bg-cyan-600 px-2 py-1 rounded border`}
            >
              {r === null ? (
                <span className="text-white text-sm font-bold">{t('filters.common.all')}</span>
              ) : (
                <div className="flex items-center -space-x-1">
                  {Array(r)
                    .fill(0)
                    .map((_, i) => (
                      <Image
                        key={i}
                        src="/images/ui/star.webp"
                        alt="star"
                        width={14}
                        height={14}
                      />
                    ))}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Element & Class Filters */}
        <div className="flex justify-center gap-8 flex-wrap">
          {/* Elements */}
          <div className="flex gap-2">
            {ELEMENTS.map((el) => (
              <button
                key={el}
                onClick={() =>
                  el === 'All'
                    ? setElementFilter([])
                    : setElementFilter((prev) =>
                      prev.includes(el as ElementType)
                        ? prev.filter((v) => v !== (el as ElementType))
                        : [...prev, el as ElementType]
                    )
                }
                className={`flex items-center justify-center h-7 rounded border ${(el === 'All' && elementFilter.length === 0) ||
                  (el !== 'All' && elementFilter.includes(el as ElementType))
                  ? 'bg-cyan-500'
                  : 'bg-gray-700'
                  } hover:bg-cyan-600`}
                title={String(el)}
              >
                {el === 'All' ? (
                  <span className="text-white text-sm font-bold px-2">{t('filters.common.all')}</span>
                ) : (
                  <ElementIcon element={el as ElementType} />
                )}
              </button>
            ))}
          </div>

          {/* Classes */}
          <div className="flex gap-2">
            {CLASSES.map((cl) => (
              <button
                key={cl}
                onClick={() =>
                  cl === 'All'
                    ? setClassFilter([])
                    : setClassFilter((prev) =>
                      prev.includes(cl as classtipe)
                        ? prev.filter((v) => v !== (cl as classtipe))
                        : [...prev, cl as classtipe]
                    )
                }
                className={`flex items-center justify-center h-7 rounded border ${(cl === 'All' && classFilter.length === 0) ||
                  (cl !== 'All' && classFilter.includes(cl as classtipe))
                  ? 'bg-cyan-500'
                  : 'bg-gray-700'
                  } hover:bg-cyan-600`}
                title={String(cl)}
              >
                {cl === 'All' ? (
                  <span className="text-white text-sm font-bold px-2">{t('filters.common.all')}</span>
                ) : (
                  <ClassIcon className={cl as classtipe} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-center text-neutral-400">
        {t('mostUsedUnit.results.showing', {
          count: filteredAndSorted.length,
          plural: filteredAndSorted.length !== 1 ? 's' : ''
        })}
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 gap-3">
        {filteredAndSorted.map((usage, index) => {
          const rankClass = index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-600' : 'text-neutral-400'
          const isExpanded = expandedRows.has(usage.character.ID)
          const characterSlug = toKebabCase(usage.character.Fullname)

          return (
            <div key={usage.character.ID} className="bg-gray-800 rounded-lg border border-gray-700">
              <div
                onClick={() => {
                  const newExpanded = new Set(expandedRows)
                  if (isExpanded) {
                    newExpanded.delete(usage.character.ID)
                  } else {
                    newExpanded.add(usage.character.ID)
                  }
                  setExpandedRows(newExpanded)
                }}
                className="flex items-center gap-4 p-4 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer hover:border-gray-600"
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-12 text-center">
                  <div className={`text-2xl font-bold ${rankClass}`}>
                    #{index + 1}
                  </div>
                </div>

                {/* Character Portrait */}
                <div className="flex-shrink-0 relative">
                  <CharacterPortrait
                    characterId={usage.character.ID}
                    characterName={usage.character.Fullname}
                    size={80}
                    className="rounded-lg border-2 border-gray-600 bg-gray-900"
                  />
                  {/* Rarity Stars */}
                  <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex justify-center items-center -space-x-1">
                    {Array(usage.character.Rarity)
                      .fill(0)
                      .map((_, i) => (
                        <Image
                          key={i}
                          src="/images/ui/star.webp"
                          alt="star"
                          width={17}
                          height={17}
                        />
                      ))}
                  </div>
                </div>

                {/* Character Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={`/characters/${characterSlug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-lg font-semibold truncate hover:text-cyan-400 transition-colors"
                    >
                      {getCharName(usage.character)}
                    </Link>
                    {usage.character.limited && (
                      <span className="px-2 py-0.5 text-xs bg-purple-600 rounded-full">{t('mostUsedUnit.badge.limited')}</span>
                    )}
                    {usage.character.tags?.includes('free') && (
                      <span className="px-2 py-0.5 text-xs bg-green-600 rounded-full">{t('mostUsedUnit.badge.free')}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <ElementIcon element={usage.character.Element as ElementType} size={16} />
                      {t(`SYS_ELEMENT_NAME_${usage.character.Element.toUpperCase()}`)}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClassIcon className={usage.character.Class as classtipe} size={16} />
                      {t(`SYS_CLASS_${usage.character.Class.toUpperCase()}`)}
                    </span>
                  </div>
                </div>

                {/* Usage Count */}
                <div className="text-3xl font-bold text-cyan-400">
                  {countInCategory(usage, selectedCategory, guideUsageData)}
                </div>
                <div className="text-xs text-gray-500">
                  {countInCategory(usage, selectedCategory, guideUsageData) === 1
                    ? t('mostUsedUnit.count.guide')
                    : t('mostUsedUnit.count.guides')}
                </div>


                {/* Categories */}
                <div className="flex-shrink-0 max-w-xs hidden md:block">
                  <div className="flex flex-wrap gap-1 justify-end">
                    {Array.from(usage.categories).slice(0, 3).map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-1 text-xs bg-gray-700 rounded-md whitespace-nowrap"
                      >
                        {t(`categories.${cat}`) || cat}
                      </span>
                    ))}
                    {usage.categories.size > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-700 rounded-md">
                        +{usage.categories.size - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Expand indicator */}
                <div className="flex-shrink-0 text-gray-400">
                  <svg
                    className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded section - Guides list */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-700">
                  <h4 className="text-sm font-semibold mb-2 text-gray-300">
                    {selectedCategory !== 'all'
                      ? t('mostUsedUnit.expanded.titleFiltered', { category: t(`categories.${selectedCategory}`) || selectedCategory })
                      : t('mostUsedUnit.expanded.title')}:
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {usage.guides
                      .filter(
                        (guideKey) =>
                          selectedCategory === 'all' ||
                          guideUsageData[guideKey]?.category === selectedCategory
                      )
                      .map((guideKey) => {
                        const guideData = guideUsageData[guideKey]
                        if (!guideData) return null

                        const guideUrl = `/guides/${guideData.category}/${guideData.guideId}`
                        const guideDef = GUIDES[guideData.guideId]
                        const guideName = guideDef ? tLoc(guideDef.title) : guideData.guideId

                        const rawTitle = t(`categories.${guideData.category}`) || guideData.category;
                        const guideCatName = cleanGuideWord(rawTitle);

                        return (
                          <Link
                            key={guideKey}
                            href={guideUrl}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors text-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="px-2 py-0.5 text-xs bg-gray-600 rounded">
                              {guideCatName}
                            </span>
                            <span className="flex-1 truncate">{guideName}</span>
                          </Link>
                        )
                      })}

                  </div>
                </div>
              )}
            </div>
          )
        })}

        {filteredAndSorted.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {t('mostUsedUnit.results.noResults')}
          </div>
        )}
      </div>
    </div>
  )
}
