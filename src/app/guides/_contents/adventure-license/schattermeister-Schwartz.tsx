'use client'

import EffectInlineTag from '@/app/components/EffectInlineTag'
import GuideHeading from '@/app/components/GuideHeading'
import TeamTabSelector from '@/app/components/TeamTabSelector'

const teams = {
  team1: {
    label: 'Team 1 – Shadow Buster',
    icon: 'SC_Buff_Effect_Dual_Attack.webp',
    setup: [
      ['Demiurge Astei'],
      ['Demiurge Vlada'],
      ['Monad Eva'],
      ['Gnosis Dahlia']
    ]
  }
}

export default function SchwartzGuide() {
  return (
    <div>
      <GuideHeading level={3}>Strategy Overview</GuideHeading>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li>Inflicts irremovable <EffectInlineTag name="BT_SEALED_IR" type="debuff" /></li>
        <li>Deals low damage when alone</li>
        <li>Damage dealt increases while Shadow Beast is alive</li>
        <li>Shadow Beasts are vulnerable to AoE</li>
        <li>Enrage makes Shadow Beasts invincible</li>
        <li>Reduces <EffectInlineTag name="BT_WG_DMG" type="debuff" /> from non-Dark units</li>
      </ul>

      <hr className="my-6 border-neutral-700" />
      <TeamTabSelector teams={teams} />
      <p className="text-neutral-400 text-sm italic mb-4">
        1 attempt. Verified up to stage 8. Any Dark DPS can replace Gnosis Dahlia (just be cautious about bleed immunity).
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
