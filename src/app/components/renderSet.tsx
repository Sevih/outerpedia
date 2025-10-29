import Image from 'next/image'
import { toKebabCase } from '@/utils/formatText'
import { highlightDiff } from '@/utils/textHighlighter'
import ItemSourceBox from './SourceBox'
import ItemStatsBlock from './ItemStatsBlock'
import type { TenantKey } from '@/tenants/config'
import type { ArmorSet } from '@/types/equipment'
import { l } from '@/lib/localize'

type Lang = TenantKey

export default function renderSet(entry: ArmorSet, lang: Lang = 'en', t: (key: string, vars?: Record<string, unknown>) => string) {
  // Utilise la fonction l() de localize.ts
  const name = l(entry, 'name', lang)
  const effect_2_1 = l(entry, 'effect_2_1', lang)
  const effect_4_1 = l(entry, 'effect_4_1', lang)
  const effect_2_4 = l(entry, 'effect_2_4', lang)
  const effect_4_4 = l(entry, 'effect_4_4', lang)
  // Icône de set : set_icon contient déjà le nom complet qui commence par TI_Icon_Set_Enchant_...
  const imageUrl = entry.set_icon
    ? `/images/ui/effect/${entry.set_icon}.webp`
    : '/images/ui/placeholder.png'

  const url = `https://outerpedia.com/item/set/${toKebabCase(entry.name)}`

  const hasAnyEffect =
    !!(effect_2_1?.trim() || effect_4_1?.trim() || effect_2_4?.trim() || effect_4_4?.trim())

  return (
    <div className="flex flex-col gap-6 text-white items-center">
      {/* Image + nom + rareté */}
      <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
        <div className="w-[80px] h-[80px] relative shrink-0">
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="100px"
            className="object-contain rounded-xl bg-neutral-900 border border-white/10"
          />
        </div>

        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold mb-2">
            {name} - {t('equipments_tabs.armor')}
          </h1>
        </div>
      </div>

      {/* Stats par slot (on garde ta présentation) */}
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
                    alt="background"
                    aria-hidden="true"
                    fill
                    className="absolute inset-0 z-0"
                    sizes="80px"
                  />
                  <div className="relative w-[80px] h-[80px]">
                    <Image
                      src={`/images/equipment/TI_Equipment_${slot}_${entry.image_prefix}.webp`}
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
                  type={slot}
                  rare={6}
                  lang={lang}
                />
              </div>
            )
          })}
        </div>
      )}

      {/* Effets 2/4 pièces T0/T4 */}
      {hasAnyEffect && (
        <div className="bg-black/30 border border-white/10 rounded-xl p-5 w-full max-w-3xl space-y-4">
          {/* En-tête avec icône et nom */}
          {imageUrl && (
            <div className="flex items-center gap-2">
              <Image src={imageUrl} alt="Set Icon" width={24} height={24} />
              <span className="font-semibold text-white">{name} - {t('items.setEffects')}</span>
            </div>
          )}

          {/* Tableau des effets */}
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="text-amber-300 border-b border-white/10">
                <th className="p-2 font-semibold"> </th>
                <th className="p-2 font-semibold">{t('items.set.twoPiece')}</th>
                <th className="p-2 font-semibold">{t('items.set.fourPiece')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="p-2 text-neutral-400 font-medium">T0</td>
                <td className="p-2 text-neutral-200 whitespace-pre-line">
                  {effect_2_1 || <span className="text-neutral-500 italic">—</span>}
                </td>
                <td className="p-2 text-neutral-200 whitespace-pre-line">
                  {effect_4_1 || <span className="text-neutral-500 italic">—</span>}
                </td>
              </tr>
              <tr>
                <td className="p-2 text-neutral-400 font-medium">T4</td>
                <td className="p-2 text-neutral-200 whitespace-pre-line">
                  {effect_2_4
                    ? highlightDiff(effect_2_1 ?? '', effect_2_4)
                    : <span className="text-neutral-500 italic">—</span>}
                </td>
                <td className="p-2 text-neutral-200 whitespace-pre-line">
                  {effect_4_4
                    ? highlightDiff(effect_4_1 ?? '', effect_4_4)
                    : <span className="text-neutral-500 italic">—</span>}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <ItemSourceBox
        itemname={name}
        source={entry.source ?? undefined}
        boss={entry.boss ?? undefined}
        mode={entry.mode ?? undefined}
      />

      <p className='w-full max-w-3xl'
              dangerouslySetInnerHTML={{
                __html: t('sets.intro1')
              }}
            />
            <p className='w-full max-w-3xl'
              dangerouslySetInnerHTML={{
                __html: t('weapon.intro2')
              }}
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
            url, // page actuelle de l'objet (à insérer si tu veux une URL absolue)
            gameItem: {
              '@type': 'Thing',
              name: entry.name,
              image: imageUrl.startsWith('http') ? imageUrl : `https://outerpedia.com${imageUrl}`,
              url,
              description:
                effect_4_4 ??
                effect_2_4 ??
                effect_4_1 ??
                effect_2_1 ?? '',
            }
          }),
        }}
      />
    </div>
  )
}
