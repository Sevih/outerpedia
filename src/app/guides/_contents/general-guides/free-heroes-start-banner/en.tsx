'use client'

import { useState, useEffect, useMemo } from 'react'
import { AnimatedTabs } from '@/app/components/AnimatedTabs'
import GuideHeading from '@/app/components/GuideHeading'
import { useTenant } from '@/lib/contexts/TenantContext'
import { lRec } from '@/lib/localize'
import parseText from '@/utils/parseText'
import { useSearchParams } from "next/navigation"
import { customBannerPicks } from './recommendedCharacters'
import {
    mapNamesToChars,
    CharacterGrid,
    renderWithLineBreaks,
    freeHeroNames,
    flattenedFreeHeroesEntries,
    getNotInCustomBannerChars
} from './helpers'

type TabKey = "free" | "custom"

export default function FreeHeroesStartBannerGuide() {
    const searchParams = useSearchParams();
    const tabParam = (searchParams.get("tab") as TabKey | null) ?? null;
    const [selected, setSelected] = useState<'free' | 'custom'>('free')

    const tabs = [
        { key: 'free' as const, label: 'Free Heroes' },
        { key: 'custom' as const, label: 'Custom Banner' }
    ]

    // initialise depuis l'URL
    useEffect(() => {
        const allowed: TabKey[] = ["free", "custom"];
        if (tabParam && (allowed as string[]).includes(tabParam)) {
            setSelected(tabParam as TabKey);
        } else if (tabParam == null) {
            setSelected("free"); // défaut propre
        }
    }, [tabParam]);

    // handler identique à ta page Premium
    const handleTabChange = (key: TabKey) => {
        setSelected(key);
        const params = new URLSearchParams(window.location.search);
        if (key === "free") params.delete("tab"); // onglet par défaut → URL propre
        else params.set("tab", key);
        const qs = params.toString();
        const newUrl = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
        window.history.replaceState(null, "", newUrl);
    };


    return (
        <div className="guide-content">
            <GuideHeading level={2}>Free Heroes & Start Banner</GuideHeading>

            <p className="text-neutral-300 mb-6 leading-relaxed">
                A comprehensive guide on all the free heroes you can obtain and the best pulling strategy for the Custom Banner.
            </p>

            <p className="text-red-500 font-semibold bg-red-100 border border-red-300 rounded px-4 py-2 text-sm mb-6">
                Avoid picking duplicates — <strong>always choose characters you do not already own</strong>. If your in-game recommendations look different, it is because we have already excluded heroes available from guaranteed sources (missions, story progression).
            </p>

            <div className="flex justify-center mb-6">
                <AnimatedTabs
                    tabs={tabs}
                    selected={selected}
                    onSelect={(key) => handleTabChange(key as TabKey)}
                    pillColor="#0ea5e9"
                />
            </div>

            <section className="guide-version-content mt-6">
                {selected === 'free' ? <FreeHeroesContent /> : <CustomBannerContent />}
            </section>
        </div>
    )
}

function FreeHeroesContent() {
    const { key: lang } = useTenant()

    return (
        <div className="space-y-6">
            <p className="text-neutral-400 text-sm italic">
                Guild Shop heroes take 5+ weeks to unlock. Prioritize getting them from the Custom Banner for early progression, then use Guild Shop for transcendence.
            </p>

            <table className="w-auto mx-auto border border-gray-600 rounded-md text-center border-collapse">
                <thead>
                    <tr className="border-b-2 border-slate-500">
                        <th className="text-center py-3 px-4 text-sky-400 font-semibold border-r border-slate-600">Source</th>
                        <th className="text-center py-3 px-4 text-sky-400 font-semibold border-r border-slate-600">Characters</th>
                        <th className="text-center py-3 px-4 text-sky-400 font-semibold">Details</th>
                    </tr>
                </thead>
                <tbody>
                    {flattenedFreeHeroesEntries.map((entry, index) => {
                        const characters = mapNamesToChars(entry.names, lang)
                        const isPickOne = entry.pickType === 'one'

                        return (
                            <tr key={index} className={`border-b border-slate-600 ${index % 2 === 0 ? 'bg-slate-800/30' : ''}`}>
                                <td className="py-3 px-4 align-middle border-r border-slate-600">
                                    <span className="font-medium text-neutral-200">
                                        {renderWithLineBreaks(lRec(entry.source, lang))}
                                    </span>
                                </td>
                                <td className="py-3 px-4 align-middle border-r border-slate-600">
                                    <CharacterGrid characters={characters} />
                                </td>
                                <td className="py-3 px-4 align-middle text-sm text-neutral-300">
                                    {isPickOne && (
                                        <div className="text-center mb-2">
                                            <span className="text-amber-400 font-bold text-lg" style={{ textShadow: '0 0 10px rgba(251, 191, 36, 0.8), 0 0 20px rgba(251, 191, 36, 0.4)' }}>
                                                Choose one
                                            </span>
                                        </div>
                                    )}
                                    {parseText(lRec(entry.reason, lang))}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

function CustomBannerContent() {
    const { key: lang } = useTenant()

    const notInCustomBannerChars = useMemo(() => getNotInCustomBannerChars(lang), [lang])

    return (
        <div className="space-y-6">
            <GuideHeading level={3}>Pulling Strategy</GuideHeading>
            <p>
                Focus on unlocking new characters — doppelgangers handle transcendence. New units join the custom pool ~3.5 months after release.
            </p>
            <p className="text-neutral-400 text-sm italic">
                Note: Some heroes are not available in the custom banner yet, as they haven&apos;t been out long enough.
            </p>

            <GuideHeading level={3}>Recommended Picks (by priority)</GuideHeading>

            <table className="w-auto mx-auto border border-gray-600 rounded-md text-center border-collapse">
                <thead>
                    <tr className="border-b-2 border-slate-500">
                        <th className="text-center py-3 px-4 text-sky-400 font-semibold border-r border-slate-600">Recommended</th>
                        <th className="text-center py-3 px-4 text-sky-400 font-semibold border-r border-slate-600">Available for free</th>
                        <th className="text-center py-3 px-4 text-sky-400 font-semibold">Details</th>
                    </tr>
                </thead>
                <tbody>
                    {customBannerPicks.map((entry, index) => {
                        const names = Array.isArray(entry.names) ? entry.names : [entry.names]
                        const freeChars = mapNamesToChars(names.filter(name => freeHeroNames.has(name)), lang)
                        const notFreeChars = mapNamesToChars(names.filter(name => !freeHeroNames.has(name)), lang)

                        return (
                            <tr key={index} className={`border-b border-slate-600 ${index % 2 === 0 ? 'bg-slate-800/30' : ''}`}>
                                <td className="py-3 px-4 align-middle border-r border-slate-600">
                                    <CharacterGrid characters={notFreeChars} />
                                </td>
                                <td className="py-3 px-4 align-middle border-r border-slate-600">
                                    <CharacterGrid characters={freeChars} />
                                </td>
                                <td className="py-3 px-4 align-middle text-sm text-neutral-300">
                                    {parseText(lRec(entry.reason, lang))}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            {notInCustomBannerChars.length > 0 && (
                <div className="mt-8">
                    <GuideHeading level={3}>Not Yet Available</GuideHeading>
                    <p className="text-neutral-400 text-sm mb-4">
                        These heroes are too recent to be in the custom banner pool (~3.5 months after release).
                    </p>
                    <div className="flex justify-center">
                        <CharacterGrid characters={notInCustomBannerChars} />
                    </div>
                </div>
            )}
        </div>
    )
}
