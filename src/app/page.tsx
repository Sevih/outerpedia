// src/app/page.tsx
import HomeClient from './HomeClient'
import CurrentlyPullable from './components/CurrentlyPullable'
import WarningBanner from "@/app/components/WarningBanner"
import Image from 'next/image'

export const metadata = {
  title: 'Outerpedia – Outerplane Wiki & Guide',
  description: 'Explore characters, builds, gear and tier lists for Outerplane. The ultimate companion wiki for players.',
  alternates: {
    canonical: 'https://outerpedia.com/',
  },
  openGraph: {
    title: 'Outerpedia – Outerplane Wiki & Guide',
    description: 'Explore characters, builds, gear and tier lists for Outerplane.',
    url: 'https://outerpedia.com/',
    type: 'website',
    siteName: 'Outerpedia',
    images: [
      {
        url: 'https://outerpedia.com/images/ui/og_home.jpg',
        width: 1200,
        height: 630,
        alt: 'Outerpedia homepage preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Outerpedia – Outerplane Wiki & Guide',
    description: 'Explore characters, builds, gear and tier lists for Outerplane.',
    images: ['https://outerpedia.com/images/ui/og_home.jpg'],
  },
};
export default function Home() {
  return (
    <>
      <WarningBanner />

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-12 px-4 md:px-16">
        {/* OG Image à gauche */}
        <div className="h-[340px] w-auto max-w-full rounded-xl overflow-hidden">
          <Image
            src="/images/ui/og_home_long.jpg"
            alt="Outerpedia OG"
            width={600}
            height={340}
            className="h-full object-contain"
            priority
          />
        </div>

        {/* Cartes Currently Pullable à droite, alignées à droite */}
          <CurrentlyPullable />
        </div>

      <HomeClient />
    </>
  )
}
