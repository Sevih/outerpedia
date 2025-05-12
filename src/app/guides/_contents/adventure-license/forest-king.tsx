'use client'

import EffectInlineTag from '@/app/components/EffectInlineTag'
import GuideHeading from '@/app/components/GuideHeading'
import TeamTabSelector from '@/app/components/TeamTabSelector'

const teams = {
  team1: {
    label: 'Team 1 – Anti-Forest Core',
    icon: 'SC_Buff_Effect_Remove_Buff.webp',
    setup: [
      ['Monad Eva'],
      ['Stella'],
      ['Regina'],
      ['Akari', 'Gnosis Nella']
    ]
  }
}

export default function ForestKingGuide() {
  return (
    <div>
      <GuideHeading level={3}>Strategy Overview</GuideHeading>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li>Inflicts <EffectInlineTag name="BT_STUN" type="debuff" /></li>
        <li>Inflicts <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /></li>
        <li>Reduces Striker damage, increases Mage and Ranger damage</li>
        <li>Dark units suffer reduced <EffectInlineTag name="BT_STAT|ST_CRITICAL_RATE_IR" type="debuff" /></li>
      </ul>

      <hr className="my-6 border-neutral-700" />
      <TeamTabSelector teams={teams} />
      <p className="text-neutral-400 text-sm italic mb-4">
        1 attempt. Verified up to stage 10.
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
