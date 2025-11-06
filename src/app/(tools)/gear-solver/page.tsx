// app/(tools)/gear-solver/page.tsx
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import GearSolverWrapper from './GearSolverWrapper'

import { createPageMetadata } from '@/lib/seo'
import JsonLd from '@/app/components/JsonLd'
import { websiteLd, breadcrumbLd } from './jsonld'
import { getTenantServer } from '@/tenants/tenant.server'
import { getServerI18n } from '@/lib/contexts/server-i18n'

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    path: '/gear-solver',
    titleKey: 'gearSolver.meta.title',
    descKey: 'gearSolver.meta.desc',
    ogTitleKey: 'gearSolver.og.title',
    ogDescKey: 'gearSolver.og.desc',
    twitterTitleKey: 'gearSolver.twitter.title',
    twitterDescKey: 'gearSolver.twitter.desc',
    keywords: [
      'Outerplane',
      'Outerpedia',
      'Gear Finder',
      'Recommended Gear',
      'Weapons',
      'Amulets',
      'Sets',
      'EvaMains',
    ],
    image: {
      // Règle projet: PNG pour metadata, WEBP en page
      url: 'https://outerpedia.com/images/ui/nav/gear-solver.png',
      width: 150,
      height: 150,
      altKey: 'gearSolver.og.imageAlt',
      altFallback: 'Gear Usage Finder — Outerpedia',
    },
  })
}

export default async function Page() {
  const { key: lang, domain } = await getTenantServer()
  const { t } = await getServerI18n(lang)

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <div className="relative top-4 left-4 z-20 h-[32px] w-[32px]">
        <Link href="/tools" className="relative block h-full w-full" aria-label={t('back') ?? 'Back'}>
          <Image
            src="/images/ui/CM_TopMenu_Back.webp" // WEBP en page
            alt={t('back') ?? 'Back'}
            fill
            sizes="32px"
            className="opacity-80 hover:opacity-100 transition-opacity"
          />
        </Link>
      </div>

      <h1>{t('gearSolver.h1') ?? 'Gear Usage Finder'}</h1>

      <p className="text-yellow-900 font-semibold bg-yellow-100 border border-yellow-300 rounded px-4 py-2 text-sm">
        {t('gearSolver.warning') ??
          '⚠️ The Gear Usage Finder tool is still under development — results may be incomplete or imprecise. Use it as a guide, not as a final answer.'}
      </p>

      <JsonLd
        json={[
          websiteLd(domain),
          breadcrumbLd(domain, {
            home: t('nav.home') ?? 'Home',
            current: t('gearSolver.meta.breadcrumb') ?? 'Gear Usage Finder',
            currentPath: '/gear-solver',
          }),
        ]}
      />

      <GearSolverWrapper />
    </main>
  )
}
