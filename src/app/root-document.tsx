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
// Police PAR DÉFAUT du site (« jeu » — titres, nom du héros… ; rendu inchangé
// depuis l'ancien site). Préchargée : elle peint le corps de texte partout (LCP).
const paybooc = localFont({
  src: '../fonts/Paybooc-Bold.woff2',
  variable: '--font-game',
  weight: '700',
  display: 'swap',
});
// Les DEUX polices que le portrait du jeu utilise (`src/components/character/
// Portrait`), résolues en suivant le `m_PathID` de leur `m_Font` jusqu'au bundle
// `font2` puis converties en woff2 : le nom et le niveau prennent l'asset
// `NotoSans_Bold`, le titre l'asset `NotoSans_Regular`. L'ÉTIQUETTE MENT — leur
// table `name` dit SUIT ExtraBold (800) et SUIT Bold (700), une famille coréenne
// de Sunn. Les graisses déclarées ici sont donc les VRAIES, et les fichiers
// portent le vrai nom (cf. datagen/assets/extract-font-metrics.py).
// Elles ne servent QUE au portrait, d'où `preload: false` : déclarer la
// @font-face ne télécharge rien tant qu'aucun élément ne réclame la famille.
const suitExtraBold = localFont({
  src: '../fonts/SUIT-ExtraBold.woff2',
  variable: '--font-portrait-name',
  weight: '800',
  display: 'swap',
  preload: false,
});
const suitBold = localFont({
  src: '../fonts/SUIT-Bold.woff2',
  variable: '--font-portrait-demi',
  weight: '700',
  display: 'swap',
  preload: false,
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
  // Thème unique (sombre, apparence historique) — pas de provider de thème.
  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} ${paybooc.variable} ${suitExtraBold.variable} ${suitBold.variable}`}
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
