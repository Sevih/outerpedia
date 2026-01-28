'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { toKebabCase } from '@/utils/formatText'
import { ElementIcon } from '@/app/components/ElementIcon'
import { ClassIcon } from '@/app/components/ClassIcon'
import { AnimatedTabs } from '@/app/components/AnimatedTabs'
import CharacterCard from '@/app/components/CharacterCard'
import type { Character } from '@/types/character'
import type { ClassType, ElementType, RarityType, RoleType } from '@/types/enums'
import { ELEMENTS, CLASSES, RARITIES } from '@/types/enums'
import type { LocalizedFieldNames } from '@/types/common'
import tierListOverwrite from '@/data/stats/tier-list-overwrite.json'
import { getAvailableLanguages } from '@/tenants/config'
import { useI18n } from '@/lib/contexts/I18nContext'
import { l } from '@/lib/localize'
/* -------------------------------- Types -------------------------------- */

type CharacterDisplay = Pick<
    Character,
    'ID' | LocalizedFieldNames<Character, 'Fullname'> | 'Rarity' | 'Class' | 'Element' | 'rank' | 'role' | 'limited' | 'tags'
>


type TierListBaseProps = {
    characters?: CharacterDisplay[]
}

type TabKey = 'all' | 'dps' | 'support' | 'sustain'

type TabItem = {
    label: string
    value: TabKey
    icon: string
    color?: string
}

/* ------------------------------ Data helpers ---------------------------- */

/* ------------------------------ Overwrite Types ---------------------------- */

type RankType = 'S' | 'A' | 'B' | 'C' | 'D' | 'E'

type TranscendLevelOverwrite = {
    rank?: RankType
    role?: RoleType
}  // Permet aussi juste un string pour le rank

type OverwriteData = {
    [characterSlug: string]: {
        [transcendLevel: string]: TranscendLevelOverwrite
    }
}

const overwriteData = tierListOverwrite as OverwriteData

/**
 * Applique l'overwrite de rank/role selon le niveau de transcendance
 * pour les personnages premium et limités.
 * Accumule progressivement les overwrites de tous les niveaux <= au niveau actuel.
 * Ex: si niveau 3 définit role="support" et niveau 4 définit rank="S",
 * alors au niveau 4 on aura rank="S" ET role="support".
 */
function applyTranscendOverwrite(
    char: CharacterDisplay,
    transcendLevel: number
): { rank?: string; role?: string } {
    const slug = toKebabCase(char.Fullname)
    const charOverwrite = overwriteData[slug]

    if (!charOverwrite) return {}

    // Récupérer tous les niveaux disponibles et les trier
    const availableLevels = Object.keys(charOverwrite)
        .map(Number)
        .sort((a, b) => a - b)
        .filter(level => level <= transcendLevel)

    if (availableLevels.length === 0) return {}

    // Accumuler progressivement tous les overwrites jusqu'au niveau actuel
    const result: { rank?: string; role?: string } = {}

    for (const level of availableLevels) {
        const levelData = charOverwrite[level.toString()]
        if (!levelData) continue

        // Si c'est un string, c'est juste un rank
        if (typeof levelData === 'string') {
            result.rank = levelData
        } else {
            // Sinon c'est un objet, on met à jour seulement les champs présents
            if (levelData.rank !== undefined) {
                result.rank = levelData.rank
            }
            if (levelData.role !== undefined) {
                result.role = levelData.role
            }
        }
    }

    return result
}

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

const ELEMENTS_WITH_ALL: (ElementType | 'All')[] = ['All', ...ELEMENTS]
const CLASSES_WITH_ALL: (ClassType | 'All')[] = ['All', ...CLASSES]

function isRarity(x: unknown): x is RarityType {
    return RARITIES.includes(x as RarityType)
}

const tabColors: Record<TabKey, string> = {
    all: '#ff8c00',
    dps: '#ef4444',
    support: '#3b82f6',
    sustain: '#22c55e',
}

const RANKS_PVE = ['S', 'A', 'B', 'C', 'D', 'E'] as const
type PveRank = (typeof RANKS_PVE)[number]

function demoteOnce(rank: string): PveRank {
    const i = RANKS_PVE.indexOf((rank as PveRank) ?? 'E')
    return RANKS_PVE[Math.min(i < 0 ? RANKS_PVE.length - 1 : i + 1, RANKS_PVE.length - 1)]
}

/* ---------------------------- Localized fields -------------------------- */

// Removed: use l() from @/lib/localize instead

/* -------------------------------- Component ----------------------------- */

export default function TierListBase({
    characters = [],
}: TierListBaseProps) {
    const { t } = useI18n()
    const searchParams = useSearchParams()
    const tabParam = searchParams.get('tab') as TabKey | null

    const [activeTab, setActiveTab] = useState<TabKey>('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [classFilter, setClassFilter] = useState<ClassType[]>([])
    const [elementFilter, setElementFilter] = useState<ElementType[]>([])
    const [rarityFilter, setRarityFilter] = useState<RarityType[]>([])
    const [transcendLevel, setTranscendLevel] = useState<number>(3)

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

    // auto-clear "all selected" cases
    useEffect(() => {
        if (elementFilter.length === ELEMENTS.length) setElementFilter([])
    }, [elementFilter])
    useEffect(() => {
        if (classFilter.length === CLASSES.length) setClassFilter([])
    }, [classFilter])
    useEffect(() => {
        if (rarityFilter.length === RARITIES.length) setRarityFilter([])
    }, [rarityFilter])

    // Heavy work memoized - PvE only
    const { rankOrder, grouped } = useMemo(() => {
        const rankOrderLocal = [...RANKS_PVE]

        // Filter characters (Rarity <= 3 for PvE)
        const base = characters.filter((c) => c.Rarity <= 3)

        // Apply overwrites for premium/limited characters
        const charactersWithOverwrites = base.map((c) => {
            const overwrite = applyTranscendOverwrite(c, transcendLevel)

            return {
                ...c,
                ...(overwrite.rank ? { rank: overwrite.rank } : {}),
                ...(overwrite.role ? { role: overwrite.role } : {})
            }
        })

        // Filter by tab (role)
        const byTab =
            activeTab === 'dps'
                ? charactersWithOverwrites.filter((c) => c.role?.toLowerCase() === 'dps')
                : activeTab === 'support'
                    ? charactersWithOverwrites.filter((c) => c.role?.toLowerCase() === 'support')
                    : activeTab === 'sustain'
                        ? charactersWithOverwrites.filter((c) => c.role?.toLowerCase() === 'sustain')
                        : charactersWithOverwrites

        // Apply filters
        const current = byTab.filter(
            (c) =>
                matchesCharacterSearch(c, searchTerm) &&
                (elementFilter.length === 0 || elementFilter.includes(c.Element as ElementType)) &&
                (classFilter.length === 0 || classFilter.includes(c.Class as ClassType)) &&
                (rarityFilter.length === 0 || (isRarity(c.Rarity) && rarityFilter.includes(c.Rarity)))
        )

        // Group by rank
        const result = rankOrderLocal.reduce<Record<string, CharacterDisplay[]>>((acc, rank) => {
            acc[rank] = current
                .filter((c) => {
                    const baseRank = c.rank as string | undefined
                    if (!baseRank) return false
                    // Demote 1-2 star characters by one rank
                    const effective = c.Rarity <= 2 ? demoteOnce(baseRank) : baseRank
                    return effective === rank
                })
                .sort((a, b) => a.Fullname.localeCompare(b.Fullname))
            return acc
        }, {})

        return { rankOrder: rankOrderLocal, grouped: result }
    }, [
        characters,
        activeTab,
        searchTerm,
        elementFilter,
        classFilter,
        rarityFilter,
        transcendLevel,
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
                {t('tier.ui.title.pve') ?? 'Tier List - PvE'}
            </h1>

            {/* Warnings */}
            <p className="bg-yellow-100 text-black px-2 py-1 rounded-lg shadow-md text-sm text-center border border-yellow-100 w-3/5 mx-auto mb-4">
                <span dangerouslySetInnerHTML={{ __html: t('tier.ui.warning.pve') ?? '' }} />
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

            {/* Rarities */}
            <div className="flex flex-col items-center gap-1 mb-6">
                <p className="text-xs uppercase tracking-wide text-slate-300">{t('filters.rarity')}</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => setRarityFilter([])}
                        className={`flex items-center justify-center h-7 px-3 rounded border ${rarityFilter.length === 0
                            ? 'bg-cyan-500'
                            : 'bg-gray-700'
                            } hover:bg-cyan-600`}
                        aria-pressed={rarityFilter.length === 0}
                        aria-label={t('filters.common.all') ?? 'All'}
                    >
                        <span className="text-white text-sm font-bold">
                            {t('filters.common.all') ?? 'All'}
                        </span>
                    </button>
                    {RARITIES.map((rarity) => (
                        <button
                            key={rarity}
                            onClick={() =>
                                setRarityFilter((prev) =>
                                    prev.includes(rarity)
                                        ? prev.filter((r) => r !== rarity)
                                        : [...prev, rarity]
                                )
                            }
                            className={`flex items-center justify-center h-7 px-2 rounded border ${rarityFilter.includes(rarity)
                                ? 'bg-cyan-500'
                                : 'bg-gray-700'
                                } hover:bg-cyan-600`}
                            aria-pressed={rarityFilter.includes(rarity)}
                            aria-label={`${t('filters.rarity') ?? 'Rarity'}: ${rarity}`}
                        >
                            <div className="flex items-center -space-x-1">
                                {Array(rarity)
                                    .fill(0)
                                    .map((_, i) => (
                                        <Image
                                            key={i}
                                            src="/images/ui/star.webp"
                                            alt={t('tier.ui.alt.star') ?? 'star'}
                                            width={16}
                                            height={16}
                                            style={{ width: 16, height: 16 }}
                                        />
                                    ))}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex justify-center gap-8 mb-6 flex-wrap">
                {/* Elements */}
                <div className="flex flex-col items-center gap-1">
                    <p className="text-xs uppercase tracking-wide text-slate-300">{t('filters.elements')}</p>
                    <div className="flex gap-2">
                        {ELEMENTS_WITH_ALL.map((el) => (
                            <button
                                key={el}
                                onClick={() =>
                                    el === 'All'
                                        ? setElementFilter([])
                                        : setElementFilter((prev) =>
                                            prev.includes(el)
                                                ? prev.filter((v) => v !== el)
                                                : [...prev, el]
                                        )
                                }
                                className={`flex items-center justify-center h-7 rounded border ${(el === 'All' && elementFilter.length === 0) ||
                                    (el !== 'All' && elementFilter.includes(el))
                                    ? 'bg-cyan-500'
                                    : 'bg-gray-700'
                                    } hover:bg-cyan-600`}
                                title={String(el)}
                                aria-pressed={
                                    (el === 'All' && elementFilter.length === 0) ||
                                    (el !== 'All' && elementFilter.includes(el))
                                }
                                aria-label={
                                    el === 'All'
                                        ? (t('filters.common.all') ?? 'All')
                                        : `${t('filters.elements') ?? 'Element'}: ${el}`
                                }
                            >
                                {el === 'All' ? (
                                    <span className="text-white text-sm font-bold">
                                        {t('filters.common.all') ?? 'All'}
                                    </span>
                                ) : (
                                    <ElementIcon element={el} />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Classes */}
                <div className="flex flex-col items-center gap-1">
                    <p className="text-xs uppercase tracking-wide text-slate-300">{t('filters.classes')}</p>
                    <div className="flex gap-2">
                        {CLASSES_WITH_ALL.map((cl) => (
                            <button
                                key={cl}
                                onClick={() =>
                                    cl === 'All'
                                        ? setClassFilter([])
                                        : setClassFilter((prev) =>
                                            prev.includes(cl)
                                                ? prev.filter((v) => v !== cl)
                                                : [...prev, cl]
                                        )
                                }
                                className={`flex items-center justify-center h-7 rounded border ${(cl === 'All' && classFilter.length === 0) ||
                                    (cl !== 'All' && classFilter.includes(cl))
                                    ? 'bg-cyan-500'
                                    : 'bg-gray-700'
                                    } hover:bg-cyan-600`}
                                title={String(cl)}
                                aria-pressed={
                                    (cl === 'All' && classFilter.length === 0) ||
                                    (cl !== 'All' && classFilter.includes(cl))
                                }
                                aria-label={
                                    cl === 'All'
                                        ? (t('filters.common.all') ?? 'All')
                                        : `${t('filters.classes') ?? 'Class'}: ${cl}`
                                }
                            >
                                {cl === 'All' ? (
                                    <span className="text-white text-sm font-bold">
                                        {t('filters.common.all') ?? 'All'}
                                    </span>
                                ) : (
                                    <ClassIcon className={cl} />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Transcend Level Filter */}
            <div className="flex flex-col items-center gap-2 mb-6">
                <p className="text-sm uppercase tracking-wide text-slate-300 text-center">
                    {t('tier.ui.filter.transcend') ?? 'Transcend Level'}
                </p>
                <div className="flex justify-center gap-2">
                    {[3, 4, 5, 6].map((level) => (
                        <button
                            key={level}
                            onClick={() => setTranscendLevel(level)}
                            className={`flex items-center justify-center h-8 px-3 rounded border ${transcendLevel === level
                                ? 'bg-cyan-500 border-cyan-400'
                                : 'bg-gray-700 border-gray-600'
                                } hover:bg-cyan-600 transition-colors`}
                            aria-pressed={transcendLevel === level}
                            aria-label={`${t('tier.ui.filter.transcend') ?? 'Transcend Level'}: ${level}`}
                        >
                            <div className="flex items-center -space-x-1">
                                {Array(level)
                                    .fill(0)
                                    .map((_, i) => (
                                        <Image
                                            key={i}
                                            src="/images/ui/star.webp"
                                            alt={t('tier.ui.alt.star') ?? 'star'}
                                            width={16}
                                            height={16}
                                            style={{ width: 16, height: 16 }}
                                        />
                                    ))}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tabs PvE */}
            <div className="flex flex-col items-center gap-1 mb-8">
                <p className="text-xs uppercase tracking-wide text-slate-300">{t('characters.filters.roles')}</p>
                <AnimatedTabs
                    tabs={TABS.map((t) => ({ key: t.value, label: t.label, icon: t.icon }))}
                    selected={activeTab}
                    onSelect={handleTabChange}
                    pillColor={tabColors[activeTab]}
                />
            </div>

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
                                            alt={t('tier.ui.alt.rank', { rank }) ?? `Rank ${rank}`}
                                            fill
                                            className="object-contain"
                                            sizes="100px"
                                        />
                                    </div>
                                    <div className={`relative w-[30px] h-[80px] ${rank === 'A' ? 'mb-1' : ''}`}>
                                        <Image
                                            src={`/images/ui/IG_Event_Rank_${rank}.png`}
                                            alt={t('tier.ui.alt.letter', { rank }) ?? `Letter ${rank}`}
                                            fill
                                            className="object-contain"
                                            sizes="30px"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap justify-center gap-6">
                                    {(entries as CharacterDisplay[]).map((char, index) => (
                                        <CharacterCard
                                            key={char.ID}
                                            name={char.Fullname}
                                            responsive
                                            starsOverride={transcendLevel}
                                            priority={['dps', 'all'].includes(activeTab) && index <= 7}
                                        />
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
