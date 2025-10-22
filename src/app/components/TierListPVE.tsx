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
import type { Character } from '@/types/character'
import type { ClassType as classtipe, ElementType } from '@/types/enums'
import tierListOverwrite from '@/data/stats/tier-list-overwrite.json'
import type { TenantKey } from '@/tenants/config'
import { useI18n } from '@/lib/contexts/I18nContext'

/* -------------------------------- Types -------------------------------- */

type CharacterDisplay = Pick<
    Character,
    'ID' | 'Fullname' | 'Rarity' | 'Class' | 'Element' | 'rank' | 'role' | 'limited'
> &
    Partial<Pick<Character, 'Fullname_kr' | 'Fullname_jp' | 'tags'>>


type TierListBaseProps = {
    characters?: CharacterDisplay[]
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

/* ------------------------------ Overwrite Types ---------------------------- */

type RoleType = 'dps' | 'support' | 'sustain'
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
    return (
        includesCI(c.Fullname, term) ||
        includesCI(c.Fullname_jp, term) ||
        includesCI(c.Fullname_kr, term) ||
        includesCI(slug, term)
    )
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

type FullnameKey = Extract<keyof CharacterDisplay, `Fullname${'' | `_${string}`}`>
function getLocalizedFullname(character: CharacterDisplay, langKey: TenantKey): string {
    const key: FullnameKey = langKey === 'en' ? 'Fullname' : (`Fullname_${langKey}` as FullnameKey)
    const localized = character[key]
    return localized ?? character.Fullname
}

/* -------------------------------- Component ----------------------------- */

export default function TierListBase({
    characters = [],
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
    const [transcendLevel, setTranscendLevel] = useState<number>(3)

    // Tabs i18n (dans le composant pour récupérer t())
    const TABS: readonly TabItem[] = [
        { label: t('tier.ui.tab.all') ?? 'All', value: 'all', icon: '/images/ui/all.webp' },
        { label: t('tier.ui.tab.dps') ?? 'DPS', value: 'dps', icon: '/images/ui/dps.webp' },
        { label: t('tier.ui.tab.support') ?? 'Support', value: 'support', icon: '/images/ui/support.webp' },
        { label: t('tier.ui.tab.sustain') ?? 'Sustain', value: 'sustain', icon: '/images/ui/sustain.webp' },
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

    // Heavy work memoized - PvE only
    const { rankOrder, grouped } = useMemo(() => {
        const rankOrderLocal = [...RANKS_PVE]

        // Filter characters (Rarity <= 3 for PvE)
        const base = characters.filter((c) => c.Rarity <= 3)

        // Apply overwrites for premium/limited characters
        const charactersWithOverwrites = base.map((c) => {
            const tags = new Set(c.tags ?? [])
            const isPremiumOrLimited = tags.has('premium') || c.limited

            if (isPremiumOrLimited) {
                const overwrite = applyTranscendOverwrite(c, transcendLevel)

                return {
                    ...c,
                    ...(overwrite.rank ? { rank: overwrite.rank } : {}),
                    ...(overwrite.role ? { role: overwrite.role } : {})
                }
            }

            return c
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
                (classFilter.length === 0 || classFilter.includes(c.Class as classtipe)) &&
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
                        alt={t('tier.ui.alt.back') ?? 'Back'}
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
                                    ? (t('tier.ui.filter.all') ?? 'All')
                                    : `${t('tier.ui.filter.element') ?? 'Element'}: ${el}`
                            }
                        >
                            {el === 'All' ? (
                                <span className="text-white text-sm font-bold">
                                    {t('tier.ui.filter.all') ?? 'All'}
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
                                    ? (t('tier.ui.filter.all') ?? 'All')
                                    : `${t('tier.ui.filter.class') ?? 'Class'}: ${cl}`
                            }
                        >
                            {cl === 'All' ? (
                                <span className="text-white text-sm font-bold">
                                    {t('tier.ui.filter.all') ?? 'All'}
                                </span>
                            ) : (
                                <ClassIcon className={cl as classtipe} />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tabs PvE */}
            <div className="flex justify-center mb-8">
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
                                                    {(entries as CharacterDisplay[]).map((char, index) => {
                                                        const slug = toKebabCase(char.Fullname)

                                                        return (
                                                            <Link
                                                                key={char.ID}
                                                                href={`/characters/${slug}`}
                                                                className="w-[120px] text-center shadow hover:shadow-lg transition relative overflow-visible"
                                                            >
                                                                <div className="relative w-[121px] h-[232px]">
                                                                    <div className="relative" style={{ width: '120px', height: '231px' }}>
                                                                        {(() => {
                                                                            const badge = getRecruitBadge(char)
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
                                                                            src={`/images/characters/portrait/CT_${char.ID}.webp`}
                                                                            alt={char.Fullname}
                                                                            width={120}
                                                                            height={231}
                                                                            className="object-cover rounded"
                                                                            priority={['dps', 'all'].includes(activeTab) && index <= 7}
                                                                        />
                                                                    </div>

                                                                    {/* Stars - Transcend Level */}
                                                                    <div className="absolute top-4 right-1 z-30 flex flex-col items-end -space-y-1">
                                                                        {Array(transcendLevel)
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
                                                                        <ClassIcon className={char.Class as classtipe} />
                                                                    </div>
                                                                    <div className="absolute right-1.5 z-30" style={{ bottom: '1.375rem' }}>
                                                                        <ElementIcon element={char.Element as ElementType} />
                                                                    </div>

                                                                    <CharacterNameDisplay
                                                                        fullname={getLocalizedFullname(char, langue)}
                                                                    />
                                                                </div>
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
