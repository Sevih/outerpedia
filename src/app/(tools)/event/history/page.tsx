// src/app/(tools)/event/history/page.tsx
import type { Metadata } from 'next'
import { getTenantServer } from '@/tenants/tenant.server'
import { TENANTS, OG_LOCALE, HREFLANG, type TenantKey, resolveTenantFromHost } from '@/tenants/config'
import { EVENTS } from '@/data/events/registry.generated'
import EventHistoryClient, { type EventCardMeta } from './EventHistoryClient'
import { headers } from 'next/headers'
import { getServerI18n } from '@/lib/contexts/server-i18n'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function toMetas(): EventCardMeta[] {
  return EVENTS.map(e => ({
    slug: e.meta.slug,
    title: e.meta.title,
    start: e.meta.start,
    end: e.meta.end,
    cover: e.meta.cover ?? null,
  }))
}

function buildLanguageAlternates(pathname: string): Record<string, string> {
  return Object.fromEntries(
    (Object.keys(TENANTS) as TenantKey[]).map(k => [
      HREFLANG[k],
      `https://${TENANTS[k].domain}${pathname}`,
    ])
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const { key: langKey, domain } = await getTenantServer()
  const currentPath = '/event/history'
  const currentUrl = `https://${domain}${currentPath}`
  const languages = buildLanguageAlternates(currentPath)
  const ogLocale = OG_LOCALE[langKey] ?? 'en_US'
  const { t } = await getServerI18n(langKey)

  const total = EVENTS.length
  const now = Date.now()
  const activeCount = EVENTS.filter(e => {
    const s = Date.parse(e.meta.start)
    const t = Date.parse(e.meta.end)
    return now >= s && now <= t
  }).length

  const title = `${t('titles.tool.commuEv')} - Outerpedia`
  const description = activeCount > 0
    ? t('events.history.desc_active', { active: activeCount, total })
    : t('events.history.desc_inactive', { total })

  // const image = `https://${domain}/images/events/event-hero.webp`

  return {
    title,
    description,
    alternates: { canonical: currentUrl, languages },
    openGraph: {
      url: currentUrl,
      siteName: 'Outerpedia',
      title,
      description,
      type: 'website',
      //images: [{ url: image, width: 1200, height: 630, alt: 'Outerpedia Events' }],
      locale: ogLocale,
    },
    twitter: {
      card: 'summary_large_image', title, description
      //,images: [image] 
    },
    robots: { index: true, follow: true },
  }
}

export default async function Page() {
  const h = await headers()
  const host = h.get('host') ?? ''
  const lang = resolveTenantFromHost(host)
  const { t } = await getServerI18n(lang)
  const metas = toMetas()
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-extrabold mb-6">{t('titles.tool.commuEv')}</h1>
      <EventHistoryClient metas={metas} nowISO={new Date().toISOString()} />
    </main>
  )
}
