'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { CharacterNameDisplay } from '@/app/components/CharacterNameDisplay'
import { toKebabCase } from '@/utils/formatText'
import type { Character } from '@/types/character'

const TABS = [
  { label: 'DPS', value: 'dps', icon: '/images/ui/dps.webp' },
  { label: 'Support', value: 'support', icon: '/images/ui/support.webp' },
  { label: 'Sustain', value: 'sustain', icon: '/images/ui/sustain.webp' },
] as const

type TabValue = (typeof TABS)[number]['value']

const RANK_ORDER = ['S', 'A', 'B', 'C', 'D'] as const

const tabColors = {
  dps: '#ef4444',
  support: '#3b82f6',
  sustain: '#22c55e',
} as const

const tabBackgroundColors = {
  dps: '#991b1b',
  support: '#1e3a8a',
  sustain: '#14532d',
} as const

function ElementIcon({ element }: { element: string }) {
  return (
    <div className="absolute w-[24px] h-[24px] bottom-5.5 right-1.5 z-30">
      <Image
        src={`/images/ui/elem/${element.toLowerCase()}.webp`}
        alt={element}
        fill
        sizes="24px"
        className="object-contain"
      />
    </div>
  )
}

function ClassIcon({ className }: { className: string }) {
  return (
    <div className="absolute w-[24px] h-[24px] bottom-12.5 right-1.5 z-30">
      <Image
        src={`/images/ui/class/${className.toLowerCase()}.webp`}
        alt={className}
        fill
        sizes="24px"
        className="object-contain"
      />
    </div>
  )
}

export default function TierListPage({ characters }: { characters: Character[] }) {
  const [activeTab, setActiveTab] = useState<TabValue>('dps')
  const [searchTerm, setSearchTerm] = useState('')
  const [indicatorRef, setIndicatorRef] = useState<HTMLDivElement | null>(null)
  const tabContainerRef = useRef<HTMLDivElement>(null)


  useEffect(() => {
    if (indicatorRef && tabContainerRef.current) {
      const activeButton = tabContainerRef.current.querySelector(`[data-tab="${activeTab}"]`) as HTMLButtonElement
      if (activeButton) {
        indicatorRef.style.transform = `translateX(${activeButton.offsetLeft}px)`
        indicatorRef.style.width = `${activeButton.offsetWidth}px`
      }
    }
  }, [activeTab, indicatorRef])


  const filteredCharacters = characters.filter(c => c.Rarity === 3)

  const roleGroups: Record<TabValue, Character[]> = {
    dps: filteredCharacters.filter(c => c.role?.toLowerCase() === 'dps'),
    support: filteredCharacters.filter(c => c.role?.toLowerCase() === 'support'),
    sustain: filteredCharacters.filter(c => c.role?.toLowerCase() === 'sustain'),
  }

  function groupByRank(chars: Character[]) {
    const groups: Record<string, Character[]> = {}
    for (const rank of RANK_ORDER) {
      groups[rank] = chars
        .filter(c => c.rank === rank)
        .sort((a, b) => a.Fullname.localeCompare(b.Fullname))
    }
    return groups
  }

  const currentRoleList = groupByRank(roleGroups[activeTab])

  return (
    <div className="w-full max-w-screen-xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8 text-center">Tier List</h1>

      {/* Barre de recherche */}
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search characters..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 w-full max-w-md"
        />
      </div>

      {/* Slider */}
      <div className="flex justify-center mb-8">
        <div
          ref={tabContainerRef}
          className="relative rounded-full p-1 flex gap-1 w-fit overflow-x-auto flex-nowrap transition-colors duration-300"
          style={{ backgroundColor: tabBackgroundColors[activeTab] }}
        >
          <div
            ref={setIndicatorRef}
            className="absolute top-1 left-0 h-[calc(100%-0.5rem)] rounded-full transition-all duration-300 z-0"
            style={{ backgroundColor: tabColors[activeTab] }}
          />
          {TABS.map(tab => (
            <button
              key={tab.value}
              data-tab={tab.value}
              onClick={() => setActiveTab(tab.value)}
              onMouseEnter={(e) => {
                if (tab.value !== activeTab) {
                  e.currentTarget.style.backgroundColor = tabBackgroundColors[tab.value]
                }
              }}
              onMouseLeave={(e) => {
                if (tab.value !== activeTab) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
              style={{
                backgroundColor: activeTab === tab.value ? tabColors[tab.value] : 'transparent',
                transition: 'background-color 0.3s ease',
              }}
              className={`relative z-10 w-[140px] justify-center px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
                activeTab === tab.value ? 'text-white' : 'text-gray-800'
              }`}
            >
              <div className="relative w-[40px] h-[40px]">
                <Image
                  src={tab.icon}
                  alt={`${tab.label} icon`}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              {tab.label}
            </button>
          ))}
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
      <h2 className="text-2xl font-bold text-center mb-4">Rank {rank}</h2>

      <div className="flex flex-wrap justify-center gap-6">
        {chars.map((char,index) => (
          <Link
            key={char.ID}
            href={`/characters/${toKebabCase(char.Fullname)}`}
            className={`w-[120px] text-center shadow hover:shadow-lg transition relative overflow-hidden ${
              char.Fullname.toLowerCase().includes(searchTerm.toLowerCase())
                ? 'ring-2 ring-yellow-400'
                : 'opacity-40'
            }`}
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
              <ClassIcon className={char.Class} />
              <ElementIcon element={char.Element} />
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
