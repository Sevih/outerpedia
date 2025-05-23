'use client'

import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import GuideHeading from '@/app/components/GuideHeading'
import TeamTabSelector from '@/app/components/TeamTabSelector'

const teams = {
  promo: {
    label: 'Promotion Run',
    icon: 'SC_Buff_Dark_Dmg.webp',
    setup: [
      ['Akari'],
      ['Stella'],
      ['Drakhan'],
      ['Kitsune of Eternity Tamamo-no-Mae', 'Marian']
    ]
  }
}

export default function DemiurgeAsteiPromoGuide() {
  return (
    <div>
      <GuideHeading level={3}>Strategy Overview</GuideHeading>
      <GuideHeading level={4}>Boss Mechanics</GuideHeading>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li><strong>Skills:</strong> Same as the story version.</li>
        <li><strong>Control Immunity:</strong> Now immune to all crowd control.</li>
        <li><strong>Damage:</strong> Unbuffed damage is manageable (healing is not required).</li>
        </ul>
        <GuideHeading level={4}>Points of interest</GuideHeading>
        <ul className='list-disc list-inside text-neutral-300 mb-4'>
        <li><CharacterLinkCard name="Sterope" />: Absorbs 50% of damage taken by allies. Very resistant to AoE damage.</li>
      </ul>

      <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Team Suggestions</h3>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li><CharacterLinkCard name="Akari" /></li>
        <li><CharacterLinkCard name="Stella" /></li>
        <li><CharacterLinkCard name="Drakhan" /></li>
        <li><CharacterLinkCard name="Kitsune of Eternity Tamamo-no-Mae" /> / <CharacterLinkCard name="Marian" /></li>
      </ul>

      <p className="text-neutral-400 text-sm italic mb-4">
        Note: Typically cleared in a single attempt. No special strategy required beyond basic survival and damage output.
      </p>

      <hr className="my-6 border-neutral-700" />
      <TeamTabSelector teams={teams} />

      <hr className="my-6 border-neutral-700" />

      <div className="mb-4">
        <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
        <p className="mb-2 text-neutral-300">
          A sample video of the promotion run will be added here soon.
        </p>
      </div>
    </div>
  )
}
