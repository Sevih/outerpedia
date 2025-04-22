// src/app/page.tsx
import HomeClient from './HomeClient'

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
  return <HomeClient />
}
