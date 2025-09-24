'use client'

import { useMemo, useState, ChangeEvent } from 'react'
import GuideHeading from '@/app/components/GuideHeading'
import ItemInlineDisplay from '@/app/components/ItemInline'
import Link from 'next/link'

// ============= Types =============
type Source = {
    source: string
    daily?: number
    weekly?: number
    monthly?: number
    note?: string
}

// ============= Data =============
// On encode les Daily en valeur /jour directement (plus lisible)
const DAILY_SOURCES: Source[] = [
    { source: 'Daily Missions', daily: 50 },
    { source: 'Daily Arena', daily: 20 },
    { source: 'Daily Free Pack', daily: 15 },
    { source: 'Daily Mission Event', daily: 30 },
    { source: 'Antiparticle generator (2×12h)', daily: 78 },
]

// Hebdo = spikes hebdo (pas la conversion des daily)
const WEEKLY_SOURCES: Source[] = [
    { source: 'Weekly Free Pack', weekly: 75 },
    { source: 'Weekly Arena Ranking (Diamond 3)', weekly: 400, note: '+50 weekly per higher rank' },
    { source: 'Weekly Missions', weekly: 150 },
    { source: 'Guild Check-in', weekly: 150 },
]

// Mensuel = spikes mensuels (pas la conversion)
const MONTHLY_SOURCES: Source[] = [
    { source: 'Monthly Free Pack', monthly: 150 },
    { source: 'Skyward Tower', monthly: 500 },
    { source: 'Check-in', monthly: 750 },
    { source: 'Maintenance rewards', monthly: 400, note: '200 minimum every 2 weeks' },
    { source: 'Joint Mission', monthly: 880, note: '80 from Event Mission, do 10 joint challenge runs' },
    { source: 'Guild Raid Ranking Reward', monthly: 200, note: '200 minimum. Can go up to 1500 for rank 1.' },
    { source: 'World Boss Ranking Reward', monthly: 60 , note: '60 minimum for normal league (and 200 for extreme). Can go up to 1500 for rank 1 in extreme.'},
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

// ============= Helpers =============
function fmt(n?: number) {
    if (n === undefined) return '–'
    return n.toLocaleString()
}
const sum = (arr: Source[], key: 'daily' | 'weekly' | 'monthly') =>
    arr.reduce((acc, s) => acc + (s[key] ?? 0), 0)

function clampNonNeg(n: number) { return Number.isFinite(n) && n > 0 ? n : 0 }

// ============= Component =============
export default function EtherIncomeGuide() {
    // Totaux de base
    const totals = useMemo(() => {
        const dailyBase = sum(DAILY_SOURCES, 'daily')                                // baseline /jour
        const weeklySpike = sum(WEEKLY_SOURCES, 'weekly')                             // spikes hebdo
        const monthlySpike = sum(MONTHLY_SOURCES, 'monthly')                          // spikes mensuels

        // Agrégations usuelles (30 jours ~ mois, 4 semaines ~ mois)
        const weeklyTotal = dailyBase * 7 + weeklySpike
        const monthlyTotal = dailyBase * 30 + weeklySpike * 4 + monthlySpike

        return { dailyBase, weeklySpike, monthlySpike, weeklyTotal, monthlyTotal }
    }, [])

    // Petit calculateur “jusqu’à telle date”
    const [target, setTarget] = useState<string>('') // yyyy-mm-dd
    const [currentStock, setCurrentStock] = useState<number>(0)

    const projection = useMemo(() => {
        if (!target) return undefined
        const now = new Date()
        const end = new Date(target + 'T23:59:59')
        const ms = end.getTime() - now.getTime()
        const days = clampNonNeg(Math.floor(ms / (1000 * 60 * 60 * 24)) + 1) // inclut aujourd’hui
        const weeks = Math.floor(days / 7)
        const monthsApprox = Math.floor(days / 30)

        const fromDaily = totals.dailyBase * days
        const fromWeekly = totals.weeklySpike * weeks
        const fromMonthly = totals.monthlySpike * monthsApprox

        const total = currentStock + fromDaily + fromWeekly + fromMonthly
        return { days, weeks, monthsApprox, fromDaily, fromWeekly, fromMonthly, total }
    }, [target, currentStock, totals])

    return (
        <div className="space-y-6">
            <GuideHeading>Daily / Weekly / Monthly Ether income</GuideHeading>

            <p className="text-sm text-gray-300 leading-relaxed">
                This guide organizes your <ItemInlineDisplay names={['Ether']} /> income into clear categories:
                a steady <b>Daily</b> baseline, with extra <b>Weekly</b> and <b>Monthly</b> boosts.
                Each source is listed individually before being tallied up, while event-based or variable rewards
                are shown separately and not included in the totals.
            </p>


            {/* Totals Summary */}
            <div className="flex justify-center mt-2">
                <div className="w-full max-w-3xl grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="rounded-2xl border border-gray-700 p-4 text-center col-span-2 sm:col-span-1">
                        <div className="text-xs uppercase tracking-wide text-gray-400">Daily income</div>
                        <div className="mt-1 text-lg font-bold">{fmt(totals.dailyBase)}/day</div>
                    </div>
                    <div className="rounded-2xl border border-gray-700 p-4 text-center">
                        <div className="text-xs uppercase tracking-wide text-gray-400">Weekly income</div>
                        <div className="mt-1 text-lg font-bold">{fmt(totals.weeklySpike)}</div>
                    </div>
                    <div className="rounded-2xl border border-gray-700 p-4 text-center">
                        <div className="text-xs uppercase tracking-wide text-gray-400">Monthly income</div>
                        <div className="mt-1 text-lg font-bold">{fmt(totals.monthlySpike)}</div>
                    </div>
                    <div className="rounded-2xl border border-gray-700 p-4 text-center">
                        <div className="text-xs uppercase tracking-wide text-gray-400">Weekly Total</div>
                        <div className="mt-1 text-lg font-bold">{fmt(totals.weeklyTotal)}</div>
                    </div>
                    <div className="rounded-2xl border border-gray-700 p-4 text-center">
                        <div className="text-xs uppercase tracking-wide text-gray-400">Monthly Total</div>
                        <div className="mt-1 text-lg font-bold">{fmt(totals.monthlyTotal)}</div>
                    </div>
                </div>
            </div>

            {/* DAILY */}
            <SectionTable
                title="Daily income"
                head={['Source', 'Daily', 'Weekly ≈×7', 'Monthly ≈×30', 'Notes']}
                rows={DAILY_SOURCES.map(s => ([
                    s.source,
                    fmt(s.daily),
                    fmt((s.daily ?? 0) * 7),
                    fmt((s.daily ?? 0) * 30),
                    s.note ?? '–',
                ]))}
                footerLabel="Daily subtotal"
                footerValues={[
                    fmt(totals.dailyBase),
                    fmt(totals.dailyBase * 7),
                    fmt(totals.dailyBase * 30),
                ]}
            />

            {/* WEEKLY */}
            <SectionTable
                title="Weekly income"
                head={['Source', 'Weekly', 'Monthly ≈×4', 'Notes']}
                rows={WEEKLY_SOURCES.map(s => ([
                    s.source,
                    fmt(s.weekly),
                    fmt((s.weekly ?? 0) * 4),
                    s.note ?? '–',
                ]))}
                footerLabel="Weekly income subtotal"
                footerValues={[
                    fmt(totals.weeklySpike),
                    fmt(totals.weeklySpike * 4),
                ]}
            />

            {/* MONTHLY */}
            <SectionTable
                title="Monthly income"
                head={['Source', 'Monthly', 'Notes']}
                rows={MONTHLY_SOURCES.map(s => ([
                    s.source,
                    fmt(s.monthly),
                    s.note ?? '–',
                ]))}
                footerLabel="Monthly income subtotal"
                footerValues={[fmt(totals.monthlySpike)]}
            />

            {/* Variable Sources */}
            <div className="flex justify-center">
                <div className="w-full max-w-3xl">
                    <h3 className="font-semibold text-lg mb-2 text-center">Variable / Event-Driven (Excluded from totals)</h3>
                    <div className="space-y-3">
                        {VARIABLE_SOURCES.map((group, idx) => (
                            <div key={idx} className="rounded-2xl border border-gray-700 p-4">
                                <div className="font-medium mb-2">{group.title}</div>
                                <ul className="list-disc pl-5 space-y-1 text-gray-300">
                                    {group.items.map((it, i) => (<li key={i}>{it}</li>))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mini Calculator */}
            <div className="flex justify-center">
                <div className="w-full max-w-3xl rounded-2xl border border-gray-700 p-4">
                    <div className="font-semibold mb-2 text-center">Projection until a date (approx.)</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="text-sm">
                            End date
                            <input
                                type="date"
                                className="mt-1 w-full rounded-md bg-gray-900 border border-gray-700 p-2"
                                value={target}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setTarget(e.target.value)}
                            />
                        </label>
                        <label className="text-sm">
                            Current Ether (optional)
                            <input
                                type="number"
                                className="mt-1 w-full rounded-md bg-gray-900 border border-gray-700 p-2"
                                value={currentStock}
                                onChange={(e) => setCurrentStock(Number(e.target.value || 0))}
                                min={0}
                            />
                        </label>
                        <div className="text-sm flex items-end">
                            <div className="w-full rounded-md bg-gray-900 border border-gray-700 p-3">
                                Daily: {fmt(totals.dailyBase)} <br /> Weekly income: {fmt(totals.weeklySpike)} <br /> Monthly income: {fmt(totals.monthlySpike)}
                            </div>
                        </div>
                    </div>

                    {projection && (
                        <div className="mt-3 text-sm text-gray-300">
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                <Stat label="Days" value={fmt(projection.days)} />
                                <Stat label="Weeks (≈)" value={fmt(projection.weeks)} />
                                <Stat label="Months (≈)" value={fmt(projection.monthsApprox)} />
                                <Stat label="From Daily" value={fmt(projection.fromDaily)} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                                <Stat label="From Weekly income" value={fmt(projection.fromWeekly)} />
                                <Stat label="From Monthly income" value={fmt(projection.fromMonthly)} />
                                <Stat label="Projected Total" value={fmt(projection.total)} />
                            </div>
                            <p className="mt-2 text-xs text-gray-400">
                                Weeks = ⌊days / 7⌋, months = ⌊days / 30⌋ (approximation). Variable/event rewards not included.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ============= Small UI helpers =============
function SectionTable({
    title,
    head,
    rows,
    footerLabel,
    footerValues,
}: {
    title: string
    head: string[]
    rows: (string | number)[][]
    footerLabel: string
    footerValues: (string | number)[]
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
