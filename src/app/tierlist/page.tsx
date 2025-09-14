import type { Metadata } from 'next'
import { getMonthYear } from '@/utils/getMonthYear'
import { TierListGlowCard } from '@/app/components/TierListGlowCard'

const monthYear = getMonthYear()

export const metadata: Metadata = {
  title: `Outerplane Tier List – ${monthYear} Update | Outerpedia`,
  description: `Discover the best characters ranked in Outerplane. Updated for ${monthYear}, curated by the EvaMains Discord community.`,
  keywords: [
    'Outerplane',
    'Tier List',
    'Best Characters',
    `${monthYear}`,
    'EvaMains',
    'Outerpedia',
    'PvE ranking',
    'PvP ranking',
    'character builds'
  ],
  alternates: {
    canonical: 'https://outerpedia.com/tierlist',
  },
  openGraph: {
    title: `Outerplane Tier List – ${monthYear} Update | Outerpedia`,
    description: `Latest Outerplane character rankings as of ${monthYear}, curated by the EvaMains Discord community.`,
    url: 'https://outerpedia.com/tierlist',
    type: 'website',
    images: [
      {
        url: 'https://outerpedia.com/images/ui/nav/CM_Lobby_Button_Misson.png',
        width: 150,
        height: 150,
        alt: 'Outerpedia Tier List',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: `Outerplane Tier List – ${monthYear} | Outerpedia`,
    description: `Best Outerplane characters ranked – ${monthYear} update curated by EvaMains Discord.`,
    images: ['https://outerpedia.com/images/ui/nav/CM_Lobby_Button_Misson.png'],
  },
}

export default function TierListPageWrapper() {
  return (
    <main className="flex flex-col items-center justify-center py-12 px-4 gap-10">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-white">
        Outerplane Tier List
      </h1>
      <p className="text-gray-400 text-center max-w-2xl">
        Choose between PvE and PvP character rankings. Based on evaluations with 6★ transcends and level 0 EE effects.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <TierListGlowCard
          href="/tierlistpve"
          title="Tier List – PvE"
          description="PvE performance rankings across all content."
          image="/images/ui/nav/pve.png"
          type="pve"
        />
        <TierListGlowCard
          href="/tierlistpvp"
          title="Tier List – PvP"
          description="Performance-based Arena evaluation."
          image="/images/ui/nav/pvp.webp"
          type="pvp"
        />
      </div>
    </main>
  )
}