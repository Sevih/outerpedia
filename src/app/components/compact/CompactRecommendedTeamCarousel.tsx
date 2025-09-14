'use client'

import CompactCarouselSlot from './CompactCarouselSlot'

type Props = {
    team: string[][]
    scale?: number
}

export default function CompactRecommendedTeamCarousel({ team, scale = 0.7 }: Props) {
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
        </div>
    )
}
