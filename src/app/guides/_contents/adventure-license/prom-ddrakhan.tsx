'use client'

import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import GuideHeading from '@/app/components/GuideHeading'
import TeamTabSelector from '@/app/components/TeamTabSelector'

const teams = {
  promo: {
    label: 'Promotion Run',
    icon: 'SC_Buff_Stat_HitRecovery.webp',
    setup: [
      ['Monad Eva', 'Leo'],
      ['Nella', 'Mene'],
      ['Gnosis Nella', 'Tamamo-no-Mae'],
      ['Iota', 'Laplace', 'Demiurge Stella']
    ]
  },
  safe: {
    label: 'Safe Prom Run',
    icon: 'CM_Stat_Icon_HP.webp',
    setup: [
      ['Monad Eva'],
      ['Nella'],
      ['Gnosis Viella'],
      ["Summer Knight's Dream Ember"]
    ]
  }
}

export default function DemiurgeDrakhanPromoGuide() {
  return (
    <div>
      <GuideHeading level={3}>Strategy Overview</GuideHeading>
      <GuideHeading level={4}>Boss Mechanics</GuideHeading>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li><EffectInlineTag name="BT_INVINCIBLE_IR" type="buff" /> for 3 turns. Reapplied if Demiurge Drakhan scores a kill.</li>
        <li><strong>Skills:</strong> Identical to Season 2 Part 2 (Hard).</li>
        <li><strong>Burn Mechanic:</strong> Vlada applies 4 turn <EffectInlineTag name="IG_Buff_Dot_Burn_Interruption_D" type="debuff" />. Detonation is lethal.</li>
      </ul>

      <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Team Suggestions</h3>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li><CharacterLinkCard name="Monad Eva" /> / <CharacterLinkCard name="Leo" /></li>
        <li><CharacterLinkCard name="Nella" /> / <CharacterLinkCard name="Mene" /></li>
        <li><CharacterLinkCard name="Tamamo-no-Mae" /> / <CharacterLinkCard name="Gnosis Nella" /></li>
        <li><CharacterLinkCard name="Iota" />, <CharacterLinkCard name="Laplace" />, <CharacterLinkCard name="Demiurge Stella" /></li>
      </ul>

      <p className="text-neutral-400 text-sm italic mb-4">
        Note: Typically requires 2 attempts. Go slow. Use Invulnerability, Revival, or Resurrect options to survive Vlada’s detonation. Sage Talismans are recommended to accumulate CP during invulnerability phases.
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
