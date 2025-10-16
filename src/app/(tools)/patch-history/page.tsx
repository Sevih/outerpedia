// app/(tools)/patch-history/page.tsx
import type { Metadata } from 'next'
import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import PatchNotesViewer from './patchHistoryClient'
import { createPageMetadata } from '@/lib/seo'
import JsonLd from '@/app/components/JsonLd' // <- optionnel (cf. explications plus bas)
import { websiteLd, breadcrumbLd } from './jsonld' // <- optionnel
import { getTenantServer } from '@/tenants/tenant.server'
import { getServerI18n } from '@/lib/contexts/server-i18n'

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    path: '/patch-history',
    titleKey: 'patchHistory.meta.title',
    descKey: 'patchHistory.meta.desc',
    ogTitleKey: 'patchHistory.og.title',
    ogDescKey: 'patchHistory.og.desc',
    twitterTitleKey: 'patchHistory.twitter.title',
    twitterDescKey: 'patchHistory.twitter.desc',
    keywords: [
      // Tu peux utiliser tes clés si tu veux localiser les keywords
      // ou laisser des tokens EN, c'est OK pour SEO.
      'Outerplane',
      'Outerpedia',
      'Patch Notes',
      'Developer Letters',
      'Update History',
      'Changelog',
    ],
    image: {
      // Rappel projet: PNG pour metadata (OG/Twitter), WEBP en page
      url: 'https://outerpedia.com/images/ui/nav/CM_Lobby_Button_Agit.png',
      width: 150, height: 150,
      altKey: 'patchHistory.og.imageAlt',
      altFallback: 'Patch history and developer letters — Outerpedia',
    },
  })
}

export default async function Page() {
  const { key: lang, domain } = await getTenantServer()
  const { t } = await getServerI18n(lang)

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <div className="relative top-4 left-4 z-20 h-[32px] w-[32px]">
        <Link href="/tools" className="relative block h-full w-full" aria-label={t('common.back') ?? 'Back'}>
          <Image
            src="/images/ui/CM_TopMenu_Back.webp" // webp in-page
            alt={t('common.back') ?? 'Back'}
            fill sizes="32px"
            className="opacity-80 hover:opacity-100 transition-opacity"
          />
        </Link>
      </div>

      <h1>{t('patchHistory.h1') ?? 'Patch History'}</h1>
      <p className="text-neutral-300 mb-4">
        {t('patchHistory.intro') ??
          'Browse all Outerplane patch notes, developer letters, and compendium entries — searchable and sorted by date.'}
      </p>

      {/* JSON-LD (optionnel) */}
      <JsonLd
        json={[
          websiteLd(domain),
          breadcrumbLd(domain, {
            home: t('nav.home') ?? 'Home',
            current: t('patchHistory.meta.breadcrumb') ?? 'Patch History',
            // optionnel si l’URL change : currentPath: '/patch-history'
          }),
        ]}
      />


      <Suspense fallback={<div className="text-sm text-neutral-400">Loading…</div>}>
        <PatchNotesViewer />
      </Suspense>
    </main>
  )
}
