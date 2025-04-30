import type { Metadata } from 'next'
import eeData from '@/data/ee.json'
import EeTierClient from './eeTierClient'

export const metadata: Metadata = {
  title: 'Exclusive Equipment Priority – Outerpedia',
  description: 'A ranking of exclusive equipment (EE) based on their usefulness and impact. Curated by the community.',
  alternates: {
    canonical: 'https://outerpedia.com/ee-priority',
  },
  openGraph: {
    title: 'Exclusive Equipment Priority – Outerpedia',
    description: 'A ranking of exclusive equipment (EE) based on their usefulness and impact. Curated by the community.',
    url: 'https://outerpedia.com/ee-priority',
    siteName: 'Outerpedia',
    type: 'website',
    images: [
      {
        url: 'https://outerpedia.com/images/ui/nav/CM_Lobby_Button_Shop.webp',
        width: 1200,
        height: 630,
        alt: 'Exclusive Equipment Priority – Outerpedia',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Exclusive Equipment Priority – Outerpedia',
    description: 'A ranking of exclusive equipment (EE) based on their usefulness and impact. Curated by the community.',
    images: ['https://outerpedia.com/images/ui/nav/CM_Lobby_Button_Shop.webp'],
  },
}

export default function EeTierPage() {
  return <EeTierClient equipments={eeData} />
}
