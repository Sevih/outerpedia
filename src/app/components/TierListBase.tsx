'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { CharacterNameDisplay } from '@/app/components/CharacterNameDisplay'
import { toKebabCase } from '@/utils/formatText'
import { ElementIcon } from '@/app/components/ElementIcon'
import { ClassIcon } from '@/app/components/ClassIcon'
import { AnimatedTabs } from '@/app/components/AnimatedTabs'
import EeDisplayMini from '@/app/components/eeDisplayMini'
import type { Character, ExclusiveEquipment } from '@/types/character'
import type { CharacterLite } from '@/types/types'
import type { ClassType as classtipe, ElementType } from '@/types/enums'
import type { LocalizedFieldNames } from '@/types/common'
import charactersData from '@/data/_allCharacters.json'
import { getAvailableLanguages, type TenantKey } from '@/tenants/config'
import { useI18n } from '@/lib/contexts/I18nContext'
import { l } from '@/lib/localize'

/* -------------------------------- Types -------------------------------- */

type CharacterDisplay = Pick<
    CharacterLite,
    'ID' | LocalizedFieldNames<CharacterLite, 'Fullname'> | 'Rarity' | 'Class' | 'Element' | 'rank' | 'rank_pvp' | 'role' | 'limited' | 'tags'
>

type GroupedCharacters = Record<string, CharacterDisplay[]>
type GroupedEquipments = Record<string, [string, ExclusiveEquipment][]>

type Mode = 'pve' | 'pvp' | 'ee0' | 'ee10'

type TierListBaseProps = {
    characters?: CharacterDisplay[]
    equipments?: Record<string, ExclusiveEquipment>
    mode: Mode
    langue: TenantKey
}

type TabKey = 'all' | 'dps' | 'support' | 'sustain'

type TabItem = {
    label: string
    value: TabKey
    icon: string
    color?: string
}

type RecruitBadge = {
    src: string
    altKey: string
}

/* ------------------------------ Data helpers ---------------------------- */

const characterMap = Object.fromEntries(
    (charactersData as CharacterLite[]).map((c) => [toKebabCase(c.Fullname), c])
)

function norm(s: string) {
    return s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
}

function includesCI(haystack: string | undefined, needle: string) {
    if (!haystack) return false
    return norm(haystack).includes(norm(needle))
}

function matchesCharacterSearch(c: CharacterDisplay, term: string) {
    if (!term) return true
    const slug = toKebabCase(c.Fullname)

    // Search in base name and slug
    if (includesCI(c.Fullname, term) || includesCI(slug, term)) return true

    // Search in all available language variants
    const languages = getAvailableLanguages()
    for (const lang of languages) {
        if (lang === 'en') continue // Already checked c.Fullname
        const localizedName = l(c as Record<string, unknown>, 'Fullname', lang)
        if (localizedName && includesCI(localizedName, term)) return true
    }

    return false
}

// EE search
function matchesEESearch(term: string, slug: string, ee: ExclusiveEquipment, char?: CharacterDisplay) {
    if (!term) return true

    // Search in EE name and slug
    if (includesCI(ee.name, term) || includesCI(slug, term)) return true

    // Search in character name (all languages)
    if (char) {
        if (includesCI(char.Fullname, term) || includesCI(toKebabCase(char.Fullname), term)) return true

        const languages = getAvailableLanguages()
        for (const lang of languages) {
            if (lang === 'en') continue
            const localizedName = l(char as Record<string, unknown>, 'Fullname', lang)
            if (localizedName && includesCI(localizedName, term)) return true
        }
    }

    return false
}

function getRankKey(mode: Mode): keyof Character | keyof ExclusiveEquipment {
    if (mode === 'pvp') return 'rank_pvp'
    if (mode === 'ee10') return 'rank10'
    return 'rank'
}

const ELEMENTS: (ElementType | 'All')[] = ['All', 'Fire', 'Water', 'Earth', 'Light', 'Dark']
const CLASSES: (classtipe | 'All')[] = ['All', 'Striker', 'Defender', 'Ranger', 'Healer', 'Mage']
const RARITIES = [1, 2, 3] as const
type Rarity = typeof RARITIES[number]


function isRarity(x: unknown): x is Rarity {
    return RARITIES.includes(x as Rarity)
}

const tabColors: Record<TabKey, string> = {
    all: '#ff8c00',
    dps: '#ef4444',
    support: '#3b82f6',
    sustain: '#22c55e',
}

const RANKS_PVE = ['S', 'A', 'B', 'C', 'D', 'E'] as const
type PveRank = (typeof RANKS_PVE)[number]
const RANKS_PVP = ['S', 'A', 'B', 'C', 'D'] as const
const RANKS_EE = ['S', 'A', 'B', 'C', 'D'] as const

function demoteOnce(rank: string): PveRank {
    const i = RANKS_PVE.indexOf((rank as PveRank) ?? 'E')
    return RANKS_PVE[Math.min(i < 0 ? RANKS_PVE.length - 1 : i + 1, RANKS_PVE.length - 1)]
}

function getRecruitBadge(char: CharacterDisplay): RecruitBadge | null {
    const tags = new Set(char.tags ?? [])

    // Priorité : Collab > Seasonal > Premium > Free > Limited (fallback)
    if (tags.has('collab')) {
        return { src: "/images/ui/CM_Recruit_Tag_Collab.webp", altKey: 'collab' }
    }
    if (tags.has('seasonal')) {
        return { src: "/images/ui/CM_Recruit_Tag_Seasonal.webp", altKey: 'seasonal' }
    }
    if (tags.has('premium')) {
        return { src: "/images/ui/CM_Recruit_Tag_Premium.webp", altKey: 'premium' }
    }
    if (tags.has('free')) {
        return { src: "/images/ui/CM_Recruit_Tag_Free.webp", altKey: 'free' }
    }
    if (char.limited) {
        return { src: "/images/ui/CM_Recruit_Tag_Fes.webp", altKey: 'limited' }
    }
    return null
}

/* ---------------------------- Localized fields -------------------------- */

// Removed local getLocalized functions: use l() from @/lib/localize instead

/* -------------------------------- Component ----------------------------- */

export default function TierListBase({
    characters = [],
    equipments = {},
    mode,
    langue = 'en',
}: TierListBaseProps) {
    const { t } = useI18n()
    const searchParams = useSearchParams()
    const tabParam = searchParams.get('tab') as TabKey | null

    const [activeTab, setActiveTab] = useState<TabKey>('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [classFilter, setClassFilter] = useState<classtipe[]>([])
    const [elementFilter, setElementFilter] = useState<ElementType[]>([])
    const [rarityFilter, setRarityFilter] = useState<(typeof RARITIES)[number][]>([])
    const showRarityFilter = mode !== 'pvp'

    // Tabs i18n (dans le composant pour récupérer t())
    const TABS: readonly TabItem[] = [
        { label: t('filters.common.all'), value: 'all', icon: '/images/ui/all.webp' },
        { label: t('filters.roles.dps'), value: 'dps', icon: '/images/ui/dps.webp' },
        { label: t('filters.roles.support'), value: 'support', icon: '/images/ui/support.webp' },
        { label: t('filters.roles.sustain'), value: 'sustain', icon: '/images/ui/sustain.webp' },
    ] as const

    // initial tab from URL
    useEffect(() => {
        if (tabParam && ['all', 'dps', 'support', 'sustain'].includes(tabParam)) {
            setActiveTab(tabParam)
        }
    }, [tabParam])

    const handleTabChange = (key: typeof activeTab) => {
        setActiveTab(key)
        if (typeof window === 'undefined') return
        try {
            const params = new URLSearchParams(window.location.search)
            if (key === 'all') params.delete('tab')
            else params.set('tab', key)
            const query = params.toString()
            const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname
            window.history.replaceState(null, '', newUrl)
        } catch { }
    }

    // auto-clear “all selected” cases
    useEffect(() => {
        if (elementFilter.length === ELEMENTS.length - 1) setElementFilter([])
    }, [elementFilter])
    useEffect(() => {
        if (classFilter.length === CLASSES.length - 1) setClassFilter([])
    }, [classFilter])
    useEffect(() => {
        if (rarityFilter.length === RARITIES.length) setRarityFilter([])
    }, [rarityFilter])

    // Heavy work memoized
    const { rankOrder, grouped } = useMemo(() => {
        let rankOrderLocal: string[] = []
        let result: GroupedCharacters | GroupedEquipments = {}

        if (mode === 'pve' || mode === 'pvp') {
            rankOrderLocal = mode === 'pve' ? [...RANKS_PVE] : [...RANKS_PVP]

            const base = characters.filter((c) =>
                mode === 'pve' ? c.Rarity <= 3 : c.Rarity >= 3 && !!c.rank_pvp
            )

            const byTab =
                activeTab === 'dps'
                    ? base.filter((c) => c.role?.toLowerCase() === 'dps')
                    : activeTab === 'support'
                        ? base.filter((c) => c.role?.toLowerCase() === 'support')
                        : activeTab === 'sustain'
                            ? base.filter((c) => c.role?.toLowerCase() === 'sustain')
                            : base

            const current = byTab.filter(
                (c) =>
                    matchesCharacterSearch(c, searchTerm) &&
                    (elementFilter.length === 0 || elementFilter.includes(c.Element as ElementType)) &&
                    (classFilter.length === 0 || classFilter.includes(c.Class as classtipe)) &&
                    (mode === 'pvp' ||
                        rarityFilter.length === 0 ||
                        (isRarity(c.Rarity) && rarityFilter.includes(c.Rarity)))
            )

            const rankKey = getRankKey(mode) as keyof CharacterDisplay

            result = rankOrderLocal.reduce<Record<string, CharacterDisplay[]>>((acc, rank) => {
                acc[rank] = current
                    .filter((c) => {
                        const baseRank = c[rankKey] as string | undefined
                        if (!baseRank) return false
                        const effective = mode === 'pve' && c.Rarity <= 2 ? demoteOnce(baseRank) : baseRank
                        return effective === rank
                    })
                    .sort((a, b) => a.Fullname.localeCompare(b.Fullname))
                return acc
            }, {})
        } else {
            rankOrderLocal = [...RANKS_EE]
            const rankKey = getRankKey(mode) as keyof ExclusiveEquipment

            const eeEntries = Object.entries(equipments).sort(([, a], [, b]) =>
                a.name.localeCompare(b.name)
            )

            result = rankOrderLocal.reduce<Record<string, [string, ExclusiveEquipment][]>>((acc, rank) => {
                acc[rank] = eeEntries
                    .filter(([, ee]) => {
                        const rankValue = ee[rankKey as keyof typeof ee]
                        return typeof rankValue === 'string' && rankValue === rank
                    })
                    .filter(([slug, ee]) => {
                        const ch = characterMap[slug] || characterMap[toKebabCase(slug)]
                        if (!ch) return false
                        return (
                            matchesEESearch(searchTerm, slug, ee, ch) &&
                            (elementFilter.length === 0 || elementFilter.includes(ch.Element as ElementType)) &&
                            (classFilter.length === 0 || classFilter.includes(ch.Class as classtipe)) &&
                            (rarityFilter.length === 0 ||
                                (isRarity(ch.Rarity) && rarityFilter.includes(ch.Rarity)))

                        )
                    })
                return acc
            }, {})
        }

        return { rankOrder: rankOrderLocal, grouped: result }
    }, [
        mode,
        characters,
        equipments,
        activeTab,
        searchTerm,
        elementFilter,
        classFilter,
        rarityFilter,
    ])

    /* -------------------------------- Render -------------------------------- */

    return (
        <div className="w-full max-w-screen-xl mx-auto p-6">
            {/* Back button */}
            <div className="relative top-4 left-4 z-20 h-[32px] w-[32px]">
                <Link href={`/tools`} className="relative block h-full w-full">
                    <Image
                        src="/images/ui/CM_TopMenu_Back.webp"
                        alt={t('back') ?? 'Back'}
                        fill
                        sizes="32px"
                        className="opacity-80 hover:opacity-100 transition-opacity"
                    />
                </Link>
            </div>

            {/* Title */}
            <h1 className="text-5xl font-extrabold text-center mb-8 bg-gradient-to-b from-yellow-300 via-orange-400 to-red-500 text-transparent bg-clip-text drop-shadow-md">
                {mode === 'pve' && (t('tier.ui.title.pve') ?? 'Tier List - PvE')}
                {mode === 'pvp' && (t('tier.ui.title.pvp') ?? 'Tier List - PvP')}
                {mode === 'ee0' && (t('tier.ui.title.ee0') ?? 'Exclusive Equipment Priority (+0)')}
                {mode === 'ee10' && (t('tier.ui.title.ee10') ?? 'Exclusive Equipment Priority (+10)')}
            </h1>

            {/* Warnings */}
            <p className="bg-yellow-100 text-black px-2 py-1 rounded-lg shadow-md text-sm text-center border border-yellow-100 w-3/5 mx-auto mb-4">
                {mode === 'pve' && (
                    <span dangerouslySetInnerHTML={{ __html: t('tier.ui.warning.pve') ?? '' }} />
                )}
                {mode === 'pvp' && (
                    <span dangerouslySetInnerHTML={{ __html: t('tier.ui.warning.pvp') ?? '' }} />
                )}
                {mode === 'ee0' && (
                    <span dangerouslySetInnerHTML={{ __html: t('tier.ui.warning.ee0') ?? '' }} />
                )}
                {mode === 'ee10' && (
                    <span dangerouslySetInnerHTML={{ __html: t('tier.ui.warning.ee10') ?? '' }} />
                )}
            </p>

            {/* Search */}
            <div className="flex justify-center mt-4 mb-6">
                <input
                    suppressHydrationWarning
                    type="text"
                    placeholder={t('tier.ui.search.placeholder') ?? 'Search...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-2 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 w-full max-w-md"
                    aria-label={t('tier.ui.search.placeholder') ?? 'Search'}
                />
            </div>

            {/* Filters */}
            {showRarityFilter && (
                <div className="flex justify-center gap-2 mb-4">
                    {[null, ...RARITIES].map((r) => (
                        <button
                            key={String(r)}
                            onClick={() => {
                                if (r === null) {
                                    setRarityFilter([])
                                } else if (isRarity(r)) {
                                    setRarityFilter(prev =>
                                        prev.includes(r) ? prev.filter(v => v !== r) : [...prev, r]
                                    )
                                }
                            }}
                            className={`flex items-center justify-center ${(r === null && rarityFilter.length === 0) ||
                                (r !== null && rarityFilter.includes(r))
                                ? 'bg-cyan-500'
                                : 'bg-gray-700'
                                } hover:bg-cyan-600 px-2 py-1 rounded border`}
                            aria-pressed={
                                (r === null && rarityFilter.length === 0) ||
                                (r !== null && rarityFilter.includes(r))
                            }
                        >
                            {r === null ? (
                                <span className="text-white text-sm font-bold">{t('filters.common.all') ?? 'All'}</span>
                            ) : (
                                <div className="flex items-center -space-x-1">
                                    {Array(r)
                                        .fill(0)
                                        .map((_, i) => (
                                            <Image
                                                key={i}
                                                src="/images/ui/star.webp"
                                                alt={t('tier.ui.alt.star') ?? 'star'}
                                                width={14}
                                                height={14}
                                            />
                                        ))}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}

            <div className="flex justify-center gap-8 mb-6 flex-wrap">
                {/* Elements */}
                <div className="flex gap-2">
                    {ELEMENTS.map((el) => (
                        <button
                            key={el}
                            onClick={() =>
                                el === 'All'
                                    ? setElementFilter([])
                                    : setElementFilter((prev) =>
                                        prev.includes(el as ElementType)
                                            ? prev.filter((v) => v !== (el as ElementType))
                                            : [...prev, el as ElementType]
                                    )
                            }
                            className={`flex items-center justify-center h-7 rounded border ${(el === 'All' && elementFilter.length === 0) ||
                                (el !== 'All' && elementFilter.includes(el as ElementType))
                                ? 'bg-cyan-500'
                                : 'bg-gray-700'
                                } hover:bg-cyan-600`}
                            title={String(el)}
                            aria-pressed={
                                (el === 'All' && elementFilter.length === 0) ||
                                (el !== 'All' && elementFilter.includes(el as ElementType))
                            }
                            aria-label={
                                el === 'All'
                                    ? (t('filters.common.all') ?? 'All')
                                    : `${t('filters.element') ?? 'Element'}: ${el}`
                            }
                        >
                            {el === 'All' ? (
                                <span className="text-white text-sm font-bold">
                                    {t('filters.common.all') ?? 'All'}
                                </span>
                            ) : (
                                <ElementIcon element={el as ElementType} />
                            )}
                        </button>
                    ))}
                </div>

                {/* Classes */}
                <div className="flex gap-2">
                    {CLASSES.map((cl) => (
                        <button
                            key={cl}
                            onClick={() =>
                                cl === 'All'
                                    ? setClassFilter([])
                                    : setClassFilter((prev) =>
                                        prev.includes(cl as classtipe)
                                            ? prev.filter((v) => v !== (cl as classtipe))
                                            : [...prev, cl as classtipe]
                                    )
                            }
                            className={`flex items-center justify-center h-7 rounded border ${(cl === 'All' && classFilter.length === 0) ||
                                (cl !== 'All' && classFilter.includes(cl as classtipe))
                                ? 'bg-cyan-500'
                                : 'bg-gray-700'
                                } hover:bg-cyan-600`}
                            title={String(cl)}
                            aria-pressed={
                                (cl === 'All' && classFilter.length === 0) ||
                                (cl !== 'All' && classFilter.includes(cl as classtipe))
                            }
                            aria-label={
                                cl === 'All'
                                    ? (t('filters.common.all') ?? 'All')
                                    : `${t('filters.class') ?? 'Class'}: ${cl}`
                            }
                        >
                            {cl === 'All' ? (
                                <span className="text-white text-sm font-bold">
                                    {t('filters.common.all') ?? 'All'}
                                </span>
                            ) : (
                                <ClassIcon className={cl as classtipe} />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tabs PvE/PvP */}
            {(mode === 'pve' || mode === 'pvp') && (
                <div className="flex justify-center mb-8">
                    <AnimatedTabs
                        tabs={TABS.map((t) => ({ key: t.value, label: t.label, icon: t.icon }))}
                        selected={activeTab}
                        onSelect={handleTabChange}
                        pillColor={tabColors[activeTab]}
                    />
                </div>
            )}

            {/* List */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {rankOrder.map((rank) => {
                        const entries = grouped[rank]
                        if (!entries || entries.length === 0) return null

                        return (
                            <div key={rank} className="mb-10">
                                <div className="flex items-center justify-center">
                                    <div className="relative w-[100px] h-[80px]">
                                        <Image
                                            src={`/images/ui/text_rank_${rank}.png`}
                                            alt={t('tier.ui.alt.rank', { rank })}
                                            fill
                                            className="object-contain"
                                            sizes="100px"
                                        />
                                    </div>
                                    <div className={`relative w-[30px] h-[80px] ${rank === 'A' ? 'mb-1' : ''}`}>
                                        <Image
                                            src={`/images/ui/IG_Event_Rank_${rank}.png`}
                                            alt={t('tier.ui.alt.letter', { rank })}
                                            fill
                                            className="object-contain"
                                            sizes="30px"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap justify-center gap-6">
                                    {(entries as (CharacterLite | [string, ExclusiveEquipment])[])
                                        .map((item, index) => {
                                            let char: CharacterLite | undefined
                                            let slug: string | undefined
                                            let ee: ExclusiveEquipment | undefined

                                            if (mode === 'pve' || mode === 'pvp') {
                                                char = item as CharacterLite
                                                slug = toKebabCase(char.Fullname)
                                            } else {
                                                const entry = item as [string, ExclusiveEquipment]
                                                slug = entry[0]
                                                ee = entry[1]
                                                char = characterMap[slug] || characterMap[toKebabCase(slug)]
                                                if (!char) return null
                                            }

                                            return (
                                                <Link
                                                    key={slug || char!.ID}
                                                    href={`/characters/${slug}`}
                                                    className="w-[120px] text-center shadow hover:shadow-lg transition relative overflow-visible"
                                                >
                                                    <div className="relative w-[121px] h-[232px]">
                                                        <div className="relative" style={{ width: '120px', height: '231px' }}>
                                                            {(() => {
                                                                const badge = getRecruitBadge(char!)
                                                                return badge ? (
                                                                    <Image
                                                                        src={badge.src}
                                                                        alt={badge.altKey}
                                                                        width={75}
                                                                        height={30}
                                                                        className="absolute top-1 left-1 z-30 object-contain"
                                                                        style={{ width: 75, height: 30 }}
                                                                    />
                                                                ) : null
                                                            })()}

                                                            <Image
                                                                src={`/images/characters/portrait/CT_${char!.ID}.webp`}
                                                                alt={char!.Fullname}
                                                                width={120}
                                                                height={231}
                                                                className="object-cover rounded"
                                                                priority={mode !== 'ee0' && ['dps', 'all'].includes(activeTab) && index <= 7}
                                                            />
                                                        </div>

                                                        {/* EE badge */}
                                                        {ee && (
                                                            <div
                                                                className="absolute left-1 w-[48px] h-[48px] z-30 bg-black/50 rounded"
                                                                style={{ top: '2rem' }} // remplace bottom-xx non standard
                                                            >
                                                                <EeDisplayMini
                                                                    ee={ee}
                                                                    id={toKebabCase(char!.Fullname)}
                                                                    lang={langue}
                                                                />
                                                            </div>
                                                        )}

                                                        {/* Stars */}
                                                        <div className="absolute top-4 right-1 z-30 flex flex-col items-end -space-y-1">
                                                            {Array(char!.Rarity)
                                                                .fill(0)
                                                                .map((_, i) => (
                                                                    <Image
                                                                        key={i}
                                                                        src="/images/ui/star.webp"
                                                                        alt={t('tier.ui.alt.star') ?? 'star'}
                                                                        width={20}
                                                                        height={20}
                                                                        style={{ width: 20, height: 20 }}
                                                                    />
                                                                ))}
                                                        </div>

                                                        {/* Class / Element icons */}
                                                        <div className="absolute right-2 z-30" style={{ bottom: '3.125rem' }}>
                                                            <ClassIcon className={char!.Class as classtipe} />
                                                        </div>
                                                        <div className="absolute right-1.5 z-30" style={{ bottom: '1.375rem' }}>
                                                            <ElementIcon element={char!.Element as ElementType} />
                                                        </div>

                                                        <CharacterNameDisplay
                                                            fullname={l(char!, 'Fullname', langue)}
                                                        />
                                                    </div>

                                                    {/* EE name */}
                                                    {ee && (
                                                        <div className="mt-1 text-xs text-white font-semibold line-clamp-2">
                                                            {l(ee, 'name', langue)}
                                                        </div>
                                                    )}
                                                </Link>
                                            )
                                        })}
                                </div>
                            </div>
                        )
                    })}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
