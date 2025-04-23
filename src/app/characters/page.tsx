// ✅ pas de "use client" ici
import { Metadata } from 'next'
import CharactersPage from './CharactersPageClient'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Heroes Collection – Outerpedia',
  description: 'Browse all characters in Outerplane. View detailed stats, skills, gear recommendations and more.',
  keywords: ['Outerplane', 'Characters', 'Heroes', 'Stats', 'Outerpedia'],
  alternates: {
    canonical: 'https://outerpedia.com/characters',
  },
  openGraph: {
    title: 'Heroes Collection – Outerpedia',
    description: 'Browse all characters in Outerplane.',
    url: 'https://outerpedia.com/characters',
    type: 'website',
    images: [
      {
        url: 'https://outerpedia.com/images/ui/nav/IG_Turn_CM_Lobby_Button_Character.png',
        width: 150,
        height: 150,
        alt: 'Outerpedia Character Collection',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Heroes Collection – Outerpedia',
    description: 'Browse all characters in Outerplane.',
    images: ['https://outerpedia.com/images/ui/nav/IG_Turn_CM_Lobby_Button_Character.png'],
  },
}

export default function Page() {
  return <CharactersPage />
}
