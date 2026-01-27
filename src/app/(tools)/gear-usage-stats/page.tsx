import type { Metadata } from 'next'
import rawData from '@/data/stats/gear-usage.json'
import GearUsageStatsClients from './gear-usage-statsClients'
import { getMonthYear } from '@/utils/getMonthYear'
import { getTenantServer } from '@/tenants/tenant.server'
import { createPageMetadata } from '@/lib/seo'
import { getToolOgImage } from '@/lib/getToolMeta'
import JsonLd from '@/app/components/JsonLd'
import { websiteLd, breadcrumbLd } from './jsonld'
import { getServerI18n } from '@/lib/contexts/server-i18n'

type GearItem = {
  name: string
  type: 'Weapon' | 'Amulet' | 'Set'
  class: string | null
  count: number
  characters: string[]
}

const data = rawData as GearItem[]
const monthYear = getMonthYear()

export async function generateMetadata(): Promise<Metadata> {
  const { domain } = await getTenantServer()

  return createPageMetadata({
    path: '/gear-usage-stats',
    titleKey: 'gearUsage.meta.title',
    descKey: 'gearUsage.meta.desc',
    ogTitleKey: 'gearUsage.og.title',
    ogDescKey: 'gearUsage.og.desc',
    twitterTitleKey: 'gearUsage.twitter.title',
    twitterDescKey: 'gearUsage.twitter.desc',
    keywords: [
      'Outerplane',
      'Outerpedia',
      'Gear Stats', 'Gear Usage', 'Weapons', 'Amulets', 'Sets', 'EvaMains',
    ],
    image: {
      ...getToolOgImage('gear-usage-stats', domain),
      altKey: 'gearUsage.og.imageAlt',
      altFallback: 'Gear Usage Statistics – Outerpedia',
    },
    vars: { monthYear },
  })
}

/* ---------------- page ---------------- */

export default async function Page() {
  const { key: lang, domain } = await getTenantServer()
  const { t } = await getServerI18n(lang)

  return (
    <>
      <JsonLd
        json={[
          websiteLd(domain),
          breadcrumbLd(domain, {
            home: t('nav.home'),
            current: t('gearUsage.meta.breadcrumb'),
          }),
        ]}
      />
      <GearUsageStatsClients data={data} lang={lang} />
    </>
  )
}
