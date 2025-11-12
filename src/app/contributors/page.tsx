// src/app/contributors/page.tsx
import { getTenantServer } from '@/tenants/tenant.server'
import { getServerI18n } from '@/lib/contexts/server-i18n'
import { Card, CardContent } from '@/app/components/ui/card'
import { type Metadata } from 'next'
import { createPageMetadata } from '@/lib/seo'
import Image from 'next/image'
import contributors from '@/data/contributors.json'

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    path: '/contributors',
    titleKey: 'contributors.meta.title',
    descKey: 'contributors.meta.desc',
    image: {
      url: '/images/ui/og_home.jpg',
      width: 1200,
      height: 630,
      altFallback: 'Outerpedia Contributors',
    },
    ogType: 'website',
    twitterCard: 'summary_large_image',
  })
}

export default async function ContributorsPage() {
  const { key: langKey } = await getTenantServer()
  const { t } = await getServerI18n(langKey)

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-4 text-center relative">
        <span className="relative z-10">{t('contributors.title')}</span>
        <span className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-24 h-1 bg-cyan-600 opacity-70 rounded" />
      </h1>

      <p className="text-center text-gray-400 mb-8 max-w-2xl mx-auto">
        {t('contributors.description')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contributors.map((contributor) => (
          <Card key={contributor.id}>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  {contributor.avatar && (
                    <Image
                      src={`/images/contributors/${contributor.avatar}.webp`}
                      alt={contributor.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full object-cover border-2 border-cyan-600/30"
                    />
                  )}
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-white mb-1">{contributor.name}</h2>
                    <p className="text-sm text-cyan-400 mb-2">{contributor.role}</p>

                    {contributor.favoriteCharacter && (
                      <p className="text-sm text-gray-400 mb-2">
                        <span className="text-gray-500">Favorite Character:</span> {contributor.favoriteCharacter}
                      </p>
                    )}
                  </div>
                </div>

                {contributor.quote && (
                  <p className="text-sm text-gray-300 italic border-l-2 border-cyan-600/50 pl-3">
                    &ldquo;{contributor.quote}&rdquo;
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}