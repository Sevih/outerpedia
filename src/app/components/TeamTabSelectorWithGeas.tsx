'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import RecommendedTeam from './RecommendedTeamCarouselNoNote'
import GeasCard, { Geas } from './GeasCard'
import { resolveGeasRef } from '@/utils/geas'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'

type NoteEntry =
  | { type: 'p'; string: string }
  | { type: 'ul'; items: string[] }

type TeamTabSelectorProps = {
  teams: Record<string, {
    label: string
    icon: string
    setup: string[][]
    note?: NoteEntry[]
    'geas-active'?: string[]
    video?: {
      id: string
      title: string
    },
  }>
  bosses: {
    id: string
    geas: Record<string, {
      bonus: Geas
      malus: Geas
    }>
  }[]
}



export default function TeamTabSelectorWithGeas({ teams, bosses }: TeamTabSelectorProps) {
  const keys = Object.keys(teams)
  const [selected, setSelected] = useState(keys[0])
  const [activeTabRef, setActiveTabRef] = useState<HTMLButtonElement | null>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (activeTabRef && indicatorRef.current) {
      const { offsetLeft, offsetWidth } = activeTabRef
      indicatorRef.current.style.transform = `translateX(${offsetLeft}px)`
      indicatorRef.current.style.width = `${offsetWidth}px`
    }
  }, [selected, activeTabRef])

  const showTabs = keys.length > 1
  const selectedTeam = teams[selected]

  return (
    <div className="mb-6">
      {showTabs && (
        <div className="relative flex justify-center mb-4">
          <div className="relative bg-gray-100 dark:bg-gray-800 rounded-full p-1 flex gap-1 min-w-[240px]">
            <div
              ref={indicatorRef}
              className="absolute top-1 left-0 h-[calc(100%-0.5rem)] bg-sky-500 rounded-full transition-all duration-300 z-0"
            ></div>

            {keys.map((key) => (
              <button
                key={key}
                onClick={() => setSelected(key)}
                ref={(el) => {
                  if (selected === key) setActiveTabRef(el)
                }}
                className={`relative z-10 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors duration-300 ${selected === key
                  ? 'text-white'
                  : 'text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                <div className="relative w-[20px] h-[20px]">
                  <Image
                    src={`/images/ui/effect/${teams[key].icon}`}
                    alt={teams[key].label}
                    fill
                    className="object-contain"
                    sizes="20px"
                  />
                </div>
                <span className="hidden sm:inline">{teams[key].label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {selectedTeam['geas-active'] && selectedTeam['geas-active'].length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-sky-300 mb-1">Selected Geas:</p>
          <div className="flex flex-wrap gap-2">
            {selectedTeam['geas-active']?.map((ref) => {
              const resolved = resolveGeasRef(ref, bosses)

              if (!resolved) {
                return (
                  <div key={ref} className="text-red-500 text-sm">
                    Invalid geas reference: {ref}
                  </div>
                )
              }

              const isBonus = ref.endsWith('b')
              const type = isBonus ? 'bonus' : 'malus'

              return (
                <GeasCard
                  key={`${ref}-${resolved.bg}-${resolved.image}`}
                  geas={resolved}
                  type={type}
                />
              )
            })}


          </div>
        </div>
      )}
      <RecommendedTeam team={selectedTeam.setup} note={selectedTeam.note} />

      {selectedTeam.video && (
        <>
          <h4 className="text-base font-semibold text-sky-200 mt-4 mb-1">Combat Footage</h4>
          <YoutubeEmbed videoId={selectedTeam.video.id} title={selectedTeam.video.title} />
        </>
      )}

    </div>
  )
}
