'use client'

import EffectInlineTag from '@/app/components/EffectInlineTag'
import GuideHeading from '@/app/components/GuideHeading'
import TeamTabSelector from '@/app/components/TeamTabSelector'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'
const teams = {
  team1: {
    label: 'Team 1 – Shadow Buster',
    icon: 'SC_Buff_Effect_Dual_Attack.webp',
    setup: [
      ['Maxwell'],
      ['Demiurge Vlada'],
      ['Monad Eva'],
      ['Gnosis Dahlia','Demiurge Astei']
    ]
  }
}

export default function SchwartzGuide() {
  return (
    <div>
      <GuideHeading level={3}>Strategy Overview</GuideHeading>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li>Inflicts irremovable <EffectInlineTag name="IG_Buff_Effect_Sealed_Interruption_D" type="debuff" /></li>
        <li>Deals low damage when alone</li>
        <li>Damage dealt increases while Shadow Beast is alive</li>
        <li>Shadow Beasts are vulnerable to AoE</li>
        <li>Enrage makes Shadow Beasts invincible</li>
        <li>Reduces <EffectInlineTag name="BT_WG_REVERSE_HEAL" type="debuff" /> from non-Dark units</li>
      </ul>

      <hr className="my-6 border-neutral-700" />
      <TeamTabSelector teams={teams} />
      <p className="text-neutral-400 text-sm italic mb-4">
        1 attempt. Verified up to stage 10. Any Dark DPS can replace Gnosis Dahlia (just be cautious about bleed immunity).
      </p>
      <hr className="my-6 border-neutral-700" />

      <div className="mb-4">
        <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
        <p className="text-neutral-400 text-sm italic mt-2">
                  Run provided by <span className="text-white font-semibold">XuRenChao</span> (01/09/2025)
                </p>
                <YoutubeEmbed videoId="glWpGZRH4xc" title="Schattermeister Schwartz - Adventure License - Stage 10 - 1 run clear (Auto) - by XuRenChao" />
      </div>
    </div>
  )
}
