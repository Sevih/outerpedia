'use client'

import CarouselSlot from './CarouselSlot'

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
        className="inline-flex justify-center gap-12"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        }}
      >
        {team.map((candidates, index) => (
          <CarouselSlot key={index} characters={candidates} />
        ))}
      </div>
      {note && (
        <div className="text-neutral-400 text-sm italic mb-4">
          {note.map((entry, idx) => {
            if (entry.type === 'p') {
              return <p key={idx} className="mb-2">Note: {entry.string}</p>
            }

            if (entry.type === 'ul') {
              return (
                <ul key={idx} className="list-disc list-inside ml-4 space-y-1">
                  {entry.items.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
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
