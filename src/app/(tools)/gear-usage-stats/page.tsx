import type { Metadata } from 'next'
import rawData from '@/data/stats/gear-usage.json';
import GearUsageStatsClients from './gear-usage-statsClients';
import { getMonthYear } from '@/utils/getMonthYear';

type GearItem = {
  name: string;
  type: 'Weapon' | 'Amulet' | 'Set';
  class: string | null;
  count: number;
  characters: string[];
};

const data = rawData as GearItem[];

const monthYear = getMonthYear();

export const metadata: Metadata = {
  title: `Outerplane Gear Usage Statistics – ${monthYear} | Outerpedia`,
  description: `Discover the most recommended weapons, amulets and sets in Outerplane builds curated by the EvaMains Discord. Updated for ${monthYear}.`,
  keywords: ['Outerplane', 'Gear Stats', 'Gear Usage', 'Weapons', 'Amulets', 'Sets', 'EvaMains', 'Outerpedia'],
  alternates: {
    canonical: 'https://outerpedia.com/gear-usage-stats',
  },
  openGraph: {
    title: `Outerplane Gear Usage Statistics – ${monthYear} | Outerpedia`,
    description: `See which weapons, amulets and sets are most frequently recommended in builds curated by the EvaMains community. Updated for ${monthYear}.`,
    url: 'https://outerpedia.com/gear-usage-stats',
    type: 'website',
    images: [
      {
        url: 'https://outerpedia.com/images/ui/nav/CM_Lobby_Btn_StepUp.png',
        width: 150,
        height: 150,
        alt: 'Gear Usage Statistics – Outerpedia',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: `Outerplane Gear Usage – ${monthYear} | Outerpedia`,
    description: `Most used weapons, sets, and accessories in builds curated by EvaMains. Updated ${monthYear}.`,
    images: ['https://outerpedia.com/images/ui/nav/CM_Lobby_Btn_StepUp.png'],
  },
};


export default function Page() {
  return <GearUsageStatsClients data={data} />;
}
