import type { Metadata } from 'next'
import guideUsageData from '@/data/stats/guide-character-usage.json'
import charactersDataRaw from '@/data/_allCharacters.json'
import MostUsedClient from './mostUseClient'
import { getTenantServer } from '@/tenants/tenant.server'
import { createPageMetadata } from '@/lib/seo'
import JsonLd from '@/app/components/JsonLd'
import { websiteLd, breadcrumbLd } from './jsonld'
import { getServerI18n } from '@/lib/contexts/server-i18n'
import type { Character } from '@/types/character'

// Type assertion - _allCharacters.json has Character data without skills property
type CharacterData = Omit<Character, 'skills'> & { skills?: Character['skills'] }
const charactersData = charactersDataRaw as unknown as CharacterData[]

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    path: '/most-used-unit',
    titleKey: 'mostUsedUnit.meta.title',
    descKey: 'mostUsedUnit.meta.desc',
    ogTitleKey: 'mostUsedUnit.og.title',
    ogDescKey: 'mostUsedUnit.og.desc',
    twitterTitleKey: 'mostUsedUnit.twitter.title',
    twitterDescKey: 'mostUsedUnit.twitter.desc',
    keywords: [
      'Outerplane',
      'Outerpedia',
      'Character Usage',
      'Guide Statistics',
      'Most Used Units',
      'Team Building',
      'Meta Characters',
    ],
    image: {
      url: 'https://outerpedia.com/images/ui/nav/CM_Lobby_Button_Misson.png',
      width: 150,
      height: 150,
      altKey: 'mostUsedUnit.og.imageAlt',
      altFallback: 'Most Used Units - Outerpedia',
    },
  })
}

export default async function Page() {
  const { key: lang, domain } = await getTenantServer()
  const { t } = await getServerI18n(lang)

  return (
    <>
      <JsonLd
        json={[
          websiteLd(domain),
          breadcrumbLd(domain, {
            home: t('nav.home') ?? 'Home',
            current: t('mostUsedUnit.meta.breadcrumb') ?? 'Most Used Units',
          }),
        ]}
      />
      <MostUsedClient charactersData={charactersData} guideUsageData={guideUsageData} />
    </>
  )
}
