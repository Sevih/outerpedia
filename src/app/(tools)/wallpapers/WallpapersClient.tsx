'use client'

import { useState, useMemo, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useI18n } from '@/lib/contexts/I18nContext'
import { AnimatedTabs } from '@/app/components/AnimatedTabs'
import WallpaperLightbox from '@/app/components/WallpaperLightbox'

type Category = 'Art' | 'Banner' | 'Cutin' | 'Full:Events' | 'Full:Scenario' | 'Full:Others' | 'HeroFullArt'
type ImageEntry = { f: string; w: number; h: number }
type WallpapersData = Record<Category, ImageEntry[]>

interface Props {
  data: WallpapersData
}

const CATEGORIES: Category[] = ['HeroFullArt', 'Cutin', 'Full:Scenario', 'Full:Events', 'Full:Others', 'Banner', 'Art']

function isValidCategory(value: string | null): value is Category {
  return value !== null && CATEGORIES.includes(value as Category)
}

// Map category key to actual folder name
function getFolderName(category: Category): string {
  if (category.startsWith('Full:')) return 'Full'
  return category
}

export default function WallpapersClient({ data }: Props) {
  const { t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()

  const categoryFromUrl = searchParams.get('cat')
  const selectedCategory: Category = isValidCategory(categoryFromUrl) ? categoryFromUrl : 'HeroFullArt'

  const setSelectedCategory = useCallback((cat: Category) => {
    router.replace(`?cat=${cat}`, { scroll: false })
  }, [router])

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const tabs = useMemo(
    () =>
      CATEGORIES.map((cat) => ({
        key: cat,
        label: t(`wallpapers.categories.${cat}`),
        count: data[cat]?.length ?? 0,
      })),
    [t, data]
  )

  const images = useMemo(() => {
    const folder = getFolderName(selectedCategory)
    return (data[selectedCategory] ?? []).map((entry) => ({
      filename: entry.f,
      width: entry.w,
      height: entry.h,
      src: `/images/download/${folder}/${entry.f}.webp`,
      downloadSrc: `/images/download/${folder}/${entry.f}.png`,
    }))
  }, [data, selectedCategory])

  const lightboxImages = useMemo(
    () => images.map((img) => ({
      src: img.src,
      downloadSrc: img.downloadSrc,
      width: img.width,
      height: img.height,
    })),
    [images]
  )

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('wallpapers.title')}</h1>

      {/* Disclaimer */}
      <div className="mb-6 p-4 bg-amber-900/30 border border-amber-700/50 rounded-lg flex items-start gap-3">
        <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="text-amber-200/90 text-sm text-center flex-1">
          <p>{t('wallpapers.disclaimer.line1')}</p>
          <p className="mt-1">
            {t('wallpapers.disclaimer.line2')}{' '}
            <a
              href={t('link.helpshift')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 underline"
            >
              {t('wallpapers.contactLink')}
            </a>
          </p>
        </div>
      </div>

      <p className="text-gray-400 text-sm mb-6 text-center">
        {t('wallpapers.description')}
      </p>

      {/* Category tabs */}
      <div className="flex justify-center mb-6">
        <AnimatedTabs
          tabs={tabs}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* Gallery grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {images.map((img, index) => (
          <button
            key={img.filename}
            className="relative aspect-video bg-neutral-900 rounded-lg overflow-hidden border border-neutral-700 hover:border-sky-500 transition-all hover:scale-[1.02] group"
            onClick={() => setLightboxIndex(index)}
          >
            <Image
              src={img.src}
              alt={img.filename}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover"
              loading="lazy"
            />
            {/* Resolution badge */}
            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 rounded text-[10px] text-gray-300 font-mono">
              {img.width}x{img.height}
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <WallpaperLightbox
        images={lightboxImages}
        currentIndex={lightboxIndex ?? 0}
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </main>
  )
}
