import type { Metadata } from 'next'
import eeData from '@/data/ee.json'
import TierListBase from '@/app/components/TierListBase'
import { Suspense } from 'react'

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
        width: 150,
        height: 150,
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
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TierListBase equipments={eeData} mode="ee0" />
    </Suspense>
  )
}