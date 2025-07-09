'use client'

import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import GuideHeading from '@/app/components/GuideHeading'
import TeamTabSelector from '@/app/components/TeamTabSelector'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'

const teams = {
  curse: {
    label: 'Curse Team',
    icon: 'SC_Buff_Dot_Curse.webp',
    setup: [
      ['Sterope'],
      ['Monad Eva'],
      ['Kitsune of Eternity Tamamo-no-Mae', 'Marian', 'Drakhan'],
      ['Marian', 'Drakhan', 'Kitsune of Eternity Tamamo-no-Mae']
    ]
  },
  fixed: {
    label: 'Fixed Damage',
    icon: 'SC_Buff_Effect_True_Dmg.webp',
    setup: [
      ['Sterope'],
      ['Monad Eva'],
      ['Demiurge Stella', 'Gnosis Nella'],
      ['Tamamo-no-Mae', 'Demiurge Stella']
    ]
  }
}


export default function DemiurgeVladaGuide() {
  return (
    <div>
      <GuideHeading level={3}>Strategy Overview</GuideHeading>
      <GuideHeading level={4}>Demiurge Vlada Mechanics</GuideHeading>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li><strong>S1</strong>: Apply <EffectInlineTag name="BT_COOL_CHARGE" type="debuff" /> on target&#39;s S3 (single-target).</li>
        <li><strong>S2</strong>: Standard AoE follow-up attack.</li>
        <li><strong>S3</strong>: Starts on cooldown. Strips buffs and applies <EffectInlineTag name="BT_SEALED_RECEIVE_HEAL" type="debuff" /> for 5 turns.</li>
        <li><strong>Enrage Ultimate (at 40%)</strong>: Applies <strong>permanent, irremovable Increased Damage Taken</strong>, ignoring immunity and resilience.</li>
      </ul>


      <GuideHeading level={4}>Drakhan Mechanics</GuideHeading>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li><strong>S1</strong>: Applies 2-turn <EffectInlineTag name="BT_DOT_CURSE" type="debuff" />.</li>
        <li><strong>S2</strong>: 3-turn <EffectInlineTag name="BT_DOT_CURSE" type="debuff" />, uncounterable.</li>
        <li><strong>S3</strong>: Applies 2-turn <EffectInlineTag name="BT_STAT|ST_CRITICAL_RATE" type="debuff" />.</li>
      </ul>
      <GuideHeading level={4}>Points of interest</GuideHeading>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li>Both enemies heal 15% of all allies&#39; HP on successful debuffing, and deal increased damage based on total debuff count.</li>
        <li><EffectInlineTag name="BT_DOT_CURSE" type="debuff" /> and <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> are allowed and uncapped.</li>
      </ul>

      <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Team Suggestions</h3>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li><CharacterLinkCard name="Sterope" />: Useful at making the boss <EffectInlineTag name="BT_SEALED_RECEIVE_HEAL" type="debuff" /> </li>
        <li><CharacterLinkCard name="Monad Eva" />: Cleanse and sustain and her <EffectInlineTag name="BT_CALL_BACKUP" type="buff" /> helps to stack more <EffectInlineTag name="BT_DOT_CURSE" type="debuff" />.</li>
        <li><CharacterLinkCard name="Tio" />: optional, can be replaced for more damage.</li>
        <li><CharacterLinkCard name="Kitsune of Eternity Tamamo-no-Mae" />, <CharacterLinkCard name="Drakhan" />, <CharacterLinkCard name="Marian" />:  <EffectInlineTag name="BT_DOT_CURSE" type="debuff" /> specialists.</li>
        <li><CharacterLinkCard name="Demiurge Stella" />, <CharacterLinkCard name="Tamamo-no-Mae" />, <CharacterLinkCard name="Gnosis Nella" />:  <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> specialists.</li>
      </ul>
      <p className="text-neutral-400 text-sm italic mb-4">
        Note: This setup typically requires 2 attempts. You can consider replacing Tio if you want faster clears.
      </p>

      <hr className="my-6 border-neutral-700" />
      <TeamTabSelector teams={teams} />

      <hr className="my-6 border-neutral-700" />

      <div className="mb-4">
        <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
        <p className="text-neutral-400 text-sm italic mt-2">
          Run provided by <span className="text-white font-semibold">Sevih</span> (09/07/2025)
        </p>
        <YoutubeEmbed videoId="JIx2mVtXufA" title="Demiurge Vlada - Adventure License : promotion challenge" />
      </div>
    </div>
  )
}
