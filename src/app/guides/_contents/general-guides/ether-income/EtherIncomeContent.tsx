'use client'

import { useMemo, useState, ChangeEvent } from 'react'
import GuideHeading from '@/app/components/GuideHeading'
import ItemInlineDisplay from '@/app/components/ItemInline'
import Link from 'next/link'
import type { TenantKey } from '@/tenants/config'
import { labels } from './labels'
import {
    DEFAULTS,
    DAILY_SOURCES,
    WEEKLY_SOURCES_BASE,
    MONTHLY_SOURCES_BASE,
    VARIABLE_SOURCE_IDS,
    ARENA_REWARDS,
    GUILD_RAID_REWARDS,
    WORLD_BOSS_REWARDS,
    WORLD_BOSS_LEAGUES,
    type WorldBossLeague,
    type Source,
    fmt,
    sum,
    clampNonNeg,
    withOverrides,
} from './data'

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
    onLeagueChange,
    lang,
}: {
    overrides: Record<string, number>
    setOverride: (id: string, val: number) => void
    worldBossLeague: WorldBossLeague
    onLeagueChange: (lg: WorldBossLeague) => void
    lang: TenantKey
}) {
    const t = labels[lang]

    const pickLabel = (ranks: Record<string, string>, list: { id: string; value: number }[], v: number) => {
        const found = list.find(o => o.value === v)
        return found ? ranks[found.id] || found.id : String(v)
    }

    const arenaTxt = pickLabel(t.arenaRanks, ARENA_REWARDS, overrides['weekly.arena'])
    const guildTxt = pickLabel(t.guildRanks, GUILD_RAID_REWARDS, overrides['monthly.guildRaid'])
    const wbTxt = `${t.wbLeagues[worldBossLeague]} ${pickLabel(t.wbRanks, WORLD_BOSS_REWARDS[worldBossLeague], overrides['monthly.worldBoss'])}`

    return (
        <details className="mx-auto max-w-3xl rounded-xl border border-gray-700">
            <summary className="cursor-pointer select-none px-3 py-2 text-xs text-gray-300">
                <span className="font-medium">{t.advancedAdjustments}</span>
                <br />
                <span className="ml-2 text-[11px] text-gray-500 truncate inline-block align-middle">
                    ({t.arena}: {arenaTxt} · {t.guild}: {guildTxt} · WB: {wbTxt})
                </span>
            </summary>

            <div className="px-3 pb-3 text-xs">
                <div className="gap-2">
                    {/* Arena */}
                    <div className="flex items-center gap-2">
                        <span className="w-16 shrink-0 text-gray-400 whitespace-nowrap">{t.arena}</span>
                        <select
                            className="h-8 min-w-[9rem] w-[10rem] shrink-0 rounded-md bg-gray-900 border border-gray-700 px-2 text-xs"
                            value={overrides['weekly.arena']}
                            onChange={(e) => setOverride('weekly.arena', Number(e.target.value))}
                        >
                            {ARENA_REWARDS.map(opt => (
                                <option key={opt.value} value={opt.value}>{t.arenaRanks[opt.id]}</option>
                            ))}
                        </select>
                        <EtherAmountMini value={overrides['weekly.arena']} />
                    </div>
                    <br />
                    {/* Guild Raid */}
                    <div className="flex items-center gap-2">
                        <span className="w-16 shrink-0 text-gray-400 whitespace-nowrap">{t.guild}</span>
                        <select
                            className="h-8 min-w-[10rem] w-[11rem] shrink-0 rounded-md bg-gray-900 border border-gray-700 px-2 text-xs"
                            value={overrides['monthly.guildRaid']}
                            onChange={(e) => setOverride('monthly.guildRaid', Number(e.target.value))}
                        >
                            {GUILD_RAID_REWARDS.map(opt => (
                                <option key={opt.value} value={opt.value}>{t.guildRanks[opt.id]}</option>
                            ))}
                        </select>
                        <EtherAmountMini value={overrides['monthly.guildRaid']} />
                    </div>
                    <br />
                    {/* World Boss */}
                    <div className="flex items-center gap-2">
                        <span className="w-16 shrink-0 text-gray-400 whitespace-nowrap">{t.worldBoss}</span>
                        <select
                            className="h-8 w-28 shrink-0 rounded-md bg-gray-900 border border-gray-700 px-2 text-xs"
                            value={worldBossLeague}
                            onChange={(e) => onLeagueChange(e.target.value as WorldBossLeague)}
                        >
                            {WORLD_BOSS_LEAGUES.map(lg => (
                                <option key={lg} value={lg}>{t.wbLeagues[lg]}</option>
                            ))}
                        </select>
                        <select
                            className="h-8 min-w-[5rem] w-[7rem] shrink-0 rounded-md bg-gray-900 border border-gray-700 px-2 text-xs"
                            value={overrides['monthly.worldBoss']}
                            onChange={(e) => setOverride('monthly.worldBoss', Number(e.target.value))}
                        >
                            {WORLD_BOSS_REWARDS[worldBossLeague].map(opt => (
                                <option key={opt.value} value={opt.value}>{t.wbRanks[opt.id]}</option>
                            ))}
                        </select>
                        <EtherAmountMini value={overrides['monthly.worldBoss']} />
                    </div>
                </div>
            </div>
        </details>
    )
}



// ============= Main Component =============
export default function EtherIncomeContent({ lang }: { lang: TenantKey }) {
    const t = labels[lang]

    // Overrides
    const [overrides, setOverrides] = useState<Record<string, number>>({
        'weekly.arena': DEFAULTS.arena,
        'monthly.guildRaid': DEFAULTS.guildRaid,
        'monthly.worldBoss': DEFAULTS.worldBoss.value,
    })

    // World Boss UI state
    const [worldBossLeague, setWorldBossLeague] = useState<WorldBossLeague>(DEFAULTS.worldBoss.league)

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

    const getSourceLabel = (s: Source): string => {
        let label = t.sources[s.id] || s.id
        if (s.id === 'weekly.arena') {
            const cur = ARENA_REWARDS.find(o => o.value === s.weekly)
            if (cur) label += ` (${t.arenaRanks[cur.id]})`
        }
        if (s.id === 'monthly.guildRaid') {
            const cur = GUILD_RAID_REWARDS.find(o => o.value === s.monthly)
            if (cur) label += ` (${t.guildRanks[cur.id]})`
        }
        if (s.id === 'monthly.worldBoss') {
            const cur = WORLD_BOSS_REWARDS[worldBossLeague].find(o => o.value === s.monthly)
            if (cur) label += ` (${t.wbLeagues[worldBossLeague]} ${t.wbRanks[cur.id]})`
        }
        return label
    }

    const getNote = (s: Source): string => t.sourceNotes[s.id] || '–'

    return (
        <div className="space-y-6">
            <GuideHeading>{t.title}</GuideHeading>

            <p className="text-sm text-gray-300 leading-relaxed">
                {t.description}
            </p>

            {/* Totals Summary */}
            <div className="flex justify-center mt-2">
                <div className="w-full max-w-3xl grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="rounded-2xl border border-gray-700 p-4 text-center col-span-2 sm:col-span-1">
                        <div className="text-xs text-gray-400">{t.dailyIncome}</div>
                        <div className="mt-1 text-lg font-bold">{fmt(totals.dailyBase)}{t.perDay}</div>
                    </div>
                    <div className="rounded-2xl border border-gray-700 p-4 text-center">
                        <div className="text-xs text-gray-400">{t.weeklyIncome}</div>
                        <div className="mt-1 text-lg font-bold">{fmt(totals.weeklySpike)}</div>
                    </div>
                    <div className="rounded-2xl border border-gray-700 p-4 text-center">
                        <div className="text-xs text-gray-400">{t.monthlyIncome}</div>
                        <div className="mt-1 text-lg font-bold">{fmt(totals.monthlySpike)}</div>
                    </div>
                    <div className="rounded-2xl border border-gray-700 p-4 text-center">
                        <div className="text-xs text-gray-400">{t.weeklyTotal}</div>
                        <div className="mt-1 text-lg font-bold">{fmt(totals.weeklyTotal)}</div>
                    </div>
                    <div className="rounded-2xl border border-gray-700 p-4 text-center">
                        <div className="text-xs text-gray-400">{t.monthlyTotal}</div>
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
                    onLeagueChange={(lg) => {
                        setWorldBossLeague(lg)
                        const fallback = WORLD_BOSS_REWARDS[lg][WORLD_BOSS_REWARDS[lg].length - 1].value
                        setOverride('monthly.worldBoss', fallback)
                    }}
                    lang={lang}
                />
            </div>

            {/* Tables */}
            <SectionTable
                title={t.tableDaily}
                head={[t.source, t.daily, t.weeklyApprox, t.monthlyApprox, t.notes]}
                rows={DAILY_SOURCES.map(s => [t.sources[s.id] || s.id, fmt(s.daily), fmt((s.daily ?? 0) * 7), fmt((s.daily ?? 0) * 30), getNote(s)])}
                footerLabel={t.dailySubtotal}
                footerValues={[fmt(sum(DAILY_SOURCES, 'daily')), fmt(sum(DAILY_SOURCES, 'daily') * 7), fmt(sum(DAILY_SOURCES, 'daily') * 30)]}
            />

            <SectionTable
                title={t.tableWeekly}
                head={[t.source, t.weekly, t.monthlyApprox4, t.notes]}
                rows={WEEKLY_SOURCES.map(s => [getSourceLabel(s), fmt(s.weekly), fmt((s.weekly ?? 0) * 4), getNote(s)])}
                footerLabel={t.weeklySubtotal}
                footerValues={[fmt(sum(WEEKLY_SOURCES, 'weekly')), fmt(sum(WEEKLY_SOURCES, 'weekly') * 4)]}
            />

            <SectionTable
                title={t.tableMonthly}
                head={[t.source, t.monthly, t.notes]}
                rows={MONTHLY_SOURCES.map(s => [getSourceLabel(s), fmt(s.monthly), getNote(s)])}
                footerLabel={t.monthlySubtotal}
                footerValues={[fmt(sum(MONTHLY_SOURCES, 'monthly'))]}
            />

            <details className="mx-auto w-full max-w-3xl rounded-xl border border-gray-700">
                <summary className="cursor-pointer select-none px-4 py-2 text-sm text-gray-300">
                    {t.variableExcluded}
                </summary>
                <div className="p-3 space-y-3 text-sm">
                    <div className="rounded-2xl border border-gray-700 p-4">
                        <div className="font-medium mb-2">{t.variableTitle}</div>
                        <ul className="list-disc pl-5 space-y-1 text-gray-300">
                            {VARIABLE_SOURCE_IDS.map((id) => (
                                <li key={id}>
                                    {id === 'variable.coupons' ? (
                                        <>{t.variableItems[id]} — <Link href="/coupons" className="underline text-red-400">{lang === 'en' ? 'see more here' : lang === 'jp' ? '詳細はこちら' : lang === 'kr' ? '자세히 보기' : '点击查看'}</Link></>
                                    ) : (
                                        t.variableItems[id]
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </details>

            {/* Projection */}
            <div className="flex justify-center">
                <div className="w-full max-w-3xl rounded-2xl border border-gray-700 p-4">
                    <div className="font-semibold mb-2 text-center">{t.projection}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="text-sm">
                            {t.endDate}
                            <input type="date" className="mt-1 w-full rounded-md bg-gray-900 border border-gray-700 p-2"
                                value={target} onChange={(e: ChangeEvent<HTMLInputElement>) => setTarget(e.target.value)} />
                        </label>
                        <label className="text-sm">
                            {t.currentEther}
                            <input type="number" className="mt-1 w-full rounded-md bg-gray-900 border border-gray-700 p-2"
                                value={currentStock} onChange={(e) => setCurrentStock(Number(e.target.value || 0))} />
                        </label>
                        <div className="text-sm flex items-end">
                            <div className="w-full rounded-md bg-gray-900 border border-gray-700 p-3">
                                {t.daily}: {fmt(totals.dailyBase)} <br /> {t.weekly}: {fmt(totals.weeklySpike)} <br /> {t.monthly}: {fmt(totals.monthlySpike)}
                            </div>
                        </div>
                    </div>

                    {projection && (
                        <div className="mt-3 text-sm text-gray-300">
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                <Stat label={t.days} value={fmt(projection.days)} />
                                <Stat label={t.weeks} value={fmt(projection.weeks)} />
                                <Stat label={t.months} value={fmt(projection.monthsApprox)} />
                                <Stat label={t.fromDaily} value={fmt(projection.fromDaily)} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                                <Stat label={t.fromWeekly} value={fmt(projection.fromWeekly)} />
                                <Stat label={t.fromMonthly} value={fmt(projection.fromMonthly)} />
                                <Stat label={t.projectedTotal} value={fmt(projection.total)} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
