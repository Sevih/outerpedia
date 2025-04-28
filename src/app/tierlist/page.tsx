import type { Metadata } from 'next'
import TierListPage from './tierlistClient'
import characters from '@/data/_allCharacters.json' // fichier statique rassemblant tous les persos
import type { Character } from '@/types/character'

export const metadata: Metadata = {
  title: 'Tier List – Outerpedia',
  description: 'Browse the best characters in Outerplane.',
  keywords: ['Outerplane', 'Tier List', 'Characters'],
  alternates: {
    canonical: 'https://outerpedia.com/tierlist',
  },
  openGraph: {
    title: 'Tier List – Outerpedia',
    description: 'Best characters ranked.',
    url: 'https://outerpedia.com/tierlist',
    type: 'website',
    images: [
      {
        url: 'https://outerpedia.com/images/ui/nav/CM_Lobby_Button_Inventory.png',
        width: 150,
        height: 150,
        alt: 'Outerpedia Tier List',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Tier List – Outerpedia',
    description: 'Outerplane Tier List.',
    images: ['https://outerpedia.com/images/ui/nav/CM_Lobby_Button_Inventory.png'],
  },
}

export default function TierListPageWrapper() {
  return <TierListPage characters={characters as Character[]} />
}
