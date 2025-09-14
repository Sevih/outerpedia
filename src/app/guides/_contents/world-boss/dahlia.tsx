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
import StatInlineTag from '@/app/components/StatInlineTag'

const teams = {
  team1: {
    label: 'Light Team',
    icon: 'light.webp',
    setup: [
      ['Monad Eva'],
      ['Demiurge Drakhan'],
      ['Demiurge Stella', 'Leo', "Kitsune of Eternity Tamamo-no-Mae"],
      ['Gnosis Nella', 'Alice'],
    ]
  },
  team2: {
    label: 'Ranger Team',
    icon: 'ranger.webp',
    setup: [
      ['Notia', 'Demiurge Vlada'],
      ['Akari'],
      ['Tamara', 'Stella', 'Gnosis Beth', 'Ryu Lion'],
      ['Luna', 'Omega Nadja'],
    ]
  }
}

const versions: Record<string, { label: string; content: React.ReactNode }> = {
  default: {
    label: 'July 2025 Version',
    content: (
      <>
        <GuideHeading level={3}>Strategy Overview</GuideHeading>
        <GuideHeading level={4}>Phase 1 : Dahlia moveset</GuideHeading>
        <ul className="list-disc list-inside text-neutral-300 mb-4">
          <li><strong>S1</strong>: Single, <EffectInlineTag name="IG_Buff_BuffdurationIncrease" type="buff" />.</li>
          <li><strong>S2</strong>: AoE passive, trigger when taking a critical hit. <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /> and <EffectInlineTag name="BT_FREEZE" type="debuff" /> 5 turns</li>
          <li><strong>S3</strong>: AoE <EffectInlineTag name="BT_SEAL_COUNTER" type="debuff" />, <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /> and <EffectInlineTag name="BT_FREEZE" type="debuff" /> 5 turns.</li>

          <li><strong>Passive</strong>: At the start of the battle and her turn, gain <EffectInlineTag name="BT_IMMUNE" type="buff" /> 1 turn.</li>
          <li><strong>Passive</strong>: Grants <EffectInlineTag name="UNIQUE_DAHLIA_A" type="buff" /> to the enemy team.</li>
          <ol className='ml-10'>
            <li><ClassInlineTag name='Defender' />: deals 3 weakness gauge damage when perfoming an action.</li>
            <li><ClassInlineTag name='Healer' />: grants permanent <EffectInlineTag name="BT_IMMUNE_IR" type="buff" />.</li>
            <li><ClassInlineTag name='Mage' />: increase damage dealt to the boss.</li>
            <li><ClassInlineTag name='Ranger' />:  at the start of the battle, grants <EffectInlineTag name="BT_STAT|ST_SPEED" type="buff" /> for 1 turn.</li>
            <li><ClassInlineTag name='Striker' />: +30% attack.</li>
          </ol>
          <li><strong>Passive</strong>: Damage taken increased based on the number of debuff she gets.</li>
          <li><strong>Passive</strong>: .<EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> other than Skill chain and damage from <ElementInlineTag element='dark' /> heroes does not exceed 1 000.</li>
          <li><strong>Passive</strong>: Damage taken from <EffectInlineTag name="BT_DOT_CURSE" type="debuff" /> does not exceed 10 000.</li>
          <li><strong>Passive</strong>: Greatly reduce damage taken and nullify weakness gauge damage from enemy with 100 or more Chain Points.</li>
          <li><strong>Passive</strong>: Completely reduce <StatInlineTag name='EFF' /> from non-<ElementInlineTag element='light' />/<ElementInlineTag element='earth' /> heroes.</li>
          <li><strong>Passive</strong>: Completely reduce <StatInlineTag name='CHC' /> from <ClassInlineTag name='Healer' /> <ClassInlineTag name='Defender' /> <ClassInlineTag name='Striker' /> heroes.</li>

        </ul>
        <hr className="my-6 border-neutral-700" />
        <GuideHeading level={4}>Phase 2 : Gnosis Dahlia moveset</GuideHeading>
        <ul className="list-disc list-inside text-neutral-300 mb-4">
          <li><strong>S1</strong>: Single, <EffectInlineTag name="IG_Buff_BuffdurationIncrease" type="buff" />.</li>
          <li><strong>S2</strong>: AoE, <EffectInlineTag name="BT_INVINCIBLE" type="buff" /> 3 turns.</li>
          <li><strong>S3</strong>: AoE, <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /> <EffectInlineTag name="BT_SEALED_RESURRECTION" type="debuff" />. Reduces health of <ClassInlineTag name='Striker' /> <ClassInlineTag name='Healer' /> <ClassInlineTag name='Mage' /> heroes by 99% before attacking.<br /><span className='ml-11'>This skill is immune to <EffectInlineTag name='BT_COOL_CHARGE' type='debuff' /></span></li>
          <li><strong>Passive</strong>: After performing an action, reduce debuff duration by 2 turns.</li>
          <li><strong>Passive</strong>: Upon taking a critical hit, gain <EffectInlineTag name="BT_INVINCIBLE" type="buff" /> 1 turns.</li>
          <li><strong>Passive</strong>: Grants <EffectInlineTag name="UNIQUE_DAHLIA_B" type="buff" /> to the enemy team.</li>
          <ol className='ml-10'>
            <li><ClassInlineTag name='Defender' />: prevent boss from reducing debuff duration.</li>
            <li><ClassInlineTag name='Healer' />: grants permanent <EffectInlineTag name="BT_IMMUNE_IR" type="buff" />.</li>
            <li><ClassInlineTag name='Mage' />: increase damage dealt to the boss.</li>
            <li><ClassInlineTag name='Ranger' />:  at the start of the battle, grants <EffectInlineTag name="BT_STAT|ST_SPEED" type="buff" /> for 1 turn.</li>
            <li><ClassInlineTag name='Striker' />: +30% attack.</li>
          </ol>
          <li><strong>Passive</strong>: Damage taken increased based on the number of debuff she gets.</li>
          <li><strong>Passive</strong>: .<EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> other than Skill chain and damage from <ElementInlineTag element='dark' /> heroes does not exceed 1 000.</li>
          <li><strong>Passive</strong>: Damage taken from <EffectInlineTag name="BT_DOT_CURSE" type="debuff" /> does not exceed 10 000.</li>
          <li><strong>Passive</strong>: Greatly reduce damage taken and nullify weakness gauge damage from enemy with 100 or more Chain Points.</li>
          <li><strong>Passive</strong>: Completely reduce <StatInlineTag name='EFF' /> from non-<ElementInlineTag element='light' />/<ElementInlineTag element='earth' /> heroes.</li>
          <li><strong>Passive</strong>: Completely reduce <StatInlineTag name='CHC' /> from <ClassInlineTag name='Healer' /> <ClassInlineTag name='Defender' /> <ClassInlineTag name='Striker' /> heroes.</li>
        </ul>
        <hr className="my-6 border-neutral-700" />
        <GuideHeading level={4}>Characters and Advices</GuideHeading>

        <p>You want your first team to push in phase 2 as soon as possible. Having <ClassInlineTag name='Defender' /> allow you to break the boss pretty quickly.</p>
        <p>You want to run every character other than <ClassInlineTag name='Healer' /> <ClassInlineTag name='Defender' /> <ClassInlineTag name='Striker' /> as lowest <StatInlineTag name='CHC' /> possible in order to avoid to be counter.</p>
        <p>Try to put <EffectInlineTag name="BT_SEALED" type="debuff" /> as soon as she swap into phase 2 so she won&apos;t gain <EffectInlineTag name="BT_INVINCIBLE" type="buff" />.</p>

        <p className='font-bold underline mt-2'>Phase 1 recommended characters</p>
        <ul className="list-disc list-inside text-neutral-300 mb-4">
          <li><CharacterLinkCard name="Demiurge Drakhan" /> <CharacterLinkCard name="Leo" /> : <ElementInlineTag element='light' /> <ClassInlineTag name='Defender' /> with each one non-offensive skill allowing you to stack CP before phase 2 and team swap.</li>
          <li><CharacterLinkCard name="Monad Eva" />: strong as always.</li>
          <li><CharacterLinkCard name="Dianne" />: a nice alternative to <CharacterLinkCard name="Monad Eva" />.</li>
          <li><CharacterLinkCard name="Gnosis Nella" />: <EffectInlineTag name="BT_SEALED" type="debuff" /> source.</li>
          <li><CharacterLinkCard name="Alice" />: a nice alternative to <CharacterLinkCard name="Gnosis Nella" />.</li>
          <li><CharacterLinkCard name="Kitsune of Eternity Tamamo-no-Mae" />: <EffectInlineTag name="Heavy Strike" type="buff" /> and debuff stacking with <EffectInlineTag name="BT_DOT_CURSE_IR" type="debuff" />.</li>
          <li><CharacterLinkCard name="Demiurge Stella" /> : <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> and can&apos;t be <EffectInlineTag name="BT_FREEZE" type="debuff" />.</li>
        </ul>
        <p className='mt-4'>Bring a <ClassInlineTag name='Defender' /> will ease your way to keep the <EffectInlineTag name="BT_SEALED" type="debuff" />.</p>
        <p className='font-bold underline mt-2'>Phase 2 recommended characters</p>
        <ul className="list-disc list-inside text-neutral-300 mb-4">
          <li><CharacterLinkCard name="Ryu Lion" />: <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> and <EffectInlineTag name="BT_STAT|ST_SPEED" type="buff" />.</li>
          <li><CharacterLinkCard name="Akari" />: <EffectInlineTag name="BT_SEALED" type="debuff" /> <EffectInlineTag name="IG_Buff_DeBuffdurationIncrease" type="debuff" />.</li>
          <li><CharacterLinkCard name="Notia" />: <EffectInlineTag name="BT_DOT_POISON" type="debuff" /> will limit the boss from getting to many turns.</li>
          <li><CharacterLinkCard name="Tamara" />:  <EffectInlineTag name="BT_CALL_BACKUP" type="buff" /> <EffectInlineTag name="BT_STAT|ST_CRITICAL_RATE" type="buff" /> <EffectInlineTag name="BT_MARKING" type="debuff" />.</li>
          <li><CharacterLinkCard name="Luna" /> : <EffectInlineTag name="BT_CALL_BACKUP" type="buff" /> <EffectInlineTag name="BT_SEALED" type="debuff" />.</li>
          <li><CharacterLinkCard name="Omega Nadja" /> : <EffectInlineTag name="BT_SHIELD_BASED_CASTER" type="buff" /> to survive but be carefull : breaking the boss with her will result as K doing no damage.</li>
          <li><CharacterLinkCard name="Demiurge Vlada" /> : <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /> and her transcend bonus will reduce the priority gain of the boss but like <CharacterLinkCard name="Omega Nadja" /> : breaking the boss with her will result as K doing no damage.</li>
        
        </ul>
        <hr className="my-6 border-neutral-700" />
        <TeamTabSelector teams={teams} />
        <hr className="my-6 border-neutral-700" />
        <YoutubeEmbed videoId="dPrFOA8Mya8" title="Dahlia - World Boss - SSS - Extreme League by Sevih" />

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
              No full written guide has been made yet. For now, we recommend watching this excellent video by <strong>Ducky</strong>:
            </p>
          </div>

          <YoutubeEmbed videoId="97bGw0SfR4c" title="Dahlia World Boss Guide by Ducky" />
        </div>
      </>
    ),
  },

}

export default function DahliaGuide() {
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
