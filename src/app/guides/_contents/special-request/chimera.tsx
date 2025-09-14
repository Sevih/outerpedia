'use client'

import EffectInlineTag from '@/app/components/EffectInlineTag'
import RecommendedTeam from '@/app/components/RecommendedTeamCarousel'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'
import EquipmentInlineTag from '@/app/components/EquipmentInlineTag'
import ElementInlineTag from '@/app/components/ElementInline';
import StatInlineTag from '@/app/components/StatInlineTag';

const teamSetup = [
  ['Valentine'],
  ['Eternal'],
  ['Aer'],
  ['Monad Eva','Astei','Tamamo-no-Mae','Kanon','Bryn','Tio'],
]

export default function ChimeraGuide() {
  return (
    <div>
      <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Strategy Overview</h3>
      <p className="mb-4 text-neutral-300">
        THE boss you want to conquer as fast as possible to get that sweet sweet speed gear... and critical strike. Chimera&#39;s kit is not overly complex — this is more of a DPS race than anything.
      </p>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li>If you can&#39;t kill her before she enrages, you&#39;ll have a much harder time surviving.</li>
        <li>Thankfully, the <ElementInlineTag element="fire" /> element nowadays has so many good tools to deal with this boss.</li>
        <li>Chimera has relatively low Health but significantly higher Defense. <EffectInlineTag name="BT_STAT|ST_DEF" type="debuff" /> is pretty much required.</li>
        <li>Having your DPS units on <StatInlineTag name="PEN%" /> accessories will greatly improve your damage.</li>
        <li>Chimera&#39;s passive significantly reduces your team&#39;s <StatInlineTag name="CHD" /> by 85% but in return gives all units <strong>100% <StatInlineTag name="CHC" /></strong>.</li>
        <li>To take advantage of this, <strong>you DO NOT need to put any crit chance on your units</strong>. Focus purely on <StatInlineTag name="ATK" /> and <StatInlineTag name="CHD" />.</li>
        <li>Abuse <EquipmentInlineTag name="Rogue's Charm" type="talisman" /> on every unit since they will proc CP generation every time. <EquipmentInlineTag name="Sage's Charm" type="talisman" /> on <ElementInlineTag element="fire" /> units work as well.</li>
        <li><strong>Speed is important</strong> due to the boss&#39;s ability to gain 10% <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> whenever attacked. Ideally, you want your entire team to be above 175 <StatInlineTag name="SPD" /> for Stage 12 (185 for Stage 13).</li>        
      </ul>
      <CharacterLinkCard name="Valentine" /> needs to go first to <EffectInlineTag name="BT_STAT|ST_CRITICAL_DMG_RATE" type="buff" /> and use S1 to move up your DPS.<br />
      <CharacterLinkCard name="Eternal" /> goes second to land <EffectInlineTag name="BT_STAT|ST_DEF" type="debuff" />.
      <hr className="my-6 border-neutral-700" />
      <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Recommended Characters</h3>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li><CharacterLinkCard name="Valentine" /></li>

        <li><CharacterLinkCard name="Eternal" /></li>

        <li><CharacterLinkCard name="Aer" /></li>
      </ul>

      <hr className="my-6 border-neutral-700" />
      <RecommendedTeam team={teamSetup} />
      <hr className="my-6 border-neutral-700" />

      <div className="mb-4">
        <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
        <YoutubeEmbed videoId="eHRErCHZmp4" title='combat footage'/>
      </div>
    </div>
  )
}
