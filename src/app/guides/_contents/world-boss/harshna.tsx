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
    label: 'No Debuff Team',
    icon: 'SC_Buff_Effect_Cleanse.webp',
    setup: [      
      ['Demiurge Drakhan','Leo','Kappa'],
      ['Rey','Ame', 'Ryu Lion'],
      ['Valentine', 'Fran', 'Charlotte', 'Dianne', 'Nella', 'Astei'],
      ['Demiurge Luna', 'Maxwell', 'Regina', 'Demiurge Astei'],
    ]
  },
  team2: {
    label: 'Ranger Team',
    icon: 'ranger.webp',
    setup: [
      ['Gnosis Beth','Bell Cranel','Vlada'],
      ['Notia','Akari','Tamara'],
      ['Roxie', 'Ember', 'Maxie','Fran'],
      ['Monad Eva'],
    ]
  }
}

const versions: Record<string, { label: string; content: React.ReactNode }> = {
  default: {
    label: 'July 2025 Version',
    content: (
      <>
        <GuideHeading level={3}>Strategy Overview</GuideHeading>
        <GuideHeading level={4}>Phase 1 : Revenant Dragon Harshna moveset</GuideHeading>
        <ul className="list-disc list-inside text-neutral-300 mb-4">
          <li><strong>S1</strong>: Single, <EffectInlineTag name="BT_DOT_POISON" type="debuff" />. Prioritize front lane.</li>
          <li><strong>S2</strong>: AoE, <EffectInlineTag name="BT_DOT_POISON_IR" type="debuff" /> 2 turns</li>
          <li><strong>S3</strong>: AoE, penetratre 30% of defense. If the caster is grant a dispellable buff inflicts <EffectInlineTag name="BT_FREEZE_IR" type="debuff" /> 1 turn.</li>

          <li><strong>Passive</strong>: When the caster is grant a dispellable debuff, don&apos;t take weakness gauge damage.</li>

          <li><strong>Passive</strong>: Grants <EffectInlineTag name="UNIQUE_DAHLIA_A" type="buff" /> to the enemy team.</li>
          <ol className='ml-10'>
            <li><ClassInlineTag name='Defender' />: When perfoming an action inflicts <EffectInlineTag name="BT_STAT|ST_DEF_IR" type="debuff" /> 4 turns.</li>
            <li><ClassInlineTag name='Healer' />: Increase priority recovery efficiency by 50%.</li>
            <li><ClassInlineTag name='Mage' />: +50% <StatInlineTag name='CHD' />.</li>
            <li><ClassInlineTag name='Ranger' />: When perfoming an action deals 3% damage of max boss&apos;s health.</li>
            <li><ClassInlineTag name='Striker' />: +30%  <StatInlineTag name='ATK' />.</li>
          </ol>
          <li><strong>Passive</strong>: When an ally is inflicted by a debuff, increases priority of the caster by 100%.</li>
          <li><strong>Passive</strong>: At the end of the turn, when the caster is granted a dispellable debuff, recovers weakness gauge by 20.</li>
          <li><strong>Passive</strong>: Damage taken from <EffectInlineTag name="BT_DOT_CURSE" type="debuff" /> does not exceed 5 000.</li>
        </ul>
        <hr className="my-6 border-neutral-700" />
        <GuideHeading level={4}>Phase 2 : Frozen Dragon of phantasm Harshna moveset</GuideHeading>
        <ul className="list-disc list-inside text-neutral-300 mb-4">
          <li><strong>S1</strong>: Single, <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" /> 1 debuff from the caster. Prioritize leftmost enemy.</li>
          <li><strong>S2</strong>: AoE, penetratre 30% of defense. <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /> <EffectInlineTag name="BT_SEAL_COUNTER" type="debuff" />.</li>
          <li><strong>S3</strong>: AoE, if the caster is not inflicted a debuff, ignores 100% of the target&apos;s defense</li>
          <li><strong>Passive</strong>: If the caster is not inflicted with a debuff, weakness gauge cannot be reduced.</li>
          <li><strong>Passive</strong>: Increases weakness gauge damage taken from enemies with <EffectInlineTag name="BT_STEALTHED" type="buff" />.</li>
          <ol className='ml-10'>
            <li><ClassInlineTag name='Defender' />: When hit by a single attack, grants <EffectInlineTag name="BT_STEALTHED" type="buff" /> for 2 turns.</li>
            <li><ClassInlineTag name='Healer' />: Increase priority recovery efficiency by 50%.</li>
            <li><ClassInlineTag name='Mage' />: +50% <StatInlineTag name='CHD' />.</li>
            <li><ClassInlineTag name='Ranger' />:  Increases <StatInlineTag name='EFF' /> by 100%.</li>
            <li><ClassInlineTag name='Striker' />: +30% <StatInlineTag name='ATK' />.</li>
          </ol>
          <li><strong>Passive</strong>: Reduces weakness gauge damage from skillchain by 50%.</li>
          <li><strong>Passive</strong>: At the end of the turn, when the caster is not inflicted with a debuff, recovers weakness gauge by 20 and reduces chain point by 50.</li>
          <li><strong>Passive</strong>: <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" />  does not exceed 10 000.</li>
        </ul>
        <hr className="my-6 border-neutral-700" />
        <GuideHeading level={4}>Characters and Advices</GuideHeading>

        <p>Your first team should avoid having debuffs, otherwise you’ll give the boss many extra turns.</p>
        <p>You should run a <ClassInlineTag name='Defender' /> to apply <EffectInlineTag name="BT_STAT|ST_DEF_IR" type="debuff" /> 4 turns.</p>
        <p>You second team need debuffs. You don’t have to run a team that uses debuff as DPS (like a burn comp or gbeth). Just make sure you can maintain at least one debuff.</p>

        <p className='font-bold underline mt-2'>Phase 1 recommended characters</p>
        <ul className="list-disc list-inside text-neutral-300 mb-4">
          <li><CharacterLinkCard name="Demiurge Drakhan" /> <CharacterLinkCard name="Kappa" /> <CharacterLinkCard name="Leo" /> : <ClassInlineTag name='Defender' />.</li>
          <li><CharacterLinkCard name="Ryu Lion" /> <CharacterLinkCard name="Rey" /> <CharacterLinkCard name="Ame" /> : Strong <ElementInlineTag element='earth'/> DPS without debuff.</li>
          <li><CharacterLinkCard name="Demiurge Luna" /> <CharacterLinkCard name="Maxwell" /> <CharacterLinkCard name="Regina" /> <CharacterLinkCard name="Demiurge Astei" />: Other strong DPS without debuffs.</li>
          <li><CharacterLinkCard name="Fran" />: <EffectInlineTag name="BT_STAT|ST_COUNTER_RATE" type="buff" /> and <EffectInlineTag name="BT_SHIELD_BASED_CASTER" type="buff" />.</li>
          <li><CharacterLinkCard name="Charlotte" />: <EffectInlineTag name="BT_STAT|ST_ATK" type="buff" />.</li>
          <li><CharacterLinkCard name="Valentine" />: <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> <EffectInlineTag name="BT_STAT|ST_CRITICAL_RATE" type="buff" /> <EffectInlineTag name="BT_STAT|ST_CRITICAL_DMG_RATE" type="buff" /> (just don&apos;t use her S3).</li>
          <li><CharacterLinkCard name="Dianne" /><CharacterLinkCard name="Astei" /><CharacterLinkCard name="Nella" />: <EffectInlineTag name="BT_IMMUNE" type="buff" /></li>
        </ul>
        <p className='mt-4'>Bring a <ClassInlineTag name='Defender' /> will ease your way to go through phase 1 with <EffectInlineTag name="BT_STAT|ST_DEF_IR" type="debuff" />.</p>
        <p className='font-bold underline mt-2'>Phase 2 recommended characters</p>
        <ul className="list-disc list-inside text-neutral-300 mb-4">
          <li><CharacterLinkCard name="Gnosis Beth" />: <EffectInlineTag name="BT_STEALTHED" type="buff" /> <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> <EffectInlineTag name="BT_DOT_ETERNAL_BLEED" type="debuff" />  and good damage.</li>
          <li><CharacterLinkCard name="Notia" />: Can maintain debuff like <EffectInlineTag name="BT_DOT_POISON" type="debuff" /> and <EffectInlineTag name="BT_STAT|ST_ATK" type="debuff" /> <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" />.</li>
          <li><CharacterLinkCard name="Akari" />: <EffectInlineTag name="BT_SEALED" type="debuff" /> <EffectInlineTag name="IG_Buff_DeBuffdurationIncrease" type="debuff" />.</li>
          <li><CharacterLinkCard name="Roxie" />: <EffectInlineTag name="BT_DOT_LIGHTNING" type="debuff" /> <EffectInlineTag name="IG_Buff_DeBuffdurationIncrease" type="debuff" />.</li>
          <li><CharacterLinkCard name="Bell Cranel" /><CharacterLinkCard name="Vlada" /><CharacterLinkCard name="Maxie" /><CharacterLinkCard name="Ember" />: <EffectInlineTag name="BT_DOT_BURN" type="debuff" /> specialist.</li>
          <li><CharacterLinkCard name="Monad Eva" />: strong as always.</li>
          <li><CharacterLinkCard name="Fran" />: <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> <EffectInlineTag name="BT_STAT|ST_COUNTER_RATE" type="buff" /> and <EffectInlineTag name="IG_Buff_BuffdurationIncrease" type="buff" /> (be sure to use it after the boss’s S2).</li>
        </ul>
        <hr className="my-6 border-neutral-700" />
        <TeamTabSelector teams={teams} />
        <hr className="my-6 border-neutral-700" />
        <YoutubeEmbed videoId="13vcQM1kMEg" title="Harshna - World Boss - SSS - Extreme League by Sevih" />

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
          No full written guide has been made yet. For now, we recommend watching this video by <strong>Ducky</strong>:
        </p>
      </div>

      <YoutubeEmbed videoId="32qJPmuJDyg" title="Harsha World Boss 23mil. 1 Hour Long Fight by Ducky" />
    </div>
      </>
    ),
  },

}

export default function HarshnaGuide() {
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
