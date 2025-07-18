import type { Metadata } from 'next'
import TierListPage from './tierlistClient'
import characters from '@/data/_allCharacters.json' // fichier statique rassemblant tous les persos
import type { Character } from '@/types/character'
import { getMonthYear } from '@/utils/getMonthYear';

const monthYear = getMonthYear();

export const metadata: Metadata = {
  title: `Outerplane PvE Tier List – ${monthYear} Update | Outerpedia`,
  description: `Discover the best characters ranked for PvE in Outerplane. Updated for ${monthYear} , curated by the EvaMains Discord community.`,
  keywords: ['Outerplane', 'Tier List', 'Best Characters', `${monthYear} `, 'EvaMains', 'Outerpedia','PvE'],
  alternates: {
    canonical: 'https://outerpedia.com/tierlistpve',
  },
  openGraph: {
    title: `Outerplane PvE Tier List – ${monthYear} Update | Outerpedia`,
    description: `Latest Outerplane character PvE rankings as of ${monthYear} , curated by the EvaMains Discord community.`,
    url: 'https://outerpedia.com/tierlistpve',
    type: 'website',
    images: [
      {
        url: 'https://outerpedia.com/images/ui/nav/CM_Lobby_Button_Misson.png',
        width: 150,
        height: 150,
        alt: 'Outerpedia PvE Tier List',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: `Outerplane PvE Tier List – ${monthYear} | Outerpedia`,
    description: `Best Outerplane characters ranked for PvE – ${monthYear} update curated by EvaMains Discord.`,
    images: ['https://outerpedia.com/images/ui/nav/CM_Lobby_Button_Misson.png'],
  },
}

export default function TierListPageWrapper() {
  return <TierListPage characters={characters as Character[]} />
}
