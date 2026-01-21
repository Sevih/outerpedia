'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useI18n } from '@/lib/contexts/I18nContext'

export default function HowToPlayBox() {
  const { t } = useI18n()

  return (
    <div className="rounded-xl border border-zinc-700 bg-gray-800 p-6 shadow-lg">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative h-16 w-16 flex-shrink-0">
          <Image
            src="/images/ui/nav/CM_Lobby_Button_Recruitment.webp"
            alt="How to Play"
            fill
            sizes="64px"
            className="object-contain"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">
            {t('howToPlay.hero.title')}
          </h3>
          <p className="text-sm text-gray-400">
            {t('howToPlay.mobile.title')}
          </p>
        </div>
      </div>

      <p className="mb-4 text-sm text-gray-300">
        {t('howToPlay.hero.subtitle')}
      </p>

      <Link
        href="/guides/how-to-play"
        className="block w-full rounded-lg bg-cyan-600 px-4 py-2 text-center font-semibold text-white transition-colors hover:bg-cyan-500"
      >
        {t('howToPlay.meta.breadcrumb')}
      </Link>
    </div>
  )
}