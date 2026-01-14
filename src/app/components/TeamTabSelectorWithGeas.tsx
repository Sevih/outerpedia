'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/contexts/I18nContext'
import RecommendedTeam from './RecommendedTeamCarousel'
import GeasCard from './GeasCard'
import { resolveGeasRef } from '@/utils/geas'
import CombatFootage from '@/app/components/CombatFootage'
import { AnimatedTabs } from '@/app/components/AnimatedTabs'
import { Phase2Team, Phase1Boss, NoteEntry } from '@/schemas/guild-raid.schema'

type TeamTabSelectorProps = {
  teams: Record<string, Phase2Team>
  bosses: Phase1Boss[]
}

/**
 * Resolve localized note based on current language
 * Falls back to English if localized version doesn't exist
 */
function resolveNote(team: Phase2Team, lang: string): NoteEntry[] | undefined {
  if (lang !== 'en') {
    const localizedKey = `note_${lang}` as keyof Phase2Team
    const localizedNote = team[localizedKey] as NoteEntry[] | undefined
    if (localizedNote && localizedNote.length > 0) {
      return localizedNote
    }
  }
  return (team as { note?: NoteEntry[] }).note
}



export default function TeamTabSelectorWithGeas({ teams, bosses }: TeamTabSelectorProps) {
  const { lang } = useI18n()
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

      {selectedTeam['geas-active'] && (
        <div className="mt-4 mb-4">
          <p className="text-sm font-semibold text-sky-300 mb-1">Selected Geas:</p>
          <div className="flex flex-wrap gap-2">
            {/* Render bonus geas */}
            {selectedTeam['geas-active'].bonus?.map((ref, index) => {
              const resolved = resolveGeasRef(ref, bosses, lang)

              if (!resolved) {
                return (
                  <div key={`bonus-${ref}-${index}`} className="text-red-500 text-sm">
                    Invalid geas reference: {ref}
                  </div>
                )
              }

              return (
                <GeasCard
                  key={`bonus-${ref}-${index}-${resolved.bg}-${resolved.image}`}
                  geas={resolved}
                  type="bonus"
                />
              )
            })}

            {/* Render malus geas */}
            {selectedTeam['geas-active'].malus?.map((ref, index) => {
              const resolved = resolveGeasRef(ref, bosses, lang)

              if (!resolved) {
                return (
                  <div key={`malus-${ref}-${index}`} className="text-red-500 text-sm">
                    Invalid geas reference: {ref}
                  </div>
                )
              }

              return (
                <GeasCard
                  key={`malus-${ref}-${index}-${resolved.bg}-${resolved.image}`}
                  geas={resolved}
                  type="malus"
                />
              )
            })}
          </div>
        </div>
      )}
      <RecommendedTeam team={selectedTeam.setup} note={resolveNote(selectedTeam, lang)} />

      {selectedTeam.video && (
        <CombatFootage
          videoId={selectedTeam.video.videoId}
          title={selectedTeam.video.title}
          author={selectedTeam.video.author}
          date={selectedTeam.video.date}
        />
      )}

    </div>
  )
}
