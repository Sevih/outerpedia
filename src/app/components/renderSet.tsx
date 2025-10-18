import Image from 'next/image'
import { toKebabCase } from '@/utils/formatText'
import { highlightDiff } from '@/utils/textHighlighter'
import ItemSourceBox from './SourceBox'
import ItemStatsBlock from './ItemStatsBlock'
import type { TenantKey } from '@/tenants/config'
import type { ArmorSet } from '@/types/equipment'

type Lang = TenantKey

// Libellés simples (on garde la même approche que renderWeapon/Accessory)
const LABELS: Record<Lang, {
  rarity: string
  setEffects: string
  twoPiece: string
  fourPiece: string
}> = {
  en: { rarity: 'Rarity:', setEffects: 'Set Effects', twoPiece: '2-Piece', fourPiece: '4-Piece' },
  jp: { rarity: 'レア度：', setEffects: 'セット効果', twoPiece: '2セット', fourPiece: '4セット' },
  kr: { rarity: '희귀도:', setEffects: '세트 효과', twoPiece: '2세트', fourPiece: '4세트' },
}


// Localisation champs avec fallback EN
function localize(entry: ArmorSet, lang: Lang) {
  const name =
    (lang === 'jp' && entry.name_jp) ||
    (lang === 'kr' && entry.name_kr) ||
    entry.name

  const effect_2_1 =
    (lang === 'jp' && entry.effect_2_1_jp) ||
    (lang === 'kr' && entry.effect_2_1_kr) ||
    entry.effect_2_1

  const effect_4_1 =
    (lang === 'jp' && entry.effect_4_1_jp) ||
    (lang === 'kr' && entry.effect_4_1_kr) ||
    entry.effect_4_1

  const effect_2_4 =
    (lang === 'jp' && entry.effect_2_4_jp) ||
    (lang === 'kr' && entry.effect_2_4_kr) ||
    entry.effect_2_4

  const effect_4_4 =
    (lang === 'jp' && entry.effect_4_4_jp) ||
    (lang === 'kr' && entry.effect_4_4_kr) ||
    entry.effect_4_4

  return { name, effect_2_1, effect_4_1, effect_2_4, effect_4_4 }
}

export default function renderSet(entry: ArmorSet, lang: Lang = 'en', t: (key: string, vars?: Record<string, unknown>) => string) {
  const L = LABELS[lang]
  const loc = localize(entry, lang)
  // Icône de set : set_icon contient déjà le nom complet qui commence par TI_Icon_Set_Enchant_...
  const imageUrl = entry.set_icon
    ? `/images/ui/effect/${entry.set_icon}.webp`
    : '/images/ui/placeholder.png'

  const url = `https://outerpedia.com/item/set/${toKebabCase(entry.name)}`

  const hasAnyEffect =
    !!(loc.effect_2_1?.trim() || loc.effect_4_1?.trim() || loc.effect_2_4?.trim() || loc.effect_4_4?.trim())

  return (
    <div className="flex flex-col gap-6 text-white items-center">
      {/* Image + nom + rareté */}
      <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
        <div className="w-[80px] h-[80px] relative shrink-0">
          <Image
            src={imageUrl}
            alt={loc.name}
            fill
            sizes="100px"
            className="object-contain rounded-xl bg-neutral-900 border border-white/10"
          />
        </div>

        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold mb-2">
            {loc.name} - {t('equipments_tabs.armor')}
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
                    alt=""
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
              <span className="font-semibold text-white">{loc.name} - {L.setEffects}</span>
            </div>
          )}

          {/* Tableau des effets */}
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="text-amber-300 border-b border-white/10">
                <th className="p-2 font-semibold"> </th>
                <th className="p-2 font-semibold">{L.twoPiece}</th>
                <th className="p-2 font-semibold">{L.fourPiece}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="p-2 text-neutral-400 font-medium">T0</td>
                <td className="p-2 text-neutral-200 whitespace-pre-line">
                  {loc.effect_2_1 || <span className="text-neutral-500 italic">—</span>}
                </td>
                <td className="p-2 text-neutral-200 whitespace-pre-line">
                  {loc.effect_4_1 || <span className="text-neutral-500 italic">—</span>}
                </td>
              </tr>
              <tr>
                <td className="p-2 text-neutral-400 font-medium">T4</td>
                <td className="p-2 text-neutral-200 whitespace-pre-line">
                  {loc.effect_2_4
                    ? highlightDiff(loc.effect_2_1 ?? '', loc.effect_2_4)
                    : <span className="text-neutral-500 italic">—</span>}
                </td>
                <td className="p-2 text-neutral-200 whitespace-pre-line">
                  {loc.effect_4_4
                    ? highlightDiff(loc.effect_4_1 ?? '', loc.effect_4_4)
                    : <span className="text-neutral-500 italic">—</span>}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <ItemSourceBox
        itemname={loc.name}
        source={entry.source ?? undefined}
        boss={entry.boss ?? undefined}
        mode={entry.mode ?? undefined}
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
                loc.effect_4_4 ??
                loc.effect_2_4 ??
                loc.effect_4_1 ??
                loc.effect_2_1 ?? '',
            }
          }),
        }}
      />
    </div>
  )
}
