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
        }
      ],
    },
  ],
  poweredByHeader: false,
};

export default nextConfig;
