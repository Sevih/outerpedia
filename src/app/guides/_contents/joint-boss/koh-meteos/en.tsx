'use client'

import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import GuideTemplate from '@/app/components/GuideTemplate'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import ClassInlineTag from '@/app/components/ClassInlineTag'
import ElementInlineTag from '@/app/components/ElementInline'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'
import BossDisplay from '@/app/components/BossDisplay'
import GuideIconInline from '@/app/components/GuideIconInline'
import KOHMeteosTeamsData from './KOHMeteos.json'
import type { TeamData } from '@/types/team'

const KOHMeteosTeams = KOHMeteosTeamsData as Record<string, TeamData>

export default function KOHMeteosGuide() {
  return (
    <GuideTemplate
      title="Knight of Hope Meteos Strategy Guide"
      introduction="Joint Challenge boss. The boss prioritizes the leftmost enemy and triggers a powerful AoE attack when killing with skills or attacking non-Mage units. Light element allies gain bonus penetration, and the boss's defense stacks each turn but resets on break."
      defaultVersion="default"
      versions={{
        default: {
          label: 'November 2025 Version',
          content: (
            <>
              <BossDisplay bossKey='Knight of Hope Meteos' modeKey='Joint Challenge' defaultBossId='4176152' />
              <hr className="my-6 border-neutral-700" />
              <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Recommended Characters</h3>
              <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><CharacterLinkCard name="Demiurge Luna" /><br />
                  Essential pick because of the score bonus. Use Revenge Set, <GuideIconInline name="TI_Equipment_Accessary_06" text="Queen of Prism" /> and <EffectInlineTag name="IG_Buff_Effect_2000120_Interruption" type="buff" />.</li>

                <li><CharacterLinkCard name="Bryn" /><br />
                  Essential pick because of the score bonus. Her exclusive equipment boosts damage of allies with <EffectInlineTag name="BT_SHIELD_BASED_CASTER" type="buff" />.</li>

                <li><CharacterLinkCard name="Gnosis Dahlia" /><br />
                  S1 will push team (synergizes with boss passive).</li>

                <li><CharacterLinkCard name="Ryu Lion" /><br />
                  <EffectInlineTag name="BT_STAT|ST_SPEED" type="buff" /> <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> (ideally slower than <CharacterLinkCard name="Demiurge Luna" />).</li>

                <li><CharacterLinkCard name="Regina" /><br />
                  <ElementInlineTag element='light' /> <ClassInlineTag name='Mage' /> with self-<EffectInlineTag name="BT_ACTION_GAUGE" type="buff" />. You can use her as a replacement if you don&apos;t own <CharacterLinkCard name="Demiurge Luna" />.</li>

                <li><CharacterLinkCard name="Omega Nadja" /><br />
                  Nice damage with <EffectInlineTag name="BT_ACTION_GAUGE" type="debuff" /> <EffectInlineTag name="BT_SHIELD_BASED_CASTER" type="buff" />.</li>

                  <li><CharacterLinkCard name="Francesca" /><br />
                  Nice damage with <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> and elemental advantage.</li>

                <li><CharacterLinkCard name="Holy Night's Blessing Dianne" /><br />
                  <EffectInlineTag name="BT_CASTER_COPY_BUFF" type="buff" /> with self-<EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> (ideally slower than <CharacterLinkCard name="Demiurge Luna" />).</li>
              </ul>

              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={KOHMeteosTeams.may2025} defaultStage="default" icon='/images/ui/effect/light.webp' replace={{ lead: "", mid: "", tail: "" }} />
              <hr className="my-6 border-neutral-700" />
              <div className="mb-4">
                <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
                <YoutubeEmbed videoId="qPZzt25dKX0" title="Knight of Hope Meteos - Joint Challenge - (Auto) Very Hard Mode - by XuRenChao" />
              </div>
            </>
          ),
        },
        may2025: {
          label: 'May 2025 Version',
          content: (
            <>
              <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Strategy Overview</h3>
              <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><strong>S1</strong>: Single, prioritizes leftmost enemy.</li>
                <li><strong>S2</strong>: AoE, damage increases inversely proportional to the number of targets.</li>
                <li><strong>Passive</strong>: AoE, ignores defense. Triggered when the enemy is killed by S1/S2 or attacking a non-<ClassInlineTag name='Mage' /> target with S1.</li>
                <li><strong>Passive</strong>: <ElementInlineTag element='light' /> enemies gain 40% penetration.</li>
                <li><strong>Passive</strong>: Increases enemy priority efficiency by 100% but reduces their speed by 50%.</li>
                <li><strong>Passive</strong>: Enemies that use non-offensive skills take 100% increased critical damage (max 3 stacks).</li>
                <li><strong>Passive</strong>: Increase boss&apos;s defense by 500 each turn, but resets when the boss is inflicted with break.</li>
                <li><strong>Passive</strong>: Damage taken from <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> and <EffectInlineTag name="BT_DOT_CURSE" type="debuff" /> does not exceed 10,000.</li>
                <li><strong>Enrage</strong>: Every 4 turns. Gains <EffectInlineTag name="BT_DAMGE_TAKEN" type="buff" /> and <EffectInlineTag name="BT_STAT|ST_ATK_IR" type="buff" />.</li>
                <li><strong>Enrage Ultimate</strong>: AoE, deals lethal damage and <EffectInlineTag name="BT_SEALED_RESURRECTION" type="debuff" />.</li>
              </ul>

              <hr className="my-6 border-neutral-700" />
              <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Recommended Characters</h3>
              <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><CharacterLinkCard name="Demiurge Luna" /><br />
                  Essential pick because of the score bonus. Use Revenge Set, <GuideIconInline name="TI_Equipment_Accessary_06" text="Queen of Prism" /> and <EffectInlineTag name="IG_Buff_Effect_2000120_Interruption" type="buff" />.</li>

                <li><CharacterLinkCard name="Bryn" /><br />
                  Essential pick because of the score bonus. Her exclusive equipment boosts damage of allies with <EffectInlineTag name="BT_SHIELD_BASED_CASTER" type="buff" />.</li>

                <li><CharacterLinkCard name="Gnosis Dahlia" /><br />
                  S1 will push team (synergizes with boss passive).</li>

                <li><CharacterLinkCard name="Ryu Lion" /><br />
                  <EffectInlineTag name="BT_STAT|ST_SPEED" type="buff" /> <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> (ideally slower than <CharacterLinkCard name="Demiurge Luna" />).</li>

                <li><CharacterLinkCard name="Regina" /><br />
                  <ElementInlineTag element='light' /> <ClassInlineTag name='Mage' /> with self-<EffectInlineTag name="BT_ACTION_GAUGE" type="buff" />. You can use her as a replacement if you don&apos;t own <CharacterLinkCard name="Demiurge Luna" />.</li>

                <li><CharacterLinkCard name="Omega Nadja" /><br />
                  Nice damage with <EffectInlineTag name="BT_ACTION_GAUGE" type="debuff" /> <EffectInlineTag name="BT_SHIELD_BASED_CASTER" type="buff" />.</li>

                <li><CharacterLinkCard name="Holy Night's Blessing Dianne" /><br />
                  <EffectInlineTag name="BT_CASTER_COPY_BUFF" type="buff" /> with self-<EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> (ideally slower than <CharacterLinkCard name="Demiurge Luna" />).</li>
              </ul>

              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={KOHMeteosTeams.may2025} defaultStage="default" icon='/images/ui/effect/light.webp' replace={{ lead: "", mid: "", tail: "" }} />
              <hr className="my-6 border-neutral-700" />

              <div className="mb-4">
                <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
                <YoutubeEmbed videoId="g3LcTpm9fMo" title="Knight of Hope Meteos - Joint Challenge - Very Hard Mode by Sevih" />
              </div>
            </>
          ),
        },
        legacy2024: {
          label: 'Legacy (2024 Video)',
          content: (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
                <p className="mb-2 text-neutral-300">
                  No full written guide has been made yet. For now, we recommend watching this excellent video by <strong>Ducky</strong>:
                </p>
              </div>
              <YoutubeEmbed videoId="X5bL_YZ73y4" title="Knight of Hope Meteos Joint Boss Max Score by Ducky" />
            </>
          ),
        },
      }}
    />
  )
}
