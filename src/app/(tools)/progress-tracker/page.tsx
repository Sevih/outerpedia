import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/seo'
import { getToolOgImage } from '@/lib/getToolMeta'
import { getTenantServer } from '@/tenants/tenant.server'
import { ProgressTrackerClient } from './ProgressTrackerClient'

export async function generateMetadata(): Promise<Metadata> {
  const { domain } = await getTenantServer()

  return createPageMetadata({
    path: '/progress-tracker',
    titleKey: 'tool.progress-tracker.name',
    descKey: 'tool.progress-tracker.description',
    ogTitleKey: 'tool.progress-tracker.name',
    ogDescKey: 'tool.progress-tracker.description',
    keywords: [
      'outerpedia',
      'outerplane',
      'progress tracker',
      'daily tasks',
      'weekly tasks',
      'mission tracker',
      'checklist',
    ],
    image: {
      ...getToolOgImage('progress-tracker', domain),
      altFallback: 'Outerplane Progress Tracker',
    },
  })
}

export default function ProgressTrackerPage() {
  return (
    <main className="container mx-auto p-6 max-w-4xl">
      <ProgressTrackerClient />
    </main>
  )
}
