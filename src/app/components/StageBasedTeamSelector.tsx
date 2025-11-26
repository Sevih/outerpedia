'use client'

import { useState } from 'react'
import RecommendedTeamCarousel from './RecommendedTeamCarousel'
import { AnimatedTabs } from '@/app/components/AnimatedTabs'
import GuideHeading from '@/app/components/GuideHeading'
import { useTenant } from '@/lib/contexts/TenantContext'
import { getT } from '@/i18n'
import type { TeamData, StageData, NoteEntry } from '@/types/team'

type Props = {
  teamData: TeamData
  defaultStage?: string
  icon?: string // fallback icon if not specified in JSON
  replace?: { lead?: string, mid?: string, tail?: string }
}

function resolveNote(stageData: StageData, lang: string): NoteEntry[] | undefined {
  if (lang !== 'en') {
    const localizedKey = `note_${lang}` as keyof StageData
    const localizedNote = stageData[localizedKey] as NoteEntry[] | undefined
    if (localizedNote) return localizedNote
  }
  return stageData.note
}

export default function StageBasedTeamSelector({ teamData, defaultStage, icon, replace }: Props) {
  const { key: lang } = useTenant()
  const t = getT(lang)
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

  const resolveIcon = (iconValue?: string): string | undefined => {
    if (!iconValue) return undefined
    // If it's already a full path, return as-is
    if (iconValue.startsWith('/')) return iconValue
    // Otherwise, assume it's a shorthand for /images/ui/effect/{value}.webp
    return `/images/ui/effect/${iconValue}.webp`
  }

  const tabsData = stages.map((stage) => ({
    key: stage,
    label: formatStageLabel(stage),
    icon: resolveIcon(teamData[stage].icon) || resolveIcon(icon) // Use stage-specific icon from JSON, fallback to prop
  }))

  return (
    <div className="mt-8">
      {/* Titre */}
      <GuideHeading level={3}>{t('guide.recommendedTeam')}</GuideHeading>

      {/* Stage selector - only if more than one stage */}
      {stages.length > 1 && (
        <div className="flex justify-center mb-4">
          <AnimatedTabs
            tabs={tabsData}
            selected={selectedStage}
            onSelect={setSelectedStage}
            pillColor="#0ea5e9"
          />
        </div>
      )}

      {/* Team display */}
      <RecommendedTeamCarousel
        team={currentStageData.team}
        note={resolveNote(currentStageData, lang)}
      />
    </div>
  )
}
