import type { Metadata } from 'next'
import TierListPage from '../tierlistClient'
import characters from '@/data/_allCharacters.json'
import type { Character } from '@/types/character'

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Outerplane Tier List – April 2025 Update | Outerpedia',
  description: 'Discover the best characters ranked in Outerplane. Updated for April 2025, curated by the EvaMains Discord community.',
  keywords: ['Outerplane', 'Tier List', 'Best Characters', 'April 2025', 'EvaMains', 'Outerpedia'],
  alternates: {
    canonical: 'https://outerpedia.com/tierlist',
  },
  openGraph: {
    title: 'Outerplane Tier List – April 2025 Update | Outerpedia',
    description: 'Latest Outerplane character rankings as of April 2025, curated by the EvaMains Discord community.',
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
    title: 'Outerplane Tier List – April 2025 | Outerpedia',
    description: 'Best Outerplane characters ranked – April 2025 update curated by EvaMains Discord.',
    images: ['https://outerpedia.com/images/ui/nav/CM_Lobby_Button_Misson.png'],
  },
}

export default async function TierListTabPage({ params }: { params: Promise<{ tab: string }> }) {
  const { tab } = await params;
  return <TierListPage characters={characters as Character[]} initialTab={tab} />
}
