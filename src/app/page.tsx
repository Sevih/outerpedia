// src/app/page.tsx
import Image from 'next/image'
import CurrentlyPullable from './components/CurrentlyPullable'
import DiscordBanner from './components/home/DiscordBanner'
import PromoCodes from './components/PromoCodes'
import NewToBox from './components/home/NewToBox'
import HowToPlayBox from './components/home/HowToPlayBox'
import RecentUpdates from './components/home/RecentUpdates'
import { getServerI18n } from '@/lib/contexts/server-i18n'
import { getTenantServer } from '@/tenants/tenant.server'

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Outerpedia",
    "url": "https://outerpedia.com",
    "description":
      "Outerpedia is a complete database for the mobile RPG Outerplane. Discover characters, gear builds, exclusive equipment, sets and more."
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Outerpedia",
    "url": "https://outerpedia.com",
    "logo": "https://outerpedia.com/images/icons/icon-192x192.png",
    "sameAs": ["https://discord.com/invite/keGhVQWsHv"],
    "description":
      "Fan-made wiki for Outerplane: tier list, character builds, equipment database and more."
  }
]

export default async function Home() {
  const { key: langKey } = await getTenantServer()
  const { t } = await getServerI18n(langKey)
  return (
    <>
      {/* HERO */}
      <div className="relative w-full rounded-xl overflow-hidden mb-2 min-h-[240px] md:min-h-[280px] bg-zinc-900">
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
          <h1 className="homepage-title homepage-title-responsive">
            {t('titles.main.main')}
          </h1>

          <p className="mt-2 text-gray-300 max-w-sm md:max-w-xl text-xs md:text-sm leading-snug md:leading-relaxed px-2">
            {t('titles.main.desc')}
          </p>
        </div>
      </div>

      {/* Intro text - hidden on mobile */}
      <section className="hidden md:block max-w-3xl mx-auto px-4 md:px-0 text-center text-sm text-gray-300 space-y-4 mb-8">
        <p dangerouslySetInnerHTML={{ __html: t('home.intro.1') }} />
        <p dangerouslySetInnerHTML={{ __html: t('home.intro.2') }} />
        <p dangerouslySetInnerHTML={{ __html: t('home.intro.3') }} />
      </section>

      {/* Corps principal */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 md:gap-8 px-4 md:px-16">
        {/* Colonne droite desktop / En premier sur mobile */}
        <div className="flex w-full flex-col gap-4 md:gap-6 md:w-2/5 md:order-2">
          <DiscordBanner />
          <CurrentlyPullable />
          <PromoCodes />
        </div>

        {/* Colonne gauche desktop / En second sur mobile */}
        <div className="flex flex-col gap-6 md:gap-8 w-full md:w-3/5 md:order-1">
          <section className="text-center space-y-4 md:space-y-6">
            <HowToPlayBox />
            <NewToBox />
          </section>
          <RecentUpdates />
        </div>
      </div>

      {/* SEO structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  )
}
