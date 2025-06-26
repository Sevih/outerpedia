import HomeClient from './HomeClient'
import CurrentlyPullable from './components/CurrentlyPullable'
import WarningBanner from "@/app/components/WarningBanner"
import Image from 'next/image'
import Link from 'next/link'
import PromoCodes from './components/PromoCodes'

const categories = [
  { name: 'Characters', path: '/characters' },
  { name: 'Equipments', path: '/equipments' },
  { name: 'Tier List', path: '/tierlist' },
  { name: 'Tools', path: '/tools' },
  { name: 'Guides', path: '/guides' },
]

export default function Home() {
  return (
    <>
      <WarningBanner />

      <div className="relative w-full bg-zinc-900 rounded-xl overflow-hidden mb-8 min-h-[160px] md:min-h-[220px]">
        <Image
          src="/images/ui/og_home_no_text.webp"
          alt="Outerpedia - Outerplane Tier List, Characters & Gear"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2 py-4 md:px-4 md:py-6">
          <h1
            className="
        relative text-white font-bold
        text-base sm:text-lg md:text-2xl lg:text-3xl
        px-3 py-1 md:px-4 md:py-2
        rounded-md
        bg-[url('/images/ui/CM_Desc_Bg.webp')] bg-cover bg-center
        overflow-hidden
        max-w-[95%] sm:max-w-[90%] lg:max-w-[80%]
        homepage-title homepage-title-responsive
      "
          >
            Outerplane Tier List, Character Builds, Guides & Database
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-[8px] md:h-[12px] bg-[url('/images/ui/CM_Result_Victory_Bg.webp')] bg-no-repeat bg-bottom bg-contain pointer-events-none"></span>
          </h1>

          <p className="mt-2 text-gray-300 max-w-sm md:max-w-xl text-xs md:text-sm leading-snug md:leading-relaxed px-2">
            A fan-made wiki for Outerplane. Explore builds, gear, tools, tier list, and strategy guides.
          </p>
        </div>
      </div>


      {/* Section en dehors, après la bannière */}
      <section className="max-w-3xl mx-auto px-4 md:px-0 text-center text-sm text-gray-400 space-y-4 mb-12">
        <p>
          <strong>Outerpedia</strong> is a community-driven database for <strong>Outerplane</strong>, the strategic turn-based mobile RPG.
        </p>
        <p>
          Browse detailed <strong>character builds</strong>, <strong>gear effects</strong>, <strong>tier lists</strong>, <strong>tools</strong>, and <strong>guides</strong> — all carefully curated by passionate players.
        </p>
        <p>
          Join our <Link href="https://discord.gg/keGhVQWsHv" className="underline text-cyan-400">community Discord</Link> to share team comps, ask questions, or theorycraft together.
        </p>
      </section>


      {/* === CORPS PRINCIPAL === */}
      <div className="flex flex-col md:flex-row justify-between gap-8 px-4 md:px-16">
        {/* Colonne gauche : Categories */}
        <div className="flex flex-col gap-8 w-full md:w-3/5">
          <section className="text-center">
            <h2 className="text-2xl font-extrabold tracking-wide text-white mb-6 relative">
              <span className="z-10 relative">Categories</span>
              <span className="absolute left-1/2 transform -translate-x-1/2 -bottom-1 w-24 h-1 bg-cyan-600 opacity-70 rounded" />
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Discover categories to help you build teams, optimize gear, and master Outerplane content.
            </p>

            <ul className="grid grid-cols-2 lg:grid-cols-5 gap-6 place-items-center">
              {categories.map((cat) => {
                const iconMap: Record<string, string> = {
                  Characters: 'CM_Lobby_Button_Character.webp',
                  Equipments: 'CM_Lobby_Button_Inventory.webp',
                  'Tier List': 'CM_Lobby_Button_Misson.webp',
                  Tools: 'CM_Agit_Facility.webp',
                  Guides: 'CM_Guild_Management.webp',
                }

                const icon = iconMap[cat.name] || ''

                return (
                  <li key={cat.path} className="w-full max-w-[140px]">
                    <Link href={cat.path} aria-label={`Go to ${cat.name} page`}>
                      <div className="flex flex-col items-center bg-gray-800 hover:bg-gray-700 p-4 rounded-2xl shadow-lg transition-transform transform hover:scale-105 cursor-pointer aspect-square">
                        <div className="w-full h-full flex flex-col justify-center items-center">
                          <div className="relative w-[80px] h-[80px]">
                            <Image
                              src={`/images/ui/nav/${icon}`}
                              alt={`${cat.name} section - Outerplane`}
                              fill
                              className="object-contain mb-2"
                              sizes="80px"
                            />
                          </div>
                          <span className="text-md font-semibold text-white">{cat.name}</span>
                        </div>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
            <div className="hidden md:block mt-6">
              <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-zinc-700">
                <h3 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
                  🧭 New to Outerplane?
                </h3>

                <p className="text-sm text-gray-300 mb-4">
                  Start your journey with these beginner-friendly guides:
                </p>

                <ul className="text-sm text-cyan-400 space-y-2">
                  <li>
                    <Link href="/guides/general-guides/free-heroes-start-banner" className="hover:underline">
                      • <span className="text-white">Free Heroes & Starter Banners</span> — who to pull and how to start efficiently.
                    </Link>
                  </li>
                  <li>
                    <Link href="/guides/general-guides/stats" className="hover:underline">
                      • <span className="text-white">Statistics & Combat Basics</span> — understand stats and how combat works.
                    </Link>
                  </li>
                  <li>
                    <Link href="/guides/general-guides/gear" className="hover:underline">
                      • <span className="text-white">Gear</span> — how equipment works and how to upgrade it.
                    </Link>
                  </li>
                  <li>
                    <Link href="/guides/general-guides/heroes-growth" className="hover:underline">
                      • <span className="text-white">Hero Growth</span> — leveling, transcendence, trust, and more.
                    </Link>
                  </li>
                </ul>

                <div className="text-xs text-gray-400 italic mt-4">Perfect for first-time players</div>
              </div>
            </div>


          </section>
        </div>

        {/* Colonne droite : Currently Pullable + PromoCodes */}
        <div className="flex flex-col gap-6 w-full md:w-2/5">
          <CurrentlyPullable />
          <PromoCodes />
        </div>
      </div>

      <HomeClient />
    </>
  )
}
