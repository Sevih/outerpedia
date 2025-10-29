// src/app/changelog/page.tsx
import { getTenantServer } from '@/tenants/tenant.server'
import { getChangelog } from '@/data/changelog'
import { Card, CardContent } from '@/app/components/ui/card'
import { renderMarkdown } from '@/utils/markdown'
import { type Metadata } from 'next'
import Link from 'next/link'
import { createPageMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    path: '/changelog',
    titleKey: 'changelog.meta.title',
    descKey: 'changelog.meta.desc',
    image: {
      url: '/images/ui/og_home.jpg',
      width: 1200,
      height: 630,
      altFallback: 'Outerpedia Changelog',
    },
    ogType: 'article',
    twitterCard: 'summary_large_image',
  })
}

export default async function ChangelogPage() {
  const { key } = await getTenantServer()   // ✅ et là
  const entries = getChangelog(key)

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-8 text-center relative">
        <span className="relative z-10">Changelog</span>
        <span className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-24 h-1 bg-cyan-600 opacity-70 rounded" />
      </h1>

      <div className="space-y-6">
        {entries.map((entry, index) => (
          <Card key={index}>
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{entry.date}</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded uppercase bg-opacity-20 ${
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

              {entry.url ? (
                <Link href={entry.url}>
                  <h2 className="text-lg font-semibold text-red-400 hover:text-cyan-400 transition-colors cursor-pointer">
                    {entry.title}
                  </h2>
                </Link>
              ) : (
                <h2 className="text-lg font-semibold text-white">{entry.title}</h2>
              )}
              <div
                className="text-sm text-gray-400 markdown"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(entry.content.join('\n')) }}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
