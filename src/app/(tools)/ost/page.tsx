import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/seo'
import { getToolOgImage } from '@/lib/getToolMeta'
import { getTenantServer } from '@/tenants/tenant.server'
import OstClient from './OstClient'
import bgmMapping from '@/data/bgm_mapping.json'

export async function generateMetadata(): Promise<Metadata> {
  const { domain } = await getTenantServer()

  return createPageMetadata({
    path: '/ost',
    titleKey: 'tool.ost.name',
    descKey: 'tool.ost.description',
    ogTitleKey: 'tool.ost.name',
    ogDescKey: 'tool.ost.description',
    keywords: [
      'outerpedia',
      'outerplane',
      'ost',
      'soundtrack',
      'music',
      'bgm',
      'download',
      'audio',
      'game music',
    ],
    image: {
      ...getToolOgImage('ost', domain),
      altFallback: 'Outerplane Soundtrack',
    },
  })
}

export default function OstPage() {
  return <OstClient tracks={bgmMapping} />
}
