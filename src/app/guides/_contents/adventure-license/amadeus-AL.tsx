'use client'

import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import GuideHeading from '@/app/components/GuideHeading'
import TeamTabSelector from '@/app/components/TeamTabSelector'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'

const teams = {
  standard: {
    label: 'Recommended Team',
    icon: 'SC_Buff_Dark_Dmg.webp',
    setup: [
      ['Stella'],
      ['Demiurge Stella'],
      ['Drakhan'],
      ['Regina', 'Akari', 'Kuro']
    ]
  }
}

export default function AmadeusGuide() {
  return (
    <div>
      <GuideHeading level={3}>Strategy Overview</GuideHeading>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li><strong>Skills:</strong> Same as Special Request stage 12</li>
      </ul>

      <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Team Suggestions</h3>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li><CharacterLinkCard name="Stella" /></li>
        <li><CharacterLinkCard name="Demiurge Stella" /></li>
        <li><CharacterLinkCard name="Drakhan" /></li>
        <li><CharacterLinkCard name="Regina" /> / <CharacterLinkCard name="Akari" /> / <CharacterLinkCard name="Kuro" /></li>
      </ul>

      <p className="text-neutral-400 text-sm italic mb-4">
        Note: Typically cleared in 1 to 2 attempts. Verified up to stage 10.
      </p>

      <hr className="my-6 border-neutral-700" />
      <TeamTabSelector teams={teams} />

      <hr className="my-6 border-neutral-700" />

      <div className="mb-4">
        <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
        <p className="text-neutral-400 text-sm italic mt-2">
          Run provided by <span className="text-white font-semibold">XuRenChao</span> (08/09/2025)
        </p>
        <YoutubeEmbed videoId="EJNnAhVZPkY" title="Amadeus - Adventure License - Stage 10 - 1 run clear (Auto) - by XuRenChao" />
      </div>
    </div>
  )
}

