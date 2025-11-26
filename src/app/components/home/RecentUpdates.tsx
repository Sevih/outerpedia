'use client'

import Link from 'next/link'
import { getChangelog, type ChangelogEntry } from '@/data/changelog'
import { useMemo } from 'react'
import { renderMarkdown } from '@/utils/markdown'
import { useI18n } from '@/lib/contexts/I18nContext'

export default function RecentUpdates() {
  const { t, lang } = useI18n()

  const recentChanges = useMemo<ChangelogEntry[]>(
    () => getChangelog(lang, { limit: 5 }),
    [lang]
  )

  return (
    <section>
      <h2 className="relative mb-8 text-center text-2xl font-bold text-white">
        <span className="relative z-10">
          {t('titles.main.changetitle')}
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
                className={`uppercase text-xs font-bold px-2 py-0.5 rounded bg-opacity-20 ${entry.type === 'feature'
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

            {entry.url ? (
              <Link href={entry.url}>
                <div className="mb-1 text-lg font-semibold text-red-400 hover:text-cyan-400 transition-colors cursor-pointer">
                  {entry.title}
                </div>
              </Link>
            ) : (
              <div className="mb-1 text-lg font-semibold text-white">
                {entry.title}
              </div>
            )}
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
        >{t('titles.main.tochangelog')} →
        </Link>
      </div>
      <h2 className="sr-only">
        Outerpedia Outerplane database changelog and feature log
      </h2>
    </section>
  )
}
