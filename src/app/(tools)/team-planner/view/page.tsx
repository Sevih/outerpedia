// app/(tools)/team-planner/view/page.tsx
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import TeamPlannerWrapper from '../TeamPlannerWrapper'

import { createPageMetadata } from '@/lib/seo'
import JsonLd from '@/app/components/JsonLd'
import { websiteLd, breadcrumbLd, webPageLd, softwareApplicationLd } from '../jsonld'
import { getTenantServer } from '@/tenants/tenant.server'
import { getServerI18n } from '@/lib/contexts/server-i18n'

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    path: '/team-planner/view',
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
      // Règle projet: PNG pour metadata, WEBP en page
      url: 'https://outerpedia.com/images/ui/nav/CM_Lobby_Button_Misson.png',
      width: 150,
      height: 150,
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
        {t('teamPlanner.viewInfo') ??
          'ℹ️ Viewing shared team composition. Click Edit to make changes.'}
      </p>

      <JsonLd
        json={[
          websiteLd(domain),
          breadcrumbLd(domain, {
            home: t('nav.home') ?? 'Home',
            current: t('teamPlanner.meta.breadcrumb') ?? 'Team Planner',
            currentPath: '/team-planner/view',
          }),
          webPageLd(domain, description),
          softwareApplicationLd(domain),
        ]}
      />

      <TeamPlannerWrapper viewOnly={true} />
    </main>
  )
}
