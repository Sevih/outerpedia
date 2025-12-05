import fs from 'fs';
import path from 'path';

let version = 'dev';

try {
  const versionFile = path.resolve(__dirname, '.env.version');
  if (fs.existsSync(versionFile)) {
    const content = fs.readFileSync(versionFile, 'utf8');
    const match = content.match(/^NEXT_PUBLIC_APP_VERSION=(.+)$/m);
    if (match) version = match[1].trim();
  }
} catch (err) {
  console.warn('⚠️ Impossible de lire .env.version :', err);
}

const nextConfig = {
  compress: true,
  // Permettre les requêtes cross-origin en dev pour les sous-domaines
  allowedDevOrigins: [
    'outerpedia.local',
    'jp.outerpedia.local',
    'kr.outerpedia.local',
    'zh.outerpedia.local',
  ],
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      // Exclude jsdom from client bundle (it's server-only)
      config.resolve.fallback = {
        ...config.resolve.fallback,
        jsdom: false,
      };
    }
    return config;
  },
  images: {
	unoptimized: true, // ✅ Désactive l'optimisation dynamique
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'cdn.discordapp.com' },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
  },
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()'
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains'
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        },
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https: blob:",
            "font-src 'self' data:",
            "connect-src 'self'",
            "media-src 'self' https://img.youtube.com https://cdn.discordapp.com",
            "frame-src 'self' https://www.youtube.com",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'self'",
            "upgrade-insecure-requests"
          ].join('; ')
        }
      ],
    },
  ],
  poweredByHeader: false,
};

export default nextConfig;
