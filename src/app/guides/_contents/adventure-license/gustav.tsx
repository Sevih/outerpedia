'use client'

import EffectInlineTag from '@/app/components/EffectInlineTag'
import GuideHeading from '@/app/components/GuideHeading'
import TeamTabSelector from '@/app/components/TeamTabSelector'

const teams = {
  team1: {
    label: 'Team 1 – Orb Management',
    icon: 'SC_Buff_Effect_Cleanse.webp',
    setup: [
      ['Monad Eva'],
      ['Astei'],
      ['Drakhan', 'Marian'],
      ['Kitsune of Eternity Tamamo-no-Mae', 'Marian']
    ]
  }
}

export default function GustavGuide() {
  return (
    <div>
      <GuideHeading level={3}>Strategy Overview</GuideHeading>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li>Reduces damage taken when orbs are defeated</li>
        <li>Orbs deal <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> when attacked</li>
        <li>Bring <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" /> and/or <EffectInlineTag name="BT_IMMUNE" type="buff" /></li>
      </ul>

      <hr className="my-6 border-neutral-700" />
      <TeamTabSelector teams={teams} />
      <p className="text-neutral-400 text-sm italic mb-4">
        1 to 2 attempts. Verified up to stage 10.
      </p>
      <hr className="my-6 border-neutral-700" />

      <div className="mb-4">
        <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
        <p className="mb-2 text-neutral-300">
          A sample video of this team comp will be added here soon.
        </p>
      </div>
    </div>
  )
}
