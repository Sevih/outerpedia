// src/app/page.tsx
import Image from 'next/image'
import Link from 'next/link'
import WarningBanner from '@/app/components/WarningBanner'
import CurrentlyPullable from './components/CurrentlyPullable'
import PromoCodes from './components/PromoCodes'
// HomeClient reste pour la partie interactive, mais on ne lui passe plus lang
import HomeClient from './HomeClient'

const categories = [
  { name: 'Characters', path: '/characters' },
  { name: 'Equipments', path: '/equipments' },
  { name: 'Tier List', path: '/tierlist' },
  { name: 'Utilities', path: '/tools' },
  { name: 'Guides', path: '/guides' },
] as const

export default async function Home() {
  return (
    <>
      <WarningBanner />

      {/* HERO */}
      <div className="relative w-full rounded-xl overflow-hidden mb-8 min-h-[200px] md:min-h-[260px] bg-zinc-900">
        <Image
          src="/images/ui/og_home_no_text.webp"
          alt="Outerpedia - Outerplane Tier List, Characters & Gear"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-95"
        />
        {/* Overlay + Title */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3 py-4 md:px-6 md:py-8">
          <h1 className="
              relative text-white font-bold
              text-base sm:text-lg md:text-2xl lg:text-3xl
              px-3 py-1 md:px-4 md:py-2
              rounded-md
              bg-[url('/images/ui/CM_Desc_Bg.webp')] bg-cover bg-center
              overflow-hidden
              max-w-[95%] sm:max-w-[90%] lg:max-w-[80%]
              homepage-title homepage-title-responsive
            ">
            Outerplane Tier List, Character Builds, Guides & Database
            <span className="pointer-events-none absolute bottom-0 left-1/2 h-[10px] md:h-[12px] w-full -translate-x-1/2 bg-[url('/images/ui/CM_Result_Victory_Bg.webp')] bg-bottom bg-no-repeat bg-contain" />
          </h1>

          <p className="mt-2 text-gray-300 max-w-sm md:max-w-xl text-xs md:text-sm leading-snug md:leading-relaxed px-2">
            A fan-made wiki for Outerplane. Explore builds, gear, utilities, tier list, and strategy guides.
          </p>
        </div>
      </div>

      {/* Intro text */}
      <section className="max-w-3xl mx-auto px-4 md:px-0 text-center text-sm text-gray-400 space-y-4 mb-12">
        <p><strong>Outerpedia</strong> is a community-driven database for <strong>Outerplane</strong>, the strategic turn-based mobile RPG.</p>
        <p>Browse detailed <strong>character builds</strong>, <strong>gear effects</strong>, <strong>tier lists</strong>, <strong>utilities</strong>, and <strong>guides</strong> — all carefully curated by passionate players.</p>
        <p>Join our <Link href="https://discord.gg/keGhVQWsHv" className="underline text-cyan-400">community Discord</Link> to share team comps, ask questions, or theorycraft together.</p>
      </section>

      {/* Corps principal */}
      <div className="flex flex-col md:flex-row justify-between gap-8 px-4 md:px-16">
        {/* Colonne gauche : Categories + Beginner box */}
        <div className="flex flex-col gap-8 w-full md:w-3/5">
          <section className="text-center">
            <h2 className="text-2xl font-extrabold tracking-wide text-white mb-6 relative">
              <span className="relative z-10">Categories</span>
              <span className="absolute left-1/2 -bottom-1 h-1 w-24 -translate-x-1/2 rounded bg-cyan-600/70" />
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Discover categories to help you build teams, optimize gear, and master Outerplane content.
            </p>

            <ul className="grid grid-cols-2 lg:grid-cols-5 gap-6 place-items-center">
              {categories.map((cat) => {
                const iconMap: Record<(typeof categories)[number]['name'], string> = {
                  Characters: 'CM_Lobby_Button_Character.webp',
                  Equipments: 'CM_Lobby_Button_Inventory.webp',
                  'Tier List': 'CM_Lobby_Button_Misson.webp',
                  Utilities: 'CM_Agit_Facility.webp',
                  Guides: 'CM_Guild_Management.webp',
                }
                const icon = iconMap[cat.name]

                return (
                  <li key={cat.path} className="w-full max-w-[140px]">
                    <Link href={cat.path} aria-label={`Go to ${cat.name} page`}>
                      <div className="aspect-square cursor-pointer rounded-2xl bg-gray-800 p-4 shadow-lg transition-transform hover:scale-105 hover:bg-gray-700">
                        <div className="flex h-full w-full flex-col items-center justify-center">
                          <div className="relative h-[80px] w-[80px]">
                            <Image
                              src={`/images/ui/nav/${icon}`}
                              alt={`${cat.name} section - Outerplane`}
                              fill
                              sizes="80px"
                              className="mb-2 object-contain"
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
              <div className="rounded-xl border border-zinc-700 bg-gray-800 p-4 shadow-lg">
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">🧭 New to Outerplane?</h3>
                <p className="mb-4 text-sm text-gray-300">Start your journey with these beginner-friendly guides:</p>
                <ul className="space-y-2 text-sm text-cyan-400">
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
                <div className="mt-4 text-xs italic text-gray-400">Perfect for first-time players</div>
              </div>
            </div>
          </section>
        </div>

        {/* Colonne droite */}
        <div className="flex w-full flex-col gap-6 md:w-2/5">
          <CurrentlyPullable />
          <PromoCodes />
        </div>
        
      </div>
      <HomeClient />
    </>
  )
}
