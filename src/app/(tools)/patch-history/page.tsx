import type { Metadata } from 'next'
import { Suspense } from 'react'
import PatchNotesViewer from './patchHistoryClient'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: `Patch Notes & Dev Notes | Outerpedia`,
  description: `Browse all Outerplane patch notes, developer notes, hero compendium and more.`,
  keywords: ['Outerplane','Patch Notes','Developer Notes','Hero Compendium','Updates','Outerpedia'],
  alternates: { canonical: 'https://outerpedia.com/patch-history' },
  openGraph: {
    title: `Patch Notes & Dev Notes | Outerpedia`,
    description: `Browse all Outerplane patch notes, developer notes, hero compendium and more.`,
    siteName: 'Outerpedia',
    url: 'https://outerpedia.com/patch-history',
    type: 'website',
    images: [{ url: 'https://outerpedia.com/images/ui/nav/CM_Lobby_Button_Agit.webp', width: 150, height: 150, alt: 'Patch Notes & Dev Notes – Outerpedia' }],
  },
  twitter: {
    card: 'summary',
    title: `Patch Notes & Dev Notes | Outerpedia`,
    description: `Browse all Outerplane patch notes, developer notes, hero compendium and more.`,
    images: ['https://outerpedia.com/images/ui/nav/CM_Lobby_Button_Agit.webp'],
  },
}

export default function Page() {
  return (
    <main className="p-6 max-w-5xl mx-auto">
      <div className="relative top-4 left-4 z-20 h-[32px] w-[32px]">
        <Link href="/tools" className="relative block h-full w-full">
          <Image
            src="/images/ui/CM_TopMenu_Back.webp"
            alt="Back"
            fill
            sizes="32px"
            className="opacity-80 hover:opacity-100 transition-opacity"
          />
        </Link>
      </div>

      <h1>Patch Notes &amp; Dev Notes</h1>
      <p className="text-neutral-300 mb-4">
        Browse all Outerplane patch notes, developer notes, compendium and more — searchable and sorted by date.
      </p>

      {/* ⬇️ wrappe le composant client qui utilise useSearchParams */}
      <Suspense fallback={<div className="text-sm text-neutral-400">Loading…</div>}>
        <PatchNotesViewer />
      </Suspense>
    </main>
  )
}
