import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getTenantServer } from '@/tenants/tenant.server'
import { getServerI18n } from '@/lib/contexts/server-i18n'

import EquipmentsClient from './EquipmentsClient'

// Données
import weapons from '@/data/weapon.json'
import accessories from '@/data/amulet.json'
import talismans from '@/data/talisman.json'
import sets from '@/data/sets.json'
import eeData from '@/data/ee.json'

// SEO unifié
import { createPageMetadata } from '@/lib/seo'
import JsonLd from '@/app/components/JsonLd'
import { websiteLd, breadcrumbLd, equipmentsCollectionLd } from './jsonld'

// ---------- Metadata (helper global) ----------
export async function generateMetadata(): Promise<Metadata> {
  const { domain } = await getTenantServer()

  const path = '/equipments' as `/${string}`
  const iconAbs = `https://${domain}/images/ui/nav/CM_Lobby_Button_Inventory.png` // ✅ PNG en metadata

  return createPageMetadata({
    path,
    titleKey: 'equip.meta.title',        // ex: 'Equipments – Outerpedia'
    descKey: 'equip.meta.desc',          // ex: 'Browse all equipment in Outerplane.'
    ogTitleKey: 'equip.og.title',
    ogDescKey: 'equip.og.desc',
    twitterTitleKey: 'equip.twitter.title',
    twitterDescKey: 'equip.twitter.desc',
    keywords: ['Outerplane', 'Equipments', 'Gear', 'Stats', 'Builds', 'Outerpedia'],
    image: {
      url: iconAbs,
      width: 150,
      height: 150,
      altFallback: 'Outerpedia Equipments',
    },
    ogType: 'website',
    twitterCard: 'summary',
  })
}

// ---------- Page ----------
export default async function EquipmentsPage() {
  const { key: langKey, domain } = await getTenantServer()

  const path = '/equipments'
  const iconAbs = `https://${domain}/images/ui/nav/CM_Lobby_Button_Inventory.png`

  // Petites stats pour enrichir le JSON-LD (sans lister chaque item)
  const { t } = await getServerI18n(langKey)

  const counts = {
    weapons: (weapons as unknown[]).length,
    accessories: (accessories as unknown[]).length,
    talismans: (talismans as unknown[]).length,
    sets: (sets as unknown[]).length,
    ee: Object.keys(eeData as Record<string, unknown>).length,
  }

  const pageTitle = t('equipments.page.title')
  const pageDesc = t('equipments.page.desc')

  return (
    <>
      {/* JSON-LD harmonisé */}
      <JsonLd
        json={[
          websiteLd(domain),
          breadcrumbLd(domain, {
            home: t('equipments.breadcrumb.home'),
            current: pageTitle,
            currentPath: path,
          }),
          equipmentsCollectionLd(domain, {
            title: `${pageTitle} – Outerpedia`,
            description: pageDesc,
            path,
            imageUrl: iconAbs,
            counts,
          }),
        ]}
      />

      <Suspense fallback={<div>Loading...</div>}>
        <EquipmentsClient lang={langKey} />
      </Suspense>
    </>
  )
}
