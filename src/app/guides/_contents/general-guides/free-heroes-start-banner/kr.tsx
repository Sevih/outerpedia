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
        { key: 'free' as const, label: '무료 영웅' },
        { key: 'custom' as const, label: '커스텀 배너' }
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
            <GuideHeading level={2}>무료 영웅 & 스타트 배너</GuideHeading>

            <p className="text-neutral-300 mb-6 leading-relaxed">
                획득 가능한 무료 영웅과 커스텀 배너의 최적 가챠 전략에 대한 종합 가이드.
            </p>

            <p className="text-red-500 font-semibold bg-red-100 border border-red-300 rounded px-4 py-2 text-sm mb-6">
                중복을 피하세요 — <strong>아직 보유하지 않은 캐릭터를 선택하세요</strong>. 게임 내 추천과 다르다면, 확정 입수 가능한 영웅（미션、스토리 진행）을 제외했기 때문입니다.
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
                길드 상점 영웅은 획득에 5주 이상 소요됩니다. 초반 진행을 우선하려면 커스텀 배너에서 획득하고, 길드 상점은 초월에 사용하세요.
            </p>

            <table className="w-auto mx-auto border border-gray-600 rounded-md text-center border-collapse">
                <thead>
                    <tr className="border-b-2 border-slate-500">
                        <th className="text-center py-3 px-4 text-sky-400 font-semibold border-r border-slate-600">획득처</th>
                        <th className="text-center py-3 px-4 text-sky-400 font-semibold border-r border-slate-600">캐릭터</th>
                        <th className="text-center py-3 px-4 text-sky-400 font-semibold">상세</th>
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
                                                1명 선별
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
            <GuideHeading level={3}>가챠 전략</GuideHeading>
            <p>
                새 캐릭터 획득을 우선시하세요 — 초월은 도플갱어로 가능합니다. 신규 유닛은 출시 약 3.5개월 후 커스텀 풀에 추가됩니다.
            </p>
            <p className="text-neutral-400 text-sm italic">
                참고: 일부 영웅은 출시된 지 얼마 되지 않아 아직 커스텀 배너에 추가되지 않았습니다.
            </p>

            <GuideHeading level={3}>추천 픽 (우선순위)</GuideHeading>

            <table className="w-auto mx-auto border border-gray-600 rounded-md text-center border-collapse">
                <thead>
                    <tr className="border-b-2 border-slate-500">
                        <th className="text-center py-3 px-4 text-sky-400 font-semibold border-r border-slate-600">추천</th>
                        <th className="text-center py-3 px-4 text-sky-400 font-semibold border-r border-slate-600">무료 획득 가능</th>
                        <th className="text-center py-3 px-4 text-sky-400 font-semibold">상세</th>
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
                    <GuideHeading level={3}>미구현 캐릭터</GuideHeading>
                    <p className="text-neutral-400 text-sm mb-4">
                        이 영웅들은 아직 커스텀 배너 풀에 추가되지 않았습니다 (출시 약 3.5개월 후 추가).
                    </p>
                    <div className="flex justify-center">
                        <CharacterGrid characters={notInCustomBannerChars} cols={4} />
                    </div>
                </div>
            )}
        </div>
    )
}
