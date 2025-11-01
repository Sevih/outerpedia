// src/app/(tools)/patch-history/page.tsx
import type { Metadata } from 'next'
import fs from 'fs'
import path from 'path'
import NewsPageClient from './page-client'
import { createPageMetadata } from '@/lib/seo'
import JsonLd from '@/app/components/JsonLd'
import { websiteLd, breadcrumbLd, collectionPageLd } from './jsonld'
import { getTenantServer } from '@/tenants/tenant.server'
import { getServerI18n } from '@/lib/contexts/server-i18n'
import { getVALanguage } from '@/tenants/config'

// Chemin vers le cache généré au build time
const NEWS_CACHE_PATH = path.join(process.cwd(), 'src', 'data', 'news', 'news-cache.json')

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    path: '/patch-history',
    titleKey: 'patchHistory.meta.title',
    descKey: 'patchHistory.meta.desc',
    ogTitleKey: 'patchHistory.og.title',
    ogDescKey: 'patchHistory.og.desc',
    twitterTitleKey: 'patchHistory.twitter.title',
    twitterDescKey: 'patchHistory.twitter.desc',
    keywords: [
      'Outerplane',
      'Patch Notes',
      'Update History',
      'Events',
      'Developer Notes',
      'News',
      'Changelog',
      'Outerpedia',
    ],
    image: {
      url: 'https://outerpedia.com/images/ui/nav/tool_default.png',
      width: 150,
      height: 150,
      altKey: 'patchHistory.og.imageAlt',
      altFallback: 'Patch History — Outerpedia',
    },
  })
}

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All News',
  // VA Live categories
  notice: 'Notices',
  maintenance: 'Maintenance',
  issues: 'Known Issues',
  event: 'Events',
  winners: 'Winners',
  // Legacy categories
  patchnotes: 'Patch Notes',
  'developer-notes': 'Developer Notes',
  compendium: 'Hero Compendium',
  'world-introduction': 'World Introduction',
  'official-4-cut-cartoon': '4-Cut Cartoon',
  probabilities: 'Probabilities',
  'media-archives': 'Media Archives',
}

type CachedArticle = {
  slug: string
  title: string
  date: string
  category: string
  excerpt?: string
  coverImage?: string
  images?: string[]
  isLegacy?: boolean
  uid?: string
  url?: string
  views?: number
  lang?: string
}

export default async function PatchHistoryPage() {
  const { key: langKey, domain } = await getTenantServer()
  const { t } = await getServerI18n(langKey)

  // Mapper la langue du tenant vers une langue VA disponible
  const newsLang = getVALanguage(langKey)

  // Récupérer tous les articles depuis le cache JSON (beaucoup plus rapide que getAllNews)
  let allArticles: CachedArticle[] = []
  if (fs.existsSync(NEWS_CACHE_PATH)) {
    const cacheContent = fs.readFileSync(NEWS_CACHE_PATH, 'utf-8')
    const cache = JSON.parse(cacheContent) as Record<string, CachedArticle[]>
    allArticles = cache[newsLang] || []
  } else {
    console.warn('⚠️ News cache not found. Run `npm run gen:news-cache` to generate it.')
  }

  // Compter les articles par catégorie
  const categoryCounts: Record<string, number> = {}
  allArticles.forEach(article => {
    categoryCounts[article.category] = (categoryCounts[article.category] || 0) + 1
  })

  // Groupes de catégories fusionnées
  type CategoryGroup = {
    value: string
    label: string
    count: number
    includes: string[] // catégories incluses dans ce groupe
  }

  const categoryGroups: CategoryGroup[] = [
    {
      value: 'updates',
      label: t('patchHistory.categories.updates') ?? 'Updates',
      count: (categoryCounts['notice'] || 0) + (categoryCounts['issues'] || 0) + (categoryCounts['patchnotes'] || 0) + (categoryCounts['maintenance'] || 0),
      includes: ['notice', 'issues', 'patchnotes', 'maintenance'],
    },
    {
      value: 'event',
      label: t('patchHistory.categories.event') ?? 'Events',
      count: (categoryCounts['event'] || 0) + (categoryCounts['winners'] || 0),
      includes: ['event', 'winners'],
    },
  ]

  // Ajouter les catégories legacy individuellement (sans patchnotes qui est maintenant dans updates)
  const legacyCategories = [
    'developer-notes',
    'media-archives',
    'compendium',
    'world-introduction',
    'official-4-cut-cartoon',
    'probabilities',
  ]

  const categories = [
    { value: 'all', label: t('patchHistory.categories.all') ?? 'All News', count: allArticles.length, includes: [] },
    ...categoryGroups.filter(group => group.count > 0),
    ...legacyCategories
      .filter(category => categoryCounts[category] > 0)
      .map(category => ({
        value: category,
        label: t(`patchHistory.categories.${category}`) ?? (CATEGORY_LABELS[category] || category),
        count: categoryCounts[category],
        includes: [category],
      })),
  ]

  // Préparer les données pour le client (déjà au bon format depuis le cache)
  const clientArticles = allArticles

  return (
    <>
      <JsonLd
        json={[
          websiteLd(domain),
          breadcrumbLd(domain, {
            home: t('nav.home') ?? 'Home',
            current: t('patchHistory.meta.breadcrumb') ?? 'Patch History',
            currentPath: '/patch-history',
          }),
          collectionPageLd(domain, {
            name: t('patchHistory.collection.name') ?? 'Patch History',
            description:
              t('patchHistory.collection.desc') ??
              'Complete history of patch notes, events, developer notes and updates for Outerplane.',
          }),
        ]}
      />
      <NewsPageClient initialArticles={clientArticles} categories={categories} />
    </>
  )
}
