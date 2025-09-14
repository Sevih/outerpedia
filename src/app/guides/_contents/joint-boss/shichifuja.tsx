'use client'

import { useState } from 'react'
import VersionSelector from '@/app/components/VersionSelector'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'

import RecommendedTeam from '@/app/components/RecommendedTeamCarousel'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import GuideHeading from '@/app/components/GuideHeading'
import ClassInlineTag from '@/app/components/ClassInlineTag'
import ElementInlineTag from '@/app/components/ElementInline'

const teamSetup0825 = [
  ['Monad Eva'],
  ['Tamamo-no-Mae'],
  ['Demiurge Stella','Ryu Lion','Iota','Laplace'],
  ['Gnosis Nella','Kuro','Demiurge Drakhan','Drakhan'],
]

const versions: Record<string, { label: string; content: React.ReactNode }> = {
  default: {
    label: 'August 2025 Version',
    content: (
      <>
        <GuideHeading level={3}>Strategy Overview</GuideHeading>
        <GuideHeading level={4}>Shichifuja moveset</GuideHeading>
        <ul className="list-disc list-inside text-neutral-300 mb-4">
          <li><strong>S1</strong>: AoE, <EffectInlineTag name="BT_DOT_POISON" type="debuff" /> 3 turns. If leftmost unit isn’t a <ClassInlineTag name='Mage' />, fully recovers weakness gauge. Ignore Resilience and Immunity.</li>
          <li><strong>S2</strong>: AoE, if the target is inflicted with <EffectInlineTag name="BT_DOT_POISON" type="debuff" />, <EffectInlineTag name="BT_STAT|ST_DEF" type="debuff" /> and <EffectInlineTag name="BT_STAT|ST_SPEED" type="debuff" /> 5 turn. Ignore Resilience and Immunity.</li>
          <li><strong>S3</strong>: AoE, damage increased if the target is <EffectInlineTag name="BT_DOT_POISON" type="debuff" />. Increases damage of this skill with every use.</li>
          <li><strong>Passive</strong>: Reduces Attack of all heroes byy 90% but increases damage taken.</li>
          <li><strong>Passive</strong>: Do take weakness gauge damage only from burst skills, dual attacks and skill chain otherwise <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> of the boss by 20% and reduces weakness gauge damage by 50%.</li>
          <li><strong>Passive</strong>: At the start of the caster’s turn, recovers 10% of weakness gauge.</li>
          <li><strong>Passive</strong>: Increases damage dealt by all skills inversely proportional to the number of targets.</li>
          <li><strong>Enrage</strong>:  Every 4 turns. Gain <EffectInlineTag name="BT_DAMGE_TAKEN" type="buff" /> and <EffectInlineTag name="BT_STAT|ST_ATK_IR" type="buff" /> and recovers weakness gauge by 30%.</li>
          <li><strong>Enrage Ultimate</strong>: AoE, <EffectInlineTag name="BT_DOT_POISON_IR" type="debuff" /> 5 turns. Ignore Resilience and Immunity.</li>
        </ul>
        <hr className="my-6 border-neutral-700" />
        <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Advices</h3>
        <p>The boss is weak to <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" />.</p>
        <p>You want to generate CP as fast as possible so used Rogue/Sage’s charm.</p>
        <p>The boss ignore immunity and resilience so prefer <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" />.</p>
        <hr className="my-6 border-neutral-700" />
        <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Recommended Characters</h3>
        <ul className="list-disc list-inside text-neutral-300 mb-4">
          <li><CharacterLinkCard name="Tamamo-no-Mae" /> <CharacterLinkCard name="Gnosis Nella" />: Essential pick because of the score bonus.</li>
          <li><CharacterLinkCard name="Demiurge Stella" /> <CharacterLinkCard name="Ryu Lion" /> <CharacterLinkCard name="Iota" /> <CharacterLinkCard name="Laplace" />: <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> as chain attack finisher’s bonus.</li>
          <li><CharacterLinkCard name="Demiurge Drakhan" /> <CharacterLinkCard name="Kuro" /> : <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> source and <ElementInlineTag element='Light' />.</li>
          <li><CharacterLinkCard name="Drakhan" /> : <EffectInlineTag name="BT_DOT_CURSE" type="debuff" /> source and <ElementInlineTag element='Light' />.</li>
          <li><CharacterLinkCard name="Monad Eva" /> : <EffectInlineTag name="BT_CALL_BACKUP" type="buff" /> and <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" /> if 5 stars.</li>
        </ul>
        <hr className="my-6 border-neutral-700" />
        <RecommendedTeam team={teamSetup0825} />
        <hr className="my-6 border-neutral-700" />
        <p className="text-neutral-400 text-sm italic mt-2">
          Run provided by <span className="text-white font-semibold">Sevih</span> (19/08/2025)
        </p>
        <YoutubeEmbed videoId="hcJ6L4DwjWA" title="Shichifuja - Joint Challenge - Very Hard Mode by Sevih" />
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

          <YoutubeEmbed videoId="EjCfC5roxiQ" title="Schichifuja Joint Boss by Ducky" />
        </div>
      </>
    ),
  },

}

export default function ShichifujaGuide() {
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
