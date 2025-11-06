import type { Metadata } from 'next'
import { getMonthYear } from '@/utils/getMonthYear'
import { TierListGlowCard } from '@/app/components/TierListGlowCard'

import { createPageMetadata } from '@/lib/seo'
import JsonLd from '@/app/components/JsonLd'
import { websiteLd, breadcrumbLd, tierCollectionsLd } from './jsonld'
import { getTenantServer } from '@/tenants/tenant.server'
import { getServerI18n } from '@/lib/contexts/server-i18n'

const monthYear = getMonthYear()

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    path: '/tierlist',
    titleKey: 'tierIndex.meta.title',
    descKey: 'tierIndex.meta.desc',
    ogTitleKey: 'tierIndex.og.title',
    ogDescKey: 'tierIndex.og.desc',
    twitterTitleKey: 'tierIndex.twitter.title',
    twitterDescKey: 'tierIndex.twitter.desc',
    keywords: ['Outerplane',
      'Tier List',
      'Best Characters',
      'Character Rankings',
      'PvE Tier List',
      'PvP Tier List',
      'Most Used Units',
      'Recommended Heroes',
      'EvaMains', monthYear],
    image: {
      url: 'https://outerpedia.com/images/ui/nav/CM_Lobby_Button_Misson.png', // PNG ok pour metadata
      width: 150,
      height: 150,
      altKey: 'tierIndex.og.imageAlt',
      altFallback: 'Outerpedia Tier List',
    },
    vars: { monthYear },
  })
}

export default async function TierListPageWrapper() {
  const { key: langKey, domain } = await getTenantServer()
  const { t } = await getServerI18n(langKey)

  return (
    <main className="flex flex-col items-center justify-center py-12 px-4 gap-10">
      <JsonLd
        json={[
          websiteLd(domain),
          breadcrumbLd(domain, {
            home: t('nav.home') ?? 'Home',
            current: t('tierIndex.meta.breadcrumb') ?? 'Tier Lists',
            currentPath: '/tierlist',
          }),
          tierCollectionsLd(domain, {
            title: t('tierIndex.collection.title', { monthYear }) ?? `Outerplane Tier Lists — ${monthYear}`,
            description: t('tierIndex.collection.desc') ?? 'Choose between PvE and PvP character rankings.',
          }),
        ]}
      />

      <h1 className="text-3xl md:text-4xl font-bold text-center text-white">
        {t('tierIndex.h1') ?? 'Outerplane Tier List'}
      </h1>

      <h2 className="h2_custom text-3xl md:text-4xl font-bold text-center text-white">
        {t('tierIndex.usage.h2') ?? 'Most Used Units in Guides'}
      </h2>
      <p className="text-white text-center max-w-2xl">
        {t('tierIndex.usage.lead') ??
          'For newer players, this list is often more practical. It shows which heroes are most frequently recommended across game content.'}
      </p>

      <div className="text-center">
        <TierListGlowCard
          href="/most-used-unit"
          title={t('tierIndex.card.usage.title') ?? 'Most Used Units'}
          description={t('tierIndex.card.usage.desc') ?? 'Aggregated usage from Outerpedia guides.'}
          image="/images/ui/nav/tierlist.webp"
          type="usage"
        />
      </div>

      <h2 className="h2_custom text-3xl md:text-4xl font-bold text-center text-white">
        {t('tierIndex.section.tiers.h2') ?? 'Tier Lists (PvE & PvP)'}
      </h2>
      <p className="text-white text-center max-w-2xl">
        {t('tierIndex.lead') ??
          'Choose between PvE and PvP character rankings. Based on evaluations with 6★ transcends and level 0 EE effects.'}
      </p>



      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <TierListGlowCard
          href="/tierlistpve"
          title={t('tier.ui.title.pve') ?? 'Tier List - PvE'}
          description={t('tierIndex.card.pve.desc') ?? 'PvE performance rankings across all content.'}
          image="/images/ui/nav/pve.png"
          type="pve"
        />
        <TierListGlowCard
          href="/tierlistpvp"
          title={t('tier.ui.title.pvp') ?? 'Tier List - PvP'}
          description={t('tierIndex.card.pvp.desc') ?? 'Performance-based Arena evaluation.'}
          image="/images/ui/nav/pvp.webp"
          type="pvp"
        />
      </div>
    </main>
  )
}
