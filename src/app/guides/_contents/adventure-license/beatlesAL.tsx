'use client'

import GuideHeading from '@/app/components/GuideHeading'
import TeamTabSelector from '@/app/components/TeamTabSelector'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'

const teams = {
  team1: {
    label: 'Team 1 – Sibling Shutdown',
    icon: 'SC_Buff_Stat_CriRate.webp',
    setup: [
      ['Valentine'],
      ['Eternal'],
      ['Aer'],
      ['Kanon']
    ]
  }
}

export default function DekerilMekerilGuide() {
  return (
    <div>
      <GuideHeading level={3}>Strategy Overview</GuideHeading>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li>Same skills as Special Request Stage 12</li>
      </ul>

      <hr className="my-6 border-neutral-700" />
      <TeamTabSelector teams={teams} />
      <p className="text-neutral-400 text-sm italic mb-4">
        1 attempt. Verified up to stage 9.
      </p>
      <hr className="my-6 border-neutral-700" />

      <div className="mb-4">
        <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
        <p className="text-neutral-400 text-sm italic mt-2">
          Run provided by <span className="text-white font-semibold">XuRenChao</span> (19/08/2025)
        </p>
        <YoutubeEmbed videoId="mx8ml6X_RZI" title="Dek'ril & Mek'ril - Adventure License - Stage 10 - 1 run clear (Auto) - by XuRenChao" />
      </div>
    </div>
  )
}
