'use client'

import { useMemo, useState, ChangeEvent } from 'react'
import GuideHeading from '@/app/components/GuideHeading'
import ItemInlineDisplay from '@/app/components/ItemInline'
import Link from 'next/link'

// ============= Types =============
type Source = {
    id?: string
    source: string
    daily?: number
    weekly?: number
    monthly?: number
    note?: string
}

// === Defaults centralisés ===
const DEFAULTS = {
    arena: 400,                 // Diamond III
    guildRaid: 850,             // Top 51–100
    worldBoss: {
        league: 'Extreme' as keyof typeof WORLD_BOSS_REWARDS,
        value: 200,               // Top 100% (Extreme)
    },
}

// ============= Data =============
const DAILY_SOURCES: Source[] = [
    { source: 'Daily Missions', daily: 50 },
    { source: 'Daily Arena', daily: 20 },
    { source: 'Daily Free Pack', daily: 15 },
    { source: 'Daily Mission Event', daily: 30 },
    { source: 'Antiparticle generator (2×12h)', daily: 78 },
]

const WEEKLY_SOURCES_BASE: Source[] = [
    { source: 'Weekly Free Pack', weekly: 75 },
    { id: 'weekly.arena', source: 'Weekly Arena Ranking', weekly: 400, note: '35 minimum. Can go up to 1500 for rank 1.' },
    { source: 'Weekly Missions', weekly: 150 },
    { source: 'Guild Check-in', weekly: 150 },
]

const MONTHLY_SOURCES_BASE: Source[] = [
    { source: 'Monthly Free Pack', monthly: 150 },
    { source: 'Skyward Tower', monthly: 500 },
    { source: 'Check-in', monthly: 750 },
    { source: 'Maintenance rewards', monthly: 400, note: '≈200 every 2 weeks (min)' },
    { source: 'Joint Mission', monthly: 880, note: '80 from Event Mission, do 10 joint challenge runs' },
    { id: 'monthly.guildRaid', source: 'Guild Raid Ranking Reward', monthly: 200, note: '200 minimum. Can go up to 1500 for rank 1.' },
    { id: 'monthly.worldBoss', source: 'World Boss Ranking Reward', monthly: 60, note: '60 minimum. Can go up to 1500 for rank 1 in extreme.' },
]

// Variables / Event-driven → listés mais exclus des totaux
const VARIABLE_SOURCES: { title: string; items: React.ReactNode[] }[] = [
    {
        title: 'Extra',
        items: [
            'Terminus Island Ether rewards (22–26 on treasure reward on Terminus 10) (5 chances everyday ×2 w/ terminus pack)',
            "Every update's event",
            'New Side Stories every new character (non-premium/limited)',
            <>Coupon codes — see more <Link href="/coupons" className="underline text-red-400">here</Link></>,
            'Seasonal events (story, point shops, login chains)'
        ],
    },
]

// === Rewards tables ===
const ARENA_REWARDS: { label: string; value: number }[] = [
    { label: 'Bronze III', value: 35 },
    { label: 'Bronze II', value: 50 },
    { label: 'Bronze I', value: 75 },
    { label: 'Silver III', value: 100 },
    { label: 'Silver II', value: 125 },
    { label: 'Silver I', value: 150 },
    { label: 'Gold III', value: 175 },
    { label: 'Gold II', value: 200 },
    { label: 'Gold I', value: 225 },
    { label: 'Platinum III', value: 250 },
    { label: 'Platinum II', value: 300 },
    { label: 'Platinum I', value: 350 },
    { label: 'Diamond III', value: 400 },
    { label: 'Diamond II ', value: 450 },
    { label: 'Diamond I', value: 500 },
    { label: 'Master III', value: 550 },
    { label: 'Master II', value: 600 },
    { label: 'Master I', value: 750 },
    { label: 'Top 100', value: 800 },
    { label: 'Top 50', value: 850 },
    { label: 'Top 10', value: 1000 },
    { label: 'Top 3', value: 1150 },
    { label: 'Top 2', value: 1350 },
    { label: 'Top 1', value: 1500 },
]

const GUILD_RAID_REWARDS: { label: string; value: number }[] = [
    { label: 'Top 1', value: 1500 },
    { label: 'Top 2', value: 1400 },
    { label: 'Top 3', value: 1300 },
    { label: 'Top 5', value: 1200 },
    { label: 'Top 10', value: 1100 },
    { label: 'Top 20', value: 1000 },
    { label: 'Top 50', value: 900 },
    { label: 'Top 100', value: 850 },
    { label: 'Top 150', value: 800 },
    { label: 'Top 200', value: 750 },
    { label: 'Top 300', value: 700 },
    { label: 'Top 400', value: 650 },
    { label: 'Top 500', value: 600 },
    { label: 'Top 1000', value: 550 },
    { label: 'Top 1500', value: 500 },
    { label: 'Top 2000', value: 450 },
    { label: 'Top 3000', value: 400 },
    { label: 'Below Top 3001', value: 200 },
]

const WORLD_BOSS_REWARDS: Record<string, { label: string; value: number }[]> = {
    Normal: [
        { label: 'Rank 1', value: 200 },
        { label: 'Rank 2', value: 180 },
        { label: 'Rank 3', value: 160 },
        { label: 'Top 10', value: 140 },
        { label: 'Top 50', value: 120 },
        { label: 'Top 100', value: 100 },
        { label: 'Top 1%', value: 90 },
        { label: 'Top 10%', value: 80 },
        { label: 'Top 50%', value: 70 },
        { label: 'Top 100%', value: 60 },
    ],
    Hard: [
        { label: 'Rank 1', value: 300 },
        { label: 'Rank 2', value: 270 },
        { label: 'Rank 3', value: 240 },
        { label: 'Top 10', value: 210 },
        { label: 'Top 50', value: 180 },
        { label: 'Top 100', value: 160 },
        { label: 'Top 1%', value: 140 },
        { label: 'Top 10%', value: 120 },
        { label: 'Top 50%', value: 100 },
        { label: 'Top 100%', value: 80 },
    ],
    'Very Hard': [
        { label: 'Rank 1', value: 500 },
        { label: 'Rank 2', value: 450 },
        { label: 'Rank 3', value: 400 },
        { label: 'Top 10', value: 350 },
        { label: 'Top 50', value: 300 },
        { label: 'Top 100', value: 250 },
        { label: 'Top 1%', value: 200 },
        { label: 'Top 10%', value: 150 },
        { label: 'Top 50%', value: 120 },
        { label: 'Top 100%', value: 100 },
    ],
    Extreme: [
        { label: 'Rank 1', value: 1500 },
        { label: 'Rank 2', value: 1400 },
        { label: 'Rank 3', value: 1300 },
        { label: 'Top 10', value: 1100 },
        { label: 'Top 50', value: 900 },
        { label: 'Top 100', value: 700 },
        { label: 'Top 1%', value: 800 },
        { label: 'Top 10%', value: 600 },
        { label: 'Top 50%', value: 400 },
        { label: 'Top 100%', value: 200 },
    ],
}

// ============= Helpers =============
function fmt(n?: number) {
    if (n === undefined) return '–'
    return n.toLocaleString()
}
const sum = (arr: Source[], key: 'daily' | 'weekly' | 'monthly') =>
    arr.reduce((acc, s) => acc + (s[key] ?? 0), 0)

function clampNonNeg(n: number) {
    return Number.isFinite(n) && n > 0 ? n : 0
}
function withOverrides(list: Source[], overrides: Record<string, number>): Source[] {
    return list.map((s) => {
        if (!s.id) return s
        const override = overrides[s.id]
        if (override === undefined) return s
        if (typeof s.weekly === 'number') return { ...s, weekly: override }
        if (typeof s.monthly === 'number') return { ...s, monthly: override }
        return s
    })
}

// ============= UI Subcomponents =============
function SectionTable({ title, head, rows, footerLabel, footerValues }: {
    title: string, head: string[], rows: (string | number)[][],
    footerLabel: string, footerValues: (string | number)[]
}) {
    return (
        <div className="flex justify-center">
            <div className="w-full max-w-3xl">
                <h3 className="font-semibold text-lg mb-2 text-center">{title}</h3>
                <table className="w-auto mx-auto border border-gray-700 rounded-md text-sm text-center">
                    <thead className="bg-gray-800">
                        <tr>{head.map((h, i) => <th key={i} className="border px-3 py-2">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                        {rows.map((r, i) => (
                            <tr key={i}>
                                {r.map((c, j) => (
                                    <td key={j} className={`border px-3 py-2 ${j === 0 ? 'text-left' : ''}`}>{c}</td>
                                ))}
                            </tr>
                        ))}
                        <tr className="bg-gray-900 font-bold">
                            <td className="border px-3 py-2 text-left">{footerLabel}</td>
                            {footerValues.map((v, i) => <td key={i} className="border px-3 py-2">{v}</td>)}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function Stat({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-md border border-gray-700 p-3 text-center">
            <div className="text-xs uppercase tracking-wide text-gray-400">{label}</div>
            <div className="mt-1 font-bold">{value}</div>
        </div>
    )
}

// ——— helpers compacts ———
const pretty = (full: string) => full.split('—')[0].trim();
const pickLabel = (list: { label: string; value: number }[], v: number) =>
    pretty(list.find(o => o.value === v)?.label ?? String(v));

function EtherAmountMini({ value }: { value: number }) {
    return (
        <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="font-semibold tabular-nums text-xs">{value.toLocaleString()}</span>
            <span className="scale-90 origin-left inline-flex">
                <ItemInlineDisplay names={['Ether']} />
            </span>
        </div>
    );
}

function CompactAdjustments({
    overrides,
    setOverride,
    worldBossLeague,
    setWorldBossLeague,
    worldBossRank,
    setWorldBossRank,
}: {
    overrides: Record<string, number>
    setOverride: (id: string, val: number) => void
    worldBossLeague: keyof typeof WORLD_BOSS_REWARDS
    setWorldBossLeague: (lg: keyof typeof WORLD_BOSS_REWARDS) => void
    worldBossRank: number
    setWorldBossRank: (v: number) => void
}) {
    const arenaTxt = pickLabel(ARENA_REWARDS, overrides['weekly.arena']);
    const guildTxt = pickLabel(GUILD_RAID_REWARDS, overrides['monthly.guildRaid']);
    const wbTxt = `${worldBossLeague} ${pickLabel(WORLD_BOSS_REWARDS[worldBossLeague], overrides['monthly.worldBoss'])}`;

    return (
        <details className="mx-auto max-w-fit rounded-xl border border-gray-700">
            <summary className="cursor-pointer select-none px-3 py-2 text-xs text-gray-300">
                <span className="font-medium">Advanced rank adjustments</span>
                <span className="ml-2 text-[11px] text-gray-500 truncate inline-block align-middle max-w-[80%]">
                    (Arena: {arenaTxt} · Guild: {guildTxt} · WB: {wbTxt})
                </span>
            </summary>

            <div className="px-3 pb-3 text-xs">
                <div className="gap-2">
                    {/* Arena */}
                    <div className="flex items-center gap-2">
                        <span className="w-16 shrink-0 text-gray-400 whitespace-nowrap">Arena</span>
                        <select
                            className="h-8 min-w-[9rem] w-[10rem] shrink-0 rounded-md bg-gray-900 border border-gray-700 px-2 text-xs"
                            value={overrides['weekly.arena']}
                            onChange={(e) => setOverride('weekly.arena', Number(e.target.value))}
                        >
                            {ARENA_REWARDS.map(opt => (
                                <option key={opt.value} value={opt.value}>{pretty(opt.label)}</option>
                            ))}
                        </select>
                        <EtherAmountMini value={overrides['weekly.arena']} />
                    </div>
                    <br />
                    {/* Guild Raid */}
                    <div className="flex items-center gap-2">
                        <span className="w-16 shrink-0 text-gray-400 whitespace-nowrap">Guild</span>
                        <select
                            className="h-8 min-w-[10rem] w-[11rem] shrink-0 rounded-md bg-gray-900 border border-gray-700 px-2 text-xs"
                            value={overrides['monthly.guildRaid']}
                            onChange={(e) => setOverride('monthly.guildRaid', Number(e.target.value))}
                        >
                            {GUILD_RAID_REWARDS.map(opt => (
                                <option key={opt.value} value={opt.value}>{pretty(opt.label)}</option>
                            ))}
                        </select>
                        <EtherAmountMini value={overrides['monthly.guildRaid']} />
                    </div>
                    <br />
                    {/* World Boss */}
                    <div className="flex items-center gap-2">
                        <span className="w-16 shrink-0 text-gray-400 whitespace-nowrap">World Boss</span>
                        <select
                            className="h-8 w-28 shrink-0 rounded-md bg-gray-900 border border-gray-700 px-2 text-xs"
                            value={worldBossLeague}
                            onChange={(e) => {
                                const lg = e.target.value as keyof typeof WORLD_BOSS_REWARDS;
                                setWorldBossLeague(lg);
                                const fallback = WORLD_BOSS_REWARDS[lg][WORLD_BOSS_REWARDS[lg].length - 1].value;
                                setWorldBossRank(fallback);
                                setOverride('monthly.worldBoss', fallback);
                            }}
                        >
                            {Object.keys(WORLD_BOSS_REWARDS).map(lg => (
                                <option key={lg} value={lg}>{lg}</option>
                            ))}
                        </select>
                        <select
                            className="h-8 min-w-[9rem] w-[10rem] shrink-0 rounded-md bg-gray-900 border border-gray-700 px-2 text-xs"
                            value={worldBossRank}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                setWorldBossRank(val);
                                setOverride('monthly.worldBoss', val);
                            }}
                        >
                            {WORLD_BOSS_REWARDS[worldBossLeague].map(opt => (
                                <option key={opt.value} value={opt.value}>{pretty(opt.label)}</option>
                            ))}
                        </select>
                        <EtherAmountMini value={overrides['monthly.worldBoss']} />
                    </div>
                </div>
            </div>
        </details>
    );
}



// ============= Main Component =============
export default function EtherIncomeGuide() {
    // Overrides numériques utilisés par les calculs
    const [overrides, setOverrides] = useState<Record<string, number>>({
        'weekly.arena': DEFAULTS.arena,
        'monthly.guildRaid': DEFAULTS.guildRaid,
        'monthly.worldBoss': DEFAULTS.worldBoss.value,
    })

    // État de l’UI World Boss
    const [worldBossLeague, setWorldBossLeague] =
        useState<keyof typeof WORLD_BOSS_REWARDS>(DEFAULTS.worldBoss.league)
    const [worldBossRank, setWorldBossRank] = useState<number>(DEFAULTS.worldBoss.value)


    const WEEKLY_SOURCES = useMemo(() => withOverrides(WEEKLY_SOURCES_BASE, overrides), [overrides])
    const MONTHLY_SOURCES = useMemo(() => withOverrides(MONTHLY_SOURCES_BASE, overrides), [overrides])

    const totals = useMemo(() => {
        const dailyBase = sum(DAILY_SOURCES, 'daily')
        const weeklySpike = sum(WEEKLY_SOURCES, 'weekly')
        const monthlySpike = sum(MONTHLY_SOURCES, 'monthly')
        const weeklyTotal = dailyBase * 7 + weeklySpike
        const monthlyTotal = dailyBase * 30 + weeklySpike * 4 + monthlySpike
        return { dailyBase, weeklySpike, monthlySpike, weeklyTotal, monthlyTotal }
    }, [WEEKLY_SOURCES, MONTHLY_SOURCES])

    const [target, setTarget] = useState<string>('')
    const [currentStock, setCurrentStock] = useState<number>(0)

    const projection = useMemo(() => {
        if (!target) return undefined
        const now = new Date()
        const end = new Date(target + 'T23:59:59')
        const ms = end.getTime() - now.getTime()
        const days = clampNonNeg(Math.floor(ms / (1000 * 60 * 60 * 24)) + 1)
        const weeks = Math.floor(days / 7)
        const monthsApprox = Math.floor(days / 30)
        const fromDaily = totals.dailyBase * days
        const fromWeekly = totals.weeklySpike * weeks
        const fromMonthly = totals.monthlySpike * monthsApprox
        const total = currentStock + fromDaily + fromWeekly + fromMonthly
        return { days, weeks, monthsApprox, fromDaily, fromWeekly, fromMonthly, total }
    }, [target, currentStock, totals])

    const setOverride = (id: string, val: number) =>
        setOverrides(prev => ({ ...prev, [id]: val }))

    return (
        <div className="space-y-6">
            <GuideHeading>Daily / Weekly / Monthly Ether income</GuideHeading>

            <p className="text-sm text-gray-300 leading-relaxed">
                This guide organizes your income into Daily, Weekly, and Monthly sources. Use the Advanced rank adjustments
                (Arena, Guild Raid, World Boss) to match your account—totals and the date projection update instantly.
                Event/seasonal rewards are listed separately and aren’t counted in the totals.
            </p>


            {/* Totals Summary */}
            <div className="flex justify-center mt-2">
                <div className="w-full max-w-3xl grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="rounded-2xl border border-gray-700 p-4 text-center col-span-2 sm:col-span-1">
                        <div className="text-xs text-gray-400">Daily income</div>
                        <div className="mt-1 text-lg font-bold">{fmt(totals.dailyBase)}/day</div>
                    </div>
                    <div className="rounded-2xl border border-gray-700 p-4 text-center">
                        <div className="text-xs text-gray-400">Weekly income</div>
                        <div className="mt-1 text-lg font-bold">{fmt(totals.weeklySpike)}</div>
                    </div>
                    <div className="rounded-2xl border border-gray-700 p-4 text-center">
                        <div className="text-xs text-gray-400">Monthly income</div>
                        <div className="mt-1 text-lg font-bold">{fmt(totals.monthlySpike)}</div>
                    </div>
                    <div className="rounded-2xl border border-gray-700 p-4 text-center">
                        <div className="text-xs text-gray-400">Weekly Total</div>
                        <div className="mt-1 text-lg font-bold">{fmt(totals.weeklyTotal)}</div>
                    </div>
                    <div className="rounded-2xl border border-gray-700 p-4 text-center">
                        <div className="text-xs text-gray-400">Monthly Total</div>
                        <div className="mt-1 text-lg font-bold">{fmt(totals.monthlyTotal)}</div>
                    </div>
                </div>
            </div>

            {/* Adjustments */}
            <div className="flex justify-center">
                <CompactAdjustments
                    overrides={overrides}
                    setOverride={setOverride}
                    worldBossLeague={worldBossLeague}
                    setWorldBossLeague={setWorldBossLeague}
                    worldBossRank={worldBossRank}
                    setWorldBossRank={setWorldBossRank}
                />
            </div>

            {/* Tables */}
            <SectionTable
                title="Daily income"
                head={['Source', 'Daily', 'Weekly ≈×7', 'Monthly ≈×30', 'Notes']}
                rows={DAILY_SOURCES.map(s => [s.source, fmt(s.daily), fmt((s.daily ?? 0) * 7), fmt((s.daily ?? 0) * 30), s.note ?? '–'])}
                footerLabel="Daily subtotal"
                footerValues={[fmt(sum(DAILY_SOURCES, 'daily')), fmt(sum(DAILY_SOURCES, 'daily') * 7), fmt(sum(DAILY_SOURCES, 'daily') * 30)]}
            />

            <SectionTable
                title="Weekly income"
                head={['Source', 'Weekly', 'Monthly ≈×4', 'Notes']}
                rows={WEEKLY_SOURCES.map((s) => {
                    let label = s.source
                    if (s.id === 'weekly.arena') {
                        const cur = ARENA_REWARDS.find(o => o.value === s.weekly)
                        if (cur) label += ` (${pretty(cur.label)})`
                    }
                    return [label, fmt(s.weekly), fmt((s.weekly ?? 0) * 4), s.note ?? '–']
                })}

                footerLabel="Weekly subtotal"
                footerValues={[
                    fmt(sum(WEEKLY_SOURCES, 'weekly')),
                    fmt(sum(WEEKLY_SOURCES, 'weekly') * 4),
                ]}
            />


            <SectionTable
                title="Monthly income"
                head={['Source', 'Monthly', 'Notes']}
                rows={MONTHLY_SOURCES.map((s) => {
                    let label = s.source
                    if (s.id === 'monthly.guildRaid') {
                        const cur = GUILD_RAID_REWARDS.find(o => o.value === s.monthly)
                        if (cur) label += ` (${pretty(cur.label)})`
                    }
                    if (s.id === 'monthly.worldBoss') {
                        const cur = WORLD_BOSS_REWARDS[worldBossLeague].find(o => o.value === s.monthly)
                        if (cur) label += ` (${worldBossLeague} ${pretty(cur.label)})`
                    }
                    return [label, fmt(s.monthly), s.note ?? '–']
                })}

                footerLabel="Monthly subtotal"
                footerValues={[fmt(sum(MONTHLY_SOURCES, 'monthly'))]}
            />


            <details className="mx-auto w-full max-w-3xl rounded-xl border border-gray-700">
                <summary className="cursor-pointer select-none px-4 py-2 text-sm text-gray-300">
                    Variable / Event-Driven (excluded)
                </summary>
                <div className="p-3 space-y-3 text-sm">
                    {VARIABLE_SOURCES.map((group, idx) => (
                        <div key={idx} className="rounded-2xl border border-gray-700 p-4">
                            <div className="font-medium mb-2">{group.title}</div>
                            <ul className="list-disc pl-5 space-y-1 text-gray-300">
                                {group.items.map((it, i) => (
                                    <li key={i}>{it}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </details>


            {/* Projection */}
            <div className="flex justify-center">
                <div className="w-full max-w-3xl rounded-2xl border border-gray-700 p-4">
                    <div className="font-semibold mb-2 text-center">Projection until a date</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="text-sm">
                            End date
                            <input type="date" className="mt-1 w-full rounded-md bg-gray-900 border border-gray-700 p-2"
                                value={target} onChange={(e: ChangeEvent<HTMLInputElement>) => setTarget(e.target.value)} />
                        </label>
                        <label className="text-sm">
                            Current Ether
                            <input type="number" className="mt-1 w-full rounded-md bg-gray-900 border border-gray-700 p-2"
                                value={currentStock} onChange={(e) => setCurrentStock(Number(e.target.value || 0))} />
                        </label>
                        <div className="text-sm flex items-end">
                            <div className="w-full rounded-md bg-gray-900 border border-gray-700 p-3">
                                Daily: {fmt(totals.dailyBase)} <br /> Weekly: {fmt(totals.weeklySpike)} <br /> Monthly: {fmt(totals.monthlySpike)}
                            </div>
                        </div>
                    </div>

                    {projection && (
                        <div className="mt-3 text-sm text-gray-300">
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                <Stat label="Days" value={fmt(projection.days)} />
                                <Stat label="Weeks" value={fmt(projection.weeks)} />
                                <Stat label="Months" value={fmt(projection.monthsApprox)} />
                                <Stat label="From Daily" value={fmt(projection.fromDaily)} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                                <Stat label="From Weekly" value={fmt(projection.fromWeekly)} />
                                <Stat label="From Monthly" value={fmt(projection.fromMonthly)} />
                                <Stat label="Projected Total" value={fmt(projection.total)} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
