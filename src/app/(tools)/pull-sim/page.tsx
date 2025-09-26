import PullSimClient from './pullSimClient';
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: `Pull Simulator | Outerpedia`,
  description: `Simulate gacha pulls for all Outerplane banners. Test your luck on Rate Up, Premium, and Limited banners with the mileage system included.`,
  keywords: ['Outerplane','Pull Simulator','Gacha','Summon Simulator','Banner','Rate Up','Premium','Limited','Outerpedia'],
  alternates: { canonical: 'https://outerpedia.com/pull-sim' },
  openGraph: {
    title: `Pull Simulator | Outerpedia`,
    description: `Simulate gacha pulls for all Outerplane banners. Test your luck on Rate Up, Premium, and Limited banners with the mileage system included.`,
    siteName: 'Outerpedia',
    url: 'https://outerpedia.com/pull-sim',
    type: 'website',
    images: [{ 
      url: 'https://outerpedia.com/images/ui/nav/CM_Lobby_Button_Recruitment.webp', 
      width: 150, 
      height: 150, 
      alt: 'Pull Simulator – Outerpedia' 
    }],
  },
  twitter: {
    card: 'summary',
    title: `Pull Simulator | Outerpedia`,
    description: `Simulate gacha pulls for all Outerplane banners. Test your luck on Rate Up, Premium, and Limited banners with the mileage system included.`,
    images: ['https://outerpedia.com/images/ui/nav/CM_Lobby_Button_Recruitment.webp'],
  },
}

export default function Page() {
  return <PullSimClient />;
}
