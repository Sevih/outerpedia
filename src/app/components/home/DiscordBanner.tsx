'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useI18n } from '@/lib/contexts/I18nContext'

export default function DiscordBanner() {
  const { t } = useI18n()

  return (
    <Link
      href="https://discord.com/invite/keGhVQWsHv"
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full"
    >
      <div className="bg-[#5865F2] hover:bg-[#4752c4] transition-all duration-300 rounded-xl overflow-hidden shadow-md p-3 md:p-4 group">
        <div className="flex items-center justify-center gap-3 md:gap-4">
          <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
            <Image
              src="/images/discord_icon.webp"
              alt={t('home.discord.name')}
              fill
              sizes="48px"
              className="object-contain rounded-full shadow-md transition-all duration-300 group-hover:shadow-[0_0_10px_4px_rgba(255,255,255,0.5)]"
            />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm md:text-base font-semibold text-white">
              {t('home.discord.joinUs')}
            </span>
            <span className="text-base md:text-lg font-bold text-white">
              {t('home.discord.name')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
