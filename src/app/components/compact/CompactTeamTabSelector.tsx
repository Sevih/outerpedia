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
  const firstKey = keys[0] ?? '' // fallback string vide si pas de clé

  const [internal, setInternal] = useState(firstKey)

  useEffect(() => {
    if (selectedKey) return // contrôlé: ne rien toucher
    if (!keys.includes(internal) && firstKey) {
      setInternal(firstKey)
    }
  }, [keys, firstKey, selectedKey, internal])

  // si pas de team -> afficher un message
  if (keys.length === 0) {
    return <div className="text-sm text-zinc-400">No teams available.</div>
  }

  const activeKey = selectedKey ?? internal
  const handleSelect = (k: string) => {
    if (onSelect) onSelect(k)
    else setInternal(k)
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
        scale={scale}
      />
    </div>
  )
}
