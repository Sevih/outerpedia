'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/contexts/I18nContext'

export default function NewToBox() {
  const { t } = useI18n()

  return (
    <div className="rounded-xl border border-zinc-700 bg-gray-800 p-4 shadow-lg">
      <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
        {t('home.newTo')}
      </h3>

      <p className="mb-4 text-sm text-gray-300">
        {t('home.newTo.desc')}
      </p>

      <ul className="space-y-2 text-sm text-cyan-400">
        <li>
          <Link href="/guides/general-guides/free-heroes-start-banner" className="hover:underline">
            • <span className="text-white">{t('home.newTo.links.freeHeroes')}</span> {t('home.newTo.links.freeHeroes.desc')}
          </Link>
        </li>
        <li>
          <Link href="/guides/general-guides/stats" className="hover:underline">
            • <span className="text-white">{t('home.newTo.links.stats')}</span> {t('home.newTo.links.stats.desc')}
          </Link>
        </li>
        <li>
          <Link href="/guides/general-guides/gear" className="hover:underline">
            • <span className="text-white">{t('home.newTo.links.gear')}</span> {t('home.newTo.links.gear.desc')}
          </Link>
        </li>
        <li>
          <Link href="/guides/general-guides/heroes-growth" className="hover:underline">
            • <span className="text-white">{t('home.newTo.links.growth')}</span> {t('home.newTo.links.growth.desc')}
          </Link>
        </li>
      </ul>

      <div className="mt-4 text-xs italic text-gray-400">
        {t('home.newTo.footer')}
      </div>
    </div>
  )
}
