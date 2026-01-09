'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { AnimatedTabs } from '@/app/components/AnimatedTabs'
import GuideHeading from '@/app/components/GuideHeading'
import { CharacterPortrait } from '@/app/components/CharacterPortrait'
import { useTenant } from '@/lib/contexts/TenantContext'
import { l, lRec } from '@/lib/localize'
import { toKebabCase } from '@/utils/formatText'
import parseText from '@/utils/parseText'
import { useSearchParams } from "next/navigation"
import allCharacters from '@/data/_allCharacters.json'
import {
    freeHeroesSources,
    customBannerPicks
} from './recommendedCharacters'
type TabKey = "free" | "custom";

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
                Avoid picking duplicates — <strong>always choose characters you don&apos;t already own</strong>. If your in-game recommendations look different, it&apos;s because we&apos;ve already excluded heroes you&apos;ll unlock for free elsewhere.
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

    // Flatten all entries with their source for the table
    const flattenedEntries = freeHeroesSources.flatMap(source =>
        source.entries.map(entry => ({
            source: source.source,
            names: Array.isArray(entry.names) ? entry.names : [entry.names],
            reason: entry.reason
        }))
    )

    return (
        <div className="space-y-6">
            <table className="w-auto mx-auto border border-gray-600 rounded-md text-center border-collapse">
                <thead>
                    <tr className="border-b-2 border-slate-500">
                        <th className="text-center py-3 px-4 text-sky-400 font-semibold border-r border-slate-600">Source</th>
                        <th className="text-center py-3 px-4 text-sky-400 font-semibold border-r border-slate-600">Characters</th>
                        <th className="text-center py-3 px-4 text-sky-400 font-semibold">Details</th>
                    </tr>
                </thead>
                <tbody>
                    {flattenedEntries.map((entry, index) => {
                        const characters = entry.names.map(name => {
                            const char = allCharacters.find(c => c.Fullname === name)
                            if (!char) return null
                            return {
                                char,
                                localizedName: l(char, 'Fullname', lang),
                                slug: toKebabCase(char.Fullname)
                            }
                        }).filter(Boolean) as { char: typeof allCharacters[0], localizedName: string, slug: string }[]

                        return (
                            <tr key={index} className={`border-b border-slate-600 ${index % 2 === 0 ? 'bg-slate-800/30' : ''}`}>
                                <td className="py-3 px-4 align-middle border-r border-slate-600">
                                    <span className="font-medium text-neutral-200">
                                        {lRec(entry.source, lang)}
                                    </span>
                                </td>
                                <td className="py-3 px-4 align-middle border-r border-slate-600">
                                    <div className="grid grid-cols-3 gap-1 w-fit">
                                        {characters.map(({ char, localizedName, slug }) => (
                                            <Link
                                                key={char.ID}
                                                href={`/characters/${slug}`}
                                                className="relative hover:z-10 transition-transform hover:scale-105"
                                                title={localizedName}
                                            >
                                                <div className="relative w-[70px] h-[70px] sm:w-[80px] sm:h-[80px]">
                                                    <CharacterPortrait
                                                        characterId={char.ID}
                                                        characterName={localizedName}
                                                        size={80}
                                                        className="rounded-lg border-2 border-gray-600 bg-gray-900"
                                                        showIcons
                                                        showStars
                                                    />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </td>
                                <td className="py-3 px-4 align-middle text-sm text-neutral-300">
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

// Set of free hero names for quick lookup
const freeHeroNames = new Set(
    freeHeroesSources.flatMap(source =>
        source.entries.flatMap(entry =>
            Array.isArray(entry.names) ? entry.names : [entry.names]
        )
    )
)

// Set of custom banner hero names
const customBannerNames = new Set(
    customBannerPicks.flatMap(entry =>
        Array.isArray(entry.names) ? entry.names : [entry.names]
    )
)

function CustomBannerContent() {
    const { key: lang } = useTenant()

    // Compute heroes not yet in custom banner dynamically
    const notInCustomBannerChars = useMemo(() => {
        return allCharacters
            .filter(c => c.Rarity === 3)
            .filter(c => !c.limited)
            .filter(c => !c.tags?.includes('collab'))
            .filter(c => !c.tags?.includes('premium'))
            .filter(c => !c.Fullname.startsWith('Core Fusion'))
            .filter(c => !customBannerNames.has(c.Fullname))
            .filter(c => !freeHeroNames.has(c.Fullname))
            .map(c => ({
                char: c,
                localizedName: l(c, 'Fullname', lang),
                slug: toKebabCase(c.Fullname)
            }))
    }, [lang])

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
                        <th className="text-center py-3 px-4 text-sky-400 font-semibold border-r border-slate-600">Free</th>
                        <th className="text-center py-3 px-4 text-sky-400 font-semibold border-r border-slate-600">Not Free</th>
                        <th className="text-center py-3 px-4 text-sky-400 font-semibold">Details</th>
                    </tr>
                </thead>
                <tbody>
                    {customBannerPicks.map((entry, index) => {
                        const names = Array.isArray(entry.names) ? entry.names : [entry.names]

                        const freeChars = names
                            .filter(name => freeHeroNames.has(name))
                            .map(name => {
                                const char = allCharacters.find(c => c.Fullname === name)
                                if (!char) return null
                                return {
                                    char,
                                    localizedName: l(char, 'Fullname', lang),
                                    slug: toKebabCase(char.Fullname)
                                }
                            })
                            .filter(Boolean) as { char: typeof allCharacters[0], localizedName: string, slug: string }[]

                        const notFreeChars = names
                            .filter(name => !freeHeroNames.has(name))
                            .map(name => {
                                const char = allCharacters.find(c => c.Fullname === name)
                                if (!char) return null
                                return {
                                    char,
                                    localizedName: l(char, 'Fullname', lang),
                                    slug: toKebabCase(char.Fullname)
                                }
                            })
                            .filter(Boolean) as { char: typeof allCharacters[0], localizedName: string, slug: string }[]

                        return (
                            <tr key={index} className={`border-b border-slate-600 ${index % 2 === 0 ? 'bg-slate-800/30' : ''}`}>
                                <td className="py-3 px-4 align-middle border-r border-slate-600">
                                    <div className="grid grid-cols-3 gap-1 w-fit">
                                        {freeChars.map(({ char, localizedName, slug }) => (
                                            <Link
                                                key={char.ID}
                                                href={`/characters/${slug}`}
                                                className="relative hover:z-10 transition-transform hover:scale-105"
                                                title={localizedName}
                                            >
                                                <div className="relative w-[70px] h-[70px] sm:w-[80px] sm:h-[80px]">
                                                    <CharacterPortrait
                                                        characterId={char.ID}
                                                        characterName={localizedName}
                                                        size={80}
                                                        className="rounded-lg border-2 border-gray-600 bg-gray-900"
                                                        showIcons
                                                        showStars
                                                    />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </td>
                                <td className="py-3 px-4 align-middle border-r border-slate-600">
                                    <div className="grid grid-cols-3 gap-1 w-fit">
                                        {notFreeChars.map(({ char, localizedName, slug }) => (
                                            <Link
                                                key={char.ID}
                                                href={`/characters/${slug}`}
                                                className="relative hover:z-10 transition-transform hover:scale-105"
                                                title={localizedName}
                                            >
                                                <div className="relative w-[70px] h-[70px] sm:w-[80px] sm:h-[80px]">
                                                    <CharacterPortrait
                                                        characterId={char.ID}
                                                        characterName={localizedName}
                                                        size={80}
                                                        className="rounded-lg border-2 border-gray-600 bg-gray-900"
                                                        showIcons
                                                        showStars
                                                    />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
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
                    <div className="grid grid-cols-4 gap-2 w-fit mx-auto">
                        {notInCustomBannerChars.map(({ char, localizedName, slug }) => (
                            <Link
                                key={char.ID}
                                href={`/characters/${slug}`}
                                className="relative hover:z-10 transition-transform hover:scale-105"
                                title={localizedName}
                            >
                                <div className="relative w-[70px] h-[70px] sm:w-[80px] sm:h-[80px]">
                                    <CharacterPortrait
                                        characterId={char.ID}
                                        characterName={localizedName}
                                        size={80}
                                        className="rounded-lg border-2 border-gray-600 bg-gray-900"
                                        showIcons
                                        showStars
                                    />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
