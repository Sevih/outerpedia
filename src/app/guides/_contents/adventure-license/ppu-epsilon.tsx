'use client'

import GuideHeading from '@/app/components/GuideHeading'
import TeamTabSelector from '@/app/components/TeamTabSelector'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'

const teams = {
  team1: {
    label: 'Anti-Revive Squad',
    icon: 'IG_Buff_Seal_Ressurection.webp',
    setup: [
      ['Monad Eva'],
      ['Demiurge Stella'],
      ['Demiurge Astei','Maxwell'],
      ['Gnosis Nella', 'Tamara', 'Tamamo-no-Mae','Demiurge Luna']
    ]
  },
  team2: {
    label: 'GBeth',
    icon: 'SC_Buff_2100092.webp',
    setup: [
      ['Gnosis Beth'],
      ['Akari'],
      ['Kuro'],
      ['Sterope']
    ]
  }
}

export default function EpsilonGuide() {
  return (
    <div>
      <GuideHeading level={3}>Strategy Overview</GuideHeading>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li>Minions must be focused first because main unit does not take damage while they are alive</li>
        <li>Resurrects frequently</li>
        <li>Gains crit chance</li>
      </ul>

      <hr className="my-6 border-neutral-700" />
      <TeamTabSelector teams={teams} />
      <p className="text-neutral-400 text-sm italic mb-4">
        1 to 2 attempts. Verified up to stage 10.
      </p>
      <hr className="my-6 border-neutral-700" />

      <div className="mb-4">
        <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
        <p className="text-neutral-400 text-sm italic mt-2">
          Run provided by <span className="text-white font-semibold">Sevih</span> (14/07/2025)
        </p>
        <YoutubeEmbed videoId="XNHl5PJTJQc" title="Planet Purification Unit Epsilon - Adventure License - Stage 10 - 1 run clear" />
      </div>
    </div >
  )
}
