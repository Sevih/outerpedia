// app/(tools)/team-planner/page.tsx
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import TeamPlannerWrapper from './ClientWrapper'

import { createPageMetadata } from '@/lib/seo'
import { getToolOgImage } from '@/lib/getToolMeta'
import JsonLd from '@/app/components/JsonLd'
import { websiteLd, breadcrumbLd, webPageLd, softwareApplicationLd } from '@/lib/seo/team-planner-jsonld'
import { getTenantServer } from '@/tenants/tenant.server'
import { getServerI18n } from '@/lib/contexts/server-i18n'

export async function generateMetadata(): Promise<Metadata> {
  const { domain } = await getTenantServer()

  return createPageMetadata({
    path: '/team-planner',
    titleKey: 'teamPlanner.meta.title',
    descKey: 'teamPlanner.meta.desc',
    ogTitleKey: 'teamPlanner.og.title',
    ogDescKey: 'teamPlanner.og.desc',
    twitterTitleKey: 'teamPlanner.twitter.title',
    twitterDescKey: 'teamPlanner.twitter.desc',
    keywords: [
      'Outerplane',
      'Outerpedia',
      'Team Planner',
      'Team Builder',
      'Team Composition',
      'Boss Strategy',
      'Skyward Tower',
      'Guild Raid',
      'World Boss',
      'Team Rules',
      'Character Selection',
    ],
    image: {
      ...getToolOgImage('team-planner', domain),
      altKey: 'teamPlanner.og.imageAlt',
      altFallback: 'Team Planner — Outerpedia',
    },
  })
}

export default async function Page() {
  const { key: lang, domain } = await getTenantServer()
  const { t } = await getServerI18n(lang)

  const description = t('teamPlanner.meta.desc') ?? 'Build and validate teams for Outerplane with custom rules and restrictions'

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <div className="relative top-4 left-4 z-20 h-[32px] w-[32px]">
        <Link href="/tools" className="relative block h-full w-full" aria-label={t('back') ?? 'Back'}>
          <Image
            src="/images/ui/CM_TopMenu_Back.webp" // WEBP en page
            alt={t('back') ?? 'Back'}
            fill
            sizes="32px"
            className="opacity-80 hover:opacity-100 transition-opacity"
          />
        </Link>
      </div>

      <h1>{t('teamPlanner.h1') ?? 'Team Planner'}</h1>

      <p className="text-blue-900 font-semibold bg-blue-100 border border-blue-300 rounded px-4 py-2 text-sm mb-4">
        {t('teamPlanner.info') ??
          'ℹ️ Build your team and validate it against specific rules and restrictions. Perfect for Skyward Tower, Guild Raids, World Bosses, and more.'}
      </p>

      <JsonLd
        json={[
          websiteLd(domain),
          breadcrumbLd(domain, {
            home: t('nav.home') ?? 'Home',
            current: t('teamPlanner.meta.breadcrumb') ?? 'Team Planner',
            currentPath: '/team-planner',
          }),
          webPageLd(domain, description),
          softwareApplicationLd(domain),
        ]}
      />

      <TeamPlannerWrapper />
    </main>
  )
}
