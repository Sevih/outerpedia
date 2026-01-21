import type { Metadata } from 'next'
import type { CharacterLite } from '@/types/character'
import charactersData from '@/data/_allCharacters.json'
import { getMonthYear } from '@/utils/getMonthYear'
import TierListBase from '@/app/components/TierListPVE'
import { toKebabCase } from '@/utils/formatText'
import { Suspense } from 'react'

import { createPageMetadata } from '@/lib/seo'
import JsonLd from '@/app/components/JsonLd'
import { websiteLd, breadcrumbLd, tierItemListLd } from './jsonld'
import { getTenantServer } from '@/tenants/tenant.server'
import { getServerI18n } from '@/lib/contexts/server-i18n'

const monthYear = getMonthYear()

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    path: '/tierlistpve',
    titleKey: 'tierPve.meta.title',
    descKey: 'tierPve.meta.desc',
    ogTitleKey: 'tierPve.og.title',
    ogDescKey: 'tierPve.og.desc',
    twitterTitleKey: 'tierPve.twitter.title',
    twitterDescKey: 'tierPve.twitter.desc',
    keywords: ['Outerplane', 'Tier List', 'PvE', 'Best Characters', 'EvaMains', monthYear],
    image: {
      // PNG pour metadata (ta source est déjà .png 👍)
      url: 'https://outerpedia.com/images/ui/nav/CM_Lobby_Button_Misson.png',
      width: 150,
      height: 150,
      altKey: 'tierPve.og.imageAlt',
      altFallback: 'Outerpedia PvE Tier List',
    },
    vars: { monthYear },
  })
}

export default async function PvETierList() {
  const { domain, key: langKey } = await getTenantServer()
  const { t } = await getServerI18n(langKey)
  const characters = charactersData as CharacterLite[]

  return (
    <>
      <JsonLd
        json={[
          websiteLd(domain),
          breadcrumbLd(domain, {
            home: t('nav.home') ?? 'Home',
            current: t('tierPve.meta.breadcrumb') ?? 'PvE Tier List',
            currentPath: '/tierlistpve',
          }),
          tierItemListLd(domain, {
            title: t('tierPve.itemList.title', { monthYear }),
            description:
              t('tierPve.itemList.desc') ??
              'Discover the best characters in Outerplane sorted by DPS, Support, and Sustain. Curated by the EvaMains community.',
            characters: characters.map(c => ({
              slug: toKebabCase(c.Fullname),
              id: String(c.ID),
              name: c.Fullname,
            })),
          }),
        ]}
      />
      <Suspense fallback={<div>Loading...</div>}>
      <TierListBase characters={characters} />
      </Suspense>
    </>
  )
}
