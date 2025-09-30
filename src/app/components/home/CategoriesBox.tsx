'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useI18n } from '@/lib/contexts/I18nContext'

const categories = [
  { key: 'characters', path: '/characters', icon: 'CM_Lobby_Button_Character.webp' },
  { key: 'equipments', path: '/equipments', icon: 'CM_Lobby_Button_Inventory.webp' },
  { key: 'tierlist', path: '/tierlist', icon: 'CM_Lobby_Button_Misson.webp' },
  { key: 'utilities', path: '/tools', icon: 'CM_Agit_Facility.webp' },
  { key: 'guides', path: '/guides', icon: 'CM_Guild_Management.webp' },
] as const

export default function CategoriesBox() {
  const { t } = useI18n()

  return (
    <>
      <h2 className="text-2xl font-extrabold tracking-wide text-white mb-6 relative">
        <span className="relative z-10">{t('home.categories.title')}</span>
        <span className="absolute left-1/2 -bottom-1 h-1 w-24 -translate-x-1/2 rounded bg-cyan-600/70" />
      </h2>

      <p className="text-sm text-gray-400 mb-4">
        {t('home.categories.desc')}
      </p>

      <ul className="grid grid-cols-2 lg:grid-cols-5 gap-6 place-items-center">
        {categories.map(cat => (
          <li key={cat.path} className="w-full max-w-[140px]">
            <Link href={cat.path} aria-label={`Go to ${t(`categories.${cat.key}`)} page`}>
              <div className="aspect-square cursor-pointer rounded-2xl bg-gray-800 p-4 shadow-lg transition-transform hover:scale-105 hover:bg-gray-700">
                <div className="flex h-full w-full flex-col items-center justify-center">
                  <div className="relative h-[80px] w-[80px]">
                    <Image
                      src={`/images/ui/nav/${cat.icon}`}
                      alt={`${t(`categories.${cat.key}`)} section - Outerplane`}
                      fill
                      sizes="80px"
                      className="mb-2 object-contain"
                    />
                  </div>
                  <span className="text-md font-semibold text-white">
                    {t(`categories.${cat.key}`)}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
