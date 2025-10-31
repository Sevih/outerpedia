'use client'

import { useState } from 'react'
import RecommendedTeam from './RecommendedTeamCarousel'
import GeasCard, { Geas } from './GeasCard'
import { resolveGeasRef } from '@/utils/geas'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'
import { AnimatedTabs } from '@/app/components/AnimatedTabs'

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
  const teamKeys  = Object.keys(teams)
  const [selected, setSelected] = useState(teamKeys [0])

  const showTabs = teamKeys .length > 1
  const selectedTeam = teams[selected]

  const tabList = teamKeys .map((key) => ({
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

      {selectedTeam['geas-active'] && selectedTeam['geas-active'].length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-sky-300 mb-1">Selected Geas:</p>
          <div className="flex flex-wrap gap-2">
            {selectedTeam['geas-active'].map((ref) => {
              const resolved = resolveGeasRef(ref, bosses)

              if (!resolved) {
                return (
                  <div key={ref} className="text-red-500 text-sm">
                    Invalid geas reference: {ref}
                  </div>
                )
              }

              const isBonus = ref.endsWith('B')
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
