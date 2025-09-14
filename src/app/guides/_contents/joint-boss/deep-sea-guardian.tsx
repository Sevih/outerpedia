'use client'

import { useState } from 'react'
import VersionSelector from '@/app/components/VersionSelector'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'

import RecommendedTeam from '@/app/components/RecommendedTeamCarousel'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import GuideHeading from '@/app/components/GuideHeading'
import ClassInlineTag from '@/app/components/ClassInlineTag'

const teamSetup0725 = [
  ['Monad Eva'],
  ['Kanon','Caren','Aer'],
  ['Poolside Trickster Regina','Francesca', 'Regina'],
  ['Ryu Lion','Delta','Stella','Kappa', 'Eliza'],
]

const teamSetup0325 = [
  ['Demiurge Delta','Dianne'],
  ['Delta','Idith','Hanbyul Lee'],
  ['Notia','Kappa','Stella'],
  ['Ame','Rey','Demiurge Stella'],
]

const versions: Record<string, { label: string; content: React.ReactNode }>= {
  default: {
      label: 'July 2025 Version',
      content: (
        <>
          <GuideHeading level={3}>Strategy Overview</GuideHeading>
          <GuideHeading level={4}>Deep Sea Guardian moveset</GuideHeading>
          <ul className="list-disc list-inside text-neutral-300 mb-4">
            <li><strong>S1</strong>: AoE, <EffectInlineTag name="BT_DOT_BLEED" type="debuff" /> 3 turns. <EffectInlineTag name="BT_STEAL_BUFF" type="debuff" /> if only 1 target.</li>
            <li><strong>S2</strong>: AoE, 2 <EffectInlineTag name="BT_DOT_BLEED_IR" type="debuff" /> 3 turns (ignore immunity).</li>
            <li><strong>S3</strong>: AoE, <EffectInlineTag name="BT_INVINCIBLE" type="buff" /> 9 turns. <EffectInlineTag name="BT_DETONATE" type="debuff" /> all <EffectInlineTag name="BT_DOT_BLEED" type="debuff" />.</li>
            <li><strong>Passive</strong>: When any character with <EffectInlineTag name="BT_INVINCIBLE" type="buff" /> gains a turn, their Ultimate Skill cooldown is reduced by 1 turn, regardless of whether they are an ally or enemy.</li>
            <li><strong>Passive</strong>: Reduces enemies effectiveness by 90%.</li>
            <li><strong>Passive</strong>: Increases caster’s<EffectInlineTag name="BT_DOT_BLEED" type="debuff" /> damage by 100%.</li>
            <li><strong>Passive</strong>: At the end of the caster’s turn, deal 10% of target’s Max Health as Fixed damage to enemies without any buffs.</li>
            <li><strong>Passive</strong>: Increases damage taken from <ClassInlineTag name='Striker' /> and reduces damage taken from attacks that target all enemies.</li>
            <li><strong>Passive</strong>: <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> and <EffectInlineTag name="BT_DOT_CURSE" type="debuff" /> cannot exceed 10 000.</li>
            <li><strong>Passive</strong>: Greatly increases damage dealt inversely proportional to the number of targets.</li>
            <li><strong>Enrage</strong>:  Every 3 turns. Gain <EffectInlineTag name="BT_DAMGE_TAKEN" type="buff" /> and <EffectInlineTag name="BT_STAT|ST_ATK_IR" type="buff" /> and recovers weakness gauge by 10%.</li>
            <li><strong>Enrage Ultimate</strong>: AoE, heavy damage.</li>
          </ul>
          <hr className="my-6 border-neutral-700" />
          <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Advices</h3>
          <p>You want to remove <EffectInlineTag name="BT_INVINCIBLE" type="buff" /> from the boss as soon as possible with <EffectInlineTag name="BT_STEAL_BUFF" type="debuff" /> or <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" />.</p>
          <p>You can prevent the boss from buffing himself with <EffectInlineTag name="BT_SEALED" type="debuff" /> but your unit must be around 290 Speed.</p>
          <p>If using a unit that will <EffectInlineTag name="BT_STEAL_BUFF" type="debuff" />, you want it to be the first to play after the boss .</p>
          <p>You want at least one unit that can AoE buff your team to prevent the boss’s <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" />.</p>
          <p>Revenge Set is good here except on the unit that will <EffectInlineTag name="BT_STEAL_BUFF" type="debuff" /> boss’s <EffectInlineTag name="BT_INVINCIBLE" type="buff" />.</p>
          <hr className="my-6 border-neutral-700" />
          <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Recommended Characters</h3>
          <ul className="list-disc list-inside text-neutral-300 mb-4">
            <li><CharacterLinkCard name="Kanon" /> <CharacterLinkCard name="Poolside Trickster Regina" />: Essential pick because of the score bonus.</li>
            <li><CharacterLinkCard name="Caren" /> <CharacterLinkCard name="Poolside Trickster Regina" />: <EffectInlineTag name="BT_STEAL_BUFF" type="debuff" /> boss’s <EffectInlineTag name="BT_INVINCIBLE" type="buff" />.</li>
            <li><CharacterLinkCard name="Aer" /> <CharacterLinkCard name="Kappa" /> <CharacterLinkCard name="Eliza" /> <CharacterLinkCard name="Regina" />: <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /> boss’s <EffectInlineTag name="BT_INVINCIBLE" type="buff" />.</li>
            <li><CharacterLinkCard name="Delta" /> : <ClassInlineTag name='Striker' /> with <EffectInlineTag name="BT_STAT|ST_COUNTER_RATE" type="buff" /> (since the boss is fast).</li>
            <li><CharacterLinkCard name="Ryu Lion" /> : to buff your team with <EffectInlineTag name="BT_STAT|ST_SPEED" type="buff" />.</li>
            <li><CharacterLinkCard name="Monad Eva" /> : <EffectInlineTag name="BT_STAT|ST_SPEED" type="buff" /> and <EffectInlineTag name="BT_INVINCIBLE" type="buff" />.</li>
          </ul>
          <hr className="my-6 border-neutral-700" />
          <RecommendedTeam team={teamSetup0725} />
          <hr className="my-6 border-neutral-700" />
          <p className="text-neutral-400 text-sm italic mt-2">
          Run provided by <span className="text-white font-semibold">Sevih</span> (23/07/2025)
        </p>
          <YoutubeEmbed videoId="ScFXrrOeVNk" title="Deep Sea Guardian - Joint Challenge - Very Hard Mode by Sevih" />
        </>
      ),
    },
  mars2025: {
    label: 'Legacy (March 2025 Version)',
    content: (
      <>
        <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Strategy Overview</h3>
        <p className="mb-4 text-neutral-300">
          In the March 2025 version of Deep Sea Guardian, the boss takes the first turn and uses his ultimate immediately,
          stunning your whole team and ignoring <EffectInlineTag name="BT_IMMUNE" type="buff" />.
        </p>
        <ul className="list-disc list-inside text-neutral-300 mb-4">
          <li>Applies <EffectInlineTag name="BT_DOT_LIGHTNING" type="debuff" /> and reduces AP gain (except for Healers).</li>
          <li>If your team has no duplicate classes, you gain <strong>50% free Resilience</strong>.</li>
          <li>Using a unit with ~300 Resilience helps avoid constant stuns.</li>
          <li><strong>Demiurge Delta</strong> with a Tier 4 <strong>Saint Ring</strong> can cleanse herself and the team with S3.</li>
          <li>The boss is fast, so counter-based units are a solid source of damage.</li>
        </ul>
        <hr className="my-6 border-neutral-700" />
        <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Recommended Characters</h3>
        <ul className="list-disc list-inside text-neutral-300 mb-4">
          <li><CharacterLinkCard name="Demiurge Delta" />: Essential pick with <strong>Saint Ring</strong> to self-cleanse and team-cleanse with S3.</li>
          <li><CharacterLinkCard name="Delta" />: Grants team-wide counterattack buff. Needs average team speed except for Demiurge Delta.</li>
          <li><CharacterLinkCard name="Rey" /> / <CharacterLinkCard name="Ame" />: High damage dealers.</li>
          <li><CharacterLinkCard name="Dstella" />: Cannot be stunned and deals fixed damage (low compared to Rey/Ame).</li>
          <li><CharacterLinkCard name="Stella" />: Also stun-immune, provides minor support.</li>
          <li><CharacterLinkCard name="Notia" />: Damage dealer plus a ranger so you can pair her with Ame/Rey Ame/Delta.</li>
          <li><CharacterLinkCard name="Idith" />: Good alternative to Delta; counter-focused.</li>
          <li><CharacterLinkCard name="Hanbyul Lee" />: Provides counterattack buff to the team.</li>
          <li><CharacterLinkCard name="Kappa" /> (with EE): Buffs Earth-element units.</li>
          <li><CharacterLinkCard name="Dianne" />: Can replace Demiurge Delta for cleansing if needed.</li>
        </ul>
        <hr className="my-6 border-neutral-700" />
        <RecommendedTeam team={teamSetup0325} />
      </>
    ),
  },  
  legacy2024: {
    label: 'Legacy (2024 Video)',
    content: (
      <>
        <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Legacy Video (2024-10-02)</h3>
        <p className="mb-4 text-neutral-300">
        No full written of this version has been made. For now, we recommend watching this excellent video by <strong>Ducky</strong>:
        </p>
        <YoutubeEmbed videoId="pHi3CcaWhn0" title='Deep Sea Guardian Joint Boss Max Score! [OUTERPLANE]'/>
      </>
    ),
  },
  
}

export default function DeepSeaGuardianGuide() {
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
