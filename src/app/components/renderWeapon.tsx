import Image from 'next/image'
import ClassInlineTag from './ClassInlineTag'
import { toKebabCase } from '@/utils/formatText'
import { highlightDiff } from '@/utils/textHighlighter'
import ItemSourceBox from './SourceBox'
import ItemStatsBlock from './ItemStatsBlock'
import type { Weapon } from '@/types/equipment'
import type { TenantKey } from '@/tenants/config'
type Lang = TenantKey

const LABELS: Record<Lang, {
    classRestriction: string
    rarity: string
    baseEffect: string
    tier4Effect: string
}> = {
    en: {
        classRestriction: 'Class restriction:',
        rarity: 'Rarity:',
        baseEffect: 'Base Effect:',
        tier4Effect: 'Tier 4 Effect:',
    },
    jp: {
        classRestriction: 'クラス制限：',
        rarity: 'レア度：',
        baseEffect: '基本効果：',
        tier4Effect: 'Tier4効果：',
    },
    kr: {
        classRestriction: '클래스 제한:',
        rarity: '희귀도:',
        baseEffect: '기본 효과:',
        tier4Effect: '티어4 효과:',
    },
}

// Sélectionne les champs localisés avec fallback EN
function localize(entry: Weapon, lang: Lang) {
    const name =
        (lang === 'jp' && entry.name_jp) ||
        (lang === 'kr' && entry.name_kr) ||
        entry.name

    const effect_name =
        (lang === 'jp' && entry.effect_name_jp) ||
        (lang === 'kr' && entry.effect_name_kr) ||
        entry.effect_name

    const effect_desc1 =
        (lang === 'jp' && entry.effect_desc1_jp) ||
        (lang === 'kr' && entry.effect_desc1_kr) ||
        entry.effect_desc1

    const effect_desc4 =
        (lang === 'jp' && entry.effect_desc4_jp) ||
        (lang === 'kr' && entry.effect_desc4_kr) ||
        entry.effect_desc4

    return { name, effect_name, effect_desc1, effect_desc4 }
}

/**
 * Affichage WEBP pour tout (icônes, images). PNG réservé à la page/metadata.
 * @param entry Weapon
 * @param lang 'en' | 'jp' | 'kr' (par défaut 'en')
 */
export default function renderWeapon(entry: Weapon, lang: Lang = 'en',t: (key: string, vars?: Record<string, unknown>) => string) {
    const L = LABELS[lang]
    const loc = localize(entry, lang)


    // Images d’affichage en .webp (pas de remplacement)
    const imageUrl = `/images/equipment/${entry.image}.webp`
    const effectKey = entry.effect_icon?.trim()
    const iconEffectUrl = effectKey ? `/images/ui/effect/${effectKey}.webp` : null

    // Étoiles
    const starLevel = Number.isFinite(entry.level) ? entry.level : 6
    const slotBgKey = entry.rarity

    // Effets présents ?
    const hasBaseEffect = !!loc.effect_desc1?.trim()
    const hasT4Effect = !!loc.effect_desc4?.trim()
    const showT4Line = hasT4Effect && loc.effect_desc4 !== loc.effect_desc1

    // URL canonique (JSON-LD)
      const url = `https://outerpedia.com/item/weapon/${toKebabCase(entry.name)}`

    return (
        <div className="flex flex-col gap-6 text-white items-center">
            {/* En-tête : image + titre + badges */}
            <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">


                <div className="relative w-[80px] h-[80px] shrink-0">
                    {/* fond selon la rareté */}
                    <Image
                        src={`/images/bg/CT_Slot_${slotBgKey}.webp`}
                        alt=""
                        aria-hidden="true"
                        fill
                        sizes="80px"
                        className="absolute inset-0 z-0"
                        priority
                    />

                    {/* image de l'arme en premier plan */}
                    <Image
                        src={imageUrl} // `/images/equipment/${entry.image}.webp`
                        alt={loc.name}
                        fill
                        sizes="80px"
                        className="relative z-10 object-contain"
                        priority
                    />

                    {/* étoiles de niveau (overlay bas-centre) */}
                    {starLevel > 0 && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 inline-flex justify-center mt-0.5 z-20">
                            {Array.from({ length: starLevel }).map((_, i) => (
                                <Image
                                    key={i}
                                    src="/images/ui/CM_icon_star_y.webp"
                                    alt="star"
                                    width={15}
                                    height={15}
                                    className={`object-contain ${i > 0 ? '-ml-1' : ''}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* icône d’effet (overlay en haut-droite) */}
                    {effectKey && (
                        <div className="absolute top-2 right-2 z-20 translate-x-1/3 -translate-y-1/3">
                            <Image
                                src={`/images/ui/effect/${effectKey}.webp`}
                                alt={loc.effect_name}
                                width={20}
                                height={20}
                                style={{ width: 20, height: 20 }}
                            />
                        </div>
                    )}

                    {/* icône de classe */}
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
                    <h1 className="text-2xl font-bold mb-2">{loc.name} - {t('weapons')}</h1>

                    {entry.class && (
                        <p className="text-sm text-neutral-300">
                            <span className="font-semibold">{L.classRestriction}</span>{' '}
                            <ClassInlineTag name={entry.class} />
                        </p>
                    )}
                </div>
            </div>

            {/* Bloc stats (exemple générique) */}
            <ItemStatsBlock stats={['ATK']} substats={['ATK%', 'DEF%', 'HP%']} type="weapons" rare={starLevel} lang={lang} />

            {/* Effets */}
            {loc.effect_name && (hasBaseEffect || hasT4Effect) && (
                <div className="bg-black/30 border border-white/10 rounded-xl p-5 w-full max-w-3xl">
                    <div className="flex items-center gap-2 mb-3">
                        {iconEffectUrl && (
                            <Image src={iconEffectUrl} alt={loc.effect_name} width={24} height={24} />
                        )}
                        <span className="font-semibold text-white">{loc.effect_name}</span>
                    </div>

                    {hasBaseEffect && (
                        <p className="text-sm text-neutral-200 whitespace-pre-line mb-2">
                            <span className="text-amber-300 font-semibold">{L.baseEffect}</span>{' '}
                            {highlightDiff(loc.effect_desc4 || '', loc.effect_desc1 || '')}
                        </p>
                    )}

                    {showT4Line && (
                        <p className="text-sm text-neutral-200 whitespace-pre-line">
                            <span className="text-amber-300 font-semibold">{L.tier4Effect}</span>{' '}
                            {highlightDiff(loc.effect_desc1 || '', loc.effect_desc4 || '')}
                        </p>
                    )}
                </div>
            )}

            {/* Source / Boss / Mode */}
            <ItemSourceBox
                itemname={loc.name}
                source={entry.source}
                boss={entry.boss ?? undefined}
                mode={entry.mode ?? undefined}
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
