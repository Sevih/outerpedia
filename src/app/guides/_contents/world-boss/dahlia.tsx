'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
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

export default function DahliaGuide() {
  return (
    <GuideTemplate
      title="Dahlia World Boss Strategy"
      introduction="Dahlia is a challenging world boss in Outerplane that requires careful team composition and understanding of her mechanics across two phases. This guide covers optimal strategies for defeating Dahlia in Extreme League."
      defaultVersion="default"
      versions={{
        default: {
          label: 'July 2025 Version',
          content: (
            <>
              <GuideHeading level={3}>Strategy Overview</GuideHeading>
              
              <GuideHeading level={4}>Phase 1: Dahlia Moveset</GuideHeading>
              <ul className="list-disc list-inside text-neutral-300 mb-4 space-y-1">
                <li><strong>S1</strong>: Single target attack with <EffectInlineTag name="IG_Buff_BuffdurationIncrease" type="buff" />.</li>
                <li><strong>S2</strong>: AoE passive skill that triggers when taking a critical hit. Applies <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /> and <EffectInlineTag name="BT_FREEZE" type="debuff" /> for 5 turns.</li>
                <li><strong>S3</strong>: AoE, <EffectInlineTag name="BT_SEAL_COUNTER" type="debuff" />, <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" />, and <EffectInlineTag name="BT_FREEZE" type="debuff" /> for 5 turns.</li>
                <li><strong>Passive</strong>: At the start of battle and her turn, gains <EffectInlineTag name="BT_IMMUNE" type="buff" /> for 1 turn.</li>
                <li><strong>Passive</strong>: Grants <EffectInlineTag name="UNIQUE_DAHLIA_A" type="buff" /> to enemy team with class-specific effects:
                  <ul className="ml-8 mt-1 space-y-1">
                    <li><ClassInlineTag name='Defender' />: Deals 3 weakness gauge damage when performing an action.</li>
                    <li><ClassInlineTag name='Healer' />: Grants permanent <EffectInlineTag name="BT_IMMUNE_IR" type="buff" />.</li>
                    <li><ClassInlineTag name='Mage' />: Increases damage dealt to the boss.</li>
                    <li><ClassInlineTag name='Ranger' />: At battle start, grants <EffectInlineTag name="BT_STAT|ST_SPEED" type="buff" /> for 1 turn.</li>
                    <li><ClassInlineTag name='Striker' />: +30% attack.</li>
                  </ul>
                </li>
                <li><strong>Passive</strong>: Damage taken increases based on number of debuffs applied.</li>
                <li><strong>Passive</strong>: <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> other than skill chain and damage from <ElementInlineTag element='dark' /> heroes does not exceed 1,000.</li>
                <li><strong>Passive</strong>: Damage taken from <EffectInlineTag name="BT_DOT_CURSE" type="debuff" /> does not exceed 10,000.</li>
                <li><strong>Passive</strong>: Greatly reduces damage taken and nullifies weakness gauge damage from enemies with 100 or more Chain Points.</li>
                <li><strong>Passive</strong>: Completely reduces <StatInlineTag name='EFF' /> from non-<ElementInlineTag element='light' />/<ElementInlineTag element='earth' /> heroes.</li>
                <li><strong>Passive</strong>: Completely reduces <StatInlineTag name='CHC' /> from <ClassInlineTag name='Healer' />, <ClassInlineTag name='Defender' />, and <ClassInlineTag name='Striker' /> heroes.</li>
              </ul>

              <hr className="my-6 border-neutral-700" />

              <GuideHeading level={4}>Phase 2: Gnosis Dahlia Moveset</GuideHeading>
              <ul className="list-disc list-inside text-neutral-300 mb-4 space-y-1">
                <li><strong>S1</strong>: Single target attack with <EffectInlineTag name="IG_Buff_BuffdurationIncrease" type="buff" />.</li>
                <li><strong>S2</strong>: AoE attack granting <EffectInlineTag name="BT_INVINCIBLE" type="buff" /> for 3 turns.</li>
                <li><strong>S3</strong>: AoE attack with <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /> and <EffectInlineTag name="BT_SEALED_RESURRECTION" type="debuff" />. Reduces health of <ClassInlineTag name='Striker' />, <ClassInlineTag name='Healer' />, and <ClassInlineTag name='Mage' /> heroes by 99% before attacking.<br /><span className='ml-11'>This skill is immune to <EffectInlineTag name='BT_COOL_CHARGE' type='debuff' />.</span></li>
                <li><strong>Passive</strong>: After performing an action, reduces debuff duration by 2 turns.</li>
                <li><strong>Passive</strong>: Upon taking a critical hit, gains <EffectInlineTag name="BT_INVINCIBLE" type="buff" /> for 1 turn.</li>
                <li><strong>Passive</strong>: Grants <EffectInlineTag name="UNIQUE_DAHLIA_B" type="buff" /> to enemy team with class-specific effects:
                  <ul className="ml-8 mt-1 space-y-1">
                    <li><ClassInlineTag name='Defender' />: Prevents boss from reducing debuff duration.</li>
                    <li><ClassInlineTag name='Healer' />: Grants permanent <EffectInlineTag name="BT_IMMUNE_IR" type="buff" />.</li>
                    <li><ClassInlineTag name='Mage' />: Increases damage dealt to the boss.</li>
                    <li><ClassInlineTag name='Ranger' />: At battle start, grants <EffectInlineTag name="BT_STAT|ST_SPEED" type="buff" /> for 1 turn.</li>
                    <li><ClassInlineTag name='Striker' />: +30% attack.</li>
                  </ul>
                </li>
                <li><strong>Passive</strong>: Damage taken increases based on number of debuffs applied.</li>
                <li><strong>Passive</strong>: <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> other than skill chain and damage from <ElementInlineTag element='dark' /> heroes does not exceed 1,000.</li>
                <li><strong>Passive</strong>: Damage taken from <EffectInlineTag name="BT_DOT_CURSE" type="debuff" /> does not exceed 10,000.</li>
                <li><strong>Passive</strong>: Greatly reduces damage taken and nullifies weakness gauge damage from enemies with 100 or more Chain Points.</li>
                <li><strong>Passive</strong>: Completely reduces <StatInlineTag name='EFF' /> from non-<ElementInlineTag element='light' />/<ElementInlineTag element='earth' /> heroes.</li>
                <li><strong>Passive</strong>: Completely reduces <StatInlineTag name='CHC' /> from <ClassInlineTag name='Healer' />, <ClassInlineTag name='Defender' />, and <ClassInlineTag name='Striker' /> heroes.</li>
              </ul>

              <hr className="my-6 border-neutral-700" />

              <GuideHeading level={3}>Strategy Tips and Team Building</GuideHeading>

              <GuideHeading level={4}>General Strategy</GuideHeading>
              <ul className="list-disc list-inside text-neutral-300 mb-4 space-y-2">
                <li>Your first team should push into Phase 2 as quickly as possible. Having a <ClassInlineTag name='Defender' /> allows you to break the boss efficiently.</li>
                <li>Run all characters except <ClassInlineTag name='Healer' />, <ClassInlineTag name='Defender' />, and <ClassInlineTag name='Striker' /> with the lowest possible <StatInlineTag name='CHC' /> to avoid triggering her counter mechanics.</li>
                <li>Apply <EffectInlineTag name="BT_SEALED" type="debuff" /> immediately when she transitions to Phase 2 to prevent her from gaining <EffectInlineTag name="BT_INVINCIBLE" type="buff" />.</li>
              </ul>

              <GuideHeading level={4}>Phase 1 Recommended Characters</GuideHeading>
              <ul className="list-disc list-inside text-neutral-300 mb-4 space-y-1">
                <li><CharacterLinkCard name="Demiurge Drakhan" /> and <CharacterLinkCard name="Leo" />: <ElementInlineTag element='light' /> <ClassInlineTag name='Defender' /> units with non-offensive skills that allow CP stacking before Phase 2 and team swap.</li>
                <li><CharacterLinkCard name="Monad Eva" />: Strong option as always.</li>
                <li><CharacterLinkCard name="Dianne" />: Excellent alternative to <CharacterLinkCard name="Monad Eva" />.</li>
                <li><CharacterLinkCard name="Gnosis Nella" />: Provides <EffectInlineTag name="BT_SEALED" type="debuff" /> application.</li>
                <li><CharacterLinkCard name="Alice" />: Good alternative to <CharacterLinkCard name="Gnosis Nella" />.</li>
                <li><CharacterLinkCard name="Kitsune of Eternity Tamamo-no-Mae" />: Offers <EffectInlineTag name="Heavy Strike" type="buff" /> and debuff stacking with <EffectInlineTag name="BT_DOT_CURSE_IR" type="debuff" />.</li>
                <li><CharacterLinkCard name="Demiurge Stella" />: Provides <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> and is immune to <EffectInlineTag name="BT_FREEZE" type="debuff" />.</li>
              </ul>

              <p className="text-neutral-300 mb-4">
                Bringing a <ClassInlineTag name='Defender' /> will make it easier to maintain <EffectInlineTag name="BT_SEALED" type="debuff" /> on the boss.
              </p>

              <GuideHeading level={4}>Phase 2 Recommended Characters</GuideHeading>
              <ul className="list-disc list-inside text-neutral-300 mb-4 space-y-1">
                <li><CharacterLinkCard name="Ryu Lion" />: Provides <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> and <EffectInlineTag name="BT_STAT|ST_SPEED" type="buff" />.</li>
                <li><CharacterLinkCard name="Akari" />: Offers <EffectInlineTag name="BT_SEALED" type="debuff" /> and <EffectInlineTag name="IG_Buff_DeBuffdurationIncrease" type="debuff" />.</li>
                <li><CharacterLinkCard name="Notia" />: <EffectInlineTag name="BT_DOT_POISON" type="debuff" /> limits the boss&apos;s turn count.</li>
                <li><CharacterLinkCard name="Tamara" />: Provides <EffectInlineTag name="BT_CALL_BACKUP" type="buff" />, <EffectInlineTag name="BT_STAT|ST_CRITICAL_RATE" type="buff" />, and <EffectInlineTag name="BT_MARKING" type="debuff" />.</li>
                <li><CharacterLinkCard name="Luna" />: Offers <EffectInlineTag name="BT_CALL_BACKUP" type="buff" /> and <EffectInlineTag name="BT_SEALED" type="debuff" />.</li>
                <li><CharacterLinkCard name="Omega Nadja" />: Provides <EffectInlineTag name="BT_SHIELD_BASED_CASTER" type="buff" /> for survival, but be careful: breaking the boss with her will prevent K from dealing damage.</li>
                <li><CharacterLinkCard name="Demiurge Vlada" />: Applies <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /> and her transcend bonus reduces boss priority gain. Like <CharacterLinkCard name="Omega Nadja" />, breaking with her prevents K from dealing damage.</li>
              </ul>

              <hr className="my-6 border-neutral-700" />

              <GuideHeading level={3}>Example Team Compositions</GuideHeading>
              <TeamTabSelector teams={teams} />

              <hr className="my-6 border-neutral-700" />

              <GuideHeading level={3}>Video Guide</GuideHeading>
              <p className="text-neutral-300 mb-4">
                Watch this SSS Extreme League clear by Sevih for detailed gameplay demonstration:
              </p>
              <YoutubeEmbed videoId="dPrFOA8Mya8" title="Dahlia - World Boss - SSS - Extreme League by Sevih" />
            </>
          ),
        },

        legacy2024: {
          label: 'Legacy (2024 Video)',
          content: (
            <>
              <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4 mb-6">
                <p className="text-amber-200 text-sm">
                  ⚠️ <strong>Note:</strong> This is an older strategy from 2024. While the core mechanics remain similar, 
                  we recommend checking the updated July 2025 version for the latest strategies 
                  and character recommendations.
                </p>
              </div>

              <GuideHeading level={3}>Video Guide by Ducky</GuideHeading>
              <p className="mb-4 text-neutral-300">
                Watch this comprehensive guide by <strong>Ducky</strong> covering the fundamentals 
                of the Dahlia world boss fight:
              </p>

              <YoutubeEmbed videoId="97bGw0SfR4c" title="Dahlia World Boss Guide by Ducky (2024)" />
            </>
          ),
        },
      }}
    />
  )
}