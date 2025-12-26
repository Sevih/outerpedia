'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import EquipmentInlineTag from '@/app/components/EquipmentInlineTag'
import InlineBarList from '@/app/components/InlineBarList'
import CharacterInlineStacked from '@/app/components/CharacterInlineStacked'
import Link from 'next/link'
import { useI18n } from '@/lib/contexts/I18nContext'
import type { TenantKey } from '@/tenants/config'
import { AnimatedTabs } from "@/app/components/AnimatedTabs"
import { CLASSES, ClassType } from '@/types/enums'
import { useSearchParams } from "next/navigation"

type GearItem = {
    name: string
    type: 'Weapon' | 'Amulet' | 'Set'
    class: string | null
    count: number
    characters: string[]
}

type Props = {
    data: GearItem[]
    lang: TenantKey
}

type TabKey = 'Set' | 'Weapon' | 'Amulet'

export default function GearUsageStatsClients({ data }: Props) {
    const { t } = useI18n()
    const searchParams = useSearchParams()
    const tabParam = (searchParams.get("tab") as TabKey | null) ?? null

    const tabs: { key: TabKey; label: string; icon?: string }[] = [
        { key: 'Set', label: t('sets'), icon: '/images/ui/nav/armor.webp' },
        { key: 'Weapon', label: t('weapons'), icon: '/images/ui/nav/weapon.webp' },
        { key: 'Amulet', label: t('accessories'), icon: '/images/ui/nav/accessory.webp' },
    ]

    const [activeTab, setActiveTab] = useState<TabKey>('Set')
    const [classFilter, setClassFilter] = useState<ClassType[]>([])

    // Initialise depuis l'URL
    useEffect(() => {
        const allowed: TabKey[] = ['Set', 'Weapon', 'Amulet']
        if (tabParam && (allowed as string[]).includes(tabParam)) {
            setActiveTab(tabParam as TabKey)
        } else if (tabParam == null) {
            setActiveTab('Set')
        }
    }, [tabParam])

    // Met à jour l'URL quand on change d'onglet
    const handleTabChange = (key: TabKey) => {
        setActiveTab(key)
        setClassFilter([])
        const params = new URLSearchParams(window.location.search)
        if (key === 'Set') params.delete('tab') // onglet par défaut → URL propre
        else params.set('tab', key)
        const qs = params.toString()
        const newUrl = `${window.location.pathname}${qs ? `?${qs}` : ''}`
        window.history.replaceState(null, '', newUrl)
    }

    // Filtered data
    const filtered = data.filter(item => item.type === activeTab)
    const filteredByClass =
        activeTab === 'Set'
            ? filtered
            : classFilter.length === 0
                ? filtered
                : filtered.filter(item => item.class === null || classFilter.includes(item.class as ClassType))

    const top5: GearItem[] = [...filteredByClass].sort((a, b) => b.count - a.count).slice(0, 5)

    const classLabel = (c: ClassType) =>
        t(`SYS_CLASS_${c.toUpperCase()}` as const)

    const currentTabLabel = tabs.find(t => t.key === activeTab)?.label ?? ''


    return (
        <div className="p-4 max-w-5xl mx-auto">
            {/* H1 */}
            <h1 className="text-3xl font-bold text-center mb-4">
                {t('gearUsage.h1') ?? 'Outerplane Gear Usage Statistics'}
            </h1>

            {/* Notice */}
            <p className="text-red-500 font-semibold bg-red-100 border border-red-300 rounded px-4 py-2 text-center dark:bg-red-900/20 dark:border-red-700">
                {t('gear.notice.line1')} <br />
                <strong>{t('gear.notice.line2')}</strong>
            </p>

            {/* Back arrow */}
            <div className="relative top-4 left-4 z-20 h-[32px] w-[32px]">
                <Link href={`/tools`} className="relative block h-full w-full" aria-label={t('back')}>
                    <Image
                        src="/images/ui/CM_TopMenu_Back.webp"
                        alt={t('back')}
                        fill
                        sizes='32px'
                        className="opacity-80 hover:opacity-100 transition-opacity"
                    />
                </Link>
            </div>

            {/* Tabs (AnimatedTabs) */}
            <div className="flex justify-center mb-6 mt-4">
                <AnimatedTabs<TabKey>
                    tabs={tabs}
                    selected={activeTab}
                    onSelect={handleTabChange}
                    pillColor="#0ea5e9"
                    scrollable={false}
                    compact={false}
                />
            </div>


            {/* Class filters */}
            {activeTab !== 'Set' && (
                <div className="flex justify-center flex-wrap gap-2 mb-6">
                    <button
                        onClick={() => setClassFilter([])}
                        className={`border p-1 rounded ${classFilter.length === 0 ? "bg-cyan-500" : "bg-transparent"}`}
                        aria-pressed={classFilter.length === 0}
                    >
                        <span className="px-2 text-sm font-semibold text-white">{t('filters.common.all')}</span>
                    </button>

                    {CLASSES.map(cl => (
                        <button
                            key={cl}
                            onClick={() =>
                                setClassFilter(prev =>
                                    prev.includes(cl) ? prev.filter(c => c !== cl) : [...prev, cl]
                                )
                            }
                            className={`border p-1 rounded transition ${classFilter.includes(cl) ? "bg-cyan-500" : "bg-transparent"}`}
                            aria-pressed={classFilter.includes(cl)}
                            title={classLabel(cl)}
                        >
                            <span className="relative w-[24px] h-[24px] inline-block">
                                <Image
                                    src={`/images/ui/class/${cl.toLowerCase()}.webp`}
                                    alt={classLabel(cl)}
                                    title={classLabel(cl)}
                                    fill
                                    className="object-contain"
                                    sizes="24px"
                                />
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* Chart */}
            <h2 className="text-lg font-semibold mb-2 text-center">
                {t('mostUsed')} {currentTabLabel}
            </h2>
            <div className="mb-10 h-[200px] w-full">
                <InlineBarList
                    data={top5}
                    allData={filteredByClass}
                    type={activeTab.toLowerCase() as 'weapon' | 'amulet' | 'set'}
                />
            </div>

            {/* Table */}
            <h2 className="text-lg font-semibold mb-2 text-center">
                {t('fullList')} {currentTabLabel}
            </h2>
            <table className="w-full text-sm border border-gray-300 rounded-md overflow-hidden shadow-md">
                <thead className="bg-neutral-900 text-white sticky top-0 z-10">
                    <tr>
                        <th className="text-left p-3">{t('table.name')}</th>
                        <th className="text-left p-3">{t('table.usedBy')}</th>
                        <th className="text-left p-3">{t('table.characters')}</th>
                    </tr>
                </thead>

                <tbody>
                    {filteredByClass.map((item, idx) => (
                        <tr
                            key={`${item.type}:${item.name}:${idx}`}
                            className="border-t border-neutral-700 even:bg-neutral-900 hover:bg-neutral-800 transition-colors"
                        >
                            {/* Name */}
                            <td className="p-3">
                                <EquipmentInlineTag
                                    name={item.name}
                                    type={activeTab.toLowerCase() as 'weapon' | 'amulet' | 'set'}
                                />
                            </td>

                            {/* Count */}
                            <td className="p-3 font-bold text-white">{item.count}</td>

                            {/* Characters */}
                            <td className="p-3">
                                <div className="grid gap-2 grid-cols-4 sm:grid-cols-6 md:grid-cols-8 xl:grid-cols-10">
                                    {item.characters.map((charName) => (
                                        <CharacterInlineStacked key={charName} name={charName} size={40} />
                                    ))}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
