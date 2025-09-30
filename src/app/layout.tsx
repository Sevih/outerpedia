import './globals.css';
import type { Metadata, Viewport } from 'next';
import Header from './components/Header';
import Footer from './components/Footer';
import { Inter } from 'next/font/google';
import UpdateToast from './components/UpdateToast';
import { getTenant } from '@/tenants/tenant'; // <-- ajouté
import type { TenantKey } from '@/tenants/config'

const inter = Inter({ subsets: ['latin'], display: 'swap' });

const titles: Record<TenantKey, string> = {
  en: 'Outerplane Tier List, Character Builds, Guides & Database – Outerpedia',
  fr: 'Outerplane Tier List, Builds, Guides & Base de données – Outerpedia',
  jp: 'Outerplane ティアリスト・ビルド・ガイド・データベース – Outerpedia',
  kr: 'Outerplane 티어리스트, 빌드, 가이드 & 데이터베이스 – Outerpedia',
}

const descs: Record<TenantKey, string> = {
  en: 'Explore characters, builds, gear, tier lists and join our Discord community for Outerplane!',
  fr: 'Découvrez les personnages, builds, équipements, tier lists et rejoignez notre Discord pour Outerplane !',
  jp: 'Outerplane のキャラクター、ビルド、装備、ティアリストをチェックし、Discord コミュニティに参加しよう！',
  kr: 'Outerplane의 캐릭터, 빌드, 장비, 티어리스트를 확인하고 Discord 커뮤니티에 참여하세요!',
}

const ogLocale: Record<TenantKey, string> = {
  en: 'en_US',
  fr: 'fr_FR',
  jp: 'ja_JP',
  kr: 'ko_KR',
}

const hreflang: Record<TenantKey, string> = {
  en: 'en',
  fr: 'fr',
  jp: 'ja',
  kr: 'ko',
}

// Domains par langue (adapte .local/.com selon ton getTenant())
const isProd = process.env.NODE_ENV === 'production'
const domainForKey: Record<TenantKey, string> = isProd
  ? { en: 'outerpedia.com', fr: 'fr.outerpedia.com', jp: 'jp.outerpedia.com', kr: 'kr.outerpedia.com' }
  : { en: 'outerpedia.local', fr: 'fr.outerpedia.local', jp: 'jp.outerpedia.local', kr: 'kr.outerpedia.local' }

// Viewport statique, ça peut rester en export const
// layout.tsx
export const viewport: Viewport = { themeColor: '#081b1f' }

// SEO global par défaut → mais maintenant en fonction du tenant
export async function generateMetadata(): Promise<Metadata> {
  const { domain, key } = await getTenant() // p.ex. { domain: 'fr.outerpedia.local', key: 'fr' }
  const siteUrl = `https://${domain}`
  const title = titles[key] ?? titles.en
  const description = descs[key] ?? descs.en

  return {
    // Titre/description par défaut (page d’accueil et fallback global)
    title,
    description,

    alternates: {
      canonical: siteUrl,
      languages: {
        'x-default': `https://${domainForKey.en}/`,
        en: `https://${domainForKey.en}/`,
        fr: `https://${domainForKey.fr}/`,
        ja: `https://${domainForKey.jp}/`,
        ko: `https://${domainForKey.kr}/`,
      },
    },

    openGraph: {
      type: 'website',
      title,
      description,
      url: siteUrl,
      siteName: 'Outerpedia',
      locale: ogLocale[key] ?? 'en_US',
      images: [{ url: `${siteUrl}/images/ui/og_home.jpg`, width: 1200, height: 630 }],
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${siteUrl}/images/ui/og_home.jpg`],
    },

    icons: {
      icon: [
        { url: '/favicon.ico' },
      ],
      apple: [{ url: '/apple-touch-icon.png' }],
    },
  }
}

// RootLayout devient async pour lire tenant
// layout.tsx
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { key } = await getTenant()
  return (
    <html lang={hreflang[key] ?? 'en'}>
      <body className={`min-h-screen bg-black text-white ${inter.className}`}>
        <Header current={key} />   {/* <-- passer la langue ici */}
        {children}
        <Footer />
        <UpdateToast />
      </body>
    </html>
  )
}