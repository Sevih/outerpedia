import Image from 'next/image'
import ClassInlineTag from './ClassInlineTag'
import { highlightDiff } from '@/utils/textHighlighter'
import { toKebabCase } from '@/utils/formatText'
import ItemSourceBox from './SourceBox'
import ItemStatsBlock from './ItemStatsBlock'
import type { TenantKey } from '@/tenants/config'
import type { Accessory } from '@/types/equipment'
import { l } from '@/lib/localize'
type Lang = TenantKey

export default function renderAccessory(entry: Accessory, lang: Lang = 'en',t: (key: string, vars?: Record<string, unknown>) => string) {

  // Utilise la fonction l() de localize.ts au lieu d'une fonction locale
  const name = l(entry, 'name', lang)
  const effect_name = l(entry, 'effect_name', lang)
  const effect_desc1 = l(entry, 'effect_desc1', lang)
  const effect_desc4 = l(entry, 'effect_desc4', lang)
  const source = l(entry, 'source', lang)

  // Images (affichage page) → .webp
  const imageUrl = `/images/equipment/${entry.image}.webp`
  const slotBgKey = entry.rarity
  const effectKey = entry.effect_icon?.trim()
  // Accessory a son naming spécial (gardé comme dans ton code)
  const iconEffectUrl = effectKey
    ? `/images/ui/effect/${effectKey}.webp`
    : null

  // Étoiles affichées (fallback 6 si level non valide)
  const starLevel = Number.isFinite(entry.level) ? entry.level : 6

  // Présence effets
  const hasBase = !!effect_desc1?.trim()
  const hasT4 = !!effect_desc4?.trim()
  const showT4 = hasT4 && effect_desc4 !== effect_desc1

  // URL canonique (JSON-LD)
  const url = `https://outerpedia.com/item/accessory/${toKebabCase(entry.name)}`

  return (
    <div className="flex flex-col gap-6 text-white items-center">
      {/* En-tête : vignette + titre + classe/rarete */}
      <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
        {/* vignette style weapon */}
        <div className="relative w-[80px] h-[80px] shrink-0">
          {/* fond selon la rareté (décoratif) */}
          <Image
            src={`/images/bg/CT_Slot_${slotBgKey}.webp`}
            alt="background"
            aria-hidden="true"
            fill
            sizes="80px"
            className="absolute inset-0 z-0"
            priority
          />

          {/* image accessoire */}
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="80px"
            className="relative z-10 object-contain"
            priority
          />

          {/* étoiles */}
          {starLevel > 0 && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 inline-flex justify-center mt-0.5 z-20">
              {Array.from({ length: starLevel }).map((_, i) => (
                <Image
                  key={i}
                  src="/images/ui/CM_icon_star_y.webp"
                  alt="star"
                  aria-hidden="true"
                  width={15}
                  height={15}
                  className={`object-contain ${i > 0 ? '-ml-1' : ''}`}
                />
              ))}
            </div>
          )}

          {/* icône effet */}
          {effectKey && (
            <div className="absolute top-2 right-2 z-20 translate-x-1/3 -translate-y-1/3">
              <Image
                src={iconEffectUrl!}
                alt={effect_name}
                width={20}
                height={20}
                style={{ width: 20, height: 20 }}
              />
            </div>
          )}

          {/* icône classe */}
          {entry.class && (
            <div className="absolute top-8 right-2 -translate-y-1/3 z-20 translate-x-1/3">
              <Image
                src={`/images/ui/class/${entry.class.toLowerCase()}.webp`}
                alt={`${entry.class} class`}
                width={20}
                height={20}
                style={{ width: 20, height: 20 }}
              />
            </div>
          )}
        </div>

        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold mb-2">{name} - {t('equipments_tabs.accessory')}</h1>

          {entry.class && (
            <p className="text-sm text-neutral-300">
              <span className="font-semibold">{t('items.classRestriction')}</span>{' '}
              <ClassInlineTag name={entry.class} />
            </p>
          )}

          {entry.rarity && (
            <p className="text-sm text-neutral-300">
              <span className="font-semibold">{t('items.rarity')}</span> {entry.rarity}
            </p>
          )}
        </div>
      </div>

      {/* Stats principales (mapping PEN/HH en %) */}
      {entry.mainStats && entry.mainStats.length > 0 && (
        <ItemStatsBlock
          stats={entry.mainStats.map(stat =>
            stat === 'PEN' ? 'PEN%' : stat === 'HH' ? 'HH%' : stat
          )}
          substats={[]}
          type="accessories"
          rare={starLevel}
          lang={lang}
        />
      )}

      {/* Effets */}
      {effect_name && (hasBase || hasT4) && (
        <div className="bg-black/30 border border-white/10 rounded-xl p-5 w-full max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            {iconEffectUrl && (
              <Image src={iconEffectUrl} alt={effect_name} width={24} height={24} />
            )}
            <span className="font-semibold text-white">{effect_name}</span>
          </div>

          {hasBase && (
            <p className="text-sm text-neutral-200 whitespace-pre-line mb-2">
              <span className="text-amber-300 font-semibold">{t('items.baseEffect')}</span>{' '}
              {highlightDiff(effect_desc4 || '', effect_desc1 || '')}
            </p>
          )}

          {showT4 && (
            <p className="text-sm text-neutral-200 whitespace-pre-line">
              <span className="text-amber-300 font-semibold">{t('items.tier4Effect')}</span>{' '}
              {highlightDiff(effect_desc1 || '', effect_desc4 || '')}
            </p>
          )}
        </div>
      )}

      {/* Source / Boss / Mode (localisé) */}
      <ItemSourceBox
        itemname={name}
        source={source}
        boss={entry.boss ?? undefined}
        mode={entry.mode ?? undefined}
      />

       <p className='w-full max-w-3xl'
              dangerouslySetInnerHTML={{
                __html: t('accessory.intro1')
              }}
            />
            <p className='w-full max-w-3xl'
              dangerouslySetInnerHTML={{
                __html: t('weapon.intro2')
              }}
            />

      {/* SEO JSON-LD (URLs absolues) */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'VideoGame',
            name: 'Outerplane',
            url,
            gameItem: {
              '@type': 'Thing',
              name: entry.name,
              image: `https://outerpedia.com/images/equipment/${entry.image}.webp`,
              url,
              description: entry.effect_desc4 || entry.effect_desc1 || '',
            },
          }),
        }}
      />
    </div>
  )
}
