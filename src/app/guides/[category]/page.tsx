//guides/[category]/page
import guidesRaw from '@/data/guides/guides-ref.json'
import GuideCardGrid from '@/app/components/GuideCardGrid'
import UnderConstruction from '@/app/components/UnderConstruction'
import rawCategoryMeta from '@/data/guides/categories.json'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import SortSelector from '@/app/components/SortSelector'
import AdventureGuideGrid from '@/app/components/AdventureGuideGrid'
import AdventureLicenseGuideGrid from '@/app/components/AdventureLicenseGuideGrid'
import MonadGateGuideGrid from '@/app/components/MonadGateGuideGrid'
import SkywardTowerGuideGrid from '@/app/components/SkywardTowerGuideGrid'
import { getTenantServer } from '@/tenants/tenant.server'
import { getServerI18n } from '@/lib/contexts/server-i18n'
import type { TenantKey } from '@/tenants/config'
import type { Localized } from '@/types/common'
import { generateGuideKeywords as generateKeywords } from '@/lib/seo_guides'

import { createPageMetadata } from '@/lib/seo'
import JsonLd from '@/app/components/JsonLd'
import { websiteLd, breadcrumbLd, guidesCollectionLd } from './jsonld'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const getLocalized = (v: Localized | string, lang: TenantKey) =>
  typeof v === 'string' ? v : (v[lang as keyof typeof v] ?? v.en)

type Guide = {
  category: string
  title: string | Localized
  description: string | Localized
  icon: string
  last_updated: string
  author: string
  hide?: boolean
  weight?: number
}

type CategoryMeta = {
  title: string | Localized
  description: string | Localized
  icon: string // sans extension (ex: '/images/guides/CM_GuideQuest_Navigate')
  valid: boolean
}

const categoryMeta = rawCategoryMeta as Record<string, CategoryMeta>
const guides = guidesRaw as Record<string, Guide>

type Props = { params: { category: string } }

// ---------- Metadata ----------
export async function generateMetadata({ params }: { params: Promise<Props['params']> }): Promise<Metadata> {
  const { key: langKey, domain } = await getTenantServer()
  const { category } = await params

  const meta = categoryMeta[category]
  if (!meta) {
    return {
      title: 'Category not found',
      description: 'This guide category does not exist.',
      robots: { index: false, follow: false },
    }
  }

  const metaTitle = getLocalized(meta.title, langKey)
  const metaDesc = getLocalized(meta.description, langKey)

  const path = `/guides/${category}` as `/${string}`
  const iconAbs = `https://${domain}${meta.icon}.png` // règle PNG metadata respectée

  // même modèle que les autres pages (clés i18n génériques)
  return createPageMetadata({
    path,
    titleKey: 'guides.cat.meta.title',
    descKey: 'guides.cat.meta.desc',
    ogTitleKey: 'guides.cat.og.title',
    ogDescKey: 'guides.cat.og.desc',
    twitterTitleKey: 'guides.cat.tw.title',
    twitterDescKey: 'guides.cat.tw.desc',
    keywords: await generateKeywords(category, metaTitle, langKey),
    image: {
      url: iconAbs,
      width: 150,
      height: 150,
      altFallback: `${metaTitle} icon`,
    },
    ogType: 'website',
    twitterCard: 'summary',
    vars: {
      cat: metaTitle,
      desc: metaDesc,
    },
  })
}

// ---------- Page ----------
export default async function CategoryPage({ params }: { params: Promise<Props['params']> }) {
  const { key: langKey, domain } = await getTenantServer()
  const { category } = await params

  const meta = categoryMeta[category]
  if (!meta) return <UnderConstruction />

  const metaTitle = getLocalized(meta.title, langKey)
  const metaDesc = getLocalized(meta.description, langKey)

  // helper normalisation du weight
  const toWeight = (w: unknown) => {
    if (typeof w === 'number' && Number.isFinite(w)) return w
    const n = Number(w)
    return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY
  }

  const isDev = process.env.NODE_ENV === 'development'
  const filtered = Object.entries(guides as Record<string, Guide>)
    .filter(([, g]) => g.category === category && (isDev || g.hide !== true))
    .map(([slug, g]) => ({
      slug,
      title: getLocalized(g.title, langKey),
      description: getLocalized(g.description, langKey),
      icon: g.icon,
      category: g.category,
      last_updated: g.last_updated,
      author: g.author,
      weight: toWeight((g as Guide).weight),
    }))

  if (filtered.length === 0) return <UnderConstruction />

  // Tri par défaut : weight ASC, puis last_updated DESC, puis title ASC
  filtered.sort((a, b) => {
    if (a.weight !== b.weight) return a.weight - b.weight
    const dateDiff = new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()
    if (dateDiff !== 0) return dateDiff
    return a.title.localeCompare(b.title)
  })

  const { t } = await getServerI18n(langKey)
  const path = `/guides/${category}`

  return (
    <div className="p-6">
      {/* JSON-LD */}
      <JsonLd
        json={[
          websiteLd(domain),
          breadcrumbLd(domain, {
            home: t('guides.breadcrumb.home'),
            current: metaTitle,
            currentPath: path,
          }),
          guidesCollectionLd(domain, {
            title: `${metaTitle} | Outerpedia`,
            description: metaDesc,
            path,
            items: filtered.map(g => ({
              title: g.title,
              author: g.author,
              last_updated: g.last_updated,
              description: g.description,
            })),
          }),
        ]}
      />

      <div className="relative w-full h-[150px] rounded-2xl overflow-hidden mb-6">
        {/* Flèche retour */}
        <div className="absolute top-4 left-4 z-10 h-[32px] w-[32px]">
          <Link href="/guides" className="relative block h-full w-full">
            <Image
              src="/images/ui/CM_TopMenu_Back.webp"
              alt="Back"
              fill
              sizes="32px"
              className="opacity-80 hover:opacity-100 transition-opacity"
            />
          </Link>
        </div>

        {/* Titre */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 px-4 text-center w-full max-w-[90%]">
          <h1 className="text-white font-bold drop-shadow-sm leading-tight uppercase tracking-wide text-balance text-[clamp(1.25rem,5vw,2.25rem)]">
            {metaTitle}
          </h1>
        </div>
      </div>

      {category !== 'adventure' && (
        <div className="mb-4 flex justify-end items-center gap-2">
          <label className="text-sm text-white">Sort by:</label>
          <SortSelector />
        </div>
      )}

      {category === 'adventure' ? (
        <AdventureGuideGrid items={filtered} />
      ) : category === 'monad-gate' ? (
        <MonadGateGuideGrid items={filtered} />
      ) : category === 'skyward-tower' ? (
        <SkywardTowerGuideGrid items={filtered} />
      ) : category === 'adventure-license' ? (
        <AdventureLicenseGuideGrid items={filtered} />
      ) : (
        <GuideCardGrid items={filtered} />
      )}
    </div>
  )
}
