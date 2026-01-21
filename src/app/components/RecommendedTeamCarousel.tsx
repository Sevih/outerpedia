'use client'

import CarouselSlotV2 from './CarouselSlotV2'
import parseText from '@/utils/parseText'
import type { NoteEntry } from '@/types/team'

type Props = {
  team: string[][]
  note?: NoteEntry[]
}


export default function RecommendedTeamCarousel({ team, note }: Props) {
  if (!team || team.length === 0) return null

  return (
    <>
      <div className='w-full flex justify-center overflow-x-hidden'>
        <div className='grid justify-items-center min-w-[412px] gap-y-3 gap-x-0 lg:gap-x-3' style={{ gridTemplateColumns: 'repeat(auto-fit, 200px)', maxWidth: '850px', justifyContent: 'center' }}>
          {team.map((candidates, index) => (
            <CarouselSlotV2 key={`${index}-${candidates.join(',')}`} characters={candidates} />
          ))}
        </div>
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
    </>
  )
}
