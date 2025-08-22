'use client'

import { useEffect, useMemo, useState } from 'react'
import CompactRecommendedTeamCarousel from './CompactRecommendedTeamCarousel'
import { AnimatedTabs } from '@/app/components/AnimatedTabs'
import type { NoteEntry } from "@/types/skyward"

type TeamDef = {
  label: string
  icon: string
  setup: string[][]
  note?: NoteEntry[]
}

export type CompactTeamTabSelectorProps = {
  teams: Record<string, TeamDef>
  scale?: number
  /** clé active (mode contrôlé) */
  selectedKey?: string
  /** callback sélection (mode contrôlé) */
  onSelect?: (key: string) => void
}

export default function CompactTeamTabSelector({
  teams,
  scale = 0.7,
  selectedKey,
  onSelect,
}: CompactTeamTabSelectorProps) {
  const keys = useMemo(() => Object.keys(teams), [teams])

  // si pas de team, on affiche un petit message et on sort
  if (keys.length === 0) {
    return <div className="text-sm text-zinc-400">No teams available.</div>
  }

  const firstKey = keys[0]

  // non-contrôlé: état interne
  const [internal, setInternal] = useState(firstKey)

  // réaligner la sélection quand les clés changent (en non-contrôlé)
  useEffect(() => {
    if (selectedKey) return // contrôlé: ne rien toucher
    if (!keys.includes(internal)) setInternal(firstKey)
  }, [keys, firstKey, selectedKey, internal])

  const activeKey = selectedKey ?? internal

  const handleSelect = (k: string) => {
    if (onSelect) onSelect(k)     // contrôlé
    else setInternal(k)           // non-contrôlé
  }

  const showTabs = keys.length > 1

  const tabList = keys.map((key) => ({
    key,
    label: teams[key].label,
    icon: `/images/ui/effect/${teams[key].icon}`,
  }))

  const activeTeam = teams[activeKey] ?? teams[firstKey]

  return (
    <div className="mb-4">
      {showTabs && (
        <div className="flex justify-left mb-2">
          <AnimatedTabs
            tabs={tabList}
            selected={activeKey}
            onSelect={handleSelect}
            pillColor="#0ea5e9"
            compact
          />
        </div>
      )}

      <CompactRecommendedTeamCarousel
        team={activeTeam.setup}
        note={activeTeam.note}
        scale={scale}
      />
    </div>
  )
}
