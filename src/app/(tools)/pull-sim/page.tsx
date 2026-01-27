import type { Metadata } from 'next'
import PullSimClient from './pullSimClient'

import { createPageMetadata } from '@/lib/seo'
import { getToolOgImage } from '@/lib/getToolMeta'
import JsonLd from '@/app/components/JsonLd'
import { websiteLd, breadcrumbLd, webAppLd } from './jsonld'
import { getTenantServer } from '@/tenants/tenant.server'
import { getServerI18n } from '@/lib/contexts/server-i18n'

export async function generateMetadata(): Promise<Metadata> {
  const { domain } = await getTenantServer()

  return createPageMetadata({
    path: '/pull-sim',
    titleKey: 'pullSim.meta.title',
    descKey: 'pullSim.meta.desc',
    ogTitleKey: 'pullSim.og.title',
    ogDescKey: 'pullSim.og.desc',
    twitterTitleKey: 'pullSim.twitter.title',
    twitterDescKey: 'pullSim.twitter.desc',
    keywords: [
      'Outerplane',
      'Pull Simulator',
      'Gacha',
      'Summon Simulator',
      'Banner',
      'Rate Up',
      'Premium',
      'Limited',
      'Outerpedia',
    ],
    image: {
      ...getToolOgImage('pull-sim', domain),
      altKey: 'pullSim.og.imageAlt',
      altFallback: 'Pull Simulator — Outerpedia',
    },
  })
}

export default async function Page() {
  const { key: langKey, domain } = await getTenantServer()
  const { t } = await getServerI18n(langKey)

  return (
    <>
      <JsonLd
        json={[
          websiteLd(domain),
          breadcrumbLd(domain, {
            home: t('nav.home') ?? 'Home',
            current: t('pullSim.meta.breadcrumb') ?? 'Pull Simulator',
            currentPath: '/pull-sim',
          }),
          webAppLd(domain, {
            name: t('pullSim.webapp.name') ?? 'Pull Simulator',
            description:
              t('pullSim.webapp.desc') ??
              'Simulate gacha pulls for Outerplane banners with mileage rules.',
          }),
        ]}
      />
      <PullSimClient />
    </>
  )
}