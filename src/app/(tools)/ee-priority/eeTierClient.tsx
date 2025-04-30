'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import characters from '@/data/_allCharacters.json'
import { toKebabCase } from '@/utils/formatText'
import { CharacterNameDisplay } from '@/app/components/CharacterNameDisplay'
import EeDisplayMini from '@/app/components/eeDisplayMini'

import type { Character } from '@/types/character'
import type { ClassType as classtipe, ElementType } from '@/types/enums'
import { ElementIcon } from '@/app/components/ElementIcon'
import { ClassIcon } from '@/app/components/ClassIcon'

const RANK_ORDER = ['S', 'A', 'B', 'C', 'D'] as const
const classes = [
    { name: 'All', value: null },
    { name: 'Striker', value: 'Striker' },
    { name: 'Defender', value: 'Defender' },
    { name: 'Ranger', value: 'Ranger' },
    { name: 'Healer', value: 'Healer' },
    { name: 'Mage', value: 'Mage' },
]

const elements = [
    { name: 'All', value: null },
    { name: 'Fire', value: 'Fire' },
    { name: 'Water', value: 'Water' },
    { name: 'Earth', value: 'Earth' },
    { name: 'Light', value: 'Light' },
    { name: 'Dark', value: 'Dark' },
]
const rarities = [
    { label: 'All', value: null },
    { label: 1, value: 1 },
    { label: 2, value: 2 },
    { label: 3, value: 3 },
]

type Equipment = {
    name: string
    effect: string
    effect10: string
    mainStat: string
    rank: string
    icon_effect: string
}

const characterMap = Object.fromEntries(
    (characters as Character[]).map((c) => [toKebabCase(c.Fullname), c])
)

function StarDisplay({ rarity }: { rarity: number }) {
    return (
        <div className="absolute top-4 right-1 z-30 flex flex-col items-end -space-y-1">
            {Array(rarity).fill(0).map((_, i) => (
                <Image
                    key={i}
                    src="/images/ui/star.webp"
                    alt="star"
                    width={20}
                    height={20}
                />
            ))}
        </div>
    )
}

export default function EeTierClient({ equipments }: { equipments: Record<string, Equipment> }) {
    const [search, setSearch] = useState('')
    const [classFilter, setClassFilter] = useState<string[]>([])
    const [elementFilter, setElementFilter] = useState<string[]>([])

    const [rarityFilter, setRarityFilter] = useState<number[]>([])


    const grouped = RANK_ORDER.reduce((acc, rank) => {
        acc[rank] = Object.entries(equipments)
            .filter(([, ee]) => ee.rank === rank)
            .sort(([, a], [, b]) => a.name.localeCompare(b.name))
        return acc
    }, {} as Record<string, [string, Equipment][]>)

    

    // Auto-reset si tous cochés (élément / classe)
    useEffect(() => {
        if (elementFilter.length === elements.slice(1).length) setElementFilter([])
    }, [elementFilter])

    useEffect(() => {
        if (classFilter.length === classes.slice(1).length) setClassFilter([])
    }, [classFilter])

    useEffect(() => {
        if (rarityFilter.length === rarities.slice(1).length) setRarityFilter([])
    }, [rarityFilter])



    const allCharacters = Object.entries(equipments)
        .map(([slug, ee]) => {
            const char = characterMap[slug]
            if (!char) return null
            return {
                "@type": "VideoGameCharacter",
                "name": char.Fullname,
                "url": `https://outerpedia.com/characters/${slug}`,
                "image": `https://outerpedia.com/images/characters/portrait/CT_${char.ID}.webp`,
                "description": ee.name,
            }
        })
        .filter(Boolean)

    return (
        <div className="w-full max-w-screen-xl mx-auto p-6">
            {/* JSON-LD SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "CollectionPage",
                        "name": "Exclusive Equipment Priority – Outerpedia",
                        "description": "A ranking of exclusive equipment (EE) based on their usefulness and impact.",
                        "url": "https://outerpedia.com/ee-priority",
                        "mainEntity": {
                            "@type": "ItemList",
                            "itemListElement": allCharacters,
                        }
                    }),
                }}
            />
            <h1 className="text-5xl font-extrabold text-center mb-8 bg-gradient-to-b from-yellow-300 via-orange-400 to-red-500 text-transparent bg-clip-text drop-shadow-md">
                Exclusive Equipment Priority
            </h1>

            <div className="flex justify-center mb-6">
                <input
                    type="text"
                    placeholder="Search character or EE..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="p-2 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 w-full max-w-md"
                />
            </div>
            <div className="flex justify-center gap-2 mb-4">
                {rarities.map((r) => (
                    <button
                        key={r.label}
                        onClick={() => {
                            if (r.value === null) {
                                setRarityFilter([])
                            } else {
                                const stringified = rarityFilter.map(String)
                                if (stringified.includes(String(r.value))) {
                                    setRarityFilter(rarityFilter.filter((val) => val !== r.value))
                                } else {
                                    setRarityFilter([...rarityFilter, r.value])
                                }
                            }
                        }}
                        className={`flex items-center justify-center ${(
                            (r.value === null && rarityFilter.length === 0) ||
                            (r.value !== null && rarityFilter.includes(r.value))
                        ) ? 'bg-cyan-500' : 'bg-gray-700'
                            } hover:bg-cyan-600 px-2 py-1 rounded border`}
                    >
                        {r.value === null ? (
                            <span className="text-white text-sm font-bold">All</span>
                        ) : (
                            <div className="flex items-center -space-x-1">
                                {Array(r.label)
                                    .fill(0)
                                    .map((_, i) => (
                                        <Image
                                            key={i}
                                            src="/images/ui/star.webp"
                                            alt="star"
                                            width={14}
                                            height={14}
                                            style={{ width: 14, height: 14 }}
                                        />
                                    ))}
                            </div>
                        )}
                    </button>
                ))}
            </div>

            <div className="flex justify-center gap-8 mb-6 flex-wrap">
                <div className="flex gap-2">
                    {elements.map((el) => (
                        <button
                            key={el.name}
                            onClick={() =>
                                el.value
                                    ? setElementFilter((prev) =>
                                        prev.includes(el.value!) ? prev.filter((v) => v !== el.value) : [...prev, el.value!]
                                    )
                                    : setElementFilter([])
                            }

                            className={`flex items-center justify-center w-7 h-7 rounded border transition ${((el.value === null && elementFilter.length === 0) ||
                                (el.value !== null && elementFilter.includes(el.value)))
                                ? 'bg-cyan-500' : 'bg-gray-700'} hover:bg-cyan-600`}
                            title={el.name}
                        >
                            {el.value ? (
                                <ElementIcon element={el.value as ElementType} />
                            ) : (
                                <span className="text-white text-sm font-bold">All</span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2">
                    {classes.map((cl) => (
                        <button
                            key={cl.name}
                            onClick={() =>
                                cl.value
                                    ? setClassFilter((prev) =>
                                        prev.includes(cl.value!) ? prev.filter((v) => v !== cl.value) : [...prev, cl.value!]
                                    )
                                    : setClassFilter([])
                            }

                            className={`flex items-center justify-center w-7 h-7 rounded border transition ${((cl.value === null && classFilter.length === 0) ||
                                (cl.value !== null && classFilter.includes(cl.value)))
                                ? 'bg-cyan-500' : 'bg-gray-700'} hover:bg-cyan-600`}
                            title={cl.name}
                        >
                            {cl.value ? (
                                <ClassIcon className={cl.value as classtipe} />
                            ) : (
                                <span className="text-white text-sm font-bold">All</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex justify-center mt-4">
                <button
                    onClick={() => {
                        setSearch('')
                        setClassFilter([])
                        setElementFilter([])
                        setRarityFilter([])
                    }}

                    className="bg-gray-700 hover:bg-red-700 px-4 py-1 rounded text-sm"
                >
                    Reset filters
                </button>
            </div>


            {RANK_ORDER.map((rank) => {
                const entries = grouped[rank].filter(([slug, ee]) => {
                    const char = characterMap[slug]
                    if (!char) return false

                    const matchesSearch =
                        ee.name.toLowerCase().includes(search.toLowerCase()) ||
                        slug.toLowerCase().includes(search.toLowerCase())

                    const matchesElement = elementFilter.length === 0 || elementFilter.includes(char.Element)
                    const matchesClass = classFilter.length === 0 || classFilter.includes(char.Class)

                    const matchesRarity = rarityFilter.length === 0 || rarityFilter.includes(char.Rarity)


                    return matchesSearch && matchesElement && matchesClass && matchesRarity
                })

                if (entries.length === 0) return null

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
                            {entries.map(([slug, ee]) => {
                                const char = characterMap[slug]
                                if (!char) return null

                                return (
                                    <Link
                                        key={slug}
                                        href={`/characters/${slug}`}
                                        className="w-[120px] text-center shadow hover:shadow-lg transition relative overflow-visible"
                                    >
                                        <div className="relative w-[121px] h-[232px]">
                                            <div
                                                className="relative"
                                                style={{ width: '120px', height: '231px' }} // ← dimensions explicites en style inline
                                            >
                                                <Image
                                                    src={`/images/characters/portrait/CT_${char.ID}.webp`}
                                                    alt={char.Fullname}
                                                    width={120}
                                                    height={231}
                                                    className="object-cover rounded"
                                                />



                                            </div>

                                            <div className="absolute top-1 left-1 w-[48px] h-[48px] z-30 bg-black/70 rounded">
                                                <EeDisplayMini ee={ee} id={toKebabCase(char.Fullname)} />
                                            </div>

                                            <StarDisplay rarity={char.Rarity} />
                                            <div className="absolute bottom-12.5 right-2 z-30">
                                                <ClassIcon className={char.Class as classtipe} />
                                            </div>

                                            <div className="absolute bottom-5.5 right-1.5 z-30">
                                                <ElementIcon element={char.Element as ElementType} />
                                            </div>
                                            <CharacterNameDisplay fullname={char.Fullname} />
                                        </div>

                                        <div className="mt-1 text-xs text-white font-semibold line-clamp-2">
                                            {ee.name}
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
