'use client'

import { useState } from 'react'
import GuideHeading from '@/app/components/GuideHeading'
import VersionSelector from '@/app/components/VersionSelector'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import ClassInlineTag from '@/app/components/ClassInlineTag'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'
import StarLevel from '@/app/components/StarLevel';
import RecommendedTeam from '@/app/components/RecommendedTeamCarousel'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import ElementInlineTag from '@/app/components/ElementInline'

const teamSetup0625 = [
  ['Liselotte','Monad Eva','Dianne'],
  ['Demiurge Vlada', 'Eliza'],
  ['Maxwell','Epsilon','Gnosis Dahlia'],  
  ['Demiurge Astei','Iota', 'Omega Nadja'],
]

const versions: Record<string, { label: string; content: React.ReactNode }> = {
  default: {
    label: 'June 2025 Version',
    content: (
      <>
        <GuideHeading level={3}>Strategy Overview</GuideHeading>
        <GuideHeading level={4}>Annihilator moveset</GuideHeading>
        <ul className="list-disc list-inside text-neutral-300 mb-4">
          <li><strong>S1</strong>: Single, gains <EffectInlineTag name="BT_SHIELD_BASED_CASTER" type="buff" />.</li>
          <li><strong>S2</strong>: AoE, <EffectInlineTag name="BT_STAT|ST_CRITICAL_RATE" type="debuff" /> <EffectInlineTag name="BT_STAT|ST_CRITICAL_DMG_RATE" type="debuff" /> 9 turns. <EffectInlineTag name="BT_ACTION_GAUGE" type="debuff" /> of all non-<ClassInlineTag name='Healer' /> to 0.</li>
          <li><strong>S3</strong>: AoE, <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /> then <EffectInlineTag name="BT_SEALED" type="debuff" /> 9 turns.</li>
          <li><strong>Passive</strong>: Right after all attacks, does not trigger <EffectInlineTag name="SYS_REVENGE_HEAL" type="buff" />, <EffectInlineTag name="SYS_BUFF_REVENGE" type="buff" /> and <EffectInlineTag name="BT_STAT|ST_COUNTER_RATE" type="buff" />.</li>
          <li><strong>Passive</strong>: When hit by single target attack, reduce final damage taken by 70% and restore 3 weakness gauge.</li>
          <li><strong>Passive</strong>: Each time an enemy uses a non-attack action, the boss takes 10 000 damage twice as <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" />.</li>
          <li><strong>Passive</strong>: Each time an enemy takes an action other than <EffectInlineTag name="BT_CALL_BACKUP" type="buff" />/Burst Skill or Chain attack, increases <ElementInlineTag element='Dark' /> enemies damage by 30%.</li>
          <li><strong>Passive</strong>: Action cost for non-<ElementInlineTag element='Dark' /> units is increased by 50%.</li>
          <li><strong>Passive</strong>: Damage taken from <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> and <EffectInlineTag name="BT_DOT_CURSE" type="debuff" /> is capped at 10 000.</li>
          <li><strong>Passive</strong>: All attacks deal more damage the fewer targets there are.</li>
          <li><strong>Enrage</strong>:  Every 4 turns. Gain <EffectInlineTag name="BT_DAMGE_TAKEN" type="buff" /> and <EffectInlineTag name="BT_STAT|ST_ATK_IR" type="buff" /> and recovers weakness gauge by 10%.</li>
          <li><strong>Enrage Ultimate</strong>: AoE, resets all skill cooldown.</li>
        </ul>
        <hr className="my-6 border-neutral-700" />
        <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Recommended Characters</h3>
        <ul className="list-disc list-inside text-neutral-300 mb-4">
          <li><CharacterLinkCard name="Liselotte" />: Essential pick because of the score bonus.</li>
          <li><CharacterLinkCard name="Maxwell" />: Essential pick because of the score bonus.</li>
          <li><CharacterLinkCard name="Demiurge Vlada" /> <CharacterLinkCard name="Eliza" />: <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /> to remove <EffectInlineTag name="BT_SHIELD_BASED_CASTER" type="buff" />.</li>
          <li><CharacterLinkCard name="Epsilon" /> : <ElementInlineTag element='dark' /> <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /> and no single target attacks.</li>
          <li><CharacterLinkCard name="Gnosis Dahlia" /> : <ElementInlineTag element='dark' /> with nice damage.</li>
          <li><CharacterLinkCard name="Demiurge Astei" /> : <ElementInlineTag element='dark' /> <ClassInlineTag name='Mage' />.</li>
          <li><CharacterLinkCard name="Iota" /> : <ElementInlineTag element='dark' /> <ClassInlineTag name='Mage' />.</li>
          <li><CharacterLinkCard name="Omega Nadja" /> : <ElementInlineTag element='dark' />.</li>
          <li><CharacterLinkCard name="Monad Eva" /> : You can use her as a remplacement if you don&apos;t own <CharacterLinkCard name="Liselotte" /> (must be 5 star to  <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" />).</li>
          <li><CharacterLinkCard name="Dianne" /> :  You can use her as a remplacement if you don&apos;t own <CharacterLinkCard name="Liselotte" />.</li>
        </ul>
        <p className="text-neutral-400 text-sm italic mb-4">
          Note: you want <CharacterLinkCard name="Demiurge Vlada" /> <CharacterLinkCard name="Eliza" /> to be at 240 (not over) and play before your DPS to remove the <EffectInlineTag name="BT_SHIELD_BASED_CASTER" type="buff" />. Be careful, be sure to take <CharacterLinkCard name="Liselotte" /> transcend bonus in count since she gives 5 speed at <StarLevel levelLabel="4" size={14} /> and 10 at <StarLevel levelLabel="6" size={14} />.
        </p>
        <hr className="my-6 border-neutral-700" />
        <RecommendedTeam team={teamSetup0625} />
        <hr className="my-6 border-neutral-700" />
        <YoutubeEmbed videoId="5r3gji7y6E0" title="Annihilator - Joint Challenge - Very Hard Mode by Sevih" />
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

          <YoutubeEmbed videoId="8d88RKTABNA" title="Annihilator Joint Boss by Ducky" />
        </div>
      </>
    ),
  },

}

export default function AnnihilatorGuide() {
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
