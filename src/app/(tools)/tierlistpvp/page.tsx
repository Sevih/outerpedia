import type { Metadata } from 'next'
import TierListPage from './tierlistClient'
import characters from '@/data/_allCharacters.json' // fichier statique rassemblant tous les persos
import type { Character } from '@/types/character'
import { getMonthYear } from '@/utils/getMonthYear';

const monthYear = getMonthYear();

export const metadata: Metadata = {
  title: `Outerplane PvP Tier List – ${monthYear} Update | Outerpedia`,
  description: `Discover the best characters ranked in Outerplane. Updated for ${monthYear}, curated by the EvaMains Discord community.`,
  keywords: ['Outerplane', 'Tier List', 'Best Characters', `${monthYear}`, 'EvaMains', 'Outerpedia'],
  alternates: {
    canonical: 'https://outerpedia.com/tierlistpvp',
  },
  openGraph: {
    title: `Outerplane PvP Tier List – ${monthYear} Update | Outerpedia`,
    description: `Latest Outerplane character rankings as of ${monthYear}, curated by the EvaMains Discord community.`,
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
    description: `Best Outerplane characters ranked – ${monthYear} update curated by EvaMains Discord.`,
    images: ['https://outerpedia.com/images/ui/nav/CM_Lobby_Button_Misson.png'],
  },
}

export default function TierListPageWrapper() {
  return <TierListPage characters={characters as Character[]} />
}
