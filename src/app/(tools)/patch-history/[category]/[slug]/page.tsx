// src/app/(tools)/patch-history/[category]/[slug]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getNewsArticle, getNewsSlugs, type NewsCategory } from '@/lib/news'
import { getTenantServer } from '@/tenants/tenant.server'
import { VA_AVAILABLE_LANGUAGES, getVALanguage, TENANTS, type TenantKey } from '@/tenants/config'
import type { Metadata } from 'next'
import BackButton from '@/app/components/ui/BackButton'

type Props = {
  params: Promise<{
    category: string
    slug: string
  }>
}

const VALID_CATEGORIES: NewsCategory[] = [
  // VA Live categories
  'notice',
  'maintenance',
  'issues',
  'event',
  'winners',
  // Legacy categories
  'patchnotes',
  'compendium',
  'developer-notes',
  'official-4-cut-cartoon',
  'probabilities',
  'world-introduction',
  'media-archives',
]

export async function generateStaticParams() {
  const paths: Array<{ category: string; slug: string }> = []

  // Generate paths for all VA languages
  for (const lang of VA_AVAILABLE_LANGUAGES) {
    for (const category of VALID_CATEGORIES) {
      const slugs = getNewsSlugs(category, lang)
      paths.push(...slugs.map(slug => ({ category, slug })))
    }
  }

  return paths
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params
  const { key: langKey } = await getTenantServer()
  const newsLang = getVALanguage(langKey)

  if (!VALID_CATEGORIES.includes(category as NewsCategory)) {
    return { title: 'Not Found' }
  }

  const article = getNewsArticle(category as NewsCategory, slug, newsLang)

  if (!article) {
    return { title: 'Not Found' }
  }

  // Déterminer si c'est un article live (spécifique à une langue)
  const isLiveArticle = slug.startsWith('live-')

  // Construire les alternates et canonical
  const currentDomain = TENANTS[langKey].domain
  const articlePath = `/patch-history/${category}/${slug}`

  if (isLiveArticle) {
    // Articles live: canonical vers le domaine de la langue correspondante
    const articleLang = slug.match(/^live-([a-z]{2})-/)?.[1] as TenantKey | undefined
    if (articleLang && TENANTS[articleLang]) {
      const canonical = `https://${TENANTS[articleLang].domain}${articlePath}`
      // Avoid adding "- Outerplane" if already present in title
      const pageTitle = article.frontmatter.title.toLowerCase().includes('outerplane')
        ? article.frontmatter.title
        : `${article.frontmatter.title} - Outerplane`
      return {
        title: pageTitle,
        description: article.content.substring(0, 160),
        robots: {
          index: false,
          follow: true,
        },
        alternates: {
          canonical,
        },
        openGraph: {
          title: article.frontmatter.title,
          description: article.content.substring(0, 160),
          images: article.frontmatter.coverImage
            ? [article.frontmatter.coverImage]
            : article.frontmatter.images || [],
        },
      }
    }
  }

  // Articles legacy: disponibles sur tous les domaines
  const canonical = `https://${currentDomain}${articlePath}`
  // Avoid adding "- Outerplane" if already present in title
  const pageTitle = article.frontmatter.title.toLowerCase().includes('outerplane')
    ? article.frontmatter.title
    : `${article.frontmatter.title} - Outerplane`
  return {
    title: pageTitle,
    description: article.content.substring(0, 160),
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical,
      languages: {
        'en': `https://${TENANTS.en.domain}${articlePath}`,
        'ja': `https://${TENANTS.jp.domain}${articlePath}`,
        'ko': `https://${TENANTS.kr.domain}${articlePath}`,
        'zh': `https://${TENANTS.zh.domain}${articlePath}`,
        'x-default': `https://${TENANTS.en.domain}${articlePath}`,
      }
    },
    openGraph: {
      title: article.frontmatter.title,
      description: article.content.substring(0, 160),
      images: article.frontmatter.coverImage
        ? [article.frontmatter.coverImage]
        : article.frontmatter.images || [],
    },
  }
}

export default async function NewsArticlePage({ params }: Props) {
  const { category, slug } = await params
  const { key: langKey } = await getTenantServer()
  const newsLang = getVALanguage(langKey)

  if (!VALID_CATEGORIES.includes(category as NewsCategory)) {
    notFound()
  }

  const article = getNewsArticle(category as NewsCategory, slug, newsLang)

  if (!article) {
    notFound()
  }

  const formattedDate = new Date(article.frontmatter.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const coverImage = article.frontmatter.coverImage || article.frontmatter.images?.[0]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <BackButton />
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link href="/patch-history" className="text-blue-400 hover:underline">
          Patch History
        </Link>
        <span className="text-neutral-500 mx-2">/</span>
        <Link
          href={`/patch-history?category=${category}`}
          className="text-blue-400 hover:underline capitalize"
        >
          {category.replace(/-/g, ' ')}
        </Link>
        <span className="text-neutral-500 mx-2">/</span>
        <span className="text-neutral-400">{article.frontmatter.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        {/* Category badge */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 font-medium uppercase">
            {category.replace(/-/g, ' ')}
          </span>
          <time className="text-sm text-neutral-500">{formattedDate}</time>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-4">{article.frontmatter.title}</h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-neutral-400">
          {article.frontmatter.author && <span>By {article.frontmatter.author}</span>}
          {article.frontmatter.sourceUrl && (
            <>
              <span>•</span>
              <a
                href={article.frontmatter.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                View Original
              </a>
            </>
          )}
        </div>
      </header>

      {/* Cover Image */}
      {coverImage && (
        <div className="relative w-full mb-8 rounded-xl overflow-hidden bg-neutral-800" style={{ maxHeight: '500px', minHeight: '300px' }}>
          <Image
            src={coverImage}
            alt={article.frontmatter.title}
            width={1200}
            height={500}
            className="w-full h-auto max-h-[500px] object-contain"
            priority
          />
        </div>
      )}

      {/* Content */}
      <article
        className="prose prose-invert prose-lg max-w-none
          prose-headings:text-white prose-headings:font-bold
          prose-p:text-neutral-300 prose-p:leading-relaxed
          prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-white prose-strong:font-semibold
          prose-img:rounded-lg prose-img:my-6
          prose-code:text-blue-400 prose-code:bg-neutral-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
          prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-800
          prose-ul:text-neutral-300 prose-ol:text-neutral-300
          prose-li:text-neutral-300
          prose-blockquote:border-l-blue-600 prose-blockquote:text-neutral-400"
        dangerouslySetInnerHTML={{ __html: article.html }}
      />

      {/* Back link */}
      <div className="mt-12 pt-8 border-t border-neutral-800">
        <Link
          href="/patch-history"
          className="inline-flex items-center gap-2 text-blue-400 hover:underline"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Patch History
        </Link>
      </div>
    </div>
  )
}
