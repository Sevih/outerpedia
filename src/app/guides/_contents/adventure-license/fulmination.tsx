'use client'

import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import GuideHeading from '@/app/components/GuideHeading'
import TeamTabSelector from '@/app/components/TeamTabSelector'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'

const teams = {
  standard: {
    label: 'Recommended Team',
    icon: 'SC_Buff_Dot_Curse.webp',
    setup: [
      ['Monad Eva'],
      ['Dianne'],
      ['Marian'],
      ['Kitsune of Eternity Tamamo-no-Mae', 'Drakhan']
    ]
  },
  counter: {
    label: 'Counter Team',
    icon: 'SC_Buff_Counter.webp',
    setup: [
      ['Delta'],
      ['Fran'],
      ['Rey','Rhona'],
      ['Ame']
    ]
  }
}

export default function FulMiNationAssaultSuitGuide() {
  return (
    <div>
      <GuideHeading level={4}>Strategy Overview</GuideHeading>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li><strong>Element:</strong> Water</li>
        <li>Only takes WG damage from <strong>Counter</strong> and <strong>Revenge</strong> attacks (Delta mechanic)</li>
        <li>Greatly reduced damage from AoE attacks</li>
        <li>Reduces <EffectInlineTag name="BT_STAT|ST_CRITICAL_RATE" type="debuff" /> for non-Earth units</li>
        <li><strong>S2:</strong> Deals greatly increased damage to targets without buffs</li>
        <li><strong>S3:</strong> <EffectInlineTag name="BT_STAT|ST_SPEED" type="buff" /> on boss while <EffectInlineTag name="BT_STAT|ST_SPEED" type="debuff" /> your team (3 turns), ignores immunity and resilience</li>
        <li><strong>Enrage:</strong> Inflicts <EffectInlineTag name="BT_SILENCE_IR" type="debuff" />, but usually too late to matter</li>
        <li>Low resilience; only immune to crowd control</li>
      </ul>

      <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Team Suggestions</h3>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li><CharacterLinkCard name="Monad Eva" /></li>
        <li><CharacterLinkCard name="Dianne" /></li>
        <li><CharacterLinkCard name="Marian" /></li>
        <li><CharacterLinkCard name="Kitsune of Eternity Tamamo-no-Mae" /> / <CharacterLinkCard name="Drakhan" /></li>
      </ul>

      <p className="text-neutral-400 text-sm italic mb-4">
        Note: Typically cleared in 1 attempt. Verified up to stage 10.
      </p>

      <hr className="my-6 border-neutral-700" />
      <TeamTabSelector teams={teams} />

      <hr className="my-6 border-neutral-700" />

      <div className="mb-4">
        <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
        <p className="text-neutral-400 text-sm italic mt-2">
          Run provided by <span className="text-white font-semibold">XuRenChao</span> (29/07/2025)
        </p>
        <YoutubeEmbed videoId="lt4osbmszzY" title="Ful.Mi.NATION Assault Suit - Adventure License - Stage 10 - 1 run clear (Auto) - by XuRenChao" />
      </div>
    </div>
  )
}
