import './globals.css';
import type { Metadata, Viewport } from 'next';
import Header from './components/Header';
import Footer from './components/Footer';
import { Inter } from 'next/font/google';
import UpdateToast from './components/UpdateToast';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

// SEO fallback (servira si aucune page ne définit son propre <head>)
export const metadata: Metadata = {
  title: 'Outerpedia – Outerplane Wiki & Guide',
  description: 'Explore characters, builds, gear, tier lists and join our Discord community for Outerplane!',
  icons: {
    icon: '/favicon.ico',
    apple: '/images/icons/icon-192x192.png',
    shortcut: '/images/icons/icon-512x512.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Outerpedia – Outerplane Wiki & Guide',
    description: 'Explore characters, builds, gear, tier lists and join our Discord community for Outerplane!',
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
    title: 'Outerpedia – Outerplane Wiki & Guide',
    description: 'Explore characters, builds, gear, tier lists and join our Discord community for Outerplane!',
    images: ['https://outerpedia.com/images/ui/og_home.jpg'],
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
      <head suppressHydrationWarning />
      <body className={`${inter.className} text-white`}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 container mx-auto p-4">
            {children}
          </main>
          <Footer />
        </div>
        <UpdateToast />
      </body>
    </html>
  );
}
