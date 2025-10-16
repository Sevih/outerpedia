import type { Metadata } from 'next'
import PullSimClient from './pullSimClient'

import { createPageMetadata } from '@/lib/seo'
import JsonLd from '@/app/components/JsonLd'
import { websiteLd, breadcrumbLd, webAppLd } from './jsonld'
import { getTenantServer } from '@/tenants/tenant.server'
import { getServerI18n } from '@/lib/contexts/server-i18n'

export async function generateMetadata(): Promise<Metadata> {
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
    // Règle projet: PNG pour metadata (WEBP seulement in-page)
    image: {
      url: 'https://outerpedia.com/images/ui/nav/CM_Lobby_Button_Recruitment.png',
      width: 150,
      height: 150,
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