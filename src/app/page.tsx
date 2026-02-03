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
      <div className="relative w-full rounded-xl overflow-hidden mb-2 aspect-[21/9] max-h-[100px] md:max-h-[320px]">
        <Image
          src="/images/outerpedia_2k_21-9.webp"
          alt="Outerpedia - Outerplane Tier List, Characters & Gear"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* SEO h1 - visually hidden */}
        <h1 className="sr-only">{t('titles.main.main')}</h1>
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
