'use client'

import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import GuideHeading from '@/app/components/GuideHeading'
import TeamTabSelector from '@/app/components/TeamTabSelector'
import StatInlineTag from '@/app/components/StatInlineTag'

import YoutubeEmbed from '@/app/components/YoutubeEmbed'

const teams = {
  fixed: {
    label: 'Fixed Damage',
    icon: 'SC_Buff_Effect_True_Dmg.webp',
    setup: [
      ['Tamara'],
      ['Maxwell'],
      ['Iota', 'Demiurge Stella'],
      ['Tamamo-no-Mae', 'Gnosis Nella']
    ]
  },
  curse: {
    label: 'Curse Team',
    icon: 'SC_Buff_Dot_Curse.webp',
    setup: [
      ['Hilde', 'Omega Nadja'],
      ['Monad Eva'],
      ['Kitsune of Eternity Tamamo-no-Mae', 'Marian', 'Drakhan'],
      ['Marian', 'Drakhan', 'Kitsune of Eternity Tamamo-no-Mae']
    ]
  }
}


export default function MonadEvaGuide() {
  return (
    <div>
      <GuideHeading level={3}>Strategy Overview</GuideHeading>
      <GuideHeading level={4}>Monad Eva Mechanics</GuideHeading>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li><strong>S1</strong>: Single, <EffectInlineTag name="BT_CALL_BACKUP" type="buff" />.</li>
        <li><strong>S2</strong>: Single, <EffectInlineTag name="IG_Buff_BuffdurationIncrease" type="buff" /> of allies by 1 turn.</li>
        <li><strong>S3</strong>:<EffectInlineTag name="BT_INVINCIBLE" type="buff" /> 3 turns on K.</li>
        <li><strong>Passive</strong>: When hit by single attack, negates weakness gauge damage and reduce damage taken.</li>
        <li><strong>Enrage</strong>:  When health drops under 60%. Gain <EffectInlineTag name="BT_DAMGE_TAKEN" type="buff" /> <EffectInlineTag name="BT_STAT|ST_ATK_IR" type="buff" />.</li>
        <li><strong>Enrage Ultimate</strong>: Revives K.</li>
      </ul>


      <GuideHeading level={4}>K Mechanics</GuideHeading>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li><strong>S1</strong>: Single, <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" />.</li>
        <li><strong>S2</strong>: Single, <EffectInlineTag name="BT_AGGRO" type="debuff" /> 3 turns.</li>
        <li><strong>S3</strong>: AoE, <EffectInlineTag name="BT_STAT|ST_ACCURACY" type="debuff" /> 3 turns.</li>
        <li><strong>Passive</strong>: Increases <EffectInlineTag name="BT_CALL_BACKUP" type="buff" /> damage.</li>
        <li><strong>Passive</strong>: gain 250 <StatInlineTag name="PEN" /> when hit (Max 4 stacks).</li>
      </ul>
      <GuideHeading level={4}>Points of interest</GuideHeading>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li><EffectInlineTag name="BT_CALL_BACKUP" type="buff" /> hit really hard so bring either a character that can tank it or a character that can revive.</li>
        <p className="text-orange-400 ">
          Note: Their attacks don&apos;t always target frontline, the frontlane just have more chance to be focus.
        </p>
        <li><EffectInlineTag name="BT_DOT_CURSE" type="debuff" /> and <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> are allowed and uncapped.</li>
        <li>Both bosses have 220 <StatInlineTag name="SPD" /> so try to have all your character at least at 240.</li>
      </ul>

      <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Team Suggestions</h3>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li><CharacterLinkCard name="Monad Eva" />: <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" />, <EffectInlineTag name="BT_REVIVAL" type="buff" />, <EffectInlineTag name="BT_INVINCIBLE" type="buff" /> and her <EffectInlineTag name="BT_CALL_BACKUP" type="buff" /> helps to stack more <EffectInlineTag name="BT_DOT_CURSE" type="debuff" />.</li>
        <li><CharacterLinkCard name="Demiurge Delta" />: <EffectInlineTag name="BT_REVIVAL" type="buff" />.</li>
        <li><CharacterLinkCard name="Nella" />: <EffectInlineTag name="BT_RESURRECTION_G" type="buff" />.</li>
        <li><CharacterLinkCard name="Maxwell" />: All his skills are AoE.</li>
        <li><CharacterLinkCard name="Kitsune of Eternity Tamamo-no-Mae" />, <CharacterLinkCard name="Drakhan" />, <CharacterLinkCard name="Marian" />:  <EffectInlineTag name="BT_DOT_CURSE" type="debuff" /> specialists.</li>
        <li><CharacterLinkCard name="Iota" />, <CharacterLinkCard name="Demiurge Stella" />, <CharacterLinkCard name="Tamamo-no-Mae" />, <CharacterLinkCard name="Gnosis Nella" />:  <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> specialists.</li>
      </ul>
      <p className="text-neutral-400 text-sm italic mb-4">
        Note: <CharacterLinkCard name="Iota" /> can be placed in  frontline thanks to <EffectInlineTag name="BT_UNDEAD" type="buff" />.
      </p>

      <hr className="my-6 border-neutral-700" />
      <TeamTabSelector teams={teams} />

      <hr className="my-6 border-neutral-700" />

      <hr className="my-6 border-neutral-700" />
      <div className="mb-4">
        <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
        <p className="text-neutral-400 text-sm italic mt-2">
          Run provided by <span className="text-white font-semibold">XuRenChao</span> (09/06/2025)
        </p>
        <YoutubeEmbed videoId="AOhLXfgLUzM" title="Monad Eva - Adventure License : promotion challenge by XuRenChao" />
      </div>

    </div>
  )
}
