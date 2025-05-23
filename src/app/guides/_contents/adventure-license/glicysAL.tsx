'use client'

import EffectInlineTag from '@/app/components/EffectInlineTag'
import GuideHeading from '@/app/components/GuideHeading'
import TeamTabSelector from '@/app/components/TeamTabSelector'

const teams = {
  team1: {
    label: 'Team 1 – Icebreaker',
    icon: 'SC_Buff_Effect_Invincible.webp',
    setup: [
      ['Kappa'],
      ['Charlotte'],
      ['Rey'],
      ['Ame']
    ]
  }
}

export default function GlicysGuide() {
  return (
    <div>
      <GuideHeading level={3}>Strategy Overview</GuideHeading>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li>Same skills as Special Request Stage 12</li>
        <li>Gains <EffectInlineTag name="BT_INVINCIBLE" type="buff" /> for 3 turns at 60% HP</li>
      </ul>

      <hr className="my-6 border-neutral-700" />
      <TeamTabSelector teams={teams} />
      <p className="text-neutral-400 text-sm italic mb-4">
        1 to 2 attempts. Verified up to stage 10. Starting the second attempt below 60% skips the invincibility phase.
      </p>
      <hr className="my-6 border-neutral-700" />

      <div className="mb-4">
        <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
        <p className="mb-2 text-neutral-300">
          A sample video of this team comp will be added here soon.
        </p>
      </div>
    </div>
  )
}
