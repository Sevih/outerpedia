'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import RecommendedTeam from './RecommendedTeamCarousel'

type NoteEntry =
  | { type: 'p'; string: string }
  | { type: 'ul'; items: string[] }

type TeamTabSelectorProps = {
  teams: Record<string, {
    label: string
    icon: string // chemin de l'icône dans `/public/images/ui/nav/`
    setup: string[][]
    note?: NoteEntry[]
  }>
}

export default function TeamTabSelector({ teams }: TeamTabSelectorProps) {
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

  return (
    <div className="mb-6">
      {showTabs && (
        <div className="relative flex justify-center mb-4">
          <div className="relative bg-gray-100 dark:bg-gray-800 rounded-full p-1 flex gap-1 min-w-[240px]">
            <div
              ref={indicatorRef}
              className="absolute top-1 left-0 h-[calc(100%-0.5rem)] bg-sky-500 rounded-full transition-all duration-300 z-0"
            ></div>

            {keys.map(key => (
              <button
                key={key}
                onClick={() => setSelected(key)}
                ref={el => {
                  if (selected === key) setActiveTabRef(el)
                }}
                className={`relative z-10 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors duration-300 ${
                  selected === key
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

      <RecommendedTeam team={teams[selected].setup} note={teams[selected].note} />
    </div>
  )
}
