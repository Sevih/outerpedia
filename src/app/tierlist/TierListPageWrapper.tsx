import Link from 'next/link'
import Image from 'next/image'

export default function TierListPageWrapper() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-4 gap-10">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-white">
        Outerplane Tier List
      </h1>
      <p className="text-gray-400 text-center max-w-2xl">
        Choose between PvE and PvP character rankings. Both are based on evaluations at 6★ transcends and level 0 Exclusive Equipment effects.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <Link
          href="/tools/tierlist-pve"
          className="bg-gray-800 hover:bg-gray-700 rounded-xl shadow-lg transition duration-200 p-6 flex flex-col items-center text-center gap-4"
        >
          <Image
            src="/images/ui/nav/CM_Lobby_Button_Misson.png"
            alt="Tier List PvE"
            width={80}
            height={80}
          />
          <h2 className="text-xl font-semibold text-white">Tier List – PvE</h2>
          <p className="text-gray-400 text-sm">
            Explore the best units for campaign, bosses, and farming content.
          </p>
        </Link>

        <Link
          href="/tools/tierlist-pvp"
          className="bg-gray-800 hover:bg-gray-700 rounded-xl shadow-lg transition duration-200 p-6 flex flex-col items-center text-center gap-4"
        >
          <Image
            src="/images/ui/nav/CM_PVP_Battle_Support.webp"
            alt="Tier List PvP"
            width={80}
            height={80}
          />
          <h2 className="text-xl font-semibold text-white">Tier List – PvP</h2>
          <p className="text-gray-400 text-sm">
            See who dominates in the Arena with high-transcend builds.
          </p>
        </Link>
      </div>
    </main>
  )
}
