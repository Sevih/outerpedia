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
      <div className="mb-8 space-y-4">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  selectedCategory === cat.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }
              `}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('patchHistory.search.placeholder') ?? 'Search news...'}
            className="flex-1 px-4 py-2 rounded-lg bg-neutral-800 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors"
            >
              {t('patchHistory.search.clear')}
            </button>
          )}
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
