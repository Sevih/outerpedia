import './globals.css';
import type { Metadata, Viewport } from 'next';
import Header from './components/Header';
import Footer from './components/Footer';
import { Inter } from 'next/font/google';
import UpdateToast from './components/UpdateToast';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

// SEO fallback (servira si aucune page ne définit son propre <head>)
export const metadata: Metadata = {
  title: 'Outerplane Tier List, Character Builds, Guides & Database – Outerpedia',
  description:
    'Outerpedia is your go-to wiki for Outerplane: browse character builds, tier lists, utilities, guides and strategy content.',
  icons: {
    icon: '/favicon.ico',
    apple: '/images/icons/icon-192x192.png',
    shortcut: '/images/icons/icon-512x512.png',
  },
  manifest: '/manifest.json',
  keywords: [
    'outerplane',
    'outerpedia',
    'outerplane wiki',
    'outerplane guide',
    'outerplane tier list',
    'character builds',
    'gear usage statistics',
    'gear usage finder',
    'mobile rpg database',
    'turn-based rpg',
    'outerplane builds',
    'outerplane exclusive equipment',
    'outerplane gear sets',
    'outerplane coupon',
    'outerplane code',
  ],

  openGraph: {
    title: 'Outerpedia – Outerplane Tier List, Builds & Equipment Database',
    description:
      'Discover characters, builds, utilities and strategy guides for Outerplane. All data organized, searchable, and community-maintained.',
    url: 'https://outerpedia.com/',
    type: 'website',
    siteName: 'Outerpedia',
    images: [
      {
        url: 'https://outerpedia.com/images/ui/og_home.jpg',
        width: 1200,
        height: 630,
        alt: 'Outerpedia Home Banner',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Outerplane Tier List, Character Builds, Guides & Database – Outerpedia',
    description:
      'Browse character builds, tier lists, gear effects, utilities and strategy guides for Outerplane. All in one clean and fast site.',
    images: ['https://outerpedia.com/images/ui/og_home.jpg'],
  },
  alternates: {
    canonical: 'https://outerpedia.com/',
  },
};


// Mobile viewport + couleur de barre
export const viewport: Viewport = {
  themeColor: '#0891b2',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head suppressHydrationWarning>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon-precomposed" href="/apple-touch-icon-precomposed.png" />
        {/* ⚡ Preload Hero image pour LCP */}
        <link rel="preload" as="image" href="/images/ui/og_home_no_text.webp" />
      </head>

      <body className={`${inter.className} text-white`}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 w-full max-w-none mx-auto p-3 md:p-4">
            {children}
          </main>
          <Footer />
        </div>
        <UpdateToast />
      </body>
    </html>
  );
}

