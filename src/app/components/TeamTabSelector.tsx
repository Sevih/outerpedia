'use client'

import { useState } from 'react'
import RecommendedTeam from './RecommendedTeamCarousel'
import { AnimatedTabs } from '@/app/components/AnimatedTabs'

type NoteEntry =
  | { type: 'p'; string: string }
  | { type: 'ul'; items: string[] }

type TeamTabSelectorProps = {
  teams: Record<string, {
    label: string
    icon: string // chemin de l'icône dans `/public/images/ui/effect/`
    setup: string[][]
    note?: NoteEntry[]
  }>
}

export default function TeamTabSelector({ teams }: TeamTabSelectorProps) {
  const keys = Object.keys(teams)
  const [selected, setSelected] = useState(keys[0])
  const showTabs = keys.length > 1

  const tabList = keys.map((key) => ({
    key,
    label: teams[key].label,
    icon: `/images/ui/effect/${teams[key].icon}`,
  }))

  return (
    <div className="mb-6">
      {showTabs && (
        <div className="flex justify-center mb-4">
          <AnimatedTabs
            tabs={tabList}
            selected={selected}
            onSelect={setSelected}
            pillColor="#0ea5e9"
            compact
          />
        </div>
      )}

      <RecommendedTeam team={teams[selected].setup} note={teams[selected].note} />
    </div>
  )
}
