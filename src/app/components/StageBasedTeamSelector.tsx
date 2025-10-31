'use client'

import { useState } from 'react'
import RecommendedTeamCarousel from './RecommendedTeamCarousel'

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
}

export default function StageBasedTeamSelector({ teamData, defaultStage }: Props) {
  const stages = Object.keys(teamData)
  const [selectedStage, setSelectedStage] = useState(defaultStage || stages[0])

  if (!teamData || stages.length === 0) return null

  const currentStageData = teamData[selectedStage]

  return (
    <div className="mt-8">
      {/* Stage selector */}
      <div className="flex gap-2 mb-4 justify-center">
        {stages.map((stage) => (
          <button
            key={stage}
            onClick={() => setSelectedStage(stage)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedStage === stage
                ? 'bg-sky-500 text-white'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            {stage}
          </button>
        ))}
      </div>

      {/* Team display */}
      <RecommendedTeamCarousel
        team={currentStageData.team}
        note={currentStageData.note}
      />
    </div>
  )
}
