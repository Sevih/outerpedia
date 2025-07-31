import type { Metadata } from 'next'
import type { CharacterLite } from '@/types/character'
import charactersData from '@/data/_allCharacters.json'
import { getMonthYear } from '@/utils/getMonthYear';
import TierListBase from '@/app/components/TierListBase'
import { toKebabCase } from '@/utils/formatText'
import { Suspense } from 'react'

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



export default function PvETierList() {
  const characters = charactersData as CharacterLite[]
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Outerplane PvE Tier List – ${monthYear}`,
    "url": "https://outerpedia.com/tools/tierlistpve",
    "description": `Discover the best characters in Outerplane sorted by DPS, Support, and Sustain roles. PvE Tier list curated by the EvaMains community.`,
    "itemListElement": characters.map((char, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://outerpedia.com/characters/${toKebabCase(char.Fullname)}`,
      "name": char.Fullname,
      "image": `https://outerpedia.com/images/characters/portrait/CT_${char.ID}.webp`,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Suspense fallback={<div>Loading...</div>}>
        <TierListBase characters={characters} mode="pve" />
      </Suspense>
    </>
  )
}