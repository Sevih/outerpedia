import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/seo'
import { ProgressTrackerClient } from './ProgressTrackerClient'

export async function generateMetadata(): Promise<Metadata> {
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
      url: '/images/ui/nav/CM_Lobby_Button_Misson.webp',
      width: 150,
      height: 150,
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
