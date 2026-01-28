"use client"

import { useMemo, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import GuideHeading from "@/app/components/GuideHeading"
import { AnimatedTabs } from "@/app/components/AnimatedTabs"
import { toKebabCase } from "@/utils/formatText"
import DATA from "@/data/premium_limited_data.json"
import { lRec } from "@/lib/localize"
import { getT } from "@/i18n"

import {
    type TabKey,
    type PremiumLimitedData,
    getTabs,
    LABELS,
    PremiumPullingOrder,
    HeroCard,
    CHARACTER_INDEX,
} from "./helpers"

const LANG = 'jp' as const

export default function PremiumLimitedGuide() {
    const t = getT(LANG)
    const tabs = useMemo(() => getTabs(t), [t])

    const searchParams = useSearchParams()
    const tabParam = searchParams.get("tab") as TabKey | null

    const [selected, setSelected] = useState<TabKey>("Premium")
    useEffect(() => {
        if (tabParam === "Premium" || tabParam === "Limited") setSelected(tabParam)
        else if (tabParam == null) setSelected("Premium")
    }, [tabParam])

    const handleTabChange = (key: TabKey) => {
        setSelected(key)
        const params = new URLSearchParams(window.location.search)
        if (key === "Premium") params.delete("tab")
        else params.set("tab", key)
        const qs = params.toString()
        const newUrl = `${window.location.pathname}${qs ? `?${qs}` : ""}`
        window.history.replaceState(null, "", newUrl)
    }

    const entries = useMemo(() => {
        const list = (DATA as PremiumLimitedData)[selected] ?? []
        return [...list].sort((a, b) => {
            const idA = Number(CHARACTER_INDEX[toKebabCase(a.name)]?.ID) || 0
            const idB = Number(CHARACTER_INDEX[toKebabCase(b.name)]?.ID) || 0
            return idB - idA
        })
    }, [selected])

    return (
        <div className="space-y-6">
            <GuideHeading>{lRec(LABELS.title, LANG)}</GuideHeading>

            <p className="text-sm text-gray-300 leading-relaxed">
                {lRec(LABELS.intro, LANG)}
            </p>

            <div className="flex justify-center mb-4">
                <AnimatedTabs tabs={tabs} selected={selected} onSelect={handleTabChange} pillColor="#8b5cf6" />
            </div>

            {selected === "Premium" && (
                <PremiumPullingOrder charIndex={CHARACTER_INDEX} lang={LANG} />
            )}

            {entries.length === 0 ? (
                <div className="rounded-md border border-gray-700 p-6 text-sm text-gray-300">
                    {lRec(LABELS.noEntries, LANG).replace("{tab}", selected)}
                </div>
            ) : (
                <div className="grid gap-6">
                    {entries.map((h) => {
                        const char = CHARACTER_INDEX[toKebabCase(h.name)]
                        return <HeroCard key={h.name} h={h} char={char} lang={LANG} />
                    })}
                </div>
            )}
        </div>
    )
}
