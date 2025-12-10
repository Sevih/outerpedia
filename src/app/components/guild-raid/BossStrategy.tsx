'use client'

import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import RecommendedTeam from '@/app/components/RecommendedTeamCarousel'
import TacticalTips from '@/app/components/TacticalTips'
import CombatFootage from '@/app/components/CombatFootage'
import { Phase1Boss } from '@/schemas/guild-raid.schema'
import { useTenant } from '@/lib/contexts/TenantContext'

type Props = {
  boss: Phase1Boss
}

/**
 * Resolve localized notes based on current language
 * Falls back to English if localized version doesn't exist
 */
function resolveNotes(boss: Phase1Boss, lang: string): string[] | undefined {
  if (lang !== 'en') {
    const localizedKey = `notes_${lang}` as keyof Phase1Boss
    const localizedNotes = boss[localizedKey] as string[] | undefined
    if (localizedNotes && localizedNotes.length > 0) {
      return localizedNotes
    }
  }
  return boss.notes
}

/**
 * Boss Strategy Component
 * Displays recommended units, teams, notes, and videos
 */
export function BossStrategy({ boss }: Props) {
  const { key: lang } = useTenant()
  const notes = resolveNotes(boss, lang)

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Strategy Tips */}
      {notes && notes.length > 0 && notes.some(note => note.trim() !== '') && (
        <TacticalTips
          title="strategy"
          tips={notes.filter(note => note.trim() !== '')}
        />
      )}

      {/* Recommended Units */}
      {boss.recommended && boss.recommended.length > 0 && (
        <RecommendedCharacterList entries={boss.recommended} />
      )}

      {/* Recommended Team Composition */}
      {boss.team && boss.team.length > 0 && (
        <RecommendedTeam team={boss.team} />
      )}

      {/* Video Guide */}
      {boss.video && (
        <CombatFootage
          videoId={boss.video.videoId}
          title={boss.video.title}
          author={boss.video.author}
          date={boss.video.date}
        />
      )}
    </div>
  )
}
