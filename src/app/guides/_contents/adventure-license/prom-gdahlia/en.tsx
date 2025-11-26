'use client'

import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import GuideHeading from '@/app/components/GuideHeading'
import TeamTabSelector from '@/app/components/TeamTabSelector'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'

const teams = {
  fixed: {
    label: 'Fixed Damage',
    icon: 'SC_Buff_Effect_True_Dmg.webp',
    setup: [
      ['Leo'],
      ['Gnosis Beth'],
      ['Kuro'],
      ['Akari']
    ]
  },
}


export default function GnosisDahliaGuide() {
  return (
    <div>
      <GuideHeading level={3}>Strategy Overview</GuideHeading>
      <GuideHeading level={4}>Gnosis Dahlia Mechanics</GuideHeading>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li><strong>S1</strong>: Single, when scoring a critical hit <EffectInlineTag name="BT_COOL_CHARGE" type="buff" /> of her S3 by 1 turn.</li>
        <li><strong>S2</strong>: Single, <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> by 20%.</li>
        <li><strong>S3</strong>: AoE, ignores defense.</li>
        <li><strong>Passive</strong>: Damage taken in one attack cannot exceed 6% of her health (dual and additional attack are included).</li>
        <li><strong>Passive</strong>: All boss attacks are <EffectInlineTag name="BT_SEAL_COUNTER" type="buff" />.</li>
        <li><strong>Passive</strong>: Counter with S1 when taking a critical hit.</li>
        <li><strong>Enrage</strong>:  When health drops under 20%. AoE, no longer takes Weakness Gauge damage and gains <EffectInlineTag name="BT_STAT|ST_CRITICAL_RATE_IR" type="buff" />.</li>
      </ul>
      <GuideHeading level={4}>Points of interest</GuideHeading>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li>
          The boss has a 25-turn limit. Unless your team can consistently deal between <strong>39,296</strong> and <strong>58,945</strong> damage per turn, the most reliable approach is DoT — <EffectInlineTag name="BT_DOT_2000092" type="debuff" /> or <EffectInlineTag name="BT_DOT_BURN" type="debuff" />.
          This makes units like <CharacterLinkCard name="Gnosis Beth" />, <CharacterLinkCard name="Vlada" /> and <CharacterLinkCard name="Maxie" /> especially effective.
        </li>
        <li>
          The boss is immune to <EffectInlineTag name="BT_DOT_CURSE" type="debuff" /> and <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" />.
        </li>
      </ul>
      <hr className="my-6 border-neutral-700" />
      <TeamTabSelector teams={teams} />

      <hr className="my-6 border-neutral-700" />

      <hr className="my-6 border-neutral-700" />
      <div className="mb-4">
        <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
        <p className="text-neutral-400 text-sm italic mt-2">
          Run provided by <span className="text-white font-semibold">XuRenChao</span> (25/08/2025)
        </p>
        <YoutubeEmbed videoId="iOvGnQDYaCE" title="Gnosis Dahlia - Adventure License : promotion challenge by XuRenChao" />
      </div>

    </div>
  )
}
