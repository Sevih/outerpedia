'use client'

import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import GuideHeading from '@/app/components/GuideHeading'
import TeamTabSelector from '@/app/components/TeamTabSelector'

const teams = {
  promo: {
    label: 'Promotion Run',
    icon: 'SC_Buff_Light_Dmg.webp',
    setup: [
      ['Monad Eva'],
      ['Demiurge Astei'],
      ['Demiurge Stella'],
      ['Tamamo-no-Mae', 'Gnosis Nella']
    ]
  }
}

export default function DemiurgeStellaPromoGuide() {
  return (
    <div>
      <GuideHeading level={3}>Strategy Overview</GuideHeading>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li><strong>Skills:</strong> Same as story boss version.</li>
      </ul>

      <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Team Suggestions</h3>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li><CharacterLinkCard name="Monad Eva" /></li>
        <li><CharacterLinkCard name="Demiurge Astei" /></li>
        <li><CharacterLinkCard name="Demiurge Stella" /></li>
        <li><CharacterLinkCard name="Tamamo-no-Mae" /> / <CharacterLinkCard name="Gnosis Nella" /></li>
      </ul>

      <p className="text-neutral-400 text-sm italic mb-4">
        Note: Can typically be cleared in a single attempt.
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
