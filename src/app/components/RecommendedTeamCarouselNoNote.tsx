'use client'

import CarouselSlot from './CarouselSlot'

import parseText from '@/utils/parseText'

type NoteEntry =
  | { type: 'p'; string: string }
  | { type: 'ul'; items: string[] }

type Props = {
  team: string[][]
  note?: NoteEntry[]
}


export default function RecommendedTeamCarousel({ team, note }: Props) {
  if (!team || team.length === 0) return null

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-4">
        Recommended Team
      </h3>
<div
  style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 220px))',
    justifyContent: 'center', // pour centrer les lignes incomplètes
    gap: '1rem',              // ou utilise Tailwind `gap-8`
    maxWidth: '100%',
    margin: '0 auto'
  }}
>

        {team.map((candidates, index) => (
          <CarouselSlot key={index} characters={candidates} />
        ))}
      </div>
      {note && (
        <div className="mb-4">
          {note.map((entry, idx) => {
            if (entry.type === 'p') {
              return <p key={idx} className="mb-2">{parseText(entry.string)}</p>
            }

            if (entry.type === 'ul') {
              return (
                <ul key={idx} className="list-disc list-inside ml-4 space-y-1">
                  {entry.items.map((item: string, i: number) => (
                    <li key={i}>{parseText(item)}</li>
                  ))}
                </ul>
              )
            }

            return null
          })}
        </div>
      )}

    </div>
  )
}
