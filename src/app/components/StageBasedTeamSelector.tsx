'use client'

import { useState } from 'react'
import RecommendedTeamCarousel from './RecommendedTeamCarousel'
import { AnimatedTabs } from '@/app/components/AnimatedTabs'

type NoteEntry =
  | { type: 'p'; string: string }
  | { type: 'ul'; items: string[] }

type StageData = {
  team: string[][]
  note?: NoteEntry[]
}

type TeamData = {
  [key: string]: StageData
}

type Props = {
  teamData: TeamData
  defaultStage?: string
  icon?: string
  replace?: { lead?: string, mid?: string, tail?: string }
}

export default function StageBasedTeamSelector({ teamData, defaultStage, icon, replace }: Props) {
  const stages = Object.keys(teamData)
  const [selectedStage, setSelectedStage] = useState(defaultStage || stages[0])

  if (!teamData || stages.length === 0) return null

  const currentStageData = teamData[selectedStage]

  const formatStageLabel = (stage: string): string => {
    if (!replace) return stage

    const parts = stage.split('-')
    if (parts.length === 0) return stage

    const { lead = '', mid = '', tail = '' } = replace

    // Si un seul morceau, on ajoute lead + morceau + tail
    if (parts.length === 1) {
      return `${lead}${parts[0]}${tail}`
    }

    // Si plusieurs morceaux, on place lead avant le premier, mid remplace les tirets, tail à la fin
    return `${lead}${parts.join(mid)}${tail}`
  }

  const tabsData = stages.map((stage) => ({
    key: stage,
    label: formatStageLabel(stage),
    icon: icon
  }))

  return (
    <div className="mt-8">
      {/* Stage selector */}
      <div className="flex justify-center mb-4">
        <AnimatedTabs
          tabs={tabsData}
          selected={selectedStage}
          onSelect={setSelectedStage}
          pillColor="#0ea5e9"
        />
      </div>

      {/* Team display */}
      <RecommendedTeamCarousel
        team={currentStageData.team}
        note={currentStageData.note}
      />
    </div>
  )
}
