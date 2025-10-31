// src/lib/news.ts
// Helper functions pour gérer les articles de news en Markdown

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'
import type { VALanguage } from '@/tenants/config'

const LEGACY_DIR = path.join(process.cwd(), 'src', 'data', 'news', 'legacy')
const LIVE_DIR = path.join(process.cwd(), 'src', 'data', 'news', 'live')

export type NewsCategory =
  // Nouvelles catégories (VA live)
  | 'notice'
  | 'maintenance'
  | 'issues'
  | 'event'
  | 'winners'
  // Anciennes catégories (legacy)
  | 'patchnotes'
  | 'compendium'
  | 'developer-notes'
  | 'official-4-cut-cartoon'
  | 'probabilities'
  | 'world-introduction'
  | 'media-archives'

export type NewsFrontmatter = {
  title: string
  date: string
  category: NewsCategory
  id: string
  author?: string
  sourceUrl?: string
  coverImage?: string
  images?: string[]
  // Champs spécifiques aux notices live
  uid?: string
  url?: string
  views?: number
  // Tag pour identifier le contenu legacy
  isLegacy?: boolean
}

export type NewsArticle = {
  slug: string
  frontmatter: NewsFrontmatter
  content: string
  html: string
}

export type NewsArticlePreview = Omit<NewsArticle, 'content' | 'html'> & {
  excerpt?: string
}

/**
 * Mapper les catégories VA vers nos nouvelles catégories
 */
function mapVACategoryToNewsCategory(vaCategory: string): NewsCategory {
  const categoryMap: Record<string, NewsCategory> = {
    'Notice': 'notice',
    'Maintenance': 'maintenance',
    'Issues': 'issues',
    'Issue': 'issues',
    'Event': 'event',
    'Winners Announcement': 'winners',
  }

  // Si pas de catégorie ou catégorie inconnue, c'est probablement une notice
  return categoryMap[vaCategory] || 'notice'
}

/**
 * Crée un excerpt à partir du contenu Markdown
 */
function createExcerpt(content: string): string {
  const plainText = content
    // Supprimer les images ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // Supprimer les liens [text](url) mais garder le texte
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Supprimer les headers ###
    .replace(/^#{1,6}\s+/gm, '')
    // Supprimer les bold/italic **text** ou *text*
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    // Supprimer les phrases d'introduction répétitives
    .replace(/The Action Anime,?\s*OUTERPLANE\s*/gi, '')
    .replace(/Hello,?\s*Masters!?\s*/gi, '')
    .replace(/Dear,?\s*Masters,?\s*/gi, '')
    .replace(/This is GM\s+\w+\.?\s*/gi, '')
    // Supprimer les lignes vides multiples
    .replace(/\n\s*\n/g, ' ')
    // Nettoyer les espaces
    .replace(/\s+/g, ' ')
    .trim()

  return plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '')
}

/**
 * Récupère tous les articles d'une catégorie depuis le dossier legacy
 */
function getLegacyNewsByCategory(category: NewsCategory): NewsArticlePreview[] {
  const categoryDir = path.join(LEGACY_DIR, category)

  if (!fs.existsSync(categoryDir)) {
    return []
  }

  const files = fs.readdirSync(categoryDir).filter(f => f.endsWith('.md'))

  const articles = files.map(filename => {
    const slug = filename.replace(/\.md$/, '')
    const filePath = path.join(categoryDir, filename)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(fileContent)

    return {
      slug,
      frontmatter: {
        ...(data as NewsFrontmatter),
        isLegacy: true, // Marquer comme legacy
      },
      excerpt: createExcerpt(content),
    }
  })

  return articles
}

/**
 * Récupère tous les articles live pour une langue donnée
 */
function getLiveNews(lang: VALanguage = 'en'): NewsArticlePreview[] {
  const liveDir = path.join(LIVE_DIR, lang)

  if (!fs.existsSync(liveDir)) {
    return []
  }

  const files = fs.readdirSync(liveDir).filter(f => f.endsWith('.md'))

  const articles = files.map(filename => {
    const slug = filename.replace(/\.md$/, '')
    const filePath = path.join(liveDir, filename)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(fileContent)

    // Mapper la catégorie VA vers notre catégorie
    const vaCategory = (data.category as string) || ''
    const mappedCategory = mapVACategoryToNewsCategory(vaCategory)

    // Extraire la première image pour coverImage
    const imageMatch = content.match(/!\[([^\]]*)\]\(([^)]+)\)/)
    const coverImage = imageMatch ? imageMatch[2] : undefined

    // Créer le frontmatter normalisé
    const normalizedFrontmatter: NewsFrontmatter = {
      title: data.title as string,
      date: data.date as string,
      category: mappedCategory,
      id: data.uid as string,
      sourceUrl: data.url as string,
      coverImage,
      uid: data.uid as string,
      url: data.url as string,
      views: data.views as number,
    }

    return {
      slug: `live-${lang}-${slug}`,
      frontmatter: normalizedFrontmatter,
      excerpt: createExcerpt(content),
    }
  })

  return articles
}

/**
 * Récupère tous les articles d'une catégorie (legacy + live)
 */
export function getNewsByCategory(category: NewsCategory, lang: VALanguage = 'en'): NewsArticlePreview[] {
  const legacyArticles = getLegacyNewsByCategory(category)
  const liveArticles = getLiveNews(lang).filter(article => article.frontmatter.category === category)

  const allArticles = [...legacyArticles, ...liveArticles]

  // Trier par date décroissante
  return allArticles.sort((a, b) => {
    const dateA = new Date(a.frontmatter.date).getTime()
    const dateB = new Date(b.frontmatter.date).getTime()
    return dateB - dateA
  })
}

/**
 * Récupère tous les articles de toutes les catégories (legacy + live)
 */
export function getAllNews(lang: VALanguage = 'en'): NewsArticlePreview[] {
  const categories: NewsCategory[] = [
    // Catégories live (VA)
    'notice',
    'maintenance',
    'issues',
    'event',
    'winners',
    // Catégories legacy
    'patchnotes',
    'compendium',
    'developer-notes',
    'official-4-cut-cartoon',
    'probabilities',
    'world-introduction',
    'media-archives',
  ]

  const allArticles = categories.flatMap(cat => getNewsByCategory(cat, lang))

  // Trier par date décroissante
  return allArticles.sort((a, b) => {
    const dateA = new Date(a.frontmatter.date).getTime()
    const dateB = new Date(b.frontmatter.date).getTime()
    return dateB - dateA
  })
}

/**
 * Récupère un article spécifique (legacy ou live)
 */
export function getNewsArticle(category: NewsCategory, slug: string, lang: VALanguage = 'en'): NewsArticle | null {
  // Decode URL-encoded slug (for Unicode characters in KR/JP)
  const decodedSlug = decodeURIComponent(slug)

  // Vérifier si c'est un article live
  if (decodedSlug.startsWith('live-')) {
    const liveSlug = decodedSlug.replace(/^live-[a-z]{2}-/, '')
    const filePath = path.join(LIVE_DIR, lang, `${liveSlug}.md`)

    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = matter(fileContent)

      // Mapper la catégorie
      const vaCategory = (data.category as string) || ''
      const mappedCategory = mapVACategoryToNewsCategory(vaCategory)

      // Extraire la première image pour coverImage
      const imageMatch = content.match(/!\[([^\]]*)\]\(([^)]+)\)/)
      const coverImage = imageMatch ? imageMatch[2] : undefined

      const normalizedFrontmatter: NewsFrontmatter = {
        title: data.title as string,
        date: data.date as string,
        category: mappedCategory,
        id: data.uid as string,
        sourceUrl: data.url as string,
        coverImage,
        uid: data.uid as string,
        url: data.url as string,
        views: data.views as number,
      }

      // Supprimer la première image du contenu
      let cleanedContent = content
      if (coverImage) {
        const imagePattern = new RegExp(`!\\[[^\\]]*\\]\\(${coverImage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, '')
        cleanedContent = cleanedContent.replace(imagePattern, '')
      }

      // Convertir Markdown en HTML
      const html = marked(cleanedContent)

      return {
        slug: decodedSlug,
        frontmatter: normalizedFrontmatter,
        content: cleanedContent,
        html: typeof html === 'string' ? html : '',
      }
    }
  }

  // Article legacy
  const filePath = path.join(LEGACY_DIR, category, `${decodedSlug}.md`)

  if (!fs.existsSync(filePath)) {
    return null
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(fileContent)

  // Supprimer la première image du contenu (elle sera affichée comme cover image)
  const coverImage = (data as NewsFrontmatter).coverImage || (data as NewsFrontmatter).images?.[0]
  let cleanedContent = content

  if (coverImage) {
    // Supprimer la première occurrence de cette image du Markdown
    const imagePattern = new RegExp(`!\\[[^\\]]*\\]\\(${coverImage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, '')
    cleanedContent = cleanedContent.replace(imagePattern, '')
  }

  // Convertir Markdown en HTML
  const html = marked(cleanedContent)

  return {
    slug: decodedSlug,
    frontmatter: data as NewsFrontmatter,
    content: cleanedContent,
    html: typeof html === 'string' ? html : '',
  }
}

/**
 * Récupère tous les slugs d'une catégorie (pour generateStaticParams)
 */
export function getNewsSlugs(category: NewsCategory, lang: VALanguage = 'en'): string[] {
  // Slugs legacy
  const categoryDir = path.join(LEGACY_DIR, category)
  const legacySlugs = fs.existsSync(categoryDir)
    ? fs.readdirSync(categoryDir)
        .filter(f => f.endsWith('.md'))
        .map(f => f.replace(/\.md$/, ''))
    : []

  // Slugs live
  const liveDir = path.join(LIVE_DIR, lang)
  const liveSlugs = fs.existsSync(liveDir)
    ? fs.readdirSync(liveDir)
        .filter(f => f.endsWith('.md'))
        .map(f => `live-${lang}-${f.replace(/\.md$/, '')}`)
        .filter(slug => {
          // Filtrer par catégorie
          const article = getNewsArticle(category, slug, lang)
          return article?.frontmatter.category === category
        })
    : []

  return [...legacySlugs, ...liveSlugs]
}

/**
 * Recherche dans les articles
 */
export function searchNews(query: string, category?: NewsCategory, lang: VALanguage = 'en'): NewsArticlePreview[] {
  const articles = category ? getNewsByCategory(category, lang) : getAllNews(lang)
  const lowerQuery = query.toLowerCase()

  return articles.filter(article => {
    const { title } = article.frontmatter
    const excerpt = article.excerpt || ''
    return (
      title.toLowerCase().includes(lowerQuery) ||
      excerpt.toLowerCase().includes(lowerQuery)
    )
  })
}
