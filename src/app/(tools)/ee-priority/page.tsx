// app/(tools)/ee-priority/page.tsx
import type { Metadata } from 'next'

import eeData from '@/data/ee.json'
import TierListBase from '@/app/components/TierListBase'
import charactersData from '@/data/_allCharacters.json'
import { toKebabCase } from '@/utils/formatText'
import type { CharacterLite } from '@/types/types'
import { Suspense } from 'react'
import { createPageMetadata } from '@/lib/seo'
import { getToolOgImage } from '@/lib/getToolMeta'
import JsonLd from '@/app/components/JsonLd'
import { websiteLd, breadcrumbLd, itemListLd } from './jsonld'
import { getTenantServer } from '@/tenants/tenant.server'
import { getServerI18n } from '@/lib/contexts/server-i18n'

const characterMap = Object.fromEntries(
  (charactersData as CharacterLite[]).map((c) => [toKebabCase(c.Fullname), c])
)

export async function generateMetadata(): Promise<Metadata> {
  const { domain } = await getTenantServer()

  return createPageMetadata({
    path: '/ee-priority',
    titleKey: 'eePriority.meta.title',
    descKey: 'eePriority.meta.desc',
    ogTitleKey: 'eePriority.og.title',
    ogDescKey: 'eePriority.og.desc',
    twitterTitleKey: 'eePriority.twitter.title',
    twitterDescKey: 'eePriority.twitter.desc',
    keywords: [
      'Outerplane',
      'Outerpedia',
      'Exclusive Equipment',
      'EE Priority',
      'Unlock Order',
      'Tier List',
    ],
    image: {
      ...getToolOgImage('ee-priority', domain),
      altKey: 'eePriority.og.imageAlt',
      altFallback: 'Exclusive Equipment Priority — Outerpedia',
    },
  })
}

export default async function EePriorityPage() {
  const { domain, key: langKey } = await getTenantServer()
  const { t } = await getServerI18n(langKey)

  // JSON-LD: site + breadcrumb + itemList (+0)
  const json = [
    websiteLd(domain),
    breadcrumbLd(domain, {
      home: t('nav.home') ?? 'Home',
      current: t('eePriority.meta.breadcrumb') ?? 'EE Priority',
      currentPath: '/ee-priority',
    }),
    itemListLd(domain, {
      title: t('eePriority.itemList.title') ?? 'Exclusive Equipment Priority (+0)',
      description:
        t('eePriority.itemList.desc') ??
        'Exclusive Equipment Priority based on level 0 base effects only, for optimal unlock order.',
      list: eeData,            
      characterMap,            
      imageKind: 'portrait',  
      lang: langKey,    
    }),
  ]

  return (
    <>
      <JsonLd json={json} />
      <Suspense fallback={<div>Loading...</div>}>
        <TierListBase equipments={eeData} mode="ee0" langue={langKey} />
        </Suspense>
    </>
  )
}
