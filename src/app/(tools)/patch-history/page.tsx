// src/app/(tools)/patch-history/page.tsx
import type { Metadata } from 'next'
import { getAllNews } from '@/lib/news'
import NewsPageClient from './page-client'
import { createPageMetadata } from '@/lib/seo'
import JsonLd from '@/app/components/JsonLd'
import { websiteLd, breadcrumbLd, collectionPageLd } from './jsonld'
import { getTenantServer } from '@/tenants/tenant.server'
import { getServerI18n } from '@/lib/contexts/server-i18n'
import { getVALanguage } from '@/tenants/config'

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

export default async function PatchHistoryPage() {
  const { key: langKey, domain } = await getTenantServer()
  const { t } = await getServerI18n(langKey)

  // Mapper la langue du tenant vers une langue VA disponible
  const newsLang = getVALanguage(langKey)

  // Récupérer tous les articles côté serveur (legacy + live)
  const allArticles = getAllNews(newsLang)

  // Compter les articles par catégorie
  const categoryCounts: Record<string, number> = {}
  allArticles.forEach(article => {
    categoryCounts[article.frontmatter.category] = (categoryCounts[article.frontmatter.category] || 0) + 1
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

  // Préparer les données pour le client (format simplifié)
  const clientArticles = allArticles.map(article => ({
    slug: article.slug,
    title: article.frontmatter.title,
    date: article.frontmatter.date,
    category: article.frontmatter.category,
    excerpt: article.excerpt,
    coverImage: article.frontmatter.coverImage,
    images: article.frontmatter.images,
  }))

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
