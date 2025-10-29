//guides/page
import GuideCategoryList from '@/app/components/CategoryCard'
import type { Metadata } from 'next'
import rawCategories from '@/data/guides/categories.json'
import { getTenantServer } from '@/tenants/tenant.server'
import type { TenantKey } from '@/tenants/config'
import type { Localized } from '@/types/common'
import { lRec } from '@/lib/localize'
import { getServerI18n } from '@/lib/contexts/server-i18n'

import { createPageMetadata } from '@/lib/seo'
import JsonLd from '@/app/components/JsonLd'
import { websiteLd, breadcrumbLd, guidesWebPageLd } from './jsonld'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// ---- Types & helpers
type Category = {
  title: string | Localized
  description: string | Localized
  keywords?: string[]
  icon: string
  valid: boolean
}

const categories = rawCategories as Record<string, Category>
const categoryMeta: Category[] = Object.values(categories)

function getTitle(cat: Category, lang: TenantKey): string {
  return typeof cat.title === 'string' ? cat.title : lRec(cat.title, lang)
}

// ---- Metadata (via helper site-wide)
export async function generateMetadata(): Promise<Metadata> {
  const { key: langKey, domain } = await getTenantServer()

  // Dans generateMetadata()
  const allKeywords = categoryMeta
    .filter(cat => cat.valid)
    .flatMap(cat => cat.keywords || []) // <-- récupère tous les keywords

  const listForKeywords = Array.from(
    new Set([
      ...allKeywords, // <-- inclus les keywords
      ...categoryMeta
        .filter(cat => cat.valid)
        .flatMap(cat => {
          const t = getTitle(cat, langKey)
          const base = t.replace(/ Guides$/i, '')
          return [t, base]
        })
        .map(k => k.toLowerCase())
    ])
  )

  const listForDesc = categoryMeta
    .filter(c => c.valid)
    .map(c => getTitle(c, langKey).replace(/ Guides$/i, ''))
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

  const categoryList = categoryMeta
    .filter(c => c.valid)
    .map(c => getTitle(c, langKey).replace(/ Guides$/i, ''))
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
      <GuideCategoryList lang={langKey} />
    </div>
  )
}
