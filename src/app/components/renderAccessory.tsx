import Image from 'next/image'
import { toKebabCase } from '@/utils/formatText'
import StarLevelItem from './StarLevelItem'
import ClassInlineTag from './ClassInlineTag'
import { highlightDiff } from '@/utils/textHighlighter'
import ItemSourceBox from './SourceBox'
import ItemStatsBlock from './ItemStatsBlock'

type Accessory = {
  name: string
  class?: string
  image?: string
  rarity?: string
  level?: number
  mainStats?: string[]
  effect_name?: string
  effect_desc1?: string
  effect_desc4?: string
  effect_icon?: string
  source?: string
  boss?: string
  mode?: string
}

export default function renderAccessory(entry: Accessory) {
  const imageUrl = `https://outerpedia.com/images/equipment/${entry.image}`
  const iconEffectUrl = entry.effect_icon
    ? `https://outerpedia.com/images/ui/effect/TI_Icon_UO_Accessary_${entry.effect_icon}.webp`
    : null
  const url = `https://outerpedia.com/item/accessory/${toKebabCase(entry.name)}`

  const rarity = isNaN(Number(entry.level)) ? 6 : Number(entry.level)

  return (
    <div className="flex flex-col gap-6 text-white items-center">

      {/* Image + nom + classe */}
      <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
        <div className="w-[100px] h-[100px] relative shrink-0">
          <Image
            src={imageUrl}
            alt={entry.name}
            fill
            sizes="100px"
            className="object-contain rounded-xl bg-neutral-900 border border-white/10"
          />
        </div>

        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold mb-2">{entry.name}</h1>

          {typeof entry.level === 'number' && (
            <div className="mb-2 flex justify-center sm:justify-start">
              <StarLevelItem yellow={entry.level} size={18} />
            </div>
          )}

          {entry.class && (
            <p className="text-sm text-neutral-300">
              <span className="font-semibold">Class restriction:</span>{' '}
              <ClassInlineTag name={entry.class} />
            </p>
          )}

          {entry.rarity && (
            <p className="text-sm text-neutral-300">
              <span className="font-semibold">Rarity:</span> {entry.rarity}
            </p>
          )}
        </div>
      </div>

      {/* stats */}
      {entry.mainStats && (
        <ItemStatsBlock
          stats={entry.mainStats.map(stat =>
            stat === 'PEN' ? 'PEN%' :
              stat === 'HH' ? 'HH%' :
                stat
          )}

          substats={[]}
          type="accessories"
          rare={rarity}
        />

      )}

      {/* Effets */}
      {entry.effect_name && (
        <div className="bg-black/30 border border-white/10 rounded-xl p-5 w-full max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            {iconEffectUrl && (
              <Image src={iconEffectUrl} alt={entry.effect_name} width={24} height={24} />
            )}
            <span className="font-semibold text-white">{entry.effect_name}</span>
          </div>

          {entry.effect_desc1 && (
            <p className="text-sm text-neutral-200 whitespace-pre-line mb-2">
              <span className="text-amber-300 font-semibold">Base Effect:</span>{' '}
              {highlightDiff(entry.effect_desc4 ?? '', entry.effect_desc1)}
            </p>
          )}

          {entry.effect_desc4 && entry.effect_desc4 !== entry.effect_desc1 && (
            <p className="text-sm text-neutral-200 whitespace-pre-line">
              <span className="text-amber-300 font-semibold">Tier 4 Effect:</span>{' '}
              {highlightDiff(entry.effect_desc1 ?? '', entry.effect_desc4)}
            </p>
          )}
        </div>
      )}

      <ItemSourceBox
        itemname={entry.name}
        source={entry.source}
        boss={entry.boss}
        mode={entry.mode}
      />

      {/* SEO JSON-LD */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'VideoGame',
            name: 'Outerplane',
            url, // <- ✅ la page actuelle de l'objet
            gameItem: {
              '@type': 'Thing',
              name: entry.name,
              image: imageUrl,
              url, // <- ✅ également ici
              description:
                entry.effect_desc4 ??
                entry.effect_desc1,
            }
          }),
        }}
      />
    </div>
  )
}
