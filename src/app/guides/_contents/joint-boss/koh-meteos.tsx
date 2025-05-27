'use client'

import { useState } from 'react'
import GuideHeading from '@/app/components/GuideHeading'
import VersionSelector from '@/app/components/VersionSelector'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import ClassInlineTag from '@/app/components/ClassInlineTag'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'
import GuideIconInline from '@/app/components/GuideIconInline';
import RecommendedTeam from '@/app/components/RecommendedTeamCarousel'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import ElementInlineTag from '@/app/components/ElementInline'

const teamSetup0525 = [
  ['Demiurge Luna','Regina'],
  ['Bryn'],
  ['Gnosis Dahlia', 'Regina', "Holy Night's Blessing Dianne", "Ryu Lion"],
  ['Monad Eva', 'Omega Nadja'],
]

const versions: Record<string, { label: string; content: React.ReactNode }> = {
  default: {
    label: 'May 2025 Version',
    content: (
      <>
        <GuideHeading level={3}>Strategy Overview</GuideHeading>
        <GuideHeading level={4}>Knight of Hope Meteos moveset</GuideHeading>
        <ul className="list-disc list-inside text-neutral-300 mb-4">
          <li><strong>S1</strong>: Single, prioritizes leftmost enemy.</li>
          <li><strong>S2</strong>: AoE, damage increases inversely proportional to the number of targets.</li>
          <li><strong>Passive</strong>:AoE, ignored defense. Triggered when the enemy is killed by S1/S2 or attacking a non-<ClassInlineTag name='Mage' /> target with S1.</li>
          <li><strong>Passive</strong>: <ElementInlineTag element='light' /> enemies gain 40% penetration.</li>
          <li><strong>Passive</strong>: Increases enemy priority efficiency by 100% but reduces their speed by 50%</li>
          <li><strong>Passive</strong>: Enemies that use non-offensive skills take 100% increased critical damage (max 3 stacks).</li>
          <li><strong>Passive</strong>: Increase boss&apos;s defense by 500 each turn, but resets when the boss is inflicted with break.</li>
          <li><strong>Passive</strong>: Damage taken from <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> and <EffectInlineTag name="BT_DOT_CURSE" type="debuff" /> does not exceed 10 000.</li>
          <li><strong>Enrage</strong>:  Every 4 turns. Gain <EffectInlineTag name="BT_DAMGE_TAKEN" type="buff" /> and <EffectInlineTag name="BT_STAT|ST_ATK_IR" type="buff" />.</li>
          <li><strong>Enrage Ultimate</strong>: AoE, deals lethal damage and <EffectInlineTag name="BT_SEALED_RESURRECTION" type="debuff" />.</li>
        </ul>
        <hr className="my-6 border-neutral-700" />
        <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Recommended Characters</h3>
        <ul className="list-disc list-inside text-neutral-300 mb-4">
          <li><CharacterLinkCard name="Demiurge Luna" />: Essential pick because of the score bonus. Use Revenge Set, <GuideIconInline name="TI_Equipment_Accessary_06" text="Queen of Prism" />  and <EffectInlineTag name="UNIQUE_POLAR_KNIGHT" type="buff" /></li>
          <li><CharacterLinkCard name="Bryn" />: Essential pick because of the score bonus. Her exclusive equipment boost damage of allies with <EffectInlineTag name="BT_SHIELD_BASED_CASTER" type="buff" />.</li>
          <li><CharacterLinkCard name="Gnosis Dahlia" /> : S1 will push team (synergizes with boss passive).</li>
          <li><CharacterLinkCard name="Ryu Lion" /> : <EffectInlineTag name="BT_STAT|ST_SPEED" type="buff" /> <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> (ideally slower than <CharacterLinkCard name="Demiurge Luna" />).</li>
          <li><CharacterLinkCard name="Regina" /> : <ElementInlineTag element='light' /> <ClassInlineTag name='Mage' /> with self-<EffectInlineTag name="BT_ACTION_GAUGE" type="buff" />. You can use her as a remplacement if you don&apos;t own <CharacterLinkCard name="Demiurge Luna" />.</li>
          <li><CharacterLinkCard name="Omega Nadja" /> : Nice damage with <EffectInlineTag name="BT_ACTION_GAUGE" type="debuff" /> <EffectInlineTag name="BT_SHIELD_BASED_CASTER" type="buff" />.</li>
          <li><CharacterLinkCard name="Holy Night's Blessing Dianne" /> : <EffectInlineTag name="UNIQUE_GIFT_OF_BUFF" type="buff" /> with self-<EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> (ideally slower than <CharacterLinkCard name="Demiurge Luna" />).</li>
        </ul>
        <p className="text-neutral-400 text-sm italic mb-4">
          Note: <br />Any mage can be play on leftmost position. If you don&apos;t own <CharacterLinkCard name="Demiurge Luna" /> or <CharacterLinkCard name="Regina" />, <br />try choosing a <ClassInlineTag name='Mage' /> with some <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> like <CharacterLinkCard name="Roxie" />.
        </p>
        <hr className="my-6 border-neutral-700" />
        <RecommendedTeam team={teamSetup0525} />
        <hr className="my-6 border-neutral-700" />
        <YoutubeEmbed videoId="g3LcTpm9fMo" title="Knight of Hope Meteos - Joint Challenge - Very Hard Mode by Sevih" />
      </>
    ),
  },

  legacy2024: {
    label: 'Legacy (2024 Video)',
    content: (
      <>

        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Combat Footage</h2>
            <p className="mb-2 text-neutral-300">
              No full written guide has been made yet. For now, we recommend watching this excellent video by <strong>Ducky</strong>:
            </p>
          </div>

          <YoutubeEmbed videoId="X5bL_YZ73y4" title="Knight of Hope Meteos Joint Boss Max Score by Ducky" />
        </div>
      </>
    ),
  },

}

export default function KOHmeteosGuide() {
  const [selected, setSelected] = useState<string>('default')

  return (
    <div>
      <VersionSelector
        versions={versions}
        selected={selected}
        onSelect={setSelected}
      />
      {versions[selected].content}
    </div>
  )
}
