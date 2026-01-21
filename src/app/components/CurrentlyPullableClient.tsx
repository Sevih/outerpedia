'use client'

import CharacterCard, { useCharacterData } from './CharacterCard'
import Countdown from './Countdown'
import { useI18n } from '@/lib/contexts/I18nContext'

type Banner = {
  name: string // Fullname in English
  endDate: string
}

type Props = {
  banners: Banner[]
}

function BannerCard({ name, endDate }: Banner) {
  const char = useCharacterData(name)
  const element = char?.Element.toLowerCase() ?? 'fire'

  return (
    <div className="flex flex-col items-center space-y-1">
      {/* Version mobile (md) */}
      <div className="lg:hidden">
        <CharacterCard name={name} size="md" priority />
      </div>
      {/* Version desktop (lg) */}
      <div className="hidden lg:block">
        <CharacterCard name={name} size="lg" priority />
      </div>
      <Countdown endDate={endDate} element={element} />
    </div>
  )
}


export default function CurrentlyPullableClient({ banners }: Props) {
  const { t } = useI18n()

  return (
    <section className="flex flex-col items-center space-y-4">
      {/* Titre */}
      <h2 className="text-xl md:text-2xl font-extrabold tracking-wide text-white relative text-center">
        <span className="z-10 relative">{t('titles.main.pull')}</span>
        <span className="absolute left-1/2 transform -translate-x-1/2 -bottom-1 w-3/4 h-1 bg-cyan-600 opacity-70 rounded" />
      </h2>

      {/* Cartes */}
      {banners.length > 0 ? (
        <div className="flex gap-3 md:gap-5 justify-center flex-wrap">
          {banners.map((banner) => (
            <BannerCard key={banner.name} {...banner} />
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm">{t('titles.main.noBanner')}</p>
      )}
    </section>
  )
}
