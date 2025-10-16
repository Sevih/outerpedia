import type { Metadata } from 'next'
import type { CharacterLite } from '@/types/character'
import charactersData from '@/data/_allCharacters.json'
import { getMonthYear } from '@/utils/getMonthYear'
import TierListBase from '@/app/components/TierListBase'
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
    path: '/tierlistpvp',
    titleKey: 'tierPvp.meta.title',
    descKey: 'tierPvp.meta.desc',
    ogTitleKey: 'tierPvp.og.title',
    ogDescKey: 'tierPvp.og.desc',
    twitterTitleKey: 'tierPvp.twitter.title',
    twitterDescKey: 'tierPvp.twitter.desc',
    keywords: ['Outerplane', 'Tier List', 'PvP', 'Best Characters', 'EvaMains', monthYear],
    image: {
      // PNG en metadata (règle projet)
      url: 'https://outerpedia.com/images/ui/nav/CM_Lobby_Button_Misson.png',
      width: 150,
      height: 150,
      altKey: 'tierPvp.og.imageAlt',
      altFallback: 'Outerpedia PvP Tier List',
    },
    vars: { monthYear },
  })
}

export default async function PvPTierList() {
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
            current: t('tierPvp.meta.breadcrumb') ?? 'PvP Tier List',
            currentPath: '/tierlistpvp',
          }),
          tierItemListLd(domain, {
            title: t('tierPvp.itemList.title', { monthYear }) ?? `Outerplane PvP Tier List — ${monthYear}`,
            description:
              t('tierPvp.itemList.desc') ??
              'Discover the best characters in Outerplane for PvP. Curated by the EvaMains community.',
            characters: characters.map(c => ({
              slug: toKebabCase(c.Fullname),
              id: String(c.ID),
              name: c.Fullname,
            })),
          }),
        ]}
      />
      <Suspense fallback={<div>Loading...</div>}>
        <TierListBase characters={characters} mode="pvp" langue={langKey} />
        </Suspense>
    </>
  )
}
