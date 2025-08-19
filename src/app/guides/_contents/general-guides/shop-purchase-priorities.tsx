'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import GuideHeading from '@/app/components/GuideHeading'
import ItemInlineDisplay from '@/app/components/ItemInline'
import { AnimatedTabs } from '@/app/components/AnimatedTabs'
import type { ReactNode } from 'react'

// ---- Types
type Priority = 'S' | 'A' | 'B' | 'C'
type Period = 'Daily' | 'Weekly' | 'Monthly' | 'One-time'


type ShopKey =
    | 'guild'
    | 'supply'
    | 'rico'
    | 'event'
    | 'joint'
    | 'friend'
    | 'arena'
    | 'stars'
    | 'arch'
    | 'worldboss'
    | 'skyward'
    | 'al'
    | 'survey'
    | 'resource'

type Cost = {
    currency: string            // ex: "Guild Coins", "Arena Medals"
    amount: number              // ex: 300
    note?: string               // optionnel: "dynamic", "discount", etc.
}

type Limit = {
    count: number               // ex: 5
    period: Period              // ex: 'Weekly'
}

type PerPurchase = {
    amount: number              // ex: 10000
    unit?: string               // ex: "Gold", "pcs", "%", etc.
}

type ShopItem = {
    name: string
    priority: Priority
    // Ce que l'achat DONNE par achat (ex: 10 000 Gold, 1 Manual, etc.)
    gives?: PerPurchase
    // Coûts multiples possibles (ex: 300 Coins + 20 000 Gold)
    costs?: Cost[]
    // Limite structurée (ex: { count: 5, period: 'Weekly' })
    limit?: Limit
    notes?: string
}

// ---- Onglets
const tabs: { key: ShopKey; label: string; icon: string }[] = [
    { key: 'guild', label: 'Guild Shop', icon: '/images/ui/shop_guild.webp' },
    { key: 'supply', label: "Supply Module", icon: '/images/ui/shop_supply.webp' },
    { key: 'rico', label: "Rico Secret Shop", icon: '/images/ui/shop_rico.webp' },
    { key: 'event', label: 'Event Shop', icon: '/images/ui/shop_event.webp' },
    { key: 'joint', label: 'Joint Challenge', icon: '/images/ui/shop_joint.webp' },
    { key: 'friend', label: 'Friendship Point', icon: '/images/ui/shop_friend.webp' },
    { key: 'arena', label: 'Arena Shop', icon: '/images/ui/shop_arena.webp' },
    { key: 'stars', label: "Star's Memory", icon: '/images/ui/shop_stars.webp' },
    { key: 'arch', label: "Archdemon\'s Ruins", icon: '/images/ui/shop_arch.webp' },
    { key: 'worldboss', label: 'World Boss', icon: '/images/ui/shop_worldboss.webp' },
    { key: 'skyward', label: 'Skyward Tower', icon: '/images/ui/shop_skyward.webp' },
    { key: 'al', label: 'Adventure License', icon: '/images/ui/shop_al.webp' },
    { key: 'survey', label: 'Survey Hub', icon: '/images/ui/shop_survey.webp' },
    { key: 'resource', label: 'Resources Shop', icon: '/images/ui/shop_resource.webp' }
]

// ---- Notes par shop (JSX accepté)
const shopNotes: Record<ShopKey, ReactNode> = {
    guild: (
        ""
    ),
    supply: (
        ""
    ),
    rico: (
        ""
    ),
    event: (
        ""
    ),
    joint: (
        <>
            <p>
                Save <strong>monthly purchases</strong> until the Joint Challenge event starts.
                The main concern is <em>not having enough purchases to clear the quests</em>.
            </p>
            <p>
                Once you can consistently max out the Joint Challenge, the currency becomes very abundant,
                so prioritize wisely at the start.
            </p>
        </>
    ),

    friend: (
        ""
    ),
    arena: (
        ""
    ),
    stars: (
        ""
    ),
    arch: (
        ""
    ),
    worldboss: (
        ""
    ),
    skyward: (
        ""
    ),
    al: (
        ""
    ),
    survey: (
        ""
    ),
    resource: (
        ""
    ),
}


// ---- Helpers UI
const PRIORITY_ORDER: Record<Priority, number> = { S: 0, A: 1, B: 2, C: 3 }
const PRIORITY_BADGE: Record<Priority, string> = {
    S: 'bg-emerald-600/30 text-emerald-300 ring-emerald-600/60',
    A: 'bg-sky-600/30 text-sky-300 ring-sky-600/60',
    B: 'bg-amber-600/30 text-amber-300 ring-amber-600/60',
    C: 'bg-zinc-700/40 text-zinc-300 ring-zinc-600/60',
}

function n(x: number) {
    return x.toLocaleString() // 10,000 etc.
}

function PriorityBadge({ p }: { p: Priority }) {
    return (
        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ring-1 ${PRIORITY_BADGE[p]}`}>
            {p}
        </span>
    )
}

function renderCosts(costs?: Cost[]) {
    if (!costs || costs.length === 0) return '–'

    return (
        <div className="flex flex-col gap-0.5">
            {costs.map((c, i) => {
                // Cas spécial : gratuit
                if (c.amount === 0 || c.currency.toLowerCase() === 'free') {
                    return (
                        <div key={i} className="whitespace-nowrap">
                            Free{c.note ? ` (${c.note})` : ''}
                        </div>
                    )
                }

                return (
                    <div key={i} className="whitespace-nowrap">
                        {n(c.amount)} <ItemInlineDisplay names={[c.currency]} />{c.note ? ` (${c.note})` : ''}
                    </div>
                )
            })}
        </div>
    )
}

function renderLimit(limit?: Limit) {
    if (!limit) return '–'

    const ABBR: Record<Period, string> = {
        Daily: 'D',
        Weekly: 'W',
        Monthly: 'M',
        'One-time': 'O',
    }

    return `${limit.count} / ${ABBR[limit.period]}`
}


function renderGives(g?: PerPurchase, name?: string) {
    if (!g) return '–'
    const unit = g.unit ?? name ?? ''
    return `${n(g.amount)} ${unit}`.trim()
}

function ShopTable({ items }: { items: ShopItem[] }) {
    const sorted = useMemo(
        () =>
            [...items].sort((a, b) => {
                const prioDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
                if (prioDiff !== 0) return prioDiff
                return a.name.localeCompare(b.name)
            }),
        [items]
    )

    // 🔽 check si au moins un item a une note non vide
    const hasNotes = sorted.some(it => it.notes && it.notes.trim() !== "")

    return (
        <div className="flex justify-center my-6">
            <div className="w-full max-w-4xl">
                <table className="w-full border border-gray-700 rounded-md text-sm">
                    <thead className="bg-gray-800">
                        <tr>
                            <th className="border px-3 py-2 text-left">Priority</th>
                            <th className="border px-3 py-2 text-left">Item</th>
                            <th className="border px-3 py-2 text-left">Gives</th>
                            <th className="border px-3 py-2">Cost</th>
                            <th className="border px-3 py-2">Limit</th>
                            {hasNotes && <th className="border px-3 py-2 text-left">Notes</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map((it, i) => (
                            <tr key={i} className="odd:bg-gray-900/30">
                                <td className="border px-3 py-2"><PriorityBadge p={it.priority} /></td>
                                <td className="border px-3 py-2">
                                    <ItemInlineDisplay names={[it.name]} />
                                </td>
                                <td className="border px-3 py-2">{renderGives(it.gives, it.name)}</td>
                                <td className="border px-3 py-2 text-center">{renderCosts(it.costs)}</td>
                                <td className="border px-3 py-2 text-center">{renderLimit(it.limit)}</td>
                                {hasNotes && (
                                    <td className="border px-3 py-2">{it.notes ?? ''}</td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>

                <p className="mt-3 text-xs text-zinc-400">
                    Legend:
                    <span className="font-semibold"> S</span> = must-buy,
                    <span className="font-semibold"> A</span> = high value,
                    <span className="font-semibold"> B</span> = situational,
                    <span className="font-semibold"> C</span> = low priority
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                    Periods:
                    <span className="font-semibold"> D</span> = Daily,
                    <span className="font-semibold"> W</span> = Weekly,
                    <span className="font-semibold"> M</span> = Monthly,
                    <span className="font-semibold"> O</span> = One-time
                </p>

            </div>
        </div>
    )
}

// ---- Données d'exemple (montre comment préciser coût + quantité par achat)
const data: Record<ShopKey, ShopItem[]> = {
    guild: [
        // Ex: Gold: on peut acheter 5 fois, et chaque achat donne 10 000 Gold
        {
            name: 'Gold',
            priority: 'A',
            gives: { amount: 10000, unit: 'Gold' },
            costs: [{ currency: 'Guild Coin', amount: 20 }],
            limit: { count: 5, period: 'Daily' },
        },
        {
            name: '[Guild] Upgrade Stone Chest',
            priority: 'B',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Guild Coin', amount: 15 }],
            limit: { count: 3, period: 'Daily' },
        },
        {
            name: 'Epic Quality Present Selection Chest',
            priority: 'B',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Guild Coin', amount: 50 }],
            limit: { count: 1, period: 'Daily' },
        },
        {
            name: 'Steak Dish',
            priority: 'C',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Guild Coin', amount: 45 }],
            limit: { count: 1, period: 'Daily' },
        },
        {
            name: 'Sandwich',
            priority: 'C',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Guild Coin', amount: 10 }],
            limit: { count: 5, period: 'Daily' },
        },
        {
            name: 'Cake Slice',
            priority: 'C',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Guild Coin', amount: 15 }],
            limit: { count: 3, period: 'Daily' },
        },
        {
            name: 'Prosciutto',
            priority: 'C',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Guild Coin', amount: 30 }],
            limit: { count: 2, period: 'Daily' },
        },
        {
            name: 'Gold',
            priority: 'A',
            gives: { amount: 50000, unit: 'Gold' },
            costs: [{ currency: 'Guild Coin', amount: 50 }],
            limit: { count: 10, period: 'Weekly' },
        },
        {
            name: 'Basic Skill Manual',
            priority: 'S',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Guild Coin', amount: 100 }],
            limit: { count: 3, period: 'Weekly' },
        },
        {
            name: 'Intermediate Skill Manual',
            priority: 'S',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Guild Coin', amount: 150 }],
            limit: { count: 2, period: 'Weekly' },
        },
        {
            name: 'Professional Skill Manual',
            priority: 'S',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Guild Coin', amount: 300 }],
            limit: { count: 1, period: 'Weekly' },
        },
        {
            name: '[Guild] 3★ Hero Piece Selection Chest',
            priority: 'S',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Guild Coin', amount: 300 }],
            limit: { count: 5, period: 'Weekly' },
        },
        {
            name: 'Stage 3 Gem Chest',
            priority: 'B',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Guild Coin', amount: 150 }],
            limit: { count: 5, period: 'Weekly' },
        },
        {
            name: '[Guild] Epic-Legendary Accessory Chest',
            priority: 'A',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Guild Coin', amount: 100 }],
            limit: { count: 3, period: 'Weekly' },
        },
        {
            name: '[Guild] Enhancement Toolbox',
            priority: 'C',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Guild Coin', amount: 30 }],
            limit: { count: 10, period: 'Weekly' },
        }
    ],
    joint: [
        {
            name: 'Legendary Reforge Catalyst',
            priority: 'C',
            gives: { amount: 20, unit: 'pc' },
            costs: [{ currency: 'Joint Challenge Coin', amount: 30 }],
            limit: { count: 3, period: 'Weekly' },
        },
        {
            name: 'Gold',
            priority: 'A',
            gives: { amount: 20000, unit: 'pc' },
            costs: [{ currency: 'Joint Challenge Coin', amount: 15 }],
            limit: { count: 100, period: 'Weekly' },
        },
        {
            name: 'Stage 5 Random Gem Chest',
            priority: 'B',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Joint Challenge Coin', amount: 2500 }],
            limit: { count: 1, period: 'Weekly' },
        },
        {
            name: 'Stage 3 Gem Chest ',
            priority: 'B',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Joint Challenge Coin', amount: 250 }],
            limit: { count: 1, period: 'Weekly' },
        },
        {
            name: 'Legendary Quality Present Chest',
            priority: 'A',
            gives: { amount: 10, unit: 'pc' },
            costs: [{ currency: 'Joint Challenge Coin', amount: 2500 }],
            limit: { count: 1, period: 'Weekly' },
        },
        {
            name: 'Special Recruitment Ticket (Event)',
            priority: 'S',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Joint Challenge Coin', amount: 100 }],
            limit: { count: 1, period: 'Weekly' },
        },
        {
            name: 'Refined Glunite',
            priority: 'S',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Joint Challenge Coin', amount: 5000 }],
            limit: { count: 1, period: 'Monthly' },
        },
        {
            name: 'Armor Glunite',
            priority: 'A',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Joint Challenge Coin', amount: 3000 }],
            limit: { count: 1, period: 'Weekly' },
        },
        {
            name: 'Transistone (Individual)',
            priority: 'S',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Joint Challenge Coin', amount: 8000 }],
            limit: { count: 1, period: 'Monthly' },
        },
        {
            name: 'Transistone (Total)',
            priority: 'S',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Joint Challenge Coin', amount: 8000 }],
            limit: { count: 1, period: 'Monthly' },
        },
        {
            name: 'Stamina',
            priority: 'S',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Joint Challenge Coin', amount: 15 }],
            limit: { count: 1, period: 'Daily' },
        }
    ],
    friend: [
        {
            name: 'Gold',
            priority: 'S',
            gives: { amount: 10000, unit: 'pc' },
            costs: [{ currency: 'Friend Point', amount: 25 }],
            limit: { count: 1, period: 'Daily' },
        },
        {
            name: 'Apprentice\'s Hammer Chest',
            priority: 'C',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Friend Point', amount: 30 }],
            limit: { count: 3, period: 'Daily' },
        },
        {
            name: 'Upgrade Stone Piece Selection Chest',
            priority: 'A',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Friend Point', amount: 50 }],
            limit: { count: 1, period: 'Daily' },
        },
        {
            name: '1-2★ Hero Piece Random Exchange Ticket',
            priority: 'B',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Friend Point', amount: 100 }],
            limit: { count: 1, period: 'Weekly' },
        },
        {
            name: 'Arena Ticket',
            priority: 'A',
            gives: { amount: 5, unit: 'pc' },
            costs: [{ currency: 'Friend Point', amount: 200 }],
            limit: { count: 1, period: 'Daily' },
        },
        {
            name: '3★ Hero Piece Selective Exchange Ticket',
            priority: 'S',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Friend Point', amount: 700 }],
            limit: { count: 1, period: 'Weekly' },
        },
        {
            name: 'Upgrade Stone Fragment Selection Chest',
            priority: 'C',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Friend Point', amount: 30 }],
            limit: { count: 3, period: 'Daily' },
        },
        {
            name: 'Upgrade Stone Selection Chest',
            priority: 'A',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Friend Point', amount: 500 }],
            limit: { count: 1, period: 'Weekly' },
        },
        {
            name: 'Stamina',
            priority: 'S',
            gives: { amount: 30, unit: 'pc' },
            costs: [{ currency: 'Friend Point', amount: 50 }],
            limit: { count: 2, period: 'Daily' },
        }
    ],
    arena: [
        {
            name: 'Gold',
            priority: 'A',
            gives: { amount: 10000, unit: 'pc' },
            costs: [{ currency: 'Arena Medal', amount: 10 }],
            limit: { count: 1, period: 'Daily' },
        },
        {
            name: 'Professional Skill Manual',
            priority: 'S',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Arena Medal', amount: 350 }],
            limit: { count: 2, period: 'Weekly' },
        },
        {
            name: 'Basic Skill Manual',
            priority: 'S',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Arena Medal', amount: 50 }],
            limit: { count: 5, period: 'Weekly' },
        },
        {
            name: 'Intermediate Skill Manual',
            priority: 'S',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Arena Medal', amount: 60 }],
            limit: { count: 3, period: 'Weekly' },
        },
        {
            name: 'Stamina',
            priority: 'S',
            gives: { amount: 50, unit: 'pc' },
            costs: [{ currency: 'Arena Medal', amount: 15 }],
            limit: { count: 1, period: 'Daily' },
        },
        {
            name: 'Ether Amulet',
            priority: 'B',
            gives: { amount: 50, unit: 'pc' },
            costs: [{ currency: 'Arena Medal', amount: 200 }],
            limit: { count: 5, period: 'One-time' },
        },
        {
            name: 'Ether Blade',
            priority: 'B',
            gives: { amount: 50, unit: 'pc' },
            costs: [{ currency: 'Arena Medal', amount: 200 }],
            limit: { count: 5, period: 'One-time' },
        },
        {
            name: 'Etheric Helmet of Speed',
            priority: 'C',
            gives: { amount: 50, unit: 'pc' },
            costs: [{ currency: 'Arena Medal', amount: 300 }],
            limit: { count: 1, period: 'One-time' },
        },
        {
            name: 'Etheric Gloves of Speed',
            priority: 'C',
            gives: { amount: 50, unit: 'pc' },
            costs: [{ currency: 'Arena Medal', amount: 300 }],
            limit: { count: 1, period: 'One-time' },
        },
        {
            name: 'Etheric Chest Armor of Speed',
            priority: 'C',
            gives: { amount: 50, unit: 'pc' },
            costs: [{ currency: 'Arena Medal', amount: 300 }],
            limit: { count: 1, period: 'One-time' },
        },
        {
            name: 'Etheric Boots of Speed',
            priority: 'C',
            gives: { amount: 50, unit: 'pc' },
            costs: [{ currency: 'Arena Medal', amount: 300 }],
            limit: { count: 1, period: 'One-time' },
        }
    ],
    stars: [
        {
            name: 'Arena Ticket',
            priority: 'B',
            gives: { amount: 5, unit: 'pc' },
            costs: [{ currency: 'Star\'s Memory', amount: 3 }],
            limit: { count: 1, period: 'Daily' },
        },
        {
            name: 'Refined Upgrade Stone Selection Chest',
            priority: 'B',
            gives: { amount: 20, unit: 'pc' },
            costs: [{ currency: 'Star\'s Memory', amount: 5 }],
            limit: { count: 1, period: 'Daily' },
        },
        {
            name: 'Glunite',
            priority: 'B',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Star\'s Memory', amount: 25 }],
            limit: { count: 1, period: 'Weekly' },
        },
        {
            name: 'Gold',
            priority: 'A',
            gives: { amount: 200000, unit: 'pc' },
            costs: [{ currency: 'Star\'s Memory', amount: 10 }],
            limit: { count: 3, period: 'Daily' },
        },

        {
            name: "Potentium (Weapon/Accessory)",
            priority: 'A',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Star\'s Memory', amount: 50 }],
            limit: { count: 1, period: 'Monthly' },
        },
        {
            name: 'Transistone (Total)',
            priority: 'S',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Star\'s Memory', amount: 75 }],
            limit: { count: 2, period: 'Monthly' },
        },
        {
            name: 'Stamina',
            priority: 'S',
            gives: { amount: 150, unit: 'pc' },
            costs: [{ currency: 'Star\'s Memory', amount: 5 }],
            limit: { count: 1, period: 'Daily' },
        },
        {
            name: 'Refined Glunite',
            priority: 'S',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Star\'s Memory', amount: 50 }],
            limit: { count: 1, period: 'Monthly' },
        },
        {
            name: 'Time Rewinder',
            priority: 'A',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Star\'s Memory', amount: 100 }],
            limit: { count: 1, period: 'Monthly' },
        },
        {
            name: 'Steak Dish',
            priority: 'C',
            gives: { amount: 10, unit: 'pc' },
            costs: [{ currency: 'Star\'s Memory', amount: 15 }],
            limit: { count: 1, period: 'Daily' },
        },
        {
            name: 'Professional Skill Manual',
            priority: 'S',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Star\'s Memory', amount: 30 }],
            limit: { count: 1, period: 'Weekly' },
        },
        {
            name: 'Epic Quality Present Selection Chest',
            priority: 'B',
            gives: { amount: 3, unit: 'pc' },
            costs: [{ currency: 'Star\'s Memory', amount: 10 }],
            limit: { count: 1, period: 'Daily' },
        },
        {
            name: 'Special Recruitment Ticket',
            priority: 'S',
            gives: { amount: 2, unit: 'pc' },
            costs: [{ currency: 'Star\'s Memory', amount: 10 }],
            limit: { count: 1, period: 'Weekly' },
        },
        {
            name: 'Potentium (Armor)',
            priority: 'A',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Star\'s Memory', amount: 35 }],
            limit: { count: 1, period: 'Monthly' },
        },
        {
            name: 'Special Recruitment Ticket (Event)',
            priority: 'S',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Star\'s Memory', amount: 1 }],
            limit: { count: 1, period: 'Daily' },
        },
        {
            name: 'Intermediate Skill Manual',
            priority: 'S',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Star\'s Memory', amount: 5 }],
            limit: { count: 2, period: 'Weekly' },
        },
        {
            name: 'Transistone (Individual)',
            priority: 'S',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Star\'s Memory', amount: 100 }],
            limit: { count: 2, period: 'Monthly' },
        },

    ],
    arch: [
        {
            name: 'Epic Reforge Catalyst',
            priority: 'C',
            gives: { amount: 20, unit: 'pc' },
            costs: [{ currency: 'Archdemon\'s Trace', amount: 60 }],
            limit: { count: 10, period: 'Weekly' },
        },
        {
            name: 'Artisan\'s Hammer',
            priority: 'C',
            gives: { amount: 10, unit: 'pc' },
            costs: [{ currency: 'Archdemon\'s Trace', amount: 80 }],
            limit: { count: 10, period: 'Weekly' },
        },
        {
            name: 'Refined Glunite',
            priority: 'A',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Archdemon\'s Trace', amount: 800 }],
            limit: { count: 1, period: 'Weekly' },
        },
        {
            name: '6★ Talisman Selection Chest',
            priority: 'S',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Archdemon\'s Trace', amount: 2000 }],
            limit: { count: 1, period: 'Monthly' },
        },
        {
            name: 'Legendary Reforge Catalyst',
            priority: 'C',
            gives: { amount: 10, unit: 'pc' },
            costs: [{ currency: 'Archdemon\'s Trace', amount: 80 }],
            limit: { count: 10, period: 'Weekly' },
        },
        {
            name: 'Glunite',
            priority: 'B',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Archdemon\'s Trace', amount: 150 }],
            limit: { count: 3, period: 'Weekly' },
        },
        {
            name: '5★ Random Talisman Chest',
            priority: 'B',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Archdemon\'s Trace', amount: 800 }],
            limit: { count: 1, period: 'Weekly' },
        },
    ],
    worldboss: [
        {
            name: 'Steak Dish',
            priority: 'C',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'World Boss Token', amount: 20 }],
            limit: { count: 30, period: 'Monthly' },
        },
        {
            name: 'Undefeated Leader Nella',
            priority: 'B',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'World Boss Token', amount: 3300 }],
            limit: { count: 1, period: 'One-time' },
        },
        {
            name: 'Indomitable Dragon Drakhan',
            priority: 'B',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'World Boss Token', amount: 3300 }],
            limit: { count: 1, period: 'One-time' },
        },
        {
            name: 'Potentium (Weapon/Accessory)',
            priority: 'A',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'World Boss Token', amount: 125 }],
            limit: { count: 3, period: 'Monthly' },
        },
        {
            name: 'Transistone (Total)',
            priority: 'S',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'World Boss Token', amount: 250 }],
            limit: { count: 2, period: 'Monthly' },
        },
        {
            name: 'Gold',
            priority: 'A',
            gives: { amount: 10000, unit: 'pc' },
            costs: [{ currency: 'World Boss Token', amount: 10 }],
            limit: { count: 100, period: 'Monthly' },
        },
        {
            name: 'Potentium (Armor)',
            priority: 'A',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'World Boss Token', amount: 125 }],
            limit: { count: 3, period: 'Monthly' },
        },
        {
            name: 'Transistone (Individual)',
            priority: 'S',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'World Boss Token', amount: 300 }],
            limit: { count: 2, period: 'Monthly' },
        },
    ],
    skyward: [
        {
            name: '5★ Epic Weapon',
            priority: 'C',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Automaton Coin', amount: 45 }],
            limit: { count: 1, period: 'Monthly' },
        },
        {
            name: '5★ Epic Accessory',
            priority: 'C',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Automaton Coin', amount: 45 }],
            limit: { count: 1, period: 'Monthly' },
        },
        {
            name: '5★ Epic Helmet Selection Chest',
            priority: 'C',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Automaton Coin', amount: 25 }],
            limit: { count: 1, period: 'Monthly' },
        },
        {
            name: '5★ Epic Gloves Selection Chest',
            priority: 'C',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Automaton Coin', amount: 25 }],
            limit: { count: 1, period: 'Monthly' },
        },
        {
            name: '5★ Epic Boots Selection Chest',
            priority: 'C',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Automaton Coin', amount: 25 }],
            limit: { count: 1, period: 'Monthly' },
        },
        {
            name: '5★ Epic Armor Selection Chest',
            priority: 'C',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Automaton Coin', amount: 25 }],
            limit: { count: 1, period: 'Monthly' },
        },
        {
            name: 'Basic Skill Manual',
            priority: 'S',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Automaton Coin', amount: 30 }],
            limit: { count: 25, period: 'Monthly' },
        },
        {
            name: 'Artisan\'s Hammer',
            priority: 'C',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Automaton Coin', amount: 20 }],
            limit: { count: 50, period: 'Monthly' },
        },
        {
            name: 'Stage 4 Gem Chest',
            priority: 'B',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Automaton Coin', amount: 150 }],
            limit: { count: 5, period: 'Monthly' },
        },
        {
            name: 'Potentium (Armor)',
            priority: 'A',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Automaton Coin', amount: 150 }],
            limit: { count: 10, period: 'Monthly' },
        },
        {
            name: 'Potentium (Weapon/Accessory)',
            priority: 'A',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Automaton Coin', amount: 200 }],
            limit: { count: 5, period: 'Monthly' },
        },
        {
            name: '10% Legendary Abrasive',
            priority: 'C',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Automaton Coin', amount: 50 }],
            limit: { count: 30, period: 'Monthly' },
        },
        {
            name: 'Professional Skill Manual',
            priority: 'S',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Automaton Coin', amount: 250 }],
            limit: { count: 5, period: 'Monthly' },
        },
        {
            name: 'Steak Dish',
            priority: 'C',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Automaton Coin', amount: 50 }],
            limit: { count: 20, period: 'Monthly' },
        },
        {
            name: 'Time Rewinder',
            priority: 'A',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Automaton Coin', amount: 3000 }],
            limit: { count: 1, period: 'Monthly' },
        },
        {
            name: 'Special Recruitment Ticket (Event)',
            priority: 'S',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Automaton Coin', amount: 75 }],
            limit: { count: 30, period: 'Monthly' },
        },
        {
            name: 'Gear Crafting Material Selection Chest (Normal)',
            priority: 'B',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Automaton Coin', amount: 5 }],
            limit: { count: 100, period: 'Monthly' },
        },
        {
            name: 'Gear Crafting Material Selection Chest (Superior)',
            priority: 'B',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Automaton Coin', amount: 15 }],
            limit: { count: 20, period: 'Monthly' },
        },
        {
            name: 'Gold',
            priority: 'S',
            gives: { amount: 15000, unit: 'pc' },
            costs: [{ currency: 'Free', amount: 0 }],
            limit: { count: 1, period: 'Daily' },
        },
        {
            name: 'Intermediate Skill Manual',
            priority: 'S',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Automaton Coin', amount: 70 }],
            limit: { count: 20, period: 'Monthly' },
        },
        {
            name: 'Transistone (Total)',
            priority: 'S',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Automaton Coin', amount: 1500 }],
            limit: { count: 1, period: 'Monthly' },
        },
        {
            name: 'Transistone (Individual)',
            priority: 'S',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Automaton Coin', amount: 1750 }],
            limit: { count: 1, period: 'Monthly' },
        },
        {
            name: 'Ether',
            priority: 'S',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Automaton Coin', amount: 5 }],
            limit: { count: 500, period: 'Monthly' },
        }
    ],
    al: [
        {
            name: 'Powerful Adventurer\'s Talisman',
            priority: 'B',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'License Point', amount: 3000 }],
            limit: { count: 1, period: 'One-time' },
        },
        {
            name: 'Sharp Adventurer\'s Talisman',
            priority: 'S',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'License Point', amount: 3000 }],
            limit: { count: 1, period: 'One-time' },
        },
        {
            name: 'Adventurer\'s Sword',
            priority: 'B',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'License Point', amount: 2500 }],
            limit: { count: 1, period: 'One-time' },
        },
        {
            name: 'Adventurer\'s Necklace',
            priority: 'B',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'License Point', amount: 2500 }],
            limit: { count: 1, period: 'One-time' },
        },
        {
            name: 'Refined Glunite',
            priority: 'S',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'License Point', amount: 2500 }],
            limit: { count: 8, period: 'One-time' },
        },
        {
            name: 'Stage 5-6 Gem Chest',
            priority: 'A',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'License Point', amount: 250 }],
            limit: { count: 2, period: 'Weekly' },
        },
        {
            name: '“Tycoon” Title',
            priority: 'C',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'License Point', amount: 250 }],
            limit: { count: 1, period: 'One-time' },
        },
        {
            name: 'Proof of Worth',
            priority: 'S',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'License Point', amount: 125 }],
            limit: { count: 25, period: 'Weekly' },
            notes:"Only until you finish Adventure License Quirk then ignore it."
        },
        {
            name: '6★ Legendary Boots [Burst]',
            priority: 'A',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'License Point', amount: 1250 }],
            limit: { count: 1, period: 'One-time' }
        },
        {
            name: '6★ Legendary Armor [Burst]',
            priority: 'A',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'License Point', amount: 1250 }],
            limit: { count: 1, period: 'One-time' }
        },
        {
            name: '6★ Legendary Gloves [Burst]',
            priority: 'A',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'License Point', amount: 1250 }],
            limit: { count: 1, period: 'One-time' }
        },
        {
            name: '6★ Legendary Helmet [Burst]',
            priority: 'A',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'License Point', amount: 1250 }],
            limit: { count: 1, period: 'One-time' }
        }
    ],
    survey: [
        {
            name: '6★ Legendary Helmet [Burst]',
            priority: 'A',
            gives: { amount: 1, unit: 'pc' },
            costs: [{ currency: 'Survey Contributions', amount: 1250 }],
            limit: { count: 1, period: 'One-time' }
        }
    ],



    event: [/* ... */],    
    resource: [/* ... */],
    supply: [],
    rico: []
}

export default function ShopPurchasePrioritiesGuide() {
    const searchParams = useSearchParams()
    const tabParam = (searchParams.get('tab') as ShopKey | null)
    const [selected, setSelected] = useState<ShopKey>('guild')

    useEffect(() => {
        if (tabParam && tabs.some(t => t.key === tabParam)) setSelected(tabParam)
    }, [tabParam])

    const handleTabChange = (key: ShopKey) => {
        setSelected(key)
        const params = new URLSearchParams(window.location.search)
        if (key === 'guild') params.delete('tab')
        else params.set('tab', key)
        const qs = params.toString()
        const newUrl = `${window.location.pathname}${qs ? `?${qs}` : ''}`
        window.history.replaceState(null, '', newUrl)
    }

    return (
        <div className="space-y-6">
            <GuideHeading>Shop Purchase Priorities</GuideHeading>

            <p className="text-sm text-gray-300 leading-relaxed">
                Specify exact costs and the amount given per purchase. Limits are structured as “count / period”.
            </p>

            <div className="flex justify-center mb-4">
                <AnimatedTabs
                    tabs={tabs}
                    selected={selected}
                    onSelect={handleTabChange}
                    pillColor="#10b981"
                />
            </div>

            {/* Bloc de note spécifique au shop sélectionné */}
            {shopNotes[selected] && (
                <div className="text-sm text-gray-400 px-2 text-center space-y-2">
                    {shopNotes[selected]}
                </div>
            )}

            <ShopTable items={data[selected]} />
        </div>
    )
}
