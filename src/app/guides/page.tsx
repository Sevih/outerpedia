import GuideCategoryList from '@/app/components/CategoryCard'
import type { Metadata } from 'next'
import rawCategories from '@/data/guides/categories.json'
import { getTenantServer } from '@/tenants/tenant.server'
import type { TenantKey } from '@/tenants/config'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// ---- Types & helpers
type Localized = { en: string; jp?: string; kr?: string; fr?: string }
type Category = {
  title: string | Localized
  description: string | Localized
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

// ---- Metadata
export async function generateMetadata(): Promise<Metadata> {
  const { key: langKey, domain } = await getTenantServer()
  const base = `https://${domain}`
  const dynamicKeywords = Array.from(
    new Set(
      categoryMeta
        .filter(cat => cat.valid)
        .flatMap(cat => {
          const t = getTitle(cat, langKey)       // "Adventure"
          const base = t.replace(/ Guides$/i, '') // "Adventure"
          return [t, base] // ex: ["Adventure", "Adventure"]
        })
        .map(k => k.toLowerCase()) // 🔥 tout en minuscule pour dédup
    )
  )



  const description =
    (langKey === 'jp'
      ? 'Outerplane の各種攻略ガイド: '
      : langKey === 'kr'
        ? 'Outerplane의 모든 공략 가이드: '
        : 'Browse all strategy guides for Outerplane: ') +
    categoryMeta.map(c => getTitle(c, langKey).replace(/ Guides$/i, '')).join(', ') +
    (langKey === 'jp'
      ? '。ボス攻略・冒険・イベントのウォークスルーを随時更新。'
      : langKey === 'kr'
        ? '. 보스 팁, 모험, 이벤트 공략이 정기적으로 업데이트됩니다.'
        : '. Updated regularly with boss tips, adventure help, and event walkthroughs.')

  const title =
    langKey === 'jp'
      ? 'Outerplane 攻略ガイド | Outerpedia'
      : langKey === 'kr'
        ? 'Outerplane 가이드 | Outerpedia'
        : 'Outerplane Guides | Outerpedia'

  const iconUrl = `${base}/images/guides/CM_GuideQuest_Navigate.png`

  const meta: Metadata = {
    title,
    description,
    keywords: [
      'outerplane guides',
      'strategy guides',
      'outerpedia',
      ...dynamicKeywords,
      'turn-based rpg',
      'mobile rpg',
    ],
    alternates: { canonical: `${base}/guides` },
    openGraph: {
      title,
      description,
      url: `${base}/guides`,
      type: 'website',
      images: [
        {
          url: iconUrl,
          width: 150,
          height: 150,
          alt: 'Outerpedia Guides',
        },
      ],
    },
    twitter: {
      card: 'summary', // 🟢 petit format avec icône
      title,
      description,
      images: [iconUrl],
    },
  }
  return meta
}

// ---- Page
export default async function GuidesHome() {
  const { key: langKey } = await getTenantServer()
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        {langKey === 'jp' ? 'すべてのガイド' : langKey === 'kr' ? '전체 가이드' : 'All Guides'}
      </h1>
      <GuideCategoryList lang={langKey} />
    </div>
  )
}
