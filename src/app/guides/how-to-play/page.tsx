import type { Metadata } from 'next'
import HowToPlayClient from './HowToPlayClient'

import { createPageMetadata } from '@/lib/seo'
import JsonLd from '@/app/components/JsonLd'
import { websiteLd, breadcrumbLd, articleLd } from './jsonld'
import { getTenantServer } from '@/tenants/tenant.server'
import { getServerI18n } from '@/lib/contexts/server-i18n'

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    path: '/guides/how-to-play',
    titleKey: 'howToPlay.meta.title',
    descKey: 'howToPlay.meta.desc',
    ogTitleKey: 'howToPlay.og.title',
    ogDescKey: 'howToPlay.og.desc',
    twitterTitleKey: 'howToPlay.twitter.title',
    twitterDescKey: 'howToPlay.twitter.desc',
    keywords: [
      'Outerplane',
      'How to Play',
      'Download',
      'Install',
      'Google Play',
      'App Store',
      'PC',
      'Google Play Games',
      'Getting Started',
      'Outerpedia',
    ],
    image: {
      url: 'https://outerpedia.com/images/ui/nav/CM_Lobby_Button_Recruitment.png',
      width: 150,
      height: 150,
      altKey: 'howToPlay.og.imageAlt',
      altFallback: 'How to Download and Play Outerplane — Outerpedia',
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
            guides: t('nav.guides') ?? 'Guides',
            current: t('howToPlay.meta.breadcrumb') ?? 'How to Download and Play',
            currentPath: '/guides/how-to-play',
          }),
          articleLd(domain, {
            title: t('howToPlay.meta.title') ?? 'How to Download and Play Outerplane',
            description:
              t('howToPlay.meta.desc') ??
              'Official download links and platforms to start your adventure in Outerplane — mobile stores and PC support.',
            datePublished: '2025-10-28',
            dateModified: '2025-10-28',
            author: 'Sevih',
            path: '/guides/how-to-play',
          }),
        ]}
      />
      <HowToPlayClient />
    </>
  )
}