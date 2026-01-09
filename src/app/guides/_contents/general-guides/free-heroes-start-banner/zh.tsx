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
        { key: 'free' as const, label: '免费英雄' },
        { key: 'custom' as const, label: '自选池' }
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
            <GuideHeading level={2}>免费英雄 & 新手池</GuideHeading>

            <p className="text-neutral-300 mb-6 leading-relaxed">
                关于可获取的免费英雄和自选池最佳抽卡策略的综合指南。
            </p>

            <p className="text-red-500 font-semibold bg-red-100 border border-red-300 rounded px-4 py-2 text-sm mb-6">
                避免重复选择 — <strong>请选择你尚未拥有的角色</strong>。如果游戏内推荐与此不同，是因为我们已排除了可从其他途径免费获取的英雄。
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
                        <th className="text-center py-3 px-4 text-sky-400 font-semibold border-r border-slate-600">获取途径</th>
                        <th className="text-center py-3 px-4 text-sky-400 font-semibold border-r border-slate-600">角色</th>
                        <th className="text-center py-3 px-4 text-sky-400 font-semibold">详情</th>
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
            <GuideHeading level={3}>抽卡策略</GuideHeading>
            <p>
                优先获取新角色 — 超越可以用分身处理。新角色在发布约3.5个月后加入自选池。
            </p>
            <p className="text-neutral-400 text-sm italic">
                注：部分英雄因发布时间较短，尚未加入自选池。
            </p>

            <GuideHeading level={3}>推荐选择（按优先级）</GuideHeading>

            <table className="w-auto mx-auto border border-gray-600 rounded-md text-center border-collapse">
                <thead>
                    <tr className="border-b-2 border-slate-500">
                        <th className="text-center py-3 px-4 text-sky-400 font-semibold border-r border-slate-600">免费</th>
                        <th className="text-center py-3 px-4 text-sky-400 font-semibold border-r border-slate-600">付费</th>
                        <th className="text-center py-3 px-4 text-sky-400 font-semibold">详情</th>
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
                    <GuideHeading level={3}>暂未实装</GuideHeading>
                    <p className="text-neutral-400 text-sm mb-4">
                        这些英雄尚未加入自选池（发布约3.5个月后添加）。
                    </p>
                    <div className="flex justify-center">
                        <CharacterGrid characters={notInCustomBannerChars} cols={4} />
                    </div>
                </div>
            )}
        </div>
    )
}
