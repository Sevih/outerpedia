import type { NextConfig } from 'next';
import { readFileSync } from 'fs';

// Version from package.json — single source of truth, exposed to the client.
const { version } = JSON.parse(readFileSync('./package.json', 'utf-8'));

// Security headers (ported from V2 — proven config).
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://cloudflareinsights.com",
      "media-src 'self' https://*.youtube.com https://cdn.discordapp.com",
      "frame-src 'self' https://*.youtube.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      'upgrade-insecure-requests',
    ].join('; '),
  },
];

// Pages/routes suffixées `.dev.*` ne sont reconnues qu'en développement →
// l'admin local n'est PAS buildé en prod (ni son code, ni le runtime datagen
// qu'il importe). Voir src/app/admin/*.dev.tsx.
// PIÈGE, à ne pas réintroduire : ce `pageExtensions` personnalisé CASSE les
// fichiers de métadonnées statiques de l'app router (`apple-icon.png`,
// `opengraph-image.png`…). Next les détecte assez pour émettre le
// `<link rel="apple-touch-icon">` dans le <head>, mais ne génère jamais la route
// qui les sert : le lien pointait sur un 404, en dev comme en prod. Ajouter
// « png » à cette liste ne répare rien — ça ne fait que changer la forme de
// l'URL déclarée, qui reste morte. `favicon.ico` y échappe (Next le traite à
// part). D'où les icônes servies depuis `public/`, déclarées à la main dans
// `metadata.icons` (src/app/layout.tsx) : plus aucune convention magique.
const isDev = process.env.NODE_ENV !== 'production';
const base = ['tsx', 'ts', 'jsx', 'js'];
const pageExtensions = isDev ? [...base.map((e) => `dev.${e}`), ...base] : base;

const nextConfig: NextConfig = {
  // Standalone output -> minimal production image for Docker.
  output: 'standalone',

  pageExtensions,

  // Les guides sont SCANNÉS au filesystem (meta.json + versions/*.json) — y
  // compris au runtime (revalidation ISR). La sortie standalone ne trace pas
  // ces lectures dynamiques : on les inclut explicitement. Le motif `**`
  // évite d'écrire `[lang]` (crochets = classe de caractères en glob).
  outputFileTracingIncludes: {
    '/**': ['./src/app/**/guides/_contents/**/*.json'],
  },

  env: {
    NEXT_PUBLIC_APP_VERSION: version,
  },

  // Images served from a CDN (Cloudflare R2) — revisited in Phase 3.
  images: {
    unoptimized: true,
  },

  typedRoutes: true,
  poweredByHeader: false,

  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },

  // Slugs de guides RENOMMÉS en V2 (301 hérités — contrat d'URL). Chaque entrée
  // existe en deux formes à cause du routing mixte : sous-domaine en prod (pas
  // de préfixe) et path `/:lang/…` en dev.
  async redirects() {
    const renamed: Array<[string, string]> = [
      ['urd', 'urd-light'],
      ['verdandi', 'verdandi-dark'],
      ['skuld', 'skuld-light'],
    ];
    return renamed.flatMap(([from, to]) => [
      {
        source: `/guides/dimensional-singularity/${from}`,
        destination: `/guides/dimensional-singularity/${to}`,
        permanent: true,
      },
      {
        source: `/:lang/guides/dimensional-singularity/${from}`,
        destination: `/:lang/guides/dimensional-singularity/${to}`,
        permanent: true,
      },
    ]);
  },
};

export default nextConfig;
