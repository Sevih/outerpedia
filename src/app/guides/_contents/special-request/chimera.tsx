'use client'

import EffectInlineTag from '@/app/components/EffectInlineTag'
import RecommendedTeam from '@/app/components/RecommendedTeamCarousel'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

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
        <li>Thankfully, the Fire element nowadays has soooo many good tools to deal with this boss.</li>
        <li>Chimera has relatively low Health but significantly higher Defense. <strong>Defense break is pretty much required</strong>.</li>
        <li>Having your DPS units on <strong>Penetration%</strong> accessories will greatly improve your damage.</li>
        <li>Chimera&#39;s passive significantly reduces your team&#39;s crit damage but in return gives all units <strong>100% crit chance</strong>.</li>
        <li>To take advantage of this, <strong>you DO NOT need to put any crit chance on your units</strong>. Focus purely on Attack and Crit Damage.</li>
        <li>Abuse <strong>Rogue Charms</strong> on every unit since they will proc CP generation every time. <strong>Sage Charms</strong> on Fire units work as well.</li>
        <li><strong>Speed is important</strong> due to the boss&#39;s ability to gain 10% priority whenever attacked. Ideally, you want your entire team to be above <strong>175 SPD</strong> for Stage 12.</li>        
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
        <p className="mb-2 text-neutral-300">
          A sample video of the recommended team in action will be added here soon.
        </p>
      </div>
    </div>
  )
}
