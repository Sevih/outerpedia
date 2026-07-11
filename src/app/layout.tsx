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
  /*
   * Icônes DÉCLARÉES, pas devinées.
   *
   * La convention de fichier de l'app router (`src/app/apple-icon.png`) émettait
   * bien son `<link rel="apple-touch-icon">`, mais l'URL renvoyait 404 — en dev
   * comme en prod. La cause n'est pas Next : c'est notre proxy i18n, qui 404 tout
   * chemin contenant un point (garde-fou anti-sondes de bots, cf. proxy.ts).
   * `favicon.ico` n'y survit que parce que le `matcher` du proxy l'exclut nommément.
   *
   * D'où `/icons/…` : un préfixe que le proxy laisse déjà passer, et `public/` est
   * copié tel quel dans l'image Docker. Toute icône ajoutée doit vivre là.
   */
  icons: { apple: '/icons/apple-touch-icon.png' },
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
