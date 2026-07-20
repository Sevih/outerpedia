import type { MetadataRoute } from 'next';

/**
 * Manifest PWA : rend le site INSTALLABLE (icône dédiée, fenêtre standalone) —
 * sans service worker, dont Chrome n'exige plus pour l'installation. Servi sur
 * `/manifest.webmanifest`, chemin nommément autorisé par le garde anti-points
 * du proxy i18n (cf. src/proxy.ts). Les icônes vivent sous `/icons/` pour la
 * même raison (préfixe autorisé — cf. `metadata.icons` de layout.tsx).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Outerpedia',
    short_name: 'Outerpedia',
    description: 'Community-driven wiki and database for Outerplane.',
    start_url: '/',
    display: 'standalone',
    // --surface-base de globals.css : fond de la fenêtre au lancement.
    background_color: '#0b1120',
    theme_color: '#0b1120',
    icons: [
      { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
