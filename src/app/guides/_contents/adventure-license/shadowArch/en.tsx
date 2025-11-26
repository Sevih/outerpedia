'use client'

import EffectInlineTag from '@/app/components/EffectInlineTag'
import GuideHeading from '@/app/components/GuideHeading'
import TeamTabSelector from '@/app/components/TeamTabSelector'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'

const teams = {
  team1: {
    label: 'Team 1 – Fast Clear',
    icon: 'SC_Buff_Stat_Speed.webp',
    setup: [
      ['Kanon', "Holy Night's Blessing Dianne",'Vlada'],
      ['Tamamo-no-Mae',],
      ['Maxie','Bell Cranel'],
      ['Aer','Bryn']
    ]
  }
}

export default function ShadowArchdemonGuide() {
  return (
    <div>
      <GuideHeading level={3}>Strategy Overview</GuideHeading>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li>Only Fire units can act – others have 0 Speed</li>
        <li><strong>S1:</strong> Reduces skill cooldowns</li>
        <li><strong>S2:</strong> Applies <EffectInlineTag name="BT_STATBUFF_CONVERT_TO_STATDEBUFF" type="debuff" /></li>
        <li><strong>S3:</strong> Grants <EffectInlineTag name="BT_STAT|ST_SPEED" type="buff" />, <EffectInlineTag name="BT_STAT|ST_CRITICAL_RATE" type="buff" />, <EffectInlineTag name="BT_STAT|ST_CRITICAL_DMG_RATE" type="buff" /> to both allies and enemies</li>
        <li>When boss acts, heroes with stat down effects are inflicted with <EffectInlineTag name="BT_STUN" type="debuff" /> for 5 turns (ignores resilience but not immunity)</li>
        <li>Immune to <EffectInlineTag name="BT_WG_REVERSE_HEAL" type="debuff" /> while buffed</li>
        <li>Applying any debuff to the boss restores its WG completely</li>
      </ul>

      <hr className="my-6 border-neutral-700" />
      <TeamTabSelector teams={teams} />
      <p className="text-neutral-400 text-sm italic mb-4">
        You can break him before enrage if you avoid applying debuffs between chains. But it works just fine while ignoring the WG.
      </p>
      <hr className="my-6 border-neutral-700" />

      <div className="mb-4">
        <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
        <p className="text-neutral-400 text-sm italic mt-2">
          Run provided by <span className="text-white font-semibold">XuRenChao</span> (26/08/2025)
        </p>
        <YoutubeEmbed videoId="bRSHzurhoV0" title="Shadow of the Archdemon - Adventure License - Stage 10 - 1 run clear (Auto) - by XuRenChao" />
      </div>
    </div>
  )
}
