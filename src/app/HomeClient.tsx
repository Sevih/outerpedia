'use client'

import Link from 'next/link'
import { getChangelogFor, type ChangelogEntry } from '@/data/changelog'
import { useMemo } from 'react'
import { renderMarkdown } from '@/utils/markdown'
import { useI18n } from '@/lib/contexts/I18nContext'

export default function HomeClient() {
  const { lang } = useI18n()

  const changelog = useMemo<ChangelogEntry[]>(
    () => getChangelogFor(lang),
    [lang]
  )

  const recentChanges = useMemo<ChangelogEntry[]>(
    () => changelog.slice(0, 5),
    [changelog]
  )

  return (
    <div className="space-y-16 px-4 md:px-16">
      {/* SEO structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Outerpedia",
              "url": "https://outerpedia.com",
              "description":
                "Outerpedia is a complete database for the mobile RPG Outerplane. Discover characters, gear builds, exclusive equipment, sets and more."
            },
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Outerpedia",
              "url": "https://outerpedia.com",
              "logo": "https://outerpedia.com/images/icons/icon-192x192.png",
              "sameAs": ["https://discord.com/invite/keGhVQWsHv"],
              "description":
                "Fan-made wiki for Outerplane: tier list, character builds, equipment database and more."
            }
          ])
        }}
      />

      {/* RECENT UPDATES */}
      <section className="mt-12">
        <h2 className="relative mb-8 text-center text-2xl font-bold text-white">
          <span className="relative z-10">
            Latest Outerpedia Updates & Features
          </span>
          <span className="absolute left-1/2 -bottom-1 h-1 w-24 -translate-x-1/2 rounded bg-cyan-600 opacity-70" />
        </h2>

        <div className="relative space-y-8 border-l border-gray-700 pl-6">
          {recentChanges.map((entry, index) => (
            <div
              key={index}
              className="relative rounded-xl border border-gray-700 bg-gray-800/50 p-4"
            >
              <span className="absolute left-[-11px] top-5 h-3 w-3 rounded-full border-2 border-white bg-cyan-500" />

              <div className="mb-1 flex items-center justify-between text-sm text-gray-400">
                <span className="font-mono">{entry.date}</span>
                <span
                  className={`uppercase text-xs font-bold px-2 py-0.5 rounded bg-opacity-20 ${
                    entry.type === 'feature'
                      ? 'bg-green-800 text-green-100'
                      : entry.type === 'update'
                      ? 'bg-blue-800 text-blue-100'
                      : entry.type === 'fix'
                      ? 'bg-red-800 text-red-100'
                      : 'bg-gray-800 text-gray-100'
                  }`}
                >
                  {entry.type.toUpperCase()}
                </span>
              </div>

              <div className="mb-1 text-lg font-semibold text-white">
                {entry.title}
              </div>
              <div
                className="markdown leading-relaxed text-sm text-gray-300"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(entry.content.join('\n'))
                }}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/changelog"
            className="text-sm text-primary hover:underline"
          >
            View full changelog →
          </Link>
        </div>
        <h2 className="sr-only">
          Outerpedia Outerplane database changelog and feature log
        </h2>
      </section>
    </div>
  )
}
