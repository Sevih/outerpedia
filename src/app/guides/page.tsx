//guides/page
import GuideCategoryList from '@/app/components/CategoryCard'
import type { Metadata } from 'next'
import { categoryMeta, getCategoryTitle } from '@/lib/guideCategories'
import { getTenantServer } from '@/tenants/tenant.server'
import { getServerI18n } from '@/lib/contexts/server-i18n'

import { createPageMetadata } from '@/lib/seo'
import JsonLd from '@/app/components/JsonLd'
import { websiteLd, breadcrumbLd, guidesWebPageLd } from './jsonld'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// ---- Metadata (via helper site-wide)
export async function generateMetadata(): Promise<Metadata> {
  const { key: langKey, domain } = await getTenantServer()
  const { t } = await getServerI18n(langKey)

  // Dans generateMetadata()
  const categoryEntries = Object.entries(categoryMeta).filter(([, cat]) => cat.valid)

  const allKeywords = categoryEntries.flatMap(([, cat]) => cat.keywords || [])

  const listForKeywords = Array.from(
    new Set([
      ...allKeywords,
      ...categoryEntries.flatMap(([slug]) => {
        const title = getCategoryTitle(slug, t)
        const base = title.replace(/ Guides$/i, '')
        return [title, base]
      })
        .map(k => k.toLowerCase())
    ])
  )

  const listForDesc = categoryEntries
    .map(([slug]) => getCategoryTitle(slug, t).replace(/ Guides$/i, ''))
    .join(', ')

  const path = '/guides' as `/${string}`
  const iconRel = '/images/guides/CM_GuideQuest_Navigate.png'
  const iconAbs = `https://${domain}${iconRel}`

  // On passe par createPageMetadata (mêmes conventions que Pull Sim / Items)
  return createPageMetadata({
    path,
    titleKey: 'guides.meta.title',
    descKey: 'guides.meta.desc',
    ogTitleKey: 'guides.og.title',
    ogDescKey: 'guides.og.desc',
    twitterTitleKey: 'guides.twitter.title',
    twitterDescKey: 'guides.twitter.desc',
    keywords: [
      'outerplane guides',
      'strategy guides',
      'outerpedia',
      ...listForKeywords,
      'turn-based rpg',
      'mobile rpg',
    ],
    image: {
      url: iconAbs, // PNG (déjà)
      width: 150,
      height: 150,
      altFallback: 'Outerpedia Guides',
    },
    ogType: 'website',
    twitterCard: 'summary',
    vars: {
      // variables pour interpolation i18n
      list: listForDesc,
    },
  })
}

// ---- Page
export default async function GuidesHome() {
  const { key: langKey, domain } = await getTenantServer()
  const { t } = await getServerI18n(langKey)

  const titleH1 = t('guides.page.h1')

  const path = '/guides'
  const iconRel = '/images/guides/CM_GuideQuest_Navigate.png'
  const iconAbs = `https://${domain}${iconRel}`

  const categoryList = Object.entries(categoryMeta)
    .filter(([, cat]) => cat.valid)
    .map(([slug]) => getCategoryTitle(slug, t).replace(/ Guides$/i, ''))
    .join(', ')

  return (
    <div className="p-6">
      {/* JSON-LD */}
      <JsonLd
        json={[
          websiteLd(domain),
          breadcrumbLd(domain, {
            home: t('guides.breadcrumb.home'),
            current: titleH1,
            currentPath: path,
          }),
          guidesWebPageLd(domain, {
            title: t('guides.jsonld.title'),
            description: t('guides.jsonld.desc.prefix') + categoryList + t('guides.jsonld.desc.suffix'),
            path,
            imageUrl: iconAbs,
          }),
        ]}
      />

      <h1 className="text-3xl font-bold mb-6">{titleH1}</h1>
      <GuideCategoryList />
    </div>
  )
}
