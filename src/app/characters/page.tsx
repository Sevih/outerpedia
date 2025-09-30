// src/app/characters/page.tsx
import { type Metadata } from 'next'
import CharactersPage from './CharactersPageClient'
import characters from '@/data/_allCharacters.json'
import type { Character } from '@/types/character'
import { toKebabCase } from '@/utils/formatText'
import { getMonthYear } from '@/utils/getMonthYear'
import { getTenantServer } from '@/tenants/tenant.server'

const monthYear = getMonthYear()

// IMPORTANT: ne pas forcer le statique sur une page multi-tenant
// export const dynamic = 'force-static' // ❌
// (Optionnel) tu peux explicitement forcer dynamique si tu veux:
// export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const { domain } = await getTenantServer()
  const base = `https://${domain}`

  return {
    title: `Outerplane Characters – Full Database Updated ${monthYear} | Outerpedia`,
    description: `Explore all characters in Outerplane with detailed stats, skills, gear recommendations and exclusive equipment data. Updated ${monthYear}, curated by the EvaMains Discord community.`,
    keywords: [
      'Outerplane','Characters','Heroes','Character Database','Stats','Skills',
      'Gear Recommendations','Exclusive Equipment', `${monthYear}`,'EvaMains','Outerpedia',
    ],
    alternates: { canonical: `${base}/characters` },
    openGraph: {
      title: `Outerplane Characters – Full Database Updated ${monthYear} | Outerpedia`,
      description: `Discover all Outerplane heroes with detailed stats, skills, gear, and exclusive equipment. Updated ${monthYear} by the EvaMains Discord community.`,
      url: `${base}/characters`,
      type: 'website',
      images: [
        {
          url: `${base}/images/ui/nav/CM_Lobby_Button_Character.png`,
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
      images: [`${base}/images/ui/nav/CM_Lobby_Button_Character.png`],
    },
  }
}

export default async function Page() {
  const { domain } = await getTenantServer()
  const base = `https://${domain}`

  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD doit refléter le sous-domaine actuel
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'VideoGame',
            name: 'Outerplane',
            url: `${base}/`,
            description:
              'Outerpedia is a fan-made encyclopedia for the mobile RPG Outerplane. Browse all characters, detailed stats, skills, gear recommendations and more.',
            character: (characters as Character[]).map((char) => ({
              '@type': 'VideoGameCharacter',
              name: char.Fullname,
              url: `${base}/characters/${toKebabCase(char.Fullname)}`,
              image: `${base}/images/characters/full/IMG_${char.ID}.webp`,
              description: `Element: ${char.Element} | Class: ${char.Class} | Subclass: ${char.SubClass}`,
            })),
          }),
        }}
      />
      <div className="p-3">
        <CharactersPage />
      </div>
    </>
  )
}
