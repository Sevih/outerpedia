'use client'

import EffectInlineTag from '@/app/components/EffectInlineTag'
import GuideHeading from '@/app/components/GuideHeading'
import TeamTabSelector from '@/app/components/TeamTabSelector'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'

const teams = {
  team1: {
    label: 'Team 1 – Reliable Clear',
    icon: 'SC_Buff_Stat_BuffChance.webp',
    setup: [
      ['Tamara'],
      ['Caren','Roxie'],
      ['Poolside Trickster Regina', 'Laplace'],
      ["Summer Knight's Dream Ember",'Demiurge Vlada', 'Edelweiss', 'Sterope']
    ]
  }
}

export default function KsaiGuide() {
  return (
    <div>
      <GuideHeading level={3}>Strategy Overview</GuideHeading>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li>Non-water units suffer <EffectInlineTag name="BT_STAT|ST_ATK_IR" type="debuff" /> and <EffectInlineTag name="BT_STAT|ST_DEF_IR" type="debuff" /></li>
        <li>Team has <EffectInlineTag name="BT_SYS_DEBUFF_ENHANCE_IR" type="debuff" /></li>
        <li>Boss has <EffectInlineTag name="BT_SYS_BUFF_ENHANCE_IR" type="buff" /></li>
        <li>Takes no <EffectInlineTag name="BT_WG_DMG" type="debuff" /> until boss HP &lt; 70%</li>
        <li><strong>DoT Cap:</strong> <EffectInlineTag name="BT_DOT_CURSE" type="debuff" /> / <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> limited to 5k</li>
        <li><strong>S1:</strong> AoE + heals 40% HP</li>
        <li><strong>S2:</strong> If HP &gt; 70%, launches additional AoE and gains irremovable <EffectInlineTag name="BT_STAT|ST_DEF_IR" type="buff" /> for 4 turns</li>
        <li><strong>S3:</strong> AoE, inflicts irremovable <EffectInlineTag name="BT_STAT|ST_ATK_IR" type="debuff" /> for 2 turns (ignores immunity and resilience), grants <EffectInlineTag name="BT_ADDITIVE_TURN" type="buff" /></li>
      </ul>

      <hr className="my-6 border-neutral-700" />
      <TeamTabSelector teams={teams} />
      <p className="text-neutral-400 text-sm italic mb-4">
        Demiurge Vlada&apos;s mainly here for her debuffs. She can survive the first S1, and the boss shouldn&apos;t reach a second action.
      </p>
      <hr className="my-6 border-neutral-700" />

      <div className="mb-4">
        <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
        <p className="text-neutral-400 text-sm italic mt-2">
          Run provided by <span className="text-white font-semibold">XuRenChao</span> (15/09/2025)
        </p>
        <YoutubeEmbed videoId="-jEcneW-N3Y" title="Ksai - Adventure License - Stage 10 - 1 run clear (Auto) - by XuRenChao" />
      </div>
    </div>
  )
}
