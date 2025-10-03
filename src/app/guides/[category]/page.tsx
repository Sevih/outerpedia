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
import { FaDiscord } from 'react-icons/fa'
import { getTenantServer } from '@/tenants/tenant.server'
import type { TenantKey } from '@/tenants/config'
import { generateGuideKeywords as generateKeywords } from '@/lib/seo_guides'

export const dynamic = 'force-dynamic'
export const revalidate = 0



type Localized = { en: string; jp?: string; kr?: string; fr?: string }
const getLocalized = (v: Localized | string, lang: TenantKey) =>
  typeof v === 'string' ? v : (v[lang] ?? v.en)

type Guide = {
  category: string
  title: string | Localized
  description: string | Localized
  icon: string
  last_updated: string
  author: string
  hide?: boolean
}

type CategoryMeta = {
  title: string | Localized
  description: string | Localized
  icon: string
  valid: boolean
}

const categoryMeta = rawCategoryMeta as Record<string, CategoryMeta>
const guides = guidesRaw as Record<string, Guide>

type Props = { params: { category: string } }

export async function generateMetadata({ params }: { params: Promise<Props['params']> }): Promise<Metadata> {
  const { key: langKey, domain } = await getTenantServer()
  const { category } = await params

  const meta = categoryMeta[category]
  if (!meta) {
    return {
      title: 'Category not found',
      description: 'This guide category does not exist.',
    }
  }

  const metaTitle = getLocalized(meta.title, langKey)
  const metaDesc = getLocalized(meta.description, langKey)
  const base = `https://${domain}`
  const iconUrl = `${base}${meta.icon}.png` // ex: /images/guides/CM_...

  const metadata: Metadata = {
    title: `${metaTitle} | Outerpedia`,
    keywords: generateKeywords(category, metaTitle, langKey),
    description: metaDesc,
    alternates: { canonical: `${base}/guides/${category}` },
    openGraph: {
      title: `${metaTitle} | Outerpedia`,
      description: metaDesc,
      url: `${base}/guides/${category}`,
      type: 'website',
      images: [
        {
          url: iconUrl,
          width: 150,
          height: 150,
          alt: `${metaTitle} icon`,
        },
      ],
    },
    twitter: {
      card: 'summary', // petit format, cohérent avec une icône 150x150
      title: `${metaTitle} | Outerpedia`,
      description: metaDesc,
      images: [iconUrl],
    },
  }

  //console.log('Generated metadata for /guides/[category]:', metadata)
  return metadata
}


export default async function CategoryPage({ params }: { params: Promise<Props['params']> }) {
  const { key: langKey } = await getTenantServer()
  const { category } = await params

  const meta = categoryMeta[category]
  if (!meta) return <UnderConstruction />

  const metaTitle = getLocalized(meta.title, langKey)
  const metaDesc = getLocalized(meta.description, langKey)

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
    }))

  if (filtered.length === 0) {
    return <UnderConstruction />
  }

  filtered.sort((a, b) => {
    const dateDiff = new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()
    if (dateDiff !== 0) return dateDiff
    return b.title.localeCompare(a.title) // Z → A
  })

  return (
    <div className="p-6">
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

        {/* Titre de la catégorie */}
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

      {category === 'general-guides' ? (
        <p className="text-sm text-gray-300 max-w-3xl mt-2 m-auto text-center mb-4">
          This section contains <strong>general guides</strong> covering fundamental systems, core mechanics, and
          beginner-friendly tips that apply across all game modes in Outerplane. If you&apos;re missing a specific
          topic, feel free to suggest it on our&nbsp;
          <Link
            href="https://discord.gg/keGhVQWsHv"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline inline-flex items-center gap-1 !text-amber-300"
          >
            <FaDiscord /> EvaMains Discord
          </Link>
          .
        </p>
      ) : (
        <p className="text-sm text-gray-300 max-w-3xl mt-2 m-auto text-center mb-4">
          This section contains all available guides for the <strong>{metaTitle}</strong> mode in Outerplane. If a
          specific guide is missing, you can suggest it directly via our&nbsp;
          <Link
            href="https://discord.gg/keGhVQWsHv"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline inline-flex items-center gap-1 text-amber-300"
          >
            <FaDiscord /> EvaMains Discord
          </Link>
          .
        </p>
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

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: metaTitle,
            description: metaDesc,
            mainEntity: filtered.map((g) => ({
              '@type': 'Article',
              headline: g.title,
              author: { '@type': 'Person', name: g.author },
              datePublished: g.last_updated,
              description: g.description,
            })),
          }),
        }}
      />
    </div>
  )
}