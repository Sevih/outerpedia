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
const isDev = process.env.NODE_ENV !== 'production';
const base = ['tsx', 'ts', 'jsx', 'js'];
const pageExtensions = isDev ? [...base.map((e) => `dev.${e}`), ...base] : base;

const nextConfig: NextConfig = {
  // Standalone output -> minimal production image for Docker.
  output: 'standalone',

  pageExtensions,

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
};

export default nextConfig;
