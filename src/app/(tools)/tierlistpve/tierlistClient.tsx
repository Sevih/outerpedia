'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { CharacterNameDisplay } from '@/app/components/CharacterNameDisplay'
import { toKebabCase } from '@/utils/formatText'
import type { Character } from '@/types/character'
import type { ClassType as classtipe, ElementType } from '@/types/enums'
import { ElementIcon } from '@/app/components/ElementIcon'
import { ClassIcon } from '@/app/components/ClassIcon'
import { AnimatedTabs } from '@/app/components/AnimatedTabs'

const TABS = [
  { label: 'DPS', value: 'dps', icon: '/images/ui/dps.webp' },
  { label: 'Support', value: 'support', icon: '/images/ui/support.webp' },
  { label: 'Sustain', value: 'sustain', icon: '/images/ui/sustain.webp' },
] as const

const ELEMENTS: (ElementType | 'All')[] = ['All', 'Fire', 'Water', 'Earth', 'Light', 'Dark']
const CLASSES: (classtipe | 'All')[] = ['All', 'Striker', 'Defender', 'Ranger', 'Healer', 'Mage']
const RARITIES = [1, 2, 3]

type TabValue = (typeof TABS)[number]['value']

const RANK_ORDER = ['S', 'A', 'B', 'C', 'D', 'E'] as const

const tabColors = {
  dps: '#ef4444',
  support: '#3b82f6',
  sustain: '#22c55e',
} as const



export default function TierListPage({ characters, initialTab }: { characters: Character[], initialTab?: string }) {
  const [activeTab, setActiveTab] = useState<TabValue>(
    (initialTab as TabValue) || 'dps'
  );
  const [searchTerm, setSearchTerm] = useState('')
  const [classFilter, setClassFilter] = useState<string[]>([])
  const [elementFilter, setElementFilter] = useState<string[]>([])
  const [rarityFilter, setRarityFilter] = useState<number[]>([])

  useEffect(() => {
    if (elementFilter.length === ELEMENTS.length - 1) setElementFilter([])
  }, [elementFilter])

  useEffect(() => {
    if (classFilter.length === CLASSES.length - 1) setClassFilter([])
  }, [classFilter])


  useEffect(() => {
    if (rarityFilter.length === RARITIES.length) setRarityFilter([])
  }, [rarityFilter])



  const filteredCharacters = characters.filter(c => c.Rarity <= 3)

  const roleGroups: Record<TabValue, Character[]> = {
    dps: filteredCharacters.filter(c => c.role?.toLowerCase() === 'dps'),
    support: filteredCharacters.filter(c => c.role?.toLowerCase() === 'support'),
    sustain: filteredCharacters.filter(c => c.role?.toLowerCase() === 'sustain'),
  }

  function groupByRank(chars: Character[]) {
    const groups: Record<(typeof RANK_ORDER)[number], Character[]> = {
      S: [],
      A: [],
      B: [],
      C: [],
      D: [],
      E: [],
    }

    for (const char of chars) {
      let targetRank = char.rank as typeof RANK_ORDER[number] | undefined

      // Si le rang est inconnu ou invalide, on skip
      if (!targetRank || !RANK_ORDER.includes(targetRank)) continue

      // Déclassement pour 1★ et 2★
      if (char.Rarity < 3) {
        const currentIndex = RANK_ORDER.indexOf(targetRank)
        const downgradedIndex = Math.min(currentIndex + 1, RANK_ORDER.length - 1)
        targetRank = RANK_ORDER[downgradedIndex]
      }

      groups[targetRank].push(char)
    }

    // Tri alphabétique par nom
    for (const rank of RANK_ORDER) {
      groups[rank].sort((a, b) => a.Fullname.localeCompare(b.Fullname))
    }

    return groups
  }




  const currentRoleList = groupByRank(roleGroups[activeTab])

  return (

    <div className="w-full max-w-screen-xl mx-auto p-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Outerplane PvE Tier List",
            "url": "https://outerpedia.com/tools/tierlistpve",
            "description": "Discover the best characters in Outerplane sorted by DPS, Support, and Sustain roles. PvE Tier list curated by the EvaMains community.",
            "mainEntity": {
              "@type": "ItemList",
              "itemListElement": characters.map((char, index) => ({
                "@type": "VideoGameCharacter",
                "name": char.Fullname,
                "url": `https://outerpedia.com/characters/${toKebabCase(char.Fullname)}`,
                "image": `https://outerpedia.com/images/characters/portrait/CT_${char.ID}.webp`,
                "position": index + 1,
              })),
            }
          }),
        }}
      />

      {/* Flèche retour */}
      <div className="relative top-4 left-4 z-20 h-[32px] w-[32px]">
        <Link href={`/tools`} className="relative block h-full w-full">
          <Image
            src="/images/ui/CM_TopMenu_Back.webp"
            alt="Back"
            fill
            sizes='32px'
            className="opacity-80 hover:opacity-100 transition-opacity"
          />
        </Link>
      </div>

      <h1 className="text-5xl font-extrabold text-center mb-8 bg-gradient-to-b from-yellow-300 via-orange-400 to-red-500 text-transparent bg-clip-text drop-shadow-md">
        Tier List - PvE
      </h1>
      <p className="bg-yellow-100 text-black px-2 py-1 rounded-lg shadow-md text-sm text-center border border-yellow-100 w-3/5 mx-auto">
        ⚠️ This tier list assumes <strong>6-star transcends</strong> and <strong>level 0 Exclusive Equipment effects</strong>. ⚠️<br />
        Your experience may vary if these upgrades are not yet unlocked. <br />
        This list is intended strictly for <strong>PvE content</strong> and should not be used as a reference for PvP content.
      </p>


      {/* Barre de recherche */}
      <div className="flex justify-center mt-4 mb-6">
        <input
          type="text"
          placeholder="Search characters..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 w-full max-w-md"
        />
      </div>
      <div className="flex justify-center gap-2 mb-4">
        {[null, ...RARITIES].map((r) => (
          <button
            key={String(r)}
            onClick={() =>
              r === null
                ? setRarityFilter([])
                : setRarityFilter((prev) =>
                  prev.includes(r) ? prev.filter((v) => v !== r) : [...prev, r]
                )
            }
            className={`flex items-center justify-center ${(r === null && rarityFilter.length === 0) ||
              (r !== null && rarityFilter.includes(r))
              ? 'bg-cyan-500'
              : 'bg-gray-700'
              } hover:bg-cyan-600 px-2 py-1 rounded border`}
          >
            {r === null ? (
              <span className="text-white text-sm font-bold">All</span>
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
      <div className="flex justify-center gap-8 mb-6 flex-wrap">


        {/* Elements */}
        <div className="flex gap-2">
          {ELEMENTS.map((el) => (
            <button
              key={el}
              onClick={() =>
                el === 'All'
                  ? setElementFilter([])
                  : setElementFilter((prev) =>
                    prev.includes(el) ? prev.filter((v) => v !== el) : [...prev, el]
                  )
              }
              className={`flex items-center justify-center w-7 h-7 rounded border transition ${(el === 'All' && elementFilter.length === 0) ||
                (el !== 'All' && elementFilter.includes(el))
                ? 'bg-cyan-500'
                : 'bg-gray-700'
                } hover:bg-cyan-600`}
              title={el}
            >
              {el === 'All' ? (
                <span className="text-white text-sm font-bold">All</span>
              ) : (
                <ElementIcon element={el as ElementType} />
              )}
            </button>
          ))}

        </div>

        <div className="flex gap-2">
          {CLASSES.map((cl) => (
            <button
              key={cl}
              onClick={() =>
                cl === 'All'
                  ? setClassFilter([])
                  : setClassFilter((prev) =>
                    prev.includes(cl) ? prev.filter((v) => v !== cl) : [...prev, cl]
                  )
              }
              className={`flex items-center justify-center w-7 h-7 rounded border transition ${(cl === 'All' && classFilter.length === 0) ||
                (cl !== 'All' && classFilter.includes(cl))
                ? 'bg-cyan-500'
                : 'bg-gray-700'
                } hover:bg-cyan-600`}
              title={cl}
            >
              {cl === 'All' ? (
                <span className="text-white text-sm font-bold">All</span>
              ) : (
                <ClassIcon className={cl as classtipe} />
              )}
            </button>
          ))}

        </div>



      </div>
      <div className="flex justify-center mt-4 mb-3">
        <button
          onClick={() => {
            setSearchTerm('')
            setClassFilter([])
            setElementFilter([])
            setRarityFilter([])
          }}
          className="bg-gray-700 hover:bg-red-700 px-4 py-1 rounded text-sm"
        >
          Reset filters
        </button>
      </div>

      {/* Slider */}
      <div className="flex justify-center mb-8">
        <div className="flex justify-center mb-8">
          <AnimatedTabs
            tabs={TABS.map(tab => ({ key: tab.value, label: tab.label, icon: tab.icon }))}
            selected={activeTab}
            onSelect={setActiveTab}
            pillColor={tabColors[activeTab]}

          />
        </div>

      </div>

      {/* Liste par Rank */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {RANK_ORDER.map(rank => {
            const chars = currentRoleList[rank];
            if (!chars || chars.length === 0) return null;

            return (
              <div key={rank} className="mb-10">
                <div className="flex items-center justify-center">
                  <div className="relative w-[100px] h-[80px]">
                    <Image
                      src={`/images/ui/text_rank_${rank}.png`}
                      alt={`Rank ${rank}`}
                      fill
                      className="object-contain"
                      sizes="100px"
                    />
                  </div>
                  <div className={`relative w-[30px] h-[80px] ${rank === 'A' ? 'mb-1' : rank === 'D' ? 'mb-0' : ''}`}>
                    <Image
                      src={`/images/ui/IG_Event_Rank_${rank}.png`}
                      alt={`Letter ${rank}`}
                      fill
                      className="object-contain"
                      sizes="30px"
                    />
                  </div>
                </div>


                <div className="flex flex-wrap justify-center gap-6">
                  {chars
                    .filter((char) => {
                      const matchesSearch = char.Fullname.toLowerCase().includes(searchTerm.toLowerCase())
                      const matchesElement = elementFilter.length === 0 || elementFilter.includes(char.Element)
                      const matchesClass = classFilter.length === 0 || classFilter.includes(char.Class)
                      const matchesRarity = rarityFilter.length === 0 || rarityFilter.includes(char.Rarity)

                      return matchesSearch && matchesElement && matchesClass && matchesRarity

                    })
                    .map((char, index) => (
                      <Link
                        key={char.ID}
                        href={`/characters/${toKebabCase(char.Fullname)}`}
                        className="w-[120px] text-center shadow hover:shadow-lg transition relative overflow-hidden"
                      >
                        <div className="relative w-[120px] h-[231px]">
                          <Image
                            src={`/images/characters/portrait/CT_${char.ID}.webp`}
                            alt={char.Fullname}
                            fill
                            sizes="120px"
                            className="object-cover"
                            priority={activeTab === 'dps' && index <= 7}
                          />
                          <div className="absolute top-4 right-1 z-30 flex flex-col items-end -space-y-1">
                            {Array(char.Rarity).fill(0).map((_, i) => (
                              <Image
                                key={i}
                                src="/images/ui/star.webp"
                                alt="star"
                                width={20}
                                height={20}
                                style={{ width: 20, height: 20 }}
                              />
                            ))}
                          </div>
                          <div className="absolute bottom-12.5 right-2 z-30">
                            <ClassIcon className={char.Class as classtipe} />
                          </div>
                          <div className="absolute bottom-5.5 right-1.5 z-30">
                            <ElementIcon element={char.Element as ElementType} />
                          </div>
                          <CharacterNameDisplay fullname={char.Fullname} />
                        </div>
                      </Link>
                    ))}

                </div>
              </div>
            );
          })}

        </motion.div>
      </AnimatePresence>
    </div>
  )
}