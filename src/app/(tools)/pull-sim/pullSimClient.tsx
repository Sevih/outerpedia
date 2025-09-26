'use client';
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react';
import type { ElementType, ClassType } from '@/types/enums';
import StarLevel from '@/app/components/StarLevel';
import abbrev from '@/data/abbrev.json'
import Image from 'next/image';
import type { BadgeType, Entry } from '@/types/pull';
import FocusSelect from '@/app/components/FocusSelect'

function getMileageCost(kind: Kind): number {
    switch (kind) {
        case 'limited_rateup': return 150;
        case 'premium_standard':
        case 'regular_focus': return 200;
        default: return Infinity; // "all" n’a pas d’exchange
    }
}


const ElementIcon = dynamic(() =>
    import('@/app/components/ElementIcon').then((m) => m.ElementIcon)
)
const ClassIcon = dynamic(() =>
    import('@/app/components/ClassIcon').then((m) => m.ClassIcon)
)

type Kind = 'all' | 'regular_focus' | 'premium_standard' | 'limited_rateup';


type PullEntry = { rarity: 1 | 2 | 3; pick: Entry };
type TenResult = {
    pulls: PullEntry[];
    stats: { total: number; star1: number; star2: number; star3: number; mileageAfter: number };
};

// en haut du fichier (ou exporte-les depuis un utils/pulls.ts)
function getTone(r: 1 | 2 | 3, badge: BadgeType) {
    if (r !== 3) {
        return r === 2
            ? 'from-sky-600/20 via-cyan-600/10 to-transparent border-sky-700/40'
            : 'from-zinc-600/10 via-zinc-600/5 to-transparent border-zinc-700/40'
    }
    switch (badge) {
        case 'premium': return 'from-pink-600/20 via-pink-500/10 to-transparent border-pink-600/40'
        case 'seasonal': return 'from-orange-400/20 via-orange-300/10 to-transparent border-orange-400/40'
        case 'collab': return 'from-red-600/20 via-red-500/10 to-transparent border-red-600/40'
        case 'limited': return 'from-violet-600/20 via-purple-600/10 to-transparent border-violet-600/40'
        default: return 'from-yellow-500/20 via-yellow-400/10 to-transparent border-yellow-500/40' // gold
    }
}

function getRing(r: 1 | 2 | 3, badge: BadgeType) {
    if (r !== 3) {
        return r === 2 ? 'ring-1 ring-cyan-600/30' : 'ring-1 ring-zinc-600/20'
    }
    switch (badge) {
        case 'premium': return 'ring-1 ring-pink-500/30'
        case 'seasonal': return 'ring-1 ring-orange-400/30'
        case 'collab': return 'ring-1 ring-red-500/30'
        case 'limited': return 'ring-1 ring-violet-500/30'
        default: return 'ring-1 ring-yellow-400/30'
    }
}


export default function PullSimClient() {
    const [kind, setKind] = useState<Kind>('all');
    const [mounted, setMounted] = useState(false);
    const [grantMileage, setGrantMileage] = useState(true);
    const [mileage, setMileage] = useState(0);
    const [lastPull, setLastPull] = useState<PullEntry | null>(null);
    const [lastTen, setLastTen] = useState<TenResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<'one' | 'ten' | 'exchange' | null>(null);
    const [focusCount, setFocusCount] = useState(0);

    const [regular3, setRegular3] = useState<Entry[]>([]);
    const [premium3, setPremium3] = useState<Entry[]>([]);
    const [limited3, setLimited3] = useState<Entry[]>([]);
    const [focusSlug, setFocusSlug] = useState<string>('');
    useEffect(() => { setMounted(true); }, []);


    useEffect(() => {
        const ac = new AbortController();
        fetch('/api/pull-sim/chars', { signal: ac.signal })
            .then((r) => r.json())
            .then((d) => {
                setRegular3(d.regular3 || []);
                setPremium3(d.premium3 || []);
                setLimited3(d.limited3 || []);
            })
            .catch((e) => {
                if (e?.name !== 'AbortError') setError(e?.message || 'Failed to load characters');
            });
        return () => ac.abort();
    }, []);

    const focusOptionsRaw: Entry[] = useMemo(() => {
        switch (kind) {
            case 'regular_focus': return regular3;
            case 'premium_standard': return premium3;
            case 'limited_rateup': return limited3;
            case 'all':
            default: return [];
        }
    }, [kind, regular3, premium3, limited3]);

    const focusOptions = useMemo(
        () => [...focusOptionsRaw].sort((a, b) => a.name.localeCompare(b.name)),
        [focusOptionsRaw]
    );

    useEffect(() => { setFocusSlug(''); }, [kind]);
    useEffect(() => {
        // on remet à zéro quand on change de banner OU de focus
        setMileage(0);
        setFocusCount(0);
    }, [kind, focusSlug]);

    useEffect(() => {
        if (!focusSlug) return;
        if (!focusOptions.some((o) => o.slug === focusSlug)) setFocusSlug('');
    }, [focusOptions, focusSlug]);

    async function callApi(action: 'one' | 'ten' | 'exchange', exchangeSlug?: string) {
        if (kind !== 'all' && !focusSlug) {
            setError('Select a focus before pulling on this banner.');
            return;
        }

        // check mileage côté client pour l’exchange
        // check mileage côté client pour l’exchange
        if (action === 'exchange') {
            if (kind === 'all') {
                setError('No exchange on the All banner.');
                return;
            }
            const cost = getMileageCost(kind);
            if (mileage < cost) {
                setError(`Not enough mileage. Need ${cost}.`);
                return;
            }
        }


        const focus = focusSlug ? [focusSlug] : [];
        setError(null);
        setLoading(action);

        try {
            const res = await fetch('/api/pull-sim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                cache: 'no-store',
                body: JSON.stringify({ kind, focus, action, exchangeSlug, mileage }),
            });
            const data = await res.json();

            if (!data.ok) {
                setError(data.error || 'Error');
                return;
            }

            if (action === 'one') {
                setLastTen(null);
                setLastPull(data.pull);
                if (grantMileage) setMileage(m => m + 1);

                // 🔢 compteur focus (pull 1)
                if (focusSlug && data?.pull?.pick?.slug === focusSlug) {
                    setFocusCount(c => c + 1);
                }

            } else if (action === 'ten') {
                setLastPull(null);
                setLastTen({ pulls: data.pulls, stats: data.stats });
                if (grantMileage) setMileage(m => m + (data.pulls?.length ?? 10));

                // 🔢 compteur focus (pull 10)
                if (focusSlug && Array.isArray(data.pulls)) {
                    const hits = data.pulls.reduce((acc: number, p: PullEntry) => acc + (p?.pick?.slug === focusSlug ? 1 : 0), 0);
                    if (hits > 0) setFocusCount(c => c + hits);
                }

            } else if (action === 'exchange') {
                setLastTen(null);
                setLastPull(data.result);
                const cost = getMileageCost(kind);
                setMileage(m => m - cost);

                // 🔢 compteur focus (exchange)
                if (focusSlug && data?.result?.pick?.slug === focusSlug) {
                    setFocusCount(c => c + 1);
                }
            }
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Network error');
        } finally {
            setLoading(null);
        }
    }


    const bannerLabel: Record<Kind, string> = {
        all: 'All',
        regular_focus: 'Rate Up Banner',
        premium_standard: 'Premium Banner',
        limited_rateup: 'Limited Banner',
    };
    const canFocus = kind !== 'all';
    const hasFocus = !!focusSlug;
    const canPull = loading === null && (!canFocus || hasFocus);
    const cost = getMileageCost(kind);
    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            {/* Header */}
            <h1 className="text-2xl font-bold">Pull Simulator</h1>

            {/* Controls */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40">
                <div className="p-4 border-b border-neutral-800">
                    <div className="text-base font-medium">Banner & Focus</div>
                    <div className="text-sm text-neutral-400">Select your banner; set a 3★ focus when applicable.</div>
                </div>
                <div className="p-4 grid gap-4 sm:grid-cols-2">
                    {/* Banner */}
                    <div className="space-y-2">
                        <label className="text-sm text-neutral-300">Banner</label>
                        <select
                            value={kind}
                            onChange={(e) => setKind(e.target.value as Kind)}
                            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                            <option value="all">{bannerLabel.all} (Limited & Premium include)</option>
                            <option value="regular_focus">{bannerLabel.regular_focus}</option>
                            <option value="premium_standard">{bannerLabel.premium_standard}</option>
                            <option value="limited_rateup">{bannerLabel.limited_rateup}</option>
                        </select>
                    </div>

                    {/* Focus */}
                    {kind !== 'all' && (
                        <FocusSelect
                            options={focusOptions.map(o => ({ slug: o.slug, name: o.name }))}
                            value={focusSlug}
                            onChange={setFocusSlug}
                            disabled={focusOptions.length === 0}
                            error={!focusSlug}
                        />
                    )}


                    {/* Mileage toggle */}
                    <div className="sm:col-span-2 flex items-center justify-between rounded-md border border-neutral-800 px-3 py-2">
                        <div className="space-y-0.5">
                            <div className="text-sm text-neutral-200">Count Mileage</div>
                            <p className="text-xs text-neutral-400">Track mileage on pulls and exchanges.</p>
                        </div>
                        {/* --- SWITCH animé on/off --- */}
                        <button
                            type="button"
                            role="switch"
                            aria-checked={grantMileage}
                            aria-label="Count Mileage"
                            onClick={() => setGrantMileage(!grantMileage)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setGrantMileage((v) => !v);
                                }
                            }}
                            className={[
                                'relative h-7 w-12 rounded-full transition-colors',
                                'motion-safe:duration-300 outline-none',
                                grantMileage ? 'bg-blue-600' : 'bg-neutral-700',
                                'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900'
                            ].join(' ')}
                        >
                            <span
                                className={[
                                    'absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow',
                                    'transform motion-safe:transition-transform motion-safe:duration-300',
                                    grantMileage ? 'translate-x-5' : 'translate-x-0',
                                    'active:scale-95'
                                ].join(' ')}
                            />
                        </button>

                    </div>
                </div>
            </div>

            {/* Sticky actions */}
            <div className="sticky top-2 z-10">
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 backdrop-blur p-3 flex flex-wrap gap-2">
                    <button
                        disabled={!mounted || !canPull}
                        onClick={() => callApi('one')}
                        className="min-w-[110px] rounded-md bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
                    >
                        {loading === 'one' ? 'Pulling…' : 'Draw 1'}
                    </button>

                    <button
                        disabled={!mounted || !canPull}
                        onClick={() => callApi('ten')}
                        className="min-w-[110px] rounded-md bg-green-600 px-4 py-2 text-sm font-medium hover:bg-green-500 disabled:opacity-50"
                    >
                        {loading === 'ten' ? 'Pulling 10…' : 'Draw 10'}
                    </button>

                    <div className="mx-1 hidden h-6 w-px self-center bg-neutral-800 sm:block" />

                    
                    <button
                        disabled={!mounted || loading !== null || !focusSlug || kind === 'all' || mileage < cost}
                        onClick={() => callApi('exchange', focusSlug)}
                        className="rounded-md bg-neutral-800 px-4 py-2 text-sm font-medium hover:bg-neutral-700 disabled:opacity-50"
                        title="Échange le mileage contre une unité focus (si cap atteint)"
                    >
                        {loading === 'exchange' ? 'Exchanging…' : 'Exchange mileage → Focus'}
                    </button>

                    <div className="ml-auto flex items-center gap-2 text-sm">
                        <span className="text-neutral-400">Mileage:</span>
                        <span className="inline-flex items-center rounded-md bg-neutral-800 px-2 py-1 text-xs font-semibold">
                            {mileage}
                        </span>

                        {focusSlug && (
                            <>
                                <span className="text-neutral-500">•</span>
                                <span className="text-neutral-400">Focus hits:</span>
                                <span className="inline-flex items-center rounded-md bg-neutral-800 px-2 py-1 text-xs font-semibold">
                                    {focusCount}
                                </span>
                            </>
                        )}
                    </div>

                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-md border border-red-700 bg-red-900/30 p-3 text-sm text-red-200">
                    {error}
                </div>
            )}

            {/* Last Ten */}
            {lastPull && (
                <div className="rounded-xl border border-neutral-800 overflow-hidden">
                    <div className="p-4">
                        <PullCardTile entry={lastPull} />
                    </div>
                </div>
            )}

            {/* Last Ten */}
            {lastTen && (
                <div className="rounded-xl border border-neutral-800 overflow-hidden">
                    <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                        {lastTen.pulls.map((p, i) => <PullCardTile key={i} entry={p} />)}
                    </div>
                </div>
            )}
        </div>
    );
}

function PullCardTile({ entry }: { entry: PullEntry }) {
    if (!entry?.pick) return null
    const { pick } = entry
    const r = Number(entry.rarity) as 1 | 2 | 3
    const shortName = (abbrev as Record<string, string>)[pick.name] ?? pick.name
    const portrait = `/images/characters/atb/IG_Turn_${pick.id}.webp`

    const tone = getTone(r, pick.badge)
    const ring = getRing(r, pick.badge)

    return (
        <Link
            href={`/characters/${pick.slug}`}
            className={`block rounded-lg border bg-gradient-to-br ${tone} ${ring} p-1.5 hover:scale-[1.02] transition-transform`}
        >
            <div className="flex flex-col items-center text-center gap-1">
                {/* Image carrée compacte */}
                <div className="h-14 w-14 overflow-hidden rounded-md relative">
                    <Image
                        src={portrait}
                        alt={pick.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                    />
                </div>

                {/* Ligne icônes compacte */}

                <div className="flex items-center gap-2 leading-none">
                    <RarityBadge rarity={r} />
                    <ElementIcon element={pick.element as ElementType} size={20} />
                    <ClassIcon className={pick.class as ClassType} size={20} />
                </div>

                {/* Nom */}
                <div className="w-full truncate text-[14px] font-medium" title={pick.name}>
                    {shortName}
                </div>
            </div>
        </Link>
    )
}

function RarityBadge({ rarity }: { rarity: 1 | 2 | 3 }) {
    return (
        <span className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[11px] font-semibold">
            <StarLevel levelLabel={String(rarity)} size={20} />
            <span className="sr-only">{rarity} star</span>
        </span>
    );
}
