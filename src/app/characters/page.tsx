import { Metadata } from 'next'
import CharactersPage from './CharactersPageClient'
import characters from '@/data/_allCharacters.json'
import type { Character } from '@/types/character'
import { toKebabCase } from '@/utils/formatText'
import { getMonthYear } from '@/utils/getMonthYear';

const monthYear = getMonthYear();

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: `Outerplane Characters – Full Database Updated ${monthYear} | Outerpedia`,
  description: `Explore all characters in Outerplane with detailed stats, skills, gear recommendations and exclusive equipment data. Updated ${monthYear}, curated by the EvaMains Discord community.`,
  keywords: ['Outerplane', 'Characters', 'Heroes', 'Character Database', 'Stats', 'Skills', 'Gear Recommendations', 'Exclusive Equipment', `${monthYear}`, 'EvaMains', 'Outerpedia'],
  alternates: {
    canonical: 'https://outerpedia.com/characters',
  },
  openGraph: {
    title: `Outerplane Characters – Full Database Updated ${monthYear} | Outerpedia`,
    description: `Discover all Outerplane heroes with detailed stats, skills, gear, and exclusive equipment. Updated ${monthYear} by the EvaMains Discord community.`,
    url: 'https://outerpedia.com/characters',
    type: 'website',
    images: [
      {
        url: 'https://outerpedia.com/images/ui/nav/CM_Lobby_Button_Character.png',
        width: 150,
        height: 150,
        alt: 'Outerpedia Character Collection',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: `Outerplane Characters – Updated ${monthYear} | Outerpedia`,
    description: `Full character database for Outerplane: stats, skills, gear, exclusive equipment. Updated ${monthYear} by EvaMains Discord.`,
    images: ['https://outerpedia.com/images/ui/nav/CM_Lobby_Button_Character.png'],
  },
}

export default function Page() {
  return (
    <main className="p-3">
      <script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "VideoGame",
      "name": "Outerplane",
      "url": "https://outerpedia.com/",
      "description":
        "Outerpedia is a fan-made encyclopedia for the mobile RPG Outerplane. Browse all characters, detailed stats, skills, gear recommendations and more.",
      "character": (characters as Character[]).map((char) => ({
        "@type": "VideoGameCharacter",
        "name": char.Fullname,
        "url": `https://outerpedia.com/characters/${toKebabCase(char.Fullname)}`,
        "image": `https://outerpedia.com/images/characters/full/IMG_${char.ID}.webp`,
        "description": `Element: ${char.Element} | Class: ${char.Class} | Subclass: ${char.SubClass}`,
      })),
    }),
  }}
/>

      <CharactersPage />
    </main>
  )
}