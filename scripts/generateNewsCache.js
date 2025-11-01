// scripts/generateNewsCache.js
// Génère un cache JSON de tous les articles de news pour éviter de parser 800+ fichiers Markdown à chaque requête

const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

const ROOT = process.cwd()
const LEGACY_DIR = path.join(ROOT, 'src', 'data', 'news', 'legacy')
const LIVE_DIR = path.join(ROOT, 'src', 'data', 'news', 'live')
const OUTPUT_FILE = path.join(ROOT, 'src', 'data', 'news', 'news-cache.json')

const VA_LANGUAGES = ['en', 'jp', 'kr', 'zh']

const NEWS_CATEGORIES = [
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

/**
 * Mapper les catégories VA vers nos nouvelles catégories
 */
function mapVACategoryToNewsCategory(vaCategory) {
  const categoryMap = {
    'Notice': 'notice',
    'Maintenance': 'maintenance',
    'Issues': 'issues',
    'Issue': 'issues',
    'Event': 'event',
    'Winners Announcement': 'winners',
  }
  return categoryMap[vaCategory] || 'notice'
}

/**
 * Crée un excerpt à partir du contenu Markdown
 */
function createExcerpt(content) {
  const plainText = content
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/The Action Anime,?\s*OUTERPLANE\s*/gi, '')
    .replace(/Hello,?\s*Masters!?\s*/gi, '')
    .replace(/Dear,?\s*Masters,?\s*/gi, '')
    .replace(/This is GM\s+\w+\.?\s*/gi, '')
    .replace(/\n\s*\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '')
}

/**
 * Récupère tous les articles legacy d'une catégorie
 */
function getLegacyNewsByCategory(category) {
  const categoryDir = path.join(LEGACY_DIR, category)
  if (!fs.existsSync(categoryDir)) return []

  const files = fs.readdirSync(categoryDir).filter(f => f.endsWith('.md'))

  return files.map(filename => {
    const slug = filename.replace(/\.md$/, '')
    const filePath = path.join(categoryDir, filename)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(fileContent)

    return {
      slug,
      title: data.title,
      date: data.date,
      category: data.category,
      excerpt: createExcerpt(content),
      coverImage: data.coverImage,
      images: data.images,
      isLegacy: true,
    }
  })
}

/**
 * Récupère tous les articles live pour une langue donnée
 */
function getLiveNews(lang) {
  const liveDir = path.join(LIVE_DIR, lang)
  if (!fs.existsSync(liveDir)) return []

  const files = fs.readdirSync(liveDir).filter(f => f.endsWith('.md'))

  return files.map(filename => {
    const slug = filename.replace(/\.md$/, '')
    const filePath = path.join(liveDir, filename)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(fileContent)

    const vaCategory = data.category || ''
    const mappedCategory = mapVACategoryToNewsCategory(vaCategory)

    // Extraire la première image
    const imageMatch = content.match(/!\[([^\]]*)\]\(([^)]+)\)/)
    const coverImage = imageMatch ? imageMatch[2] : undefined

    return {
      slug: `live-${lang}-${slug}`,
      title: data.title,
      date: data.date,
      category: mappedCategory,
      excerpt: createExcerpt(content),
      coverImage,
      uid: data.uid,
      url: data.url,
      views: data.views,
      lang, // Garder trace de la langue
    }
  })
}

/**
 * Génère le cache de tous les articles
 */
function generateNewsCache() {
  console.log('🔄 Generating news cache...')

  const cache = {}

  // Pour chaque langue
  for (const lang of VA_LANGUAGES) {
    const articles = []

    // Articles legacy
    for (const category of NEWS_CATEGORIES) {
      const legacyArticles = getLegacyNewsByCategory(category)
      articles.push(...legacyArticles)
    }

    // Articles live
    const liveArticles = getLiveNews(lang)
    articles.push(...liveArticles)

    // Trier par date décroissante
    articles.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateB - dateA
    })

    cache[lang] = articles

    console.log(`  ✅ ${lang}: ${articles.length} articles (${liveArticles.length} live, ${articles.length - liveArticles.length} legacy)`)
  }

  // Écrire le cache
  const outputDir = path.dirname(OUTPUT_FILE)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cache, null, 2), 'utf-8')

  const totalArticles = Object.values(cache).reduce((sum, articles) => sum + articles.length, 0)
  console.log(`✅ News cache generated: ${totalArticles} total articles across ${VA_LANGUAGES.length} languages`)
  console.log(`📝 Cache saved to: ${OUTPUT_FILE}`)
}

// Run
try {
  generateNewsCache()
} catch (error) {
  console.error('❌ Error generating news cache:', error)
  process.exit(1)
}
