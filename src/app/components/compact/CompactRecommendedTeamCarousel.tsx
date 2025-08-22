'use client'

import CompactCarouselSlot from './CompactCarouselSlot'
import type { NoteEntry } from "@/types/skyward"

type Props = {
    team: string[][]
    note?: NoteEntry[]
    scale?: number
}

export default function CompactRecommendedTeamCarousel({ team, note, scale = 0.7 }: Props) {
    if (!team || team.length === 0) return null

    return (
        <div className="mt-4">
            <h3 className="text-sm font-bold text-sky-300 border-l-4 border-sky-500 pl-2 mb-3">
                Recommended Team
            </h3>
            <div
                className="flex flex-wrap justify-left"
                style={{ gap: `${8 * scale}px` }}
            >
                {team.map((candidates, index) => (
                    <div key={index}>
                        <CompactCarouselSlot characters={candidates}  key={index} />
                    </div>
                ))}
            </div>

            {note && (
                <div className="text-xs text-neutral-400 italic mt-3">
                    {note.map((entry, idx) =>
                        entry.type === 'p' ? (
                            <p key={idx}>Note: {entry.string}</p>
                        ) : (
                            <ul key={idx} className="list-disc list-inside ml-4">
                                {entry.items.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        )
                    )}
                </div>
            )}
        </div>
    )
}
