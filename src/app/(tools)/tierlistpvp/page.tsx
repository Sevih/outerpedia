import type { Metadata } from 'next'
import type { CharacterLite } from '@/types/character'
import charactersData from '@/data/_allCharacters.json'
import { getMonthYear } from '@/utils/getMonthYear';
import TierListBase from '@/app/components/TierListBase'
import { Suspense } from 'react'

const monthYear = getMonthYear();

export const metadata: Metadata = {
  title: `Outerplane PvP Tier List – ${monthYear} Update | Outerpedia`,
  description: `Discover the best characters ranked for PvP in Outerplane. Updated for ${monthYear}, curated by the EvaMains Discord community.`,
  keywords: ['Outerplane', 'Tier List', 'Best Characters', `${monthYear}`, 'EvaMains', 'Outerpedia','PvP'],
  alternates: {
    canonical: 'https://outerpedia.com/tierlistpvp',
  },
  openGraph: {
    title: `Outerplane PvP Tier List – ${monthYear} Update | Outerpedia`,
    description: `Latest Outerplane character PvP rankings as of ${monthYear}, curated by the EvaMains Discord community.`,
    url: 'https://outerpedia.com/tierlistpvp',
    type: 'website',
    images: [
      {
        url: 'https://outerpedia.com/images/ui/nav/CM_Lobby_Button_Misson.png',
        width: 150,
        height: 150,
        alt: 'Outerpedia PvP Tier List',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: `Outerplane PvP Tier List – ${monthYear} | Outerpedia`,
    description: `Best Outerplane characters ranked for PvP  – ${monthYear} update curated by EvaMains Discord.`,
    images: ['https://outerpedia.com/images/ui/nav/CM_Lobby_Button_Misson.png'],
  },
}

export default function PvPTierList() {
  const characters = charactersData as CharacterLite[]

  return (
    <Suspense fallback={<div>Loading Tier List...</div>}>
      <TierListBase characters={characters} mode="pvp" />
    </Suspense>
  )
}

