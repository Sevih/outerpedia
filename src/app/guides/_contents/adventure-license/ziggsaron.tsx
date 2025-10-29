'use client'

import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import GuideHeading from '@/app/components/GuideHeading'
import TeamTabSelector from '@/app/components/TeamTabSelector'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'

const teams = {
  team1: {
    label: 'Team 1 – Safe Clear',
    icon: 'SC_Buff_Dot_Curse.webp',
    setup: [
      ['Monad Eva'],
      ['Kitsune of Eternity Tamamo-no-Mae'],
      ['Marian'],
      ['Tamara']
    ]
  },
  team2: {
    label: 'Team 2 – Aggro Control',
    icon: 'SC_Buff_Effect_Taunted.webp',
    setup: [
      ['Ember'],
      ['Fatal'],
      ['Edelweiss', 'Stella'],
      ['Tamara']
    ]
  },
  team3: {
    label: 'Team 3 – Water warrior',
    icon: 'water.webp',
    setup: [
      ['Veronica'],
      ['Rin'],
      ['Caren'],
      ['Beth']
    ]
  }
}

export default function RavenousWolfKingZiggsaronGuide() {
  return (
    <div>
      <GuideHeading level={4}>Strategy Overview</GuideHeading>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li><strong>Passive:</strong> Permanent <EffectInlineTag name="BT_STAT|ST_ATK" type="debuff" /> (irremovable)</li>
        <li>Inflicts <EffectInlineTag name="BT_SEALED" type="debuff" /> at the start of each turn (1 turn)</li>
        <li><strong>Disables:</strong> <EffectInlineTag name="BT_STAT|ST_COUNTER_RATE" type="buff" /> <EffectInlineTag name="SYS_BUFF_REVENGE" type="buff" /> <EffectInlineTag name="BT_RUN_PASSIVE_SKILL_ON_TURN_END_DEFENDER_NO_CHECK" type="buff" /></li>
        <li><strong>Damage Reduction:</strong> Takes reduced damage from non-Rangers and -50% WG damage from non-Water units</li>
        <li><strong>Enrage:</strong> Every 4 turns, lasts 3 turns – Enrage Ult is lethal</li>
        <li><strong>S1:</strong> <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /> 2 buffs and deals greatly increased damage to Rangers</li>
        <li><strong>S2:</strong> Increases buff duration of all allies and enemies by 2 turns</li>
        <li><strong>S3:</strong> AoE, <EffectInlineTag name="BT_STAT|ST_SPEED" type="buff" /> and <EffectInlineTag name="BT_STAT|ST_DEF" type="buff" /> for 3 turns – often fatal to DPS</li>
      </ul>

      <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Team Suggestions</h3>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li><strong>Team 1:</strong> <CharacterLinkCard name="Monad Eva" />, <CharacterLinkCard name="Kitsune of Eternity Tamamo-no-Mae" />, <CharacterLinkCard name="Marian" />, <CharacterLinkCard name="Tamara" /></li>
        <li className="text-neutral-400 text-sm italic">1 attempt. Verified up to stage 10.</li>
        <li><strong>Team 2:</strong> <CharacterLinkCard name="Ember" />, <CharacterLinkCard name="Fatal" />, <CharacterLinkCard name="Edelweiss" /> / <CharacterLinkCard name="Stella" />, <CharacterLinkCard name="Tamara" /></li>
        <li className="text-neutral-400 text-sm italic">
          Ember&apos;s self-inflicted <EffectInlineTag name="BT_MARKING" type="debuff" /> keeps S1 focused on her. Tamara should prevent S3 usage – S2 is harmless.
        </li>
        <li><strong>Team 3:</strong> <CharacterLinkCard name="Veronica" />, <CharacterLinkCard name="Rin" />, <CharacterLinkCard name="Caren" />, <CharacterLinkCard name="Beth" /></li>
      </ul>

      <hr className="my-6 border-neutral-700" />
      <TeamTabSelector teams={teams} />

      <hr className="my-6 border-neutral-700" />

      <div className="mb-4">
        <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
        <p className="text-neutral-400 text-sm italic mt-2">
          Run provided by <span className="text-white font-semibold">XuRenChao</span> (19/08/2025)
        </p>
        <YoutubeEmbed videoId="Nlt72xRKMpo" title="Ziggsaron - Adventure License - Stage 10 - 1 run clear (Auto) - by XuRenChao" />
      </div>
    </div>
  )
}
