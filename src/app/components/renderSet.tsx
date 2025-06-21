import Image from 'next/image'
import { toKebabCase } from '@/utils/formatText'
import StarLevelItem from './StarLevelItem'
import { highlightDiff } from '@/utils/textHighlighter'
import ItemSourceBox from './SourceBox'
import ItemStatsBlock from './ItemStatsBlock'

type SetEntry = {
  name: string
  rarity: number
  class?: string
  mainStats?: string[]
  substats?: string[]
  set_icon?: string
  effect_2_1?: string
  effect_4_1?: string
  effect_2_4?: string
  effect_4_4?: string
  source?: string
  boss?: string
  mode?: string
  image_prefix?: string
}

export default function renderSet(entry: SetEntry) {
  const imageUrl = entry.set_icon
    ? `https://outerpedia.com/images/ui/effect/TI_Icon_Set_Enchant_${entry.set_icon}.webp`
    : '/images/ui/placeholder.png' // fallback si jamais y’en a pas

  const url = `https://outerpedia.com/item/set/${toKebabCase(entry.name)}`

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
          <h1 className="text-2xl font-bold mb-2">{entry.name} Set</h1>

          <div className="mb-2 flex justify-center sm:justify-start">
            <StarLevelItem yellow={6} size={18} />
          </div>

          {entry.rarity && (
            <p className="text-sm text-neutral-300">
              <span className="font-semibold">Rarity:</span> {entry.rarity}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      {entry.image_prefix && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
          {(['Helmet', 'Armor', 'Gloves', 'Shoes'] as const).map((slot) => {
            const slotStatsMap: Record<typeof slot, string[]> = {
              Helmet: ['HP%'],
              Armor: ['DEF'],
              Gloves: ['ACC', 'DEF'],
              Shoes: ['EVA', 'HP%'],
            }

            return (
              <div key={slot} className="flex flex-col items-center gap-2">
                {/* Image avec fond */}
                <div className="relative w-[80px] h-[80px]">
                  <Image
                    src="/images/ui/bg_item_leg.webp"
                    alt="Background"
                    fill
                    className="absolute inset-0 z-0"
                    sizes="80px"
                  />
                  <div className="relative w-[80px] h-[80px]">
                    <Image
                      src={`https://outerpedia.com/images/equipment/TI_Equipment_${slot}_${entry.image_prefix}.webp`}
                      alt={`${slot} icon`}
                      fill
                      sizes="80px"
                      className="relative z-10 object-contain"
                    />
                  </div>
                </div>

                {/* Bloc de stats */}
                <ItemStatsBlock
                  stats={slotStatsMap[slot]}
                  substats={entry.substats || []}
                  type={slot}
                  rare={6}
                />
              </div>
            )
          })}
        </div>
      )}

      {(entry.effect_2_1 || entry.effect_4_1 || entry.effect_2_4 || entry.effect_4_4) && (
        <div className="bg-black/30 border border-white/10 rounded-xl p-5 w-full max-w-3xl space-y-4">
          {/* En-tête avec icône et nom */}
          {imageUrl && (
            <div className="flex items-center gap-2">
              <Image src={imageUrl} alt="Set Icon" width={24} height={24} />
              <span className="font-semibold text-white">{entry.name} Effects</span>
            </div>
          )}

          {/* Tableau des effets */}
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="text-amber-300 border-b border-white/10">
                <th className="p-2 font-semibold"> </th>
                <th className="p-2 font-semibold">2-piece</th>
                <th className="p-2 font-semibold">4-piece</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="p-2 text-neutral-400 font-medium">T0</td>
                <td className="p-2 text-neutral-200 whitespace-pre-line">
                  {entry.effect_2_1 || <span className="text-neutral-500 italic">—</span>}
                </td>
                <td className="p-2 text-neutral-200 whitespace-pre-line">
                  {entry.effect_4_1 || <span className="text-neutral-500 italic">—</span>}
                </td>
              </tr>
              <tr>
                <td className="p-2 text-neutral-400 font-medium">T4</td>
                <td className="p-2 text-neutral-200 whitespace-pre-line">
                  {entry.effect_2_4
                    ? highlightDiff(entry.effect_2_1 ?? '', entry.effect_2_4)
                    : <span className="text-neutral-500 italic">—</span>}
                </td>
                <td className="p-2 text-neutral-200 whitespace-pre-line">
                  {entry.effect_4_4
                    ? highlightDiff(entry.effect_4_1 ?? '', entry.effect_4_4)
                    : <span className="text-neutral-500 italic">—</span>}
                </td>
              </tr>
            </tbody>
          </table>
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
                entry.effect_4_4 ??
                entry.effect_2_4 ??
                entry.effect_4_1 ??                
                entry.effect_2_1,
            }
          }),
        }}
      />
    </div>
  )
}
