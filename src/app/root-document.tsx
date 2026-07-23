import { Geist, Geist_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import { cssBackgroundVars } from '@/lib/images';
import type { Lang } from '@/lib/i18n/config';
import './globals.css';

// preload: false sur les SECONDAIRES seulement. Paybooc (police par défaut du
// site, cf. --font-sans) reste préchargée : elle est peinte above-the-fold sur
// chaque page, son préchargement est légitime — la dé-précharger flasherait le
// fallback à chaque premier rendu. Geist Sans n'est qu'un FALLBACK de Paybooc
// (peint seulement les glyphes qu'elle n'a pas) et Geist Mono ne sert que des
// bouts épars : préchargées, elles ne sont pas utilisées dans les ~3 s → Firefox
// avertit « préchargée … non utilisée ». Elles se chargent toujours à la
// découverte CSS ; `display: swap` couvre le rendu.
const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'], preload: false });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'], preload: false });
// Police PAR DÉFAUT du site (« jeu » — titres, nom du héros… ; même rendu que la
// V2). Préchargée : elle peint le corps de texte partout (LCP).
const paybooc = localFont({
  src: '../fonts/Paybooc-Bold.woff2',
  variable: '--font-game',
  weight: '700',
  display: 'swap',
});

/**
 * Coquille <html>/<body> COMMUNE aux layouts racine. Il y en a plusieurs
 * (pas de `app/layout.tsx`) : `[lang]/layout` pour le site public — c'est lui
 * qui sert le vrai `<html lang>` par langue, raison d'être de ce découpage —
 * et les outils locaux (`admin/`, `dev/`, dev-only) qui restent en `en`.
 * Ce composant garantit fonts, globals.css et fonds décoratifs identiques
 * partout ; toute nouvelle racine DOIT passer par lui.
 */
export function RootDocument({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  // Thème unique (sombre, apparence V2) — pas de provider de thème.
  return (
    <html
      lang={lang}
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
