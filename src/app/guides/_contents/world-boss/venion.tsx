'use client'

import { useState } from 'react'
import VersionSelector from '@/app/components/VersionSelector'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'
import GuideHeading from '@/app/components/GuideHeading'
import ClassInlineTag from '@/app/components/ClassInlineTag'
import ElementInlineTag from '@/app/components/ElementInline'
import TeamTabSelector from '@/app/components/TeamTabSelector'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

const teams = {
  team1: {
    label: 'Light and Dark',
    icon: 'light.webp',
    setup: [
      ['Gnosis Dahlia', 'Regina', 'Monad Eva'],
      ['Drakhan', 'Demiurge Stella', 'Demiurge Astei'],
      ['Demiurge Luna', 'Maxwell', 'Demiurge Astei'],
      ['Monad Eva', 'Drakhan', 'Demiurge Stella', 'Demiurge Astei', 'Demiurge Luna', 'Maxwell'],
    ]
  },
  team2: {
    label: 'Fire Water Earth',
    icon: 'fire.webp',
    setup: [
      ['Tamara', 'Tamamo-no-Mae'],
      ['Veronica','Mene'],
      ['Caren', 'Kanon'],
      ['Lyla', 'Mene', 'Laplace'],
    ]
  }
}


const versions: Record<string, { label: string; content: React.ReactNode }> = {
  default: {
    label: 'June 2025 Version',
    content: (
      <>
        <GuideHeading level={3}>Strategy Overview</GuideHeading>
        <GuideHeading level={4}>Phase 1 : Walking Fortress moveset</GuideHeading>
        <ul className="list-disc list-inside text-neutral-300 mb-4">
          <li><strong>S1</strong>: Single, prioritizes leftmost enemy. Penetrates 30% of the enemy&apos;s defense.</li>
          <li><strong>S2</strong>: AoE, grants <EffectInlineTag name="UNIQUE_VENION_A" type="buff" /> or <EffectInlineTag name="UNIQUE_VENION_B" type="buff" /> for 3 turns.</li>
          <li><strong>S3</strong>: AoE, Penetrate 30% enemy&apos;s defense.</li>
          <ol className='ml-10'>
            <li>If granted <EffectInlineTag name="UNIQUE_VENION_A" type="buff" /> <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> by 80% of <ElementInlineTag element='fire' /><ElementInlineTag element='water' /><ElementInlineTag element='earth' /> enemies.</li>
            <li>If granted <EffectInlineTag name="UNIQUE_VENION_B" type="buff" /> <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> by 80% of <ElementInlineTag element='light' /><ElementInlineTag element='dark' /> enemies.</li>
          </ol>
          <li><strong>Passive</strong>: Takes increased damage from <ElementInlineTag element='fire' /><ElementInlineTag element='water' /><ElementInlineTag element='earth' /> enemies and they always have <EffectInlineTag name='BT_DMG_ELEMENT_SUPERIORITY' type='buff' />.</li>
          <li><strong>Passive</strong>: Reduces enemies&apos; Speed to 0 and inflicts them with <EffectInlineTag name="BT_SEAL_ADDITIVE_ATTACK_IR" type="debuff" /> and <EffectInlineTag name="BT_SEAL_ADDITIVE_TURN_IR" type="debuff" />.</li>
          <li><strong>Passive</strong>: After the caster attacks, <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> of enemies by 100%.</li>
          <li><strong>Passive</strong>: Damage taken from <EffectInlineTag name="BT_DOT_CURSE" type="debuff" /> does not exceed 10 000.</li>
          <li><strong>Passive</strong>: Damage taken from <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> does not exceed 20 000 (Skill chain <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> can deal up to 50 000).</li>
          <li><strong>Passive</strong>: Grants <EffectInlineTag name="UNIQUE_VENION_C" type="buff" /> to enemies.</li>
          <li><strong>Passive</strong>: Grants a special effect to the enemy team based on their class:</li>
          <ol className='ml-10'>
            <li><ClassInlineTag name='Defender' />: when performing an action, recovers all allies&apos; HP 3%.</li>
            <li><ClassInlineTag name='Healer' />: when performing an action, reduces weakness gauge of the boss by 2.</li>
            <li><ClassInlineTag name='Mage' />: for each mage, increases attack of all allies by 15%.</li>
            <li><ClassInlineTag name='Ranger' />:  when performing an action, grants <EffectInlineTag name="BT_SHIELD_BASED_CASTER" type="buff" /> to all allies for 2 turns.</li>
            <li><ClassInlineTag name='Striker' />: for each striker, increases critical damage of all allies by 60%.</li>
          </ol>
          <li><strong>Passive</strong>: For each hero of the same element, increases skill chain damage by 100%.</li>
          <li><strong>Passive</strong>: Reduces weakness gauge damage of skill chain and dual attack by 100%.</li>
        </ul>
        <hr className="my-6 border-neutral-700" />
        <GuideHeading level={4}>Phase 2 : Uncharted Fortress moveset</GuideHeading>
        <ul className="list-disc list-inside text-neutral-300 mb-4">
          <li><strong>S1</strong>: Single, prioritizes leftmost enemy. Penetrates 30% of the enemy&apos;s defense and <EffectInlineTag name="BT_SEALED_RESURRECTION" type="debuff" /></li>
          <li><strong>S2</strong>: AoE, Penetrate 30% enemy&apos;s defense. Grants <EffectInlineTag name="UNIQUE_VENION_D" type="buff" /> or <EffectInlineTag name="UNIQUE_VENION_E" type="buff" /> for 3 turn. Inflict <EffectInlineTag name="BT_COOL_CHARGE" type="debuff" /> by 1 turn</li>
          <li><strong>S3</strong>: AoE, Penetrate 30% enemy&apos;s defense and ignore resilience. Inflicts <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" />. <EffectInlineTag name="BT_SEALED_RESURRECTION" type="debuff" /></li>
          <ol className='ml-10'>
            <li>If granted <EffectInlineTag name="UNIQUE_VENION_E" type="buff" /> inflicts instant death on <ElementInlineTag element='fire' /><ElementInlineTag element='water' /><ElementInlineTag element='earth' /> enemies.</li>
            <li>If granted <EffectInlineTag name="UNIQUE_VENION_D" type="buff" /> inflicts instant death on <ElementInlineTag element='light' /><ElementInlineTag element='dark' /> enemies.</li>
          </ol>
          <li><strong>Passive</strong>: Takes increased damage from <ElementInlineTag element='light' /><ElementInlineTag element='dark' /> enemies and they always have <EffectInlineTag name='BT_DMG_ELEMENT_SUPERIORITY' type='buff' />.</li>
          <li><strong>Passive</strong>: Takes increased damage from attack that targets all enemies.</li>
          <li><strong>Passive</strong>: Reduce enemies speed to 0 and inflict them with <EffectInlineTag name="BT_SEAL_ADDITIVE_ATTACK_IR" type="debuff" /> and <EffectInlineTag name="BT_SEAL_ADDITIVE_TURN_IR" type="debuff" />.</li>
          <li><strong>Passive</strong>: After the caster attack, <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> of enemies by 100%.</li>
          <li><strong>Passive</strong>: At the start of the turn, inflict <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /> on all enemies that have 30% or less HP and change their HP to 1.</li>
          <li><strong>Passive</strong>: Damage taken from <EffectInlineTag name="BT_DOT_CURSE" type="debuff" /> does not exceed 10 000.</li>
          <li><strong>Passive</strong>: Damage taken from <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> does not exceed 20 000 (Skill chain <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> can deal up to 50 000).</li>
          <li><strong>Passive</strong>: Grants <EffectInlineTag name="UNIQUE_VENION_C" type="buff" /> to enemies.</li>
          <li><strong>Passive</strong>: Grants a special effect to the enemy team based on their class:</li>
          <ol className='ml-10'>
            <li><ClassInlineTag name='Defender' />: when performing an action, recovers all allies&apos; HP by 5%.</li>
            <li><ClassInlineTag name='Healer' />: when performing an action, reduces weakness gauge of the boss by 3.</li>
            <li><ClassInlineTag name='Mage' />: for each mage, increases attack of all allies by 125%.</li>
            <li><ClassInlineTag name='Ranger' />:  when performing an action, grants <EffectInlineTag name="BT_SHIELD_BASED_CASTER" type="buff" /> to all allies for 2 turns.</li>
            <li><ClassInlineTag name='Striker' />: for each striker, increases critical damage of all allies by 500%.</li>
          </ol>
          <li><strong>Passive</strong>: For each hero of the same element, increases skill chain damage by 100%.</li>
          <li><strong>Passive</strong>: Reduces weakness gauge damage of skill chain and dual attack by 100%.</li>
        </ul>
        <hr className="my-6 border-neutral-700" />
        <GuideHeading level={4}>Characters and Advices</GuideHeading>

        <p>You want your teams to have penetration  as much as possible. Venion&apos;s defense is high (3500 phase 1 and 5000 phase 2)</p>
        <p>Having counter set on support is really helpful since they&apos;ll activate their respective bonus gain from Venion</p>
        <p>Keep an eye on Venions&apos;s buff and swap team if needed to avoid and instant death or an 80% push since it&apos;ll make you lose one turn.</p>
        <p>Having fixed damage in your skill chain is okay as long as it results in more total damage.</p>
        <p>Having multiple healers in your second team is also a viable option to deal more weakness gauge damage.</p>

        <ul className="list-disc list-inside text-neutral-300 mb-4">
          <li><CharacterLinkCard name="Gnosis Dahlia" /> : since the boss have 100% critical hit chance, place her leftmost position and she&apos;ll counter every time.</li>
          <li><CharacterLinkCard name="Regina" />: a nice alternative to <CharacterLinkCard name="Gnosis Dahlia" />.</li>
          <li><CharacterLinkCard name="Demiurge Luna" />: High damage and AP gain chain bonus, allowing more burst and more chain points.</li>
          <li><CharacterLinkCard name="Drakhan" /> : she pushes herself when dual or skill chain allowing her to play 2 times if you perform at least 2 dual/chain attacks after she acts.</li>
          <li><CharacterLinkCard name="Monad Eva" />: strong as always. She can be put in first position if you don&apos;t have <CharacterLinkCard name="Gnosis Dahlia" /> or <CharacterLinkCard name="Regina" />.</li>

          <li><CharacterLinkCard name="Caren" />: Her S3 ignores 30% of boss defense.</li>
          <li><CharacterLinkCard name="Veronica" />: Will give a <EffectInlineTag name="BT_STAT|ST_DEF" type="buff" /> to <CharacterLinkCard name="Caren" /> that&apos;ll increase her damage.</li>
          <li><CharacterLinkCard name="Kanon" />: alternative of <CharacterLinkCard name="Caren" />.</li>
          <li><CharacterLinkCard name="Tamara" />: Her chain bonus will give you more damage for 2 turns thanks to <EffectInlineTag name="BT_MARKING" type="debuff" />.</li>
          <li><CharacterLinkCard name="Laplace" /><CharacterLinkCard name="Tamamo-no-Mae" /><CharacterLinkCard name="Ryu Lion" />: A source of <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" />.</li>
        </ul>
        <hr className="my-6 border-neutral-700" />
        <TeamTabSelector teams={teams} />
        <hr className="my-6 border-neutral-700" />
        <YoutubeEmbed videoId="SCAR0AeIsLU" title="Venion - World Boss - SSS - Extreme League by Sevih" />

      </>
    ),
  },

  legacy2024: {
    label: 'Legacy (2024 Video)',
    content: (
      <>
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Video Guide</h2>
            <p className="mb-2 text-neutral-300">
              No full written guide has been made yet. For now, we recommend watching this excellent video by <strong>Adjen</strong>:
            </p>
          </div>

          <YoutubeEmbed videoId="PxdLAUgbBPg" title="SSS Extreme League World Boss Venion! [Outerplane]" />
        </div>
      </>
    ),
  },

}

export default function VenionGuide() {
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
