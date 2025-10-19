//guides/page
import GuideCategoryList from '@/app/components/CategoryCard'
import type { Metadata } from 'next'
import rawCategories from '@/data/guides/categories.json'
import { getTenantServer } from '@/tenants/tenant.server'
import type { TenantKey } from '@/tenants/config'

import { createPageMetadata } from '@/lib/seo'
import JsonLd from '@/app/components/JsonLd'
import { websiteLd, breadcrumbLd, guidesWebPageLd } from './jsonld'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// ---- Types & helpers
type Localized = { en: string; jp?: string; kr?: string }
type Category = {
  title: string | Localized
  description: string | Localized
  keywords?: string[]
  icon: string
  valid: boolean
}

const categories = rawCategories as Record<string, Category>
const categoryMeta: Category[] = Object.values(categories)

function getLocalized(v: string | Localized, lang: TenantKey): string {
  return typeof v === 'string' ? v : (v[lang] ?? v.en)
}
function getTitle(cat: Category, lang: TenantKey): string {
  return getLocalized(cat.title, lang)
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

  const titleH1 =
    langKey === 'jp' ? 'すべてのガイド'
      : langKey === 'kr' ? '전체 가이드'
        : 'All Guides'

  const path = '/guides'
  const iconRel = '/images/guides/CM_GuideQuest_Navigate.png'
  const iconAbs = `https://${domain}${iconRel}`

  return (
    <div className="p-6">
      {/* JSON-LD */}
      <JsonLd
        json={[
          websiteLd(domain),
          breadcrumbLd(domain, {
            home: langKey === 'jp' ? 'ホーム'
              : langKey === 'kr' ? '홈'
                : 'Home',
            current: titleH1,
            currentPath: path,
          }),
          guidesWebPageLd(domain, {
            title:
              langKey === 'jp' ? 'Outerplane 攻略ガイド | Outerpedia'
                : langKey === 'kr' ? 'Outerplane 가이드 | Outerpedia'
                  : 'Outerplane Guides | Outerpedia',
            description:
              (langKey === 'jp'
                ? 'Outerplane の各種攻略ガイド: '
                : langKey === 'kr'
                  ? 'Outerplane의 모든 공략 가이드: '
                  : 'Browse all strategy guides for Outerplane: ') +
              categoryMeta
                .filter(c => c.valid)
                .map(c => getTitle(c, langKey).replace(/ Guides$/i, ''))
                .join(', ') +
              (langKey === 'jp'
                ? '。ボス攻略・冒険・イベントのウォークスルーを随時更新。'
                : langKey === 'kr'
                  ? '. 보스 팁, 모험, 이벤트 공략이 정기적으로 업데이트됩니다.'
                  : '. Updated regularly with boss tips, adventure help, and event walkthroughs.'),
            path,
            imageUrl: iconAbs,
            inLanguage: ['en', 'jp', 'kr'],
          }),
        ]}
      />

      <h1 className="text-3xl font-bold mb-6">{titleH1}</h1>
      <GuideCategoryList lang={langKey} />
    </div>
  )
}
