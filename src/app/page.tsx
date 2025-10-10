// src/app/page.tsx
import Image from 'next/image'
import Link from 'next/link'
import CurrentlyPullable from './components/CurrentlyPullable'
import PromoCodes from './components/PromoCodes'
// HomeClient reste pour la partie interactive, mais on ne lui passe plus lang
import HomeClient from './HomeClient'
import NewToBox from './components/home/NewToBox'
import CategoriesBox from './components/home/CategoriesBox'

export default async function Home() {
  return (
    <>


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
        {/* Colonne gauche */}
        <div className="flex flex-col gap-8 w-full md:w-3/5">
          <section className="text-center">
            <CategoriesBox />
            <div className="hidden md:block mt-6">
              <NewToBox />
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
