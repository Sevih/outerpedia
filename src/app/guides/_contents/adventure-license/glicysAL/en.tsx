'use client'

import EffectInlineTag from '@/app/components/EffectInlineTag'
import GuideHeading from '@/app/components/GuideHeading'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'
import TeamTabSelector from '@/app/components/TeamTabSelector'

const teams = {
  team1: {
    label: 'Team 1 – Icebreaker',
    icon: 'SC_Buff_Effect_Invincible.webp',
    setup: [
      ['Kappa'],
      ['Charlotte','Rhona'],
      ['Rey','Ryu Lion'],
      ['Ame','Noa']
    ]
  }
}

export default function GlicysGuide() {
  return (
    <div>
      <GuideHeading level={3}>Strategy Overview</GuideHeading>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li>Same skills as Special Request Stage 12</li>
        <li>Gains <EffectInlineTag name="BT_INVINCIBLE_IR" type="buff" /> 1 turn and <EffectInlineTag name="BT_STAT|ST_BUFF_CHANCE_IR" type="buff" /> 3 turns at 60% HP</li>
      </ul>

      <hr className="my-6 border-neutral-700" />
      <TeamTabSelector teams={teams} />
      <p className="text-neutral-400 text-sm italic mb-4">
        1 to 2 attempts. Verified up to stage 10. Starting the second attempt below 60% skips the invincibility phase.
      </p>
      <hr className="my-6 border-neutral-700" />

      <div className="mb-4">
        <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
        <p className="text-neutral-400 text-sm italic mt-2">
          Run provided by <span className="text-white font-semibold">XuRenChao</span> (26/08/2025)
        </p>
        <YoutubeEmbed videoId="gufhBKd9kXw" title="Glicys - Adventure License - Stage 10 - 1 run clear (Auto) - by XuRenChao" />
      </div>
    </div>
  )
}
