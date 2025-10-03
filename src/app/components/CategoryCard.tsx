'use client'
import Link from 'next/link'
import Image from 'next/image'
import categories from '@/data/guides/categories.json'
import type { TenantKey } from '@/tenants/config'

type Props = { lang: TenantKey }

type Localized = { en: string; jp?: string; kr?: string; fr?: string }

function getLocalized(obj: Localized | string, lang: TenantKey): string {
  if (typeof obj === 'string') return obj
  return obj[lang] ?? obj.en
}

export default function GuideCategoryList({ lang = 'en' }: Props) {
  const items = Object.entries(categories).map(([slug, cat]) => ({
    slug,
    title: getLocalized(cat.title, lang),
    description: getLocalized(cat.description, lang),
    icon: `${cat.icon}.webp`,
    valid: cat.valid,
  }))

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map(({ slug, title, description, icon, valid }) => (
        <Link
          key={slug}
          href={valid ? `/guides/${slug}` : `/UnderConstruction`}
          className="group bg-neutral-900/70 border border-neutral-700 rounded-2xl p-4 flex items-start gap-4 hover:border-sky-500 hover:shadow-lg transition-all"
        >
          <Image
            src={icon}
            alt={`${title} icon`}
            width={48}
            height={48}
            style={{ width: 48, height: 48 }}
            className="flex-shrink-0 object-contain"
          />
          <div className="text-white">
            <h2 className="text-lg font-bold mb-1">{title}</h2>
            <p className="text-sm text-neutral-300">{description}</p>
            {!valid && (
              <p className="mt-2 text-yellow-400 text-sm flex items-center gap-1">
                ⚠️ <span>Under construction</span>
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
