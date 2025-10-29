// app/guides/[category]/[slug]/page.tsx
import rawGuides from '@/data/guides/guides-ref.json'
import rawCategoryMeta from '@/data/guides/categories.json'
import { notFound } from 'next/navigation'
import GuideContentWrapper from './GuideContentWrapper'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getTenantServer } from '@/tenants/tenant.server'
import { getServerI18n } from '@/lib/contexts/server-i18n'
import type { TenantKey } from '@/tenants/config'
import type { Localized } from '@/types/common'
import { lRec } from '@/lib/localize'
import { createPageMetadata } from '@/lib/seo'
import { generateGuideKeywords } from '@/lib/seo_guides'
import JsonLd from '@/app/components/JsonLd'
import { websiteLd, breadcrumbLd, guidesWebPageLd } from './jsonld'

// ---- Types & utils
const getLocalized = (v: Localized | string, lang: TenantKey) =>
  typeof v === 'string' ? v : lRec(v, lang)

type Guide = {
  category: string
  title: string | Localized
  description: string | Localized
  icon: string
  last_updated: string
  author: string
  second_image?: string
}

type CategoryMeta = {
  title: string | Localized
  description: string | Localized
  icon: string
  valid: boolean
}

type Props = { params: Promise<{ category: string; slug: string }> }

const categoryMeta = rawCategoryMeta as Record<string, CategoryMeta>
const guides = rawGuides as Record<string, Guide>

// ---------- Static params ----------
export async function generateStaticParams() {
  return Object.entries(guides).map(([slug, guide]) => ({
    category: guide.category,
    slug,
  }))
}

// ---------- Metadata ----------
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { key: langKey, domain } = await getTenantServer()
  const { category, slug } = await params
  const guide = guides[slug]

  if (!guide || guide.category !== category) {
    return {
      title: 'Guide not found',
      description: 'This guide does not exist.',
      robots: { index: false, follow: false },
    }
  }

  const meta = categoryMeta[category]
  const catTitle = getLocalized(meta.title, langKey)
  const guideTitle = getLocalized(guide.title, langKey)
  const guideDesc = getLocalized(guide.description, langKey)

  const path = `/guides/${guide.category}/${slug}` as `/${string}`

  const ogPng =
    guide.category === 'monad-gate'
      ? `https://${domain}/images/guides/monad-gate/CM_Adventure_MonadGate.png`
      : `https://${domain}/images/guides/${guide.category}/${slug}_portrait.png`

  return createPageMetadata({
    path,
    titleKey: 'guides.detail.meta.title',
    descKey: 'guides.detail.meta.desc',
    ogTitleKey: 'guides.detail.og.title',
    ogDescKey: 'guides.detail.og.desc',
    twitterTitleKey: 'guides.detail.tw.title',
    twitterDescKey: 'guides.detail.tw.desc',
    keywords: await generateGuideKeywords(
      category,
      guideTitle,
      langKey
    ),
    image: {
      url: ogPng,
      width: 150,
      height: 150,
      altFallback: `${guideTitle} portrait`,
    },
    ogType: 'article',
    twitterCard: 'summary',
    vars: {
      cat: catTitle,
      guide: guideTitle,
      desc: guideDesc,
    },
  })
}

// ---------- Page ----------
export default async function GuidePage({ params }: Props) {
  const { key: langKey, domain } = await getTenantServer()
  const { category, slug } = await params
  const guide = guides[slug]

  if (!guide || guide.category !== category) notFound()

  const meta = categoryMeta[category]
  const catTitle = getLocalized(meta.title, langKey)
  const guideTitle = getLocalized(guide.title, langKey)
  const guideDesc = getLocalized(guide.description, langKey)

  const path = `/guides/${category}/${slug}`

  const image =
    guide.category === 'monad-gate'
      ? `/images/guides/monad-gate/CM_Adventure_MonadGate.webp`
      : `/images/guides/${guide.category}/${slug}_banner.webp`

  const secondImage = guide.second_image
    ? `/images/guides/${guide.category}/${guide.second_image}_banner.webp`
    : undefined

  const absImage =
    guide.category === 'monad-gate'
      ? `https://${domain}/images/guides/monad-gate/CM_Adventure_MonadGate.png`
      : `https://${domain}/images/guides/${guide.category}/${slug}_portrait.png`

  const { t } = await getServerI18n(langKey)

  return (
    <div className="p-6">
      <JsonLd
        json={[
          websiteLd(domain),
          breadcrumbLd(domain, {
            home: t('guides.breadcrumb.home'),
            current: `${guideTitle} | ${catTitle}`,
            currentPath: path,
          }),
          guidesWebPageLd(domain, {
            title: `${guideTitle} | ${catTitle} | Outerpedia`,
            description: `${catTitle} ${guideTitle} ${guideDesc}`,
            path,
            imageUrl: absImage,
          }),
        ]}
      />

      {/* H1 visible pour les lecteurs d'écran */}
      <h1 className="sr-only">{`${guideTitle} - ${catTitle}`}</h1>

      {/* Bannière */}
      <div className="relative w-full h-[150px] rounded-2xl overflow-hidden mb-6">
        {!secondImage ? (
          <Image
            src={image}
            alt={`${guideTitle} banner`}
            fill
            sizes="100vw"
            className="object-contain z-0"
            priority
          />
        ) : (
          <>
            <Image
              src={image}
              alt={`${guideTitle} banner`}
              fill
              sizes="100vw"
              className="object-contain"
              style={{ left: '20%' }}
              priority
            />
            <Image
              src={secondImage}
              alt={`${guideTitle} second banner`}
              fill
              sizes="100vw"
              className="object-contain"
              style={{ left: '-20%' }}
            />
          </>
        )}

        {/* Back button */}
        <div className="absolute top-4 left-4 z-20 h-[32px] w-[32px]">
          <Link href={`/guides/${category}`} className="relative block h-full w-full">
            <Image
              src="/images/ui/CM_TopMenu_Back.webp"
              alt="Back"
              fill
              sizes="32px"
              className="opacity-80 hover:opacity-100 transition-opacity"
            />
          </Link>
        </div>

        {/* Overlay titre */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-white text-center px-4">
          <p className="guide-title text-xs sm:text-sm uppercase tracking-wide font-semibold mb-3">
            {category.replace(/-/g, ' ')}
          </p>
          <p className="guide-title text-base sm:text-lg md:text-xl font-bold leading-tight max-w-full break-words">
            {guideTitle}
          </p>
        </div>
      </div>

      {/* Auteur + date */}
      <div className="text-sm text-neutral-400 mb-6">
        ✍️ <span itemProp="author">{guide.author}</span> · 🕒{' '}
        <time dateTime={guide.last_updated}>
          {new Date(guide.last_updated).toLocaleDateString()}
        </time>
      </div>

      {/* Texte introductif */}
      <div className="text-sm text-gray-300 max-w-3xl mt-2 m-auto text-center mb-4">
        <p className="mb-2">
          This guide covers <strong>{guideTitle}</strong> in Outerplane.
        </p>
        <p>
          If you have additional strategies or suggestions, share them on{' '}
          <Link
            href="https://discord.com/invite/keGhVQWsHv"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline inline-flex items-center gap-1 text-amber-300"
          >
            EvaMains Discord
          </Link>
          .
        </p>
      </div>

      {/* Contenu principal avec métadonnées structurées */}
      <article 
        className="mt-6"
        itemScope
        itemType="https://schema.org/Guide"
      >
        <meta itemProp="name" content={guideTitle} />
        <meta itemProp="description" content={guideDesc} />
        <meta itemProp="datePublished" content={guide.last_updated} />
        <meta itemProp="author" content={guide.author} />
        
        <GuideContentWrapper category={category} slug={slug} lang={langKey} />
      </article>
    </div>
  )
}