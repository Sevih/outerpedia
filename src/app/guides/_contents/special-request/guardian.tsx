'use client'

import RecommendedTeam from '@/app/components/RecommendedTeamCarousel'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'

const teamSetup = [
  ['Veronica', 'Lyla', 'Ritri', 'Mene', 'Monad Eva'],
  ['Tamara', 'Valentine'],
  ['Poolside Trickster Regina', 'Beth','Rin',  'Demiurge Astei'],
  ['Laplace', 'Edelweiss', 'Fatal', 'Demiurge Stella','Luna','Roxie','Caren','Marian']
]

export default function MasterlessGuide() {
  return (
    <div>
      <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Strategy Overview</h3>
      <p className="mb-4 text-neutral-300">
        This boss is all about applying debuffs and managing his minions.
      </p>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li>All three of the boss&#39;s skills remove 2 debuffs and decrease the cooldown of his Ultimate.</li>
        <li>If he has <strong>zero debuffs</strong> when using his Ult, the damage is massively increased, likely wiping your entire team.</li>
        <li>Keeping <strong>at least one debuff</strong> on him significantly nerfs his Ult and allows WG break to function.</li>
        <li>When he has no debuffs, <strong>his WG cannot be reduced</strong>.</li>
        <li>He also spawns minions with S1 and S2. Each one that moves gives him <strong>+20% priority</strong>.</li>
        <li>Bring <strong>ample AoE skills</strong> to clear the minions quickly.</li>
        <li>The core loop: upkeep debuffs → clear minions → break WG → burst during break.</li>
        <li>His DEF is relatively low, so <strong>bursting him during Break</strong> is effective.</li>
      </ul>

      <hr className="my-6 border-neutral-700" />
      <RecommendedTeam team={teamSetup} />
      <hr className="my-6 border-neutral-700" />

      <div className="mb-4">
        <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
        <p className="mb-2 text-neutral-300">
        <YoutubeEmbed videoId="bAoBcUW9h7k" title='combat footage'/>
        </p>
      </div>
    </div>
  )
}
