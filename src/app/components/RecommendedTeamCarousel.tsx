'use client'

import CarouselSlot from './CarouselSlot'

type Props = {
  team: string[][] // 4 slots, chaque slot = [nom1, nom2, ...]
}

export default function RecommendedTeamCarousel({ team }: Props) {
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

    </div>
  )
}
