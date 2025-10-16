import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getTenantServer } from '@/tenants/tenant.server'

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
  const counts = {
    weapons: (weapons as unknown[]).length,
    accessories: (accessories as unknown[]).length,
    talismans: (talismans as unknown[]).length,
    sets: (sets as unknown[]).length,
    ee: Object.keys(eeData as Record<string, unknown>).length,
  }

  const pageTitle =
    langKey === 'jp'
      ? '装備一覧'
      : langKey === 'kr'
      ? '장비 목록'
      : 'Equipments'

  const pageDesc =
    langKey === 'jp'
      ? '『アウタープレーン』の全装備を一覧表示。武器・アクセサリー・タリスマン・セット・専用装備をチェック。'
      : langKey === 'kr'
      ? '‘아우터플레인’의 모든 장비를 한 곳에서 확인하세요. 무기, 액세서리, 탈리스만, 세트, 전용 장비.'
      : 'Browse all equipment in Outerplane: weapons, accessories, talismans, sets, and exclusive equipment.'

  return (
    <>
      {/* JSON-LD harmonisé */}
      <JsonLd
        json={[
          websiteLd(domain),
          breadcrumbLd(domain, {
            home: langKey === 'jp' ? 'ホーム' : langKey === 'kr' ? '홈' : 'Home',
            current: pageTitle,
            currentPath: path,
          }),
          equipmentsCollectionLd(domain, {
            title: `${pageTitle} – Outerpedia`,
            description: pageDesc,
            path,
            imageUrl: iconAbs,
            counts,
            inLanguage: ['en', 'jp', 'kr'],
          }),
        ]}
      />

      <Suspense fallback={<div>Loading...</div>}>
        <EquipmentsClient lang={langKey} />
      </Suspense>
    </>
  )
}
