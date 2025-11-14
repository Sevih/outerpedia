'use client'

import parseText from '@/utils/parseText'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import RecommendedTeam from '@/app/components/RecommendedTeamCarousel'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'
import { Phase1Boss } from '@/schemas/guild-raid.schema'

type Props = {
  boss: Phase1Boss
}

/**
 * Boss Strategy Component
 * Displays recommended units, teams, and videos (mechanics are in BossDisplay)
 */
export function BossStrategy({ boss }: Props) {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Recommended Units */}
      {boss.recommended && boss.recommended.length > 0 && (
        <div>
          <p className="mb-1 font-semibold text-sky-300">Recommended Units:</p>
          <ul className="list-disc list-inside text-neutral-300">
            {boss.recommended.map((char, index) => (
              <li key={index}>
                <CharacterLinkCard name={char.name} />
                {char.comment && (
                  <>
                    &nbsp;: {parseText(char.comment)}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Team Composition */}
      {boss.team && boss.team.length > 0 && (
        <RecommendedTeam team={boss.team} />
      )}

      {/* Video Guide */}
      {boss.video && (
        <>
          <h4 className="text-base font-semibold text-sky-200 mt-4 mb-1">Video</h4>
          <YoutubeEmbed videoId={boss.video.id} title={boss.video.title} />
        </>
      )}
    </div>
  )
}
