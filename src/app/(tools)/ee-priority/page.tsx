import type { Metadata } from 'next'
import eeData from '@/data/ee.json'
import TierListBase from '@/app/components/TierListBase'
import charactersData from '@/data/_allCharacters.json'
import { toKebabCase } from '@/utils/formatText'
import type { Character } from '@/types/character'
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

const characterMap = Object.fromEntries(
  (charactersData as Character[]).map((c) => [toKebabCase(c.Fullname), c])
)

export default function EePriorityPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Exclusive Equipment Priority (+0)",
    "url": "https://outerpedia.com/tools/ee-priority",
    "description": "Exclusive Equipment Priority based on level 0 base effects only, for optimal unlock order.",
    "itemListElement": Object.entries(eeData).map(([slug, ee], index) => {
      const char = characterMap[slug]
      return char
        ? {
            "@type": "ListItem",
            "position": index + 1,
            "url": `https://outerpedia.com/characters/${slug}`,
            "name": ee.name,
            "image": `https://outerpedia.com/images/characters/portrait/CT_${char.ID}.webp`,
            "description": ee.effect,
          }
        : null
    }).filter(Boolean),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Suspense fallback={<div>Loading...</div>}>
        <TierListBase equipments={eeData} mode="ee0" />
      </Suspense>
    </>
  )
}