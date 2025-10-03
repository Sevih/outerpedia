'use client'

import { useState, useEffect } from 'react'
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
import type { Character } from '@/types/character'
import type { ClassType as classtipe, ElementType } from '@/types/enums'
import charactersData from '@/data/_allCharacters.json'
import type { TenantKey } from '@/tenants/config'


type CharacterDisplay = Pick<Character, 'ID' | 'Fullname' | 'Rarity' | 'Class' | 'Element' | 'rank' | 'rank_pvp' | 'role'> &
    Partial<Pick<Character, 'Fullname_kr' | 'Fullname_jp'>
    >

type GroupedCharacters = Record<string, CharacterDisplay[]>
type GroupedEquipments = Record<string, [string, Equipment][]>
type WithLocalizedNames = {
    Fullname: string
    Fullname_jp?: string
    Fullname_kr?: string
}

const characterMap = Object.fromEntries(
    (charactersData as Character[]).map((c) => [toKebabCase(c.Fullname), c])
)

function norm(s: string) {
    return s
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
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


// pour les EE
function matchesEESearch(
    term: string,
    slug: string,
    ee: Equipment,
    char?: WithLocalizedNames
) {
    if (!term) return true
    return (
        includesCI(ee.name, term) ||
        includesCI(slug, term) ||
        (char && (
            includesCI(char.Fullname, term) ||
            includesCI(char.Fullname_jp, term) ||
            includesCI(char.Fullname_kr, term) ||
            includesCI(toKebabCase(char.Fullname), term)
        ))
        // Optionnel :
        // || includesCI(ee.effect, term) || includesCI(ee.effect10, term)
    )
}





type Mode = 'pve' | 'pvp' | 'ee0' | 'ee10'

function getRankKey(mode: Mode): keyof Character | keyof Equipment {
    if (mode === 'pvp') return 'rank_pvp'
    if (mode === 'ee10') return 'rank10' // ⚡ tu prépares le futur champ
    return 'rank'
}


type Equipment = {
    name: string
    effect: string
    effect10: string
    mainStat: string
    rank: string
    rank10?: string
    icon_effect: string
}

type TierListBaseProps = {
    characters?: CharacterDisplay[]
    equipments?: Record<string, Equipment>
    mode: Mode
    langue: TenantKey
}


type TabItem = {
    label: string
    value: TabKey
    icon: string
    color?: string
}

const TABS = [
    { label: 'All', value: 'all', icon: '/images/ui/all.webp' },
    { label: 'DPS', value: 'dps', icon: '/images/ui/dps.webp' },
    { label: 'Support', value: 'support', icon: '/images/ui/support.webp' },
    { label: 'Sustain', value: 'sustain', icon: '/images/ui/sustain.webp' },
] satisfies readonly TabItem[];

type TabKey = 'all' | 'dps' | 'support' | 'sustain'

const ELEMENTS: (ElementType | 'All')[] = ['All', 'Fire', 'Water', 'Earth', 'Light', 'Dark']
const CLASSES: (classtipe | 'All')[] = ['All', 'Striker', 'Defender', 'Ranger', 'Healer', 'Mage']
const RARITIES = [1, 2, 3]

const tabColors = {
    all: '#ff8c00',     // violet par exemple
    dps: '#ef4444',
    support: '#3b82f6',
    sustain: '#22c55e',
} as const


const RANKS_PVE = ['S', 'A', 'B', 'C', 'D', 'E'] as const
const RANKS_PVP = ['S', 'A', 'B', 'C', 'D'] as const
const RANKS_EE = ['S', 'A', 'B', 'C', 'D'] as const

const PVE_RANKS = ['S', 'A', 'B', 'C', 'D', 'E'] as const
type PveRank = typeof PVE_RANKS[number]

function demoteOnce(rank: string): PveRank {
    const i = PVE_RANKS.indexOf((rank as PveRank) ?? 'E')
    return PVE_RANKS[Math.min(i < 0 ? PVE_RANKS.length - 1 : i + 1, PVE_RANKS.length - 1)]
}


type FullnameKey = Extract<keyof CharacterDisplay, `Fullname${'' | `_${string}`}`>
function getLocalizedFullname(character: CharacterDisplay, langKey: TenantKey): string {
    //console.log(character)
    const key: FullnameKey = langKey === 'en' ? 'Fullname' : (`Fullname_${langKey}` as FullnameKey)
    const localized = character[key] // type: string | undefined
    return localized ?? character.Fullname
}


export default function TierListBase({ characters = [], equipments = {}, mode, langue = "en" }: TierListBaseProps) {
    const searchParams = useSearchParams()
    const tabParam = searchParams.get('tab') as TabKey | null
    const [activeTab, setActiveTab] = useState<TabKey>('all')


    const [searchTerm, setSearchTerm] = useState('')
    const [classFilter, setClassFilter] = useState<string[]>([])
    const [elementFilter, setElementFilter] = useState<string[]>([])
    const [rarityFilter, setRarityFilter] = useState<number[]>([])

    const showRarityFilter = mode !== 'pvp'

    // tab depuis l’URL
    useEffect(() => {
        if (tabParam && ['all', 'dps', 'support', 'sustain'].includes(tabParam)) {
            setActiveTab(tabParam)
        }
    }, [tabParam])


    const handleTabChange = (key: typeof activeTab) => {
        setActiveTab(key)
        const params = new URLSearchParams(window.location.search)
        if (key === 'all') params.delete('tab')   // ← au lieu de 'dps'
        else params.set('tab', key)
        const query = params.toString()
        const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname
        window.history.replaceState(null, '', newUrl)
    }


    useEffect(() => {
        if (elementFilter.length === ELEMENTS.length - 1) setElementFilter([])
    }, [elementFilter])
    useEffect(() => {
        if (classFilter.length === CLASSES.length - 1) setClassFilter([])
    }, [classFilter])
    useEffect(() => {
        if (rarityFilter.length === RARITIES.length) setRarityFilter([])
    }, [rarityFilter])

    // ---------- Data grouping ----------
    let rankOrder: string[] = []
    let grouped: GroupedCharacters | GroupedEquipments = {}



    if (mode === 'pve' || mode === 'pvp') {
        rankOrder = mode === 'pve' ? [...RANKS_PVE] : [...RANKS_PVP]
        const filtered = characters.filter(c =>
            mode === 'pve' ? c.Rarity <= 3 : c.Rarity >= 3 && !!c.rank_pvp
        )

        const roleGroups = {
            all: filtered, // ← on prend tous les persos filtrés
            dps: filtered.filter(c => c.role?.toLowerCase() === 'dps'),
            support: filtered.filter(c => c.role?.toLowerCase() === 'support'),
            sustain: filtered.filter(c => c.role?.toLowerCase() === 'sustain'),
        }
        const current = roleGroups[activeTab]


        const rankKey = getRankKey(mode) as keyof CharacterDisplay

        grouped = rankOrder.reduce<Record<string, CharacterDisplay[]>>((acc, rank) => {
            acc[rank] = current
                .filter(c => {
                    const base = c[rankKey] as string | undefined
                    if (!base) return false // on ignore ce perso
                    // En PvE, rétrograde d’un rang si 1★ ou 2★ ; sinon garde le rang
                    const effective =
                        mode === 'pve' && c.Rarity <= 2 ? demoteOnce(base) : (base as PveRank)
                    return effective === rank
                })
                .sort((a, b) => a.Fullname.localeCompare(b.Fullname))
            return acc
        }, {})





    }

    if (mode === 'ee0' || mode === 'ee10') {
        rankOrder = [...RANKS_EE]
        const rankKey = getRankKey(mode) as keyof Equipment

        grouped = rankOrder.reduce<Record<string, [string, Equipment][]>>((acc, rank) => {
            acc[rank] = Object.entries(equipments)
                .filter(([, ee]) => (ee[rankKey] as string) === rank)
                .sort(([, a], [, b]) => a.name.localeCompare(b.name))
            return acc
        }, {})
    }

    return (
        <div className="w-full max-w-screen-xl mx-auto p-6">
            {/* Back button */}
            <div className="relative top-4 left-4 z-20 h-[32px] w-[32px]">
                <Link href={`/tools`} className="relative block h-full w-full">
                    <Image src="/images/ui/CM_TopMenu_Back.webp" alt="Back" fill sizes='32px'
                        className="opacity-80 hover:opacity-100 transition-opacity" />
                </Link>
            </div>

            <h1 className="text-5xl font-extrabold text-center mb-8 bg-gradient-to-b from-yellow-300 via-orange-400 to-red-500 text-transparent bg-clip-text drop-shadow-md">
                {mode === 'pve' && 'Tier List - PvE'}
                {mode === 'pvp' && 'Tier List - PvP'}
                {mode === 'ee0' && 'Exclusive Equipment Priority (+0)'}
                {mode === 'ee10' && 'Exclusive Equipment Priority (+10)'}
            </h1>

            {/* Bloc de prévention */}
            <p className="bg-yellow-100 text-black px-2 py-1 rounded-lg shadow-md text-sm text-center border border-yellow-100 w-3/5 mx-auto mb-4">
                {mode === 'pve' && (
                    <>
                        ⚠️ This tier list assumes <strong>6-star transcends</strong> and <strong>level 0 Exclusive Equipment effects</strong>. ⚠️<br />
                        Your experience may vary if these upgrades are not yet unlocked. <br />
                        This list is intended strictly for <strong>PvE content</strong> and should not be used as a reference for PvP content.
                    </>
                )}
                {mode === 'pvp' && (
                    <>
                        ⚠️ This tier list assumes <strong>6-star transcends</strong> and <strong>level 0 Exclusive Equipment effects</strong>. ⚠️<br />
                        Your experience may vary if these upgrades are not yet unlocked. <br />
                        This list is intended strictly for <strong>PvP content</strong> and should not be used as a reference for PvE content.
                    </>
                )}
                {mode === 'ee0' && (
                    <>
                        ⚠️ This <strong>Exclusive Equipment Priority</strong> ranking helps you decide which <strong>Exclusive Equipment (EE)</strong> to unlock first in <strong>Outerplane</strong>. <br />
                        It evaluates each EE based on its <strong>level 0 base effect</strong> only, to establish an optimal unlocking order.<br />
                        <strong>+10 bonus effects are not taken into account.</strong>
                    </>
                )}
                {mode === 'ee10' && (
                    <>
                        ⚠️ This <strong>Exclusive Equipment Priority</strong> ranking evaluates <strong>Exclusive Equipment (EE)</strong> in <strong>Outerplane</strong> including their <strong>+10 bonus effects</strong>, to provide a full performance evaluation.<br />
                        This list is intended to help prioritize upgrades beyond base effects.
                    </>
                )}
            </p>


            {/* Search */}
            <div className="flex justify-center mt-4 mb-6">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-2 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 w-full max-w-md"
                />
            </div>

            {/* Filters */}
            {showRarityFilter && (
                <div className="flex justify-center gap-2 mb-4">
                    {[null, ...RARITIES].map((r) => (
                        <button
                            key={String(r)}
                            onClick={() =>
                                r === null
                                    ? setRarityFilter([])
                                    : setRarityFilter(prev =>
                                        prev.includes(r) ? prev.filter(v => v !== r) : [...prev, r]
                                    )
                            }
                            className={`flex items-center justify-center ${(r === null && rarityFilter.length === 0) ||
                                (r !== null && rarityFilter.includes(r))
                                ? 'bg-cyan-500'
                                : 'bg-gray-700'
                                } hover:bg-cyan-600 px-2 py-1 rounded border`}
                        >
                            {r === null ? (
                                <span className="text-white text-sm font-bold">All</span>
                            ) : (
                                <div className="flex items-center -space-x-1">
                                    {Array(r)
                                        .fill(0)
                                        .map((_, i) => (
                                            <Image key={i} src="/images/ui/star.webp" alt="star" width={14} height={14} />
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
                    {ELEMENTS.map(el => (
                        <button
                            key={el}
                            onClick={() =>
                                el === 'All'
                                    ? setElementFilter([])
                                    : setElementFilter(prev => prev.includes(el) ? prev.filter(v => v !== el) : [...prev, el])
                            }
                            className={`flex items-center justify-center w-7 h-7 rounded border ${(el === 'All' && elementFilter.length === 0) ||
                                (el !== 'All' && elementFilter.includes(el))
                                ? 'bg-cyan-500'
                                : 'bg-gray-700'
                                } hover:bg-cyan-600`}
                            title={el}
                        >
                            {el === 'All' ? <span className="text-white text-sm font-bold">All</span> : <ElementIcon element={el as ElementType} />}
                        </button>
                    ))}
                </div>

                {/* Classes */}
                <div className="flex gap-2">
                    {CLASSES.map(cl => (
                        <button
                            key={cl}
                            onClick={() =>
                                cl === 'All'
                                    ? setClassFilter([])
                                    : setClassFilter(prev => prev.includes(cl) ? prev.filter(v => v !== cl) : [...prev, cl])
                            }
                            className={`flex items-center justify-center w-7 h-7 rounded border ${(cl === 'All' && classFilter.length === 0) ||
                                (cl !== 'All' && classFilter.includes(cl))
                                ? 'bg-cyan-500'
                                : 'bg-gray-700'
                                } hover:bg-cyan-600`}
                            title={cl}
                        >
                            {cl === 'All' ? <span className="text-white text-sm font-bold">All</span> : <ClassIcon className={cl as classtipe} />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tabs PvE/PvP seulement */}
            {(mode === 'pve' || mode === 'pvp') && (
                <div className="flex justify-center mb-8">
                    <AnimatedTabs
                        tabs={TABS.map(t => ({ key: t.value, label: t.label, icon: t.icon }))}
                        selected={activeTab}
                        onSelect={handleTabChange}
                        pillColor={tabColors[activeTab]}
                    />

                </div>
            )}

            {/* Liste */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {rankOrder.map(rank => {
                        const entries = grouped[rank]

                        if (!entries || entries.length === 0) return null

                        return (
                            <div key={rank} className="mb-10">
                                <div className="flex items-center justify-center">
                                    <div className="relative w-[100px] h-[80px]">
                                        <Image
                                            src={`/images/ui/text_rank_${rank}.png`}
                                            alt={`Rank ${rank}`}
                                            fill
                                            className="object-contain"
                                            sizes="100px"
                                        />
                                    </div>
                                    <div className={`relative w-[30px] h-[80px] ${rank === 'A' ? 'mb-1' : rank === 'D' ? 'mb-0' : ''}`}>
                                        <Image
                                            src={`/images/ui/IG_Event_Rank_${rank}.png`}
                                            alt={`Letter ${rank}`}
                                            fill
                                            className="object-contain"
                                            sizes="30px"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-wrap justify-center gap-6">
                                    {(entries as (Character | [string, Equipment])[])
                                        .filter(item => {
                                            if (mode === 'pve' || mode === 'pvp') {
                                                const char = item as Character
                                                return (
                                                    matchesCharacterSearch(char, searchTerm) &&
                                                    (elementFilter.length === 0 || elementFilter.includes(char.Element)) &&
                                                    (classFilter.length === 0 || classFilter.includes(char.Class)) &&
                                                    (!showRarityFilter || rarityFilter.length === 0 || rarityFilter.includes(char.Rarity))
                                                )
                                            } else {
                                                const [slug, ee] = item as [string, Equipment]
                                                const char = characterMap[slug] || characterMap[toKebabCase(slug)]
                                                if (!char) return false

                                                const matchesSearch = matchesEESearch(searchTerm, slug, ee, char)
                                                const matchesElement = elementFilter.length === 0 || elementFilter.includes(char.Element)
                                                const matchesClass = classFilter.length === 0 || classFilter.includes(char.Class)
                                                const matchesRarity = rarityFilter.length === 0 || rarityFilter.includes(char.Rarity)

                                                return matchesSearch && matchesElement && matchesClass && matchesRarity
                                            }

                                        })
                                        .map((item, index) => {
                                            let char: Character | undefined
                                            let slug: string | undefined
                                            let ee: Equipment | undefined

                                            if (mode === 'pve' || mode === 'pvp') {
                                                char = item as Character
                                                slug = toKebabCase(char.Fullname)
                                            } else {
                                                const entry = item as [string, Equipment]
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
                                                        <div
                                                            className="relative"
                                                            style={{ width: '120px', height: '231px' }}
                                                        >
                                                            <Image
                                                                src={`/images/characters/portrait/CT_${char!.ID}.webp`}
                                                                alt={char!.Fullname}
                                                                width={120}
                                                                height={231}
                                                                className="object-cover rounded"
                                                                priority={mode !== 'ee0' && ['dps', 'all'].includes(activeTab) && index <= 7}
                                                            />
                                                        </div>

                                                        {/* Bloc spécifique EE */}
                                                        {ee && (
                                                            <div className="absolute top-1 left-1 w-[48px] h-[48px] z-30 bg-black/70 rounded">
                                                                <EeDisplayMini ee={ee} id={toKebabCase(char!.Fullname)} />
                                                            </div>
                                                        )}

                                                        {/* Etoiles */}
                                                        <div className="absolute top-4 right-1 z-30 flex flex-col items-end -space-y-1">
                                                            {Array(char!.Rarity).fill(0).map((_, i) => (
                                                                <Image
                                                                    key={i}
                                                                    src="/images/ui/star.webp"
                                                                    alt="star"
                                                                    width={20}
                                                                    height={20}
                                                                    style={{ width: 20, height: 20 }}
                                                                />
                                                            ))}
                                                        </div>

                                                        <div className="absolute bottom-12.5 right-2 z-30">
                                                            <ClassIcon className={char!.Class as classtipe} />
                                                        </div>
                                                        <div className="absolute bottom-5.5 right-1.5 z-30">
                                                            <ElementIcon element={char!.Element as ElementType} />
                                                        </div>
                                                        <CharacterNameDisplay fullname={getLocalizedFullname(char!, langue)} />
                                                    </div>

                                                    {/* Nom EE en dessous */}
                                                    {ee && (
                                                        <div className="mt-1 text-xs text-white font-semibold line-clamp-2">
                                                            {ee.name}
                                                        </div>
                                                    )}
                                                </Link>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        )
                    })}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}