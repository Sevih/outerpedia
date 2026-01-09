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
        { key: 'free' as const, label: '無料キャラ' },
        { key: 'custom' as const, label: 'カスタムバナー' }
    ]

    useEffect(() => {
        const allowed: TabKey[] = ["free", "custom"];
        if (tabParam && (allowed as string[]).includes(tabParam)) {
            setSelected(tabParam as TabKey);
        } else if (tabParam == null) {
            setSelected("free");
        }
    }, [tabParam]);

    const handleTabChange = (key: TabKey) => {
        setSelected(key);
        const params = new URLSearchParams(window.location.search);
        if (key === "free") params.delete("tab");
        else params.set("tab", key);
        const qs = params.toString();
        const newUrl = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
        window.history.replaceState(null, "", newUrl);
    };


    return (
        <div className="guide-content">
            <GuideHeading level={2}>無料キャラ & スタートバナー</GuideHeading>

            <p className="text-neutral-300 mb-6 leading-relaxed">
                入手可能な無料キャラとカスタムバナーの最適なガチャ戦略についての総合ガイド。
            </p>

            <p className="text-red-500 font-semibold bg-red-100 border border-red-300 rounded px-4 py-2 text-sm mb-6">
                重複を避けよう — <strong>まだ持っていないキャラを選ぼう</strong>。ゲーム内のおすすめと違う場合は、他で無料入手できるキャラを除外しているため。
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
            <table className="w-auto mx-auto border border-gray-600 rounded-md text-center border-collapse">
                <thead>
                    <tr className="border-b-2 border-slate-500">
                        <th className="text-center py-3 px-4 text-sky-400 font-semibold border-r border-slate-600">入手先</th>
                        <th className="text-center py-3 px-4 text-sky-400 font-semibold border-r border-slate-600">キャラクター</th>
                        <th className="text-center py-3 px-4 text-sky-400 font-semibold">詳細</th>
                    </tr>
                </thead>
                <tbody>
                    {flattenedFreeHeroesEntries.map((entry, index) => {
                        const characters = mapNamesToChars(entry.names, lang)
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
            <GuideHeading level={3}>ガチャ戦略</GuideHeading>
            <p>
                新キャラの獲得を優先しよう — 限界突破はドッペルゲンガーで対応可能。新キャラはリリースから約3.5ヶ月後にカスタムプールに追加される。
            </p>
            <p className="text-neutral-400 text-sm italic">
                注：リリースから間もないキャラはまだカスタムバナーに追加されていない場合がある。
            </p>

            <GuideHeading level={3}>おすすめピック（優先度順）</GuideHeading>

            <table className="w-auto mx-auto border border-gray-600 rounded-md text-center border-collapse">
                <thead>
                    <tr className="border-b-2 border-slate-500">
                        <th className="text-center py-3 px-4 text-sky-400 font-semibold border-r border-slate-600">無料</th>
                        <th className="text-center py-3 px-4 text-sky-400 font-semibold border-r border-slate-600">有料</th>
                        <th className="text-center py-3 px-4 text-sky-400 font-semibold">詳細</th>
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
                                    <CharacterGrid characters={freeChars} />
                                </td>
                                <td className="py-3 px-4 align-middle border-r border-slate-600">
                                    <CharacterGrid characters={notFreeChars} />
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
                    <GuideHeading level={3}>未実装キャラ</GuideHeading>
                    <p className="text-neutral-400 text-sm mb-4">
                        これらのキャラはまだカスタムバナーに追加されていない（リリースから約3.5ヶ月後に追加）。
                    </p>
                    <div className="flex justify-center">
                        <CharacterGrid characters={notInCustomBannerChars} cols={4} />
                    </div>
                </div>
            )}
        </div>
    )
}
