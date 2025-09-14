'use client'

import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import GuideHeading from '@/app/components/GuideHeading'
import TeamTabSelector from '@/app/components/TeamTabSelector'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'

const teams = {
  team1: {
    label: 'Team 1 – Blue Tantrum Clear',
    icon: 'SC_Buff_Stat_Def.webp',
    setup: [
      ['Dianne'],
      ['Kappa', 'Ame', 'Rey','Noa', 'Ryu Lion','Kitsune of Eternity Tamamo-no-Mae'],
      ['Ame','Kappa', 'Rey', 'Noa', 'Ryu Lion','Kitsune of Eternity Tamamo-no-Mae'],
      ['Rey','Kappa', 'Ame', 'Noa', 'Ryu Lion','Kitsune of Eternity Tamamo-no-Mae']
    ]
  }
}

export default function TyrantToddlerGuide() {
  return (
    <div>
      <GuideHeading level={3}>Strategy Overview</GuideHeading>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li>Same skills as Special Request Stage 12</li>
      </ul>

      <hr className="my-6 border-neutral-700" />
      <TeamTabSelector teams={teams} />
      <p className="text-neutral-400 text-sm italic mb-4">
        1 to 2 attempts. Verified up to stage 10. <CharacterLinkCard name="Kitsune of Eternity Tamamo-no-Mae" /> only 6★.
      </p>
      <hr className="my-6 border-neutral-700" />

      <div className="mb-4">
              <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
              <p className="text-neutral-400 text-sm italic mt-2">
                Run provided by <span className="text-white font-semibold">XuRenChao</span> (11/08/2025)
              </p>
              <YoutubeEmbed videoId="i7HvX6Gzic8" title="Tyrant Toddler - Adventure License - Stage 10 - 1 run clear - by XuRenChao" />
            </div>
    </div>
  )
}
