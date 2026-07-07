import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import { getBaseUrl } from '@/lib/seo';
import { cssBackgroundVars } from '@/lib/images';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
// Font « jeu » (titres, nom du héros…) — même rendu que la V2.
const paybooc = localFont({
  src: '../fonts/Paybooc-Bold.woff2',
  variable: '--font-game',
  weight: '700',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: { default: 'Outerpedia', template: '%s | Outerpedia' },
  description: 'Community-driven wiki and database for Outerplane.',
  openGraph: { siteName: 'Outerpedia', type: 'website' },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Thème unique (sombre, apparence V2) — pas de provider de thème.
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${paybooc.variable}`}
      // Fonds décoratifs → base R2 (globals.css les lit en var — cf. cssBackgroundVars).
      style={cssBackgroundVars as React.CSSProperties}
    >
      <body className="antialiased">
        {children}
        <div id="portal-root" />
      </body>
    </html>
  );
}
