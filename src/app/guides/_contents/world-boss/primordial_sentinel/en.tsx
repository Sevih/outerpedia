'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import ElementInlineTag from '@/app/components/ElementInline'
import GuideHeading from '@/app/components/GuideHeading'
import ClassInlineTag from '@/app/components/ClassInlineTag'
import TeamTabSelector from '@/app/components/TeamTabSelector'

//team composition
const teams = {
  team1: {
    label: 'Phase 1',
    icon: 'ranger.webp', // Change icon as needed
    setup: [
      ['Iota', 'Stella'],
      ['Valentine'],
      ['Notia', 'Fran'],
      ['Dianne', 'Demiurge Delta','Saeran', 'Tio', 'Nella', 'Astei']
    ]
  },
  team2: {
    label: 'Phase 2',
    icon: 'light.webp', // Change icon as needed
    setup: [
      ['Monad Eva', 'Viella'],
      ['Demiurge Luna', 'Regina'],
      ['Drakhan', 'Gnosis Dahlia', 'Demiurge Stella', 'Akari', 'Skadi'],
      ['Demiurge Drakhan', 'Gnosis Beth', 'Kuro', 'Demiurge Vlada', 'Gnosis Viella'],
    ]
  }
}

export default function PrimordialSentinelGuide() {
  return (
    <GuideTemplate
      title="Primordial Sentinel (Glorious Sentinel) Strategy"
      introduction="The Primordial Sentinel is a challenging two-phase world boss that requires precise team coordination and timing. This guide covers strategies for defeating this boss up to the Extreme League."
      defaultVersion="november2025"
      versions={{
        november2025: {
          label: 'November 2025',
          content: (
            <>
              <GuideHeading level={3}>Strategy Overview</GuideHeading>

              <GuideHeading level={4}>Phase 1: [Boss Name] Moveset</GuideHeading>
              <ul className="list-disc list-inside text-neutral-300 mb-4 space-y-1">
                <li><strong>S1</strong>: Single, grants <EffectInlineTag name='BT_STAT|ST_CRITICAL_RATE' type='buff' /> for 2 turns.</li>
                <li><strong>S2</strong>: AoE, reduces chain points by 5 for each target. If the target is <EffectInlineTag name='BT_DOT_LIGHTNING' type='debuff' />, additionally reduces chain points by 20 points each.</li>
                <li><strong>S3</strong>: AoE, inflicts <EffectInlineTag name='BT_DOT_LIGHTNING' type='debuff' /> for 2 turns (ignores immunity). When scoring a critical hit, grants <EffectInlineTag name="CORE_ENERGY" type="buff" /> to the caster for 1 turn.</li>
                <li><strong>Passive</strong>: Increases damage taken from <ElementInlineTag element='fire' /> <ElementInlineTag element='earth' /> <ElementInlineTag element='water' /> enemies.</li>
                <li><strong>Passive</strong>: Inflicts permanent <EffectInlineTag name='BT_SEAL_BT_CALL_BACKUP_IR' type='debuff' /> on all enemies.</li>
                <li><strong>Passive</strong>: Inflicts permanent <EffectInlineTag name='BT_STAT|ST_SPEED' type='debuff' /> on <ElementInlineTag element='light' /> <ElementInlineTag element='dark' /> enemies, greatly reduces their damage and does not take weakness gauge damage from them.</li>
                <li><strong>Passive</strong>: Reduces damage taken from skills other than Skill Chains and Burst Skills and reduces weakness gauge damage by 50%.</li>
                <li><strong>Passive</strong>: Grants <EffectInlineTag name="UNIQUE_DAHLIA_A" type="buff" /> to enemy team with class-specific effects:
                  <ul className="ml-8 mt-1 space-y-1">
                    <li><ClassInlineTag name='Striker' />: +50% Priority recovery efficiency.</li>
                    <li><ClassInlineTag name='Mage' />: Increased damage.</li>
                    <li><ClassInlineTag name='Defender' />: Inflicts <EffectInlineTag name="BT_STAT|ST_DEF" type="debuff" /> for 4 turns when performing an action.</li>
                    <li><ClassInlineTag name='Ranger' />: Inflicts <EffectInlineTag name="BT_STAT|ST_BUFF_RESIST" type="debuff" /> for 4 turns when performing an action.</li>
                    <li><ClassInlineTag name='Healer' />: Inflicts <EffectInlineTag name="BT_STAT|ST_SPEED" type="debuff" /> for 4 turns when performing an action.</li>
                  </ul>
                </li>
                <li><strong>Passive</strong>: After using S1 and S2, when granted <EffectInlineTag name="CORE_ENERGY" type="buff" />, attacks all enemies and gains <EffectInlineTag name="BT_STAT|ST_SPEED" type="buff" /> for 5 turns.</li>
              </ul>

              <hr className="my-6 border-neutral-700" />

              <GuideHeading level={4}>Phase 2: [Boss Name] Moveset</GuideHeading>
              <ul className="list-disc list-inside text-neutral-300 mb-4 space-y-1">
                <li><strong>S1</strong>: Single, guaranteed critical hit if the target has a debuff.</li>
                <li><strong>S2</strong>: AoE, inflicts <EffectInlineTag name="BT_STAT|ST_ATK_IR" type="debuff" /> for 2 turns if the target has <EffectInlineTag name='BT_DOT_LIGHTNING' type='debuff' />.</li>
                <li><strong>S3</strong>: AoE, inflicts <EffectInlineTag name='BT_DOT_LIGHTNING' type='debuff' /> for 2 turns (ignores immunity). Grants <EffectInlineTag name="CORE_ENERGY" type="buff" /> to the caster for 1 turn.</li>
                <li><strong>Passive</strong>: Increases damage taken from <ElementInlineTag element='light' /> <ElementInlineTag element='dark' /> enemies.</li>
                <li><strong>Passive</strong>: Inflicts permanent <EffectInlineTag name='BT_STAT|ST_SPEED' type='debuff' /> on <ElementInlineTag element='fire' /> <ElementInlineTag element='earth' /> <ElementInlineTag element='water' /> enemies, greatly reduces their damage and does not take weakness gauge damage from them.</li>
                <li><strong>Passive</strong>: Reduces damage taken from skills other than Skill Chains, Dual Attacks and Burst Skills and does not take weakness gauge damage.</li>
                <li><strong>Passive</strong>: Damage taken from <EffectInlineTag name='BT_DOT_CURSE' type='debuff' /> and <EffectInlineTag name='BT_FIXED_DAMAGE' type='debuff' /> does not exceed 30 000.</li>
                <li><strong>Passive</strong>: Grants <EffectInlineTag name="UNIQUE_DAHLIA_A" type="buff" /> to enemy team with class-specific effects:
                  <ul className="ml-8 mt-1 space-y-1">
                    <li><ClassInlineTag name='Striker' />: Increased damage.</li>
                    <li><ClassInlineTag name='Mage' />: +50% Priority recovery efficiency.</li>
                    <li><ClassInlineTag name='Defender' />: Inflicts <EffectInlineTag name="BT_STAT|ST_DEF" type="debuff" /> for 4 turns when performing an action.</li>
                    <li><ClassInlineTag name='Ranger' />: Reduces the health of the boss by 3% when performing an action.</li>
                    <li><ClassInlineTag name='Healer' />: Inflicts <EffectInlineTag name="BT_STAT|ST_SPEED" type="debuff" /> for 4 turns when performing an action.</li>
                  </ul>
                </li>
                <li><strong>Passive</strong>: After using S1 and S2, when granted <EffectInlineTag name="CORE_ENERGY" type="buff" />, attacks all enemies, gains <EffectInlineTag name="BT_STAT|ST_SPEED" type="buff" /> for 5 turns and fully reduces Chain Points of the enemy team.</li>
              </ul>

              <hr className="my-6 border-neutral-700" />

              <GuideHeading level={3}>Strategy Tips and Team Building</GuideHeading>

              <GuideHeading level={4}>General Strategy</GuideHeading>
              <ul className="list-disc list-inside text-neutral-300 mb-4 space-y-2">
                <li>This entire fight revolves around priority control. In Phase 1, you can reduce the boss&apos;s priority unlike in Phase 2, so you need to abuse it as much as possible.</li>
                <li>In Phase 2, however, the boss is immune to priority reduction, so you will need to make your characters as fast as possible.</li>
                <li>Everything will depend on Skill Chains and CP generation, so equip your Sage and Rogue charms (don&apos;t forget your critical hit chance for Rogue).</li>
                <li>In both phases, you want at least 1 healer for the <EffectInlineTag name="BT_STAT|ST_SPEED" type="debuff" /> thanks to the <EffectInlineTag name="UNIQUE_DAHLIA_A" type="buff" /> buff.</li>
                <li>Quick tip : if you have <CharacterLinkCard name="Monad Eva" /> at 6 stars in your second team you can stack up CP in phase 1. Swap to Team 2 when you&apos;re close to finishing phase 1 and trigger phase 2. Monad Eva will instantly <EffectInlineTag name='BT_SEAL_ADDITIVE_ATTACK' type='debuff' /> the boss allowing you to keep the CP you built during phase 1.</li>
              </ul>

              <GuideHeading level={4}>Phase 1 Recommended Characters</GuideHeading>
              <ul className="list-disc list-inside text-neutral-300 mb-4 space-y-1">
                <li><CharacterLinkCard name="Iota" /> <CharacterLinkCard name="Stella" /> : for <EffectInlineTag name='BT_ACTION_GAUGE' type='debuff' /></li>
                <li><CharacterLinkCard name="Notia" /> <CharacterLinkCard name="Fran" /> : for <EffectInlineTag name='BT_ACTION_GAUGE' type='buff' /></li>
                <li><CharacterLinkCard name="Valentine" /> : for both <EffectInlineTag name='BT_ACTION_GAUGE' type='buff' /> and <EffectInlineTag name='BT_ACTION_GAUGE' type='debuff' /></li>
                <li><CharacterLinkCard name="Dianne" /> <CharacterLinkCard name="Demiurge Delta" /> <CharacterLinkCard name="Saeran" /> <CharacterLinkCard name="Tio" /> <CharacterLinkCard name="Nella" /> <CharacterLinkCard name="Astei" /> : <ClassInlineTag name='Healer' /> with <EffectInlineTag name='BT_ACTION_GAUGE' type='buff' /></li>
              </ul>

              <GuideHeading level={4}>Phase 2 Recommended Characters</GuideHeading>
              <ul className="list-disc list-inside text-neutral-300 mb-4 space-y-1">
                <li><CharacterLinkCard name="Monad Eva" /> <CharacterLinkCard name="Viella" /> : <ClassInlineTag name='Healer' /> with <EffectInlineTag name='BT_CALL_BACKUP' type='buff' /></li>
                <li><CharacterLinkCard name="Demiurge Luna" /> <CharacterLinkCard name="Regina" /> : <ClassInlineTag name='Mage' /> with <EffectInlineTag name='BT_ACTION_GAUGE' type='buff' /> on their S1.</li>
                <li><CharacterLinkCard name="Drakhan" /> <CharacterLinkCard name="Gnosis Dahlia" /> <CharacterLinkCard name="Demiurge Stella" /> : <ClassInlineTag name='Striker' /> with <EffectInlineTag name='BT_ACTION_GAUGE' type='buff' /> on their S1.</li>
                <li><CharacterLinkCard name="Demiurge Drakhan" />  : <ClassInlineTag name='Defender' /> with <EffectInlineTag name='BT_ACTION_GAUGE' type='buff' /> on their S1.</li>
                <li><CharacterLinkCard name="Gnosis Beth" /> : pushes her whole team with her DoT <EffectInlineTag name='BT_DOT_2000092' type='debuff' /></li>
                <li><CharacterLinkCard name="Kuro" /> <CharacterLinkCard name="Demiurge Vlada" /> <CharacterLinkCard name="Gnosis Viella" />: can remove <EffectInlineTag name="BT_STAT|ST_SPEED" type="buff" /> from the boss.</li>
                <li><CharacterLinkCard name="Akari" /> : can prevent the boss from gaining <EffectInlineTag name="BT_STAT|ST_SPEED" type="buff" />.</li>                
                <li><CharacterLinkCard name="Skadi" /> : cycles your skills CD faster with <EffectInlineTag name="BT_COOL_CHARGE" type="buff" />.</li>
              </ul>

              <hr className="my-6 border-neutral-700" />

              <GuideHeading level={3}>Team Compositions</GuideHeading>
              <TeamTabSelector teams={teams} />


            </>
          ),
        },

        july2024: {
          label: 'July 2024',
          content: (
            <>
              <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Strategy Overview</h3>
              <p className="mb-4 text-neutral-300">
                For Phase 1, you need to :
              </p>
              <ul>
                <li><CharacterLinkCard name="Val" />&apos;s S3 as much as possible</li>
                <li><CharacterLinkCard name="Iota" /> uses S1 only</li>
                <li><CharacterLinkCard name="Notia" /> must maintain her buff uptime for priority pushes</li>
                <li><CharacterLinkCard name="Dianne" /> needs <CharacterLinkCard name="Iota" /> to have the highest ATK to push her every turn with S1</li>
              </ul>

              <hr className="my-6 border-neutral-700" />
              <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">
                Phase 1 Sequence
              </h3>

              <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li>Build CP in P1 and lock boss down using <CharacterLinkCard name="Iota" /> &amp; <CharacterLinkCard name="Valentine" />&apos;s priority reduction.</li>
                <li>Do <strong>not heal <CharacterLinkCard name="Iota" /></strong>; let her self-sap to 1 HP (boosts SPD via Swiftness).</li>
                <li>Break boss once, reduce WG to 1 - 2, apply Invulnerable with <CharacterLinkCard name="Iota" /> S3/S2B2.</li>
                <li>Ensure boss is around 1.2M HP after breaking with 10 chain attacks ready.</li>
                <li>Push P1 damage over threshold → P2 boss spawns.</li>
                <li><CharacterLinkCard name="Iota" /> (1 HP, Swiftness) will act <strong>before</strong> P2 boss.</li>
                <li>Swap to Team 2.</li>
              </ul>

              <hr className="my-6 border-neutral-700" />
              <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">
                Phase 2 Mechanics
              </h3>
              <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li>P2 boss uses S2 <EffectInlineTag name="BT_DOT_LIGHTNING" type="debuff" />, <CharacterLinkCard name="Monad Eva" /> S2 cleanses it immediately.</li>
                <li>Cleanse = &quot;healer action&quot;, which applies <EffectInlineTag name="BT_STAT|ST_SPEED" type="debuff" /> to boss.</li>
                <li>Team can outspeed and <strong>break + remove core energy</strong>.</li>
                <li>Spam chain attacks to lock him; use <CharacterLinkCard name="Monad Eva" /> S1 to help build CP.</li>
              </ul>

              <hr className="my-6 border-neutral-700" />
              <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">
                Important Notes
              </h3>
              <p className="text-neutral-300 mb-4">
                This comp only works with 6★ <CharacterLinkCard name="Meva" />. Credit to <strong>Birdmouth</strong> for discovering this.
                The core energy buff counts as an <em>additional attack</em>, which <CharacterLinkCard name="Meva" /> skill seal at battle start can cancel.
                This protects your CP from being lost.
              </p>
              <p className="text-neutral-300 mb-4">
                Alternative: swap to Team 2 <strong>during Phase 1</strong>. Since <ElementInlineTag element="light" /><ElementInlineTag element="dark" /> units can&apos;t reduce WG in P1, you&apos;ll need at least
                one <ElementInlineTag element="fire" /><ElementInlineTag element="water" /><ElementInlineTag element="earth" /> unit in Team 2. This lets <CharacterLinkCard name="Meva" /> apply skill seal upon entering P2 and protect your rotation.
              </p>
              <p className="text-neutral-300">
                Another option: run <CharacterLinkCard name="DStella" /> instead of <CharacterLinkCard name="Stella" />. Swap to Team 2 at end of P1 and use one chain skill to trigger fixed damage and move into P2.
              </p>

              <hr className="my-6 border-neutral-700" />

              {/* Bloc vidéo */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
                <p className="mb-2 text-neutral-300">
                  This video showcases how the comp is executed in practice, as demonstrated by <strong>Ducky</strong>.
                </p>
              </div>

              <YoutubeEmbed videoId="Kd-dKroOXEo" title="Glorious Sentinel World Boss 23mil+ by Ducky" />
            </>
          ),
        },
      }}
    />
  )
}
