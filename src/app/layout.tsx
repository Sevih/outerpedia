// src/app/layout.tsx
import './globals.css'
import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'

import Header from '@/app/components/layout/Header'
import Footer from '@/app/components/layout/Footer'
import UpdateToast from '@/app/components/UpdateToast'

import { getTenantServer } from '@/tenants/tenant.server'
import {
  OG_LOCALE,
  HREFLANG,
  TENANTS,
  type TenantKey,
} from '@/tenants/config'

import { TenantProvider } from '@/lib/contexts/TenantContext'
import { I18nProvider } from '@/lib/contexts/I18nContext'
import { getServerI18n } from '@/lib/contexts/server-i18n'

const inter = localFont({
  src: '../fonts/Inter-Variable.woff2',
  display: 'swap',
  variable: '--font-inter',
  weight: '100 900',
})

/** Couleur d’UI pour mobile */
export const viewport: Viewport = { themeColor: '#081b1f' }

/** SEO global dynamique selon le tenant (subdomaine) */
export async function generateMetadata(): Promise<Metadata> {
  const { domain, key } = await getTenantServer()
  const siteUrl = `https://${domain}`

  const { t } = await getServerI18n(key)
  const title = t('titles.main.main')
  const description = t('titles.main.desc')

  // Construit les <link rel="alternate" hreflang="..."> à partir de ta config TENANTS
  const languages = (Object.keys(TENANTS) as TenantKey[]).reduce<Record<string, string>>(
    (acc, k) => {
      acc[HREFLANG[k]] = `https://${TENANTS[k].domain}/`
      return acc
    },
    { 'x-default': `https://${TENANTS.en.domain}/` }
  )

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,

    alternates: {
      canonical: siteUrl,
      languages,
    },

    openGraph: {
      type: 'website',
      siteName: 'Outerpedia',
      title,
      description,
      url: siteUrl,
      locale: OG_LOCALE[key] ?? 'en_US',
      images: [{ url: `${siteUrl}/images/ui/og_home.jpg`, width: 1200, height: 630 }],
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${siteUrl}/images/ui/og_home.jpg`],
    },

    icons: {
      icon: [{ url: '/favicon.ico' }],
      apple: [{ url: '/apple-touch-icon.png' }],
    },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getTenantServer() // { key, domain }
  const langKey = tenant.key 

  // charge le dictionnaire sérialisable pour I18nProvider
  const messages = (await import(`@/i18n/locales/${langKey}.ts`)).default ?? {}

  return (
    <html lang={HREFLANG[langKey]} data-scroll-behavior="smooth">
      <body className={`min-h-dvh bg-black text-white ${inter.className}`}>
        <TenantProvider value={tenant}>
          <I18nProvider initialLang={langKey} messages={messages}>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <UpdateToast />
          </I18nProvider>
        </TenantProvider>
        <div id="portal-root" />
      </body>
    </html>
  )
}
