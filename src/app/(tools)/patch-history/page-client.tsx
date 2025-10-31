'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useI18n } from '@/lib/contexts/I18nContext'

type NewsArticle = {
  slug: string
  title: string
  date: string
  category: string
  excerpt?: string
  coverImage?: string
  images?: string[]
}

type NewsPageClientProps = {
  initialArticles: NewsArticle[]
  categories: Array<{ value: string; label: string; count: number; includes: string[] }>
}

export default function NewsPageClient({ initialArticles, categories }: NewsPageClientProps) {
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Synchroniser avec le paramètre d'URL
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl)
    }
  }, [searchParams])

  // Fonction pour changer de catégorie et mettre à jour l'URL
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    if (category === 'all') {
      router.push('/patch-history')
    } else {
      router.push(`/patch-history?category=${category}`)
    }
  }

  // Filtrage dynamique côté client
  const filteredArticles = useMemo(() => {
    let filtered = initialArticles

    // Filtre par catégorie
    if (selectedCategory !== 'all') {
      // Trouver les catégories incluses dans le groupe sélectionné
      const selectedGroup = categories.find(cat => cat.value === selectedCategory)
      const includedCategories = selectedGroup?.includes || [selectedCategory]

      filtered = filtered.filter(article => includedCategories.includes(article.category))
    }

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(query) ||
        (article.excerpt || '').toLowerCase().includes(query)
      )
    }

    return filtered
  }, [initialArticles, selectedCategory, searchQuery, categories])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">{t('patchHistory.h1')}</h1>

      {/* Filters */}
      <div className="mb-8 space-y-6">
        {/* Search */}
        <div className="relative max-w-2xl">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('patchHistory.search.placeholder') ?? 'Search news...'}
            className="w-full pl-12 pr-12 py-3 rounded-xl bg-neutral-800/50 border border-neutral-700 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            role="search"
            autoComplete="off"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
              aria-label="Clear search"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Category filter */}
        <div>
          <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`
                  group relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    selectedCategory === cat.value
                      ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-neutral-800/50 text-neutral-300 hover:bg-neutral-700/80 border border-neutral-700/50 hover:border-neutral-600'
                  }
                `}
              >
                <span className="relative z-10">{cat.label}</span>
                <span className={`
                  ml-1.5 text-xs font-semibold
                  ${selectedCategory === cat.value ? 'text-blue-100' : 'text-neutral-500 group-hover:text-neutral-400'}
                `}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-400 text-lg">{t('patchHistory.results.noResults')}</p>
          <p className="text-neutral-500 text-sm mt-2">
            {t('patchHistory.results.tryAdjusting')}
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-neutral-400 mb-4">
            {t('patchHistory.results.showing', { count: filteredArticles.length })}
          </p>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {filteredArticles.map((article) => {
              const coverImage = article.coverImage || article.images?.[0]
              const formattedDate = new Date(article.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })

              return (
                <Link
                  key={article.slug}
                  href={`/patch-history/${article.category}/${article.slug}`}
                  className="group block rounded-lg bg-neutral-900 overflow-hidden hover:ring-2 hover:ring-blue-600 transition-all"
                >
                  {/* Image - hauteur réduite */}
                  {coverImage && (
                    <div className="relative w-full h-36 overflow-hidden bg-neutral-800">
                      <Image
                        src={coverImage}
                        alt={article.title}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-2.5">
                    {/* Category badge */}
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600/20 text-blue-400 font-medium uppercase truncate">
                        {article.category.replace(/-/g, ' ')}
                      </span>
                      <span className="text-[10px] text-neutral-500 whitespace-nowrap">{formattedDate}</span>
                    </div>

                    {/* Title */}
                    <h2 className="text-sm font-bold text-white line-clamp-2 group-hover:text-blue-400 transition-colors min-h-[2.25rem]">
                      {article.title}
                    </h2>

                    {/* Excerpt - optionnel */}
                    {article.excerpt && (
                      <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1.5">{article.excerpt}</p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
