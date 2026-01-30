import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/seo'
import { getToolOgImage } from '@/lib/getToolMeta'
import { getTenantServer } from '@/tenants/tenant.server'
import WallpapersClient from './WallpapersClient'
import wallpapers from '@/data/wallpapers.json'

export async function generateMetadata(): Promise<Metadata> {
  const { domain } = await getTenantServer()

  return createPageMetadata({
    path: '/wallpapers',
    titleKey: 'tool.wallpapers.name',
    descKey: 'tool.wallpapers.description',
    ogTitleKey: 'tool.wallpapers.name',
    ogDescKey: 'tool.wallpapers.description',
    keywords: [
      'outerpedia',
      'outerplane',
      'wallpapers',
      'wallpaper',
      'artwork',
      'art',
      'download',
      'official art',
      'game art',
      'background',
    ],
    image: {
      ...getToolOgImage('wallpapers', domain),
      altFallback: 'Outerplane Wallpapers Gallery',
    },
  })
}

export default function WallpapersPage() {
  return <WallpapersClient data={wallpapers} />
}
