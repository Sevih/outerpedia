import type { Metadata } from 'next'
import TierListPage from '../tierlistClient'
import characters from '@/data/_allCharacters.json'
import type { Character } from '@/types/character'
import { getMonthYear } from '@/utils/getMonthYear';

export const dynamic = 'force-static';

const monthYear = getMonthYear();

export const metadata: Metadata = {
  title: `Outerplane PvE Tier List – ${monthYear} Update | Outerpedia`,
  description: `Discover the best characters ranked in Outerplane. Updated for ${monthYear}, curated by the EvaMains Discord community.`,
  keywords: ['Outerplane', 'Tier List', 'Best Characters', `${monthYear}`, 'EvaMains', 'Outerpedia'],
  alternates: {
    canonical: 'https://outerpedia.com/tierlistpve',
  },
  openGraph: {
    title: `Outerplane PvE Tier List – ${monthYear} Update | Outerpedia`,
    description: `Latest Outerplane character rankings as of ${monthYear}, curated by the EvaMains Discord community.`,
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
    description: `Best Outerplane characters ranked – ${monthYear} update curated by EvaMains Discord.`,
    images: ['https://outerpedia.com/images/ui/nav/CM_Lobby_Button_Misson.png'],
  },
}

export default async function TierListTabPage({ params }: { params: Promise<{ tab: string }> }) {
  const { tab } = await params;
  return <TierListPage characters={characters as Character[]} initialTab={tab} />
}
