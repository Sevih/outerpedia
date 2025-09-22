'use client'

import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import GuideHeading from '@/app/components/GuideHeading'
import TeamTabSelector from '@/app/components/TeamTabSelector'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'

const teams = {
  standard: {
    label: 'Recommended Team',
    icon: 'fire.webp',
    setup: [
      ['Aer'],
      ['Eternal', 'Tamamo-no-Mae'],
      ['Holy Night\'s Blessing Dianne', 'Kanon'],
      ['Tio']
    ]
  },
  burn: {
    label: 'Burn Team',
    icon: 'SC_Buff_Dot_Burn.webp',
    setup: [
      ['Ember'],
      ['Vlada'],
      ['Bell Cranel', 'Maxie'],
      ['Astei','Tio']
    ]
  },
  burn2: {
    label: 'Ember Team',
    icon: 'SC_Buff_Dot_Burn.webp',
    setup: [
      ['Ember']
    ]
  }
}

export default function AnubisGuardianGuide() {
  return (
    <div>
      <GuideHeading level={3}>Strategy Overview</GuideHeading>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li><strong>S1:</strong> <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> of a random ally by 50%</li>
        <li><strong>S2:</strong> AoE attack that <EffectInlineTag name="BT_STAT|ST_ATK" type="buff" /> of all allies</li>
        <li><strong>S3:</strong> AoE that applies 5 turn <EffectInlineTag name="BT_DOT_LIGHTNING" type="debuff" /></li>
        <li><strong>Passive:</strong> Permanent Increased ATK buff for all enemies, reduces crit chance to 0%</li>
        <li><strong>Other:</strong> 
          <ul className="list-disc list-inside ml-4">
            <li>Resurrects adds every turn</li>
            <li>Extends all buffs and debuffs on self every turn</li>
            <li>Non-fire units remove all debuffs on the boss and deal half WG damage</li>
            <li>No WG damage taken if only the boss is alive</li>
            <li>Enrages at 50% HP – deals lethal damage after 3 turns</li>
          </ul>
        </li>
      </ul>

      <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Team Suggestions</h3>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li><CharacterLinkCard name="Aer" /></li>
        <li><CharacterLinkCard name="Eternal" /> / <CharacterLinkCard name="Tamamo-no-Mae" /></li>
        <li><CharacterLinkCard name="Holy Night's Blessing Dianne" /> / <CharacterLinkCard name="Kanon" /></li>
        <li><CharacterLinkCard name="Tio" /></li>
      </ul>

      <p className="text-neutral-400 text-sm italic mb-4">
        Note: Typically cleared in 1–2 attempts. Verified up to stage 9.
      </p>

      <hr className="my-6 border-neutral-700" />
      <TeamTabSelector teams={teams} />

      <hr className="my-6 border-neutral-700" />

      <div className="mb-4">
              <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
              <p className="text-neutral-400 text-sm italic mt-2">
                Run provided by <span className="text-white font-semibold">XuRenChao</span> (22/09/2025)
              </p>
              <YoutubeEmbed videoId="fU0UUuHswKM" title="Anubis Guardian - Adventure License - Stage 10 - 1 run clear (Auto) - by XuRenChao" />
            </div>
    </div>
  )
}
