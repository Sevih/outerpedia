'use client'

import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import GuideHeading from '@/app/components/GuideHeading'
import TeamTabSelector from '@/app/components/TeamTabSelector'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'

const teams = {
  etamamo: {
    label: 'ETamamo Carry',
    icon: 'SC_Buff_Dot_Curse.webp',
    setup: [
      ['Kitsune of Eternity Tamamo-no-Mae'],
      ['Dianne']
    ]
  },
  rhona: {
    label: 'Rhona Chain Strat',
    icon: 'SC_Buff_Effect_Heavy_bk.webp',
    setup: [
      ['Rhona'],
      ['Kappa', 'Noa', 'Ryu Lion', 'Ame', 'Rey',],
      ['Ryu Lion', 'Noa', 'Ame', 'Rey', 'Kappa'],
      ['Noa', 'Ryu Lion', 'Ame', 'Rey', 'Kappa']
    ]
  }
}

export default function HeavyFixedVladiMaxGuide() {
  return (
    <div>
      <GuideHeading level={3}>Strategy Overview</GuideHeading>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li>Fully heals when hit by non-attack skills</li>
        <li>Applies <EffectInlineTag name="BT_STAT|ST_CRITICAL_RATE" type="buff" /> irremovable on your team</li>
        <li><strong>S1:</strong> Inflicts 3 turn <EffectInlineTag name="BT_AGGRO" type="debuff" /> </li>
        <li><strong>S3:</strong> Requires 5 stacks and inflicts <strong>Instant Death</strong></li>
        <li>Gains 2 stacks on critical hit, loses 1 on non-crit</li>
        <li>No WG damage from crits; reduced WG damage from non-Earth units</li>
      </ul>

      <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Team Suggestions</h3>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li><strong>Team 1 (ETamamo Carry):</strong> <CharacterLinkCard name="Kitsune of Eternity Tamamo-no-Mae" /> {`&`} <CharacterLinkCard name="Dianne" /> (optional)</li>
        <li className="text-neutral-400 text-sm italic">
          Note: Dianne may not be needed. Confirmed clear up to stage 10 with 6★ ETamamo.
        </li>
        <li><strong>Team 2 (Rhona Chain):</strong> <CharacterLinkCard name="Rhona" /> + 3 of <CharacterLinkCard name="Noa" />, <CharacterLinkCard name="Ryu Lion" />, <CharacterLinkCard name="Ame" />, <CharacterLinkCard name="Rey" />, <CharacterLinkCard name="Kappa" /></li>
        <li className="text-neutral-400 text-sm italic">
          Note: Be sure to use the chain attack with the character that play just before the boss.
        </li>
      </ul>

      <hr className="my-6 border-neutral-700" />
      <TeamTabSelector teams={teams} />

      <hr className="my-6 border-neutral-700" />

      <div className="mb-4">
        <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
        <p className="text-neutral-400 text-sm italic mt-2">
          Run provided by <span className="text-white font-semibold">XuRenChao</span> (14/07/2025)
        </p>
        <YoutubeEmbed videoId="dJ13OvWJ44A" title="Heavy Fixed Vladi Max - Adventure License - Stage 10 - 1 run clear - by XuRenChao" />
      </div>
    </div>
  )
}
