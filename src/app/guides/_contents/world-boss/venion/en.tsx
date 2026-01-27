'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import { WorldBossDisplay } from '@/app/components/boss'
import VenionTeamsData from './Venion.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { phase1Characters, phase2Characters } from './recommendedCharacters'
import GuideHeading from '@/app/components/GuideHeading'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import ClassInlineTag from '@/app/components/ClassInlineTag'
import ElementInlineTag from '@/app/components/ElementInline'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'

const VenionTeams = VenionTeamsData as Record<string, TeamData>

const venionJanuary2026 = {
  boss1Key: 'Walking Fortress Vault Venion',
  boss2Key: 'Uncharted Fortress Vault Venion',
  boss1Ids: {
    'Normal': '4086013',
    'Very Hard': '4086015',
    'Extreme': '4086017'
  },
  boss2Ids: {
    'Hard': '4086014',
    'Very Hard': '4086016',
    'Extreme': '4086018'
  }
} as const

export default function VenionGuide() {
  return (
    <GuideTemplate
      title="Walking Fortress Vault Venion World Boss Guide"
      introduction="Venion is a two-phase world boss that requires adapting your team composition based on the boss's buff state. This guide covers strategies for defeating this boss up to the Extreme League."
      disclaimer="This guide is currently being updated for the January 2026 version."
      defaultVersion="january2026"
      versions={{
        january2026: {
          label: 'January 2026',
          content: (
            <>
              <WorldBossDisplay config={venionJanuary2026} defaultMode="Extreme" />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                sections={[
                  {
                    title: "strategy",
                    tips: [
                      "You want your teams to have penetration as much as possible. Venion's defense is high (3500 phase 1 and 5000 phase 2).",
                      "Having counter set on support is really helpful since they'll activate their respective bonus gain from Venion.",
                      "Keep an eye on Venion's buff and swap team if needed to avoid instant death or an 80% push since it'll make you lose one turn.",
                      "Having fixed damage in your skill chain is okay as long as it results in more total damage.",
                      "Having multiple healers in your second team is also a viable option to deal more weakness gauge damage."
                    ]
                  },
                  {
                    title: "phase1",
                    tips: [
                      "Phase 1 boss takes increased damage from {E/Fire}, {E/Water}, {E/Earth} enemies and they always have elemental advantage.",
                      "If granted {B/UNIQUE_VENION_A}, the boss pushes {E/Fire}/{E/Water}/{E/Earth} enemies' priority by 80%.",
                      "If granted {B/UNIQUE_VENION_B}, the boss pushes {E/Light}/{E/Dark} enemies' priority by 80%."
                    ]
                  },
                  {
                    title: "phase2",
                    tips: [
                      "Phase 2 boss takes increased damage from {E/Light}, {E/Dark} enemies and from AoE attacks.",
                      "If granted {B/UNIQUE_VENION_E}, the boss inflicts instant death on {E/Fire}/{E/Water}/{E/Earth} enemies.",
                      "If granted {B/UNIQUE_VENION_D}, the boss inflicts instant death on {E/Light}/{E/Dark} enemies.",
                      "At the start of the turn, the boss removes buffs and sets HP to 1 for all enemies with 30% or less HP."
                    ]
                  }
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList title="phase1" entries={phase1Characters} />
              <RecommendedCharacterList title="phase2" entries={phase2Characters} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={VenionTeams.january2026} defaultStage="Light and Dark" />
              {/** Manque le combat footage */}
            </>
          ),
        },
        june2025: {
          label: 'June 2025',
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
                <li><strong>Passive</strong>: Reduce enemies speed to 0 and inflict them with <EffectInlineTag name="BT_SEAL_BT_CALL_BACKUP_IR" type="debuff" /> and <EffectInlineTag name="BT_SEAL_ADDITIVE_TURN_IR" type="debuff" />.</li>
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
              <StageBasedTeamSelector teamData={VenionTeams.june2025} defaultStage="Light and Dark" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="SCAR0AeIsLU"
                title="Venion - World Boss - SSS - Extreme League"
                author="Sevih"
                date="01/06/2025"
              />
            </>
          ),
        },
        legacy2024: {
          label: 'Legacy (2024 Video)',
          content: (
            <>
              <GuideHeading level={3}>Video Guide</GuideHeading>
              <p className="mb-4 text-neutral-300">
                No full written guide has been made yet. For now, we recommend watching this excellent video by <strong>Adjen</strong>:
              </p>
              <YoutubeEmbed videoId="PxdLAUgbBPg" title="SSS Extreme League World Boss Venion! [Outerplane]" />
            </>
          ),
        },
      }}
    />
  )
}
