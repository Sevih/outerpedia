'use client'

import { useState, useEffect, Fragment, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import GuideHeading from '@/app/components/GuideHeading'
import ItemInlineDisplay from '@/app/components/ItemInline'
import { AnimatedTabs } from '@/app/components/AnimatedTabs'
import { useI18n } from '@/lib/contexts/I18nContext'

// Types
export type TabKey = 'books' | 'transistones' | 'special' | 'glunite'
export type SourceType = 'mission' | 'guild' | 'adventurer' | 'craft'

export type ResourceSource = {
    sourceKey: string
    weekly?: number
    monthly?: number
    costItem?: string
    costAmount?: number
}

export type ResourceItem = {
    name: string
    sources: ResourceSource[]
}

export type TimegateData = Record<TabKey, ResourceItem[]>
export type SourceLabelRenderer = (source: ResourceSource) => ReactNode

export type TableHeaders = {
    source: string
    weekly: string
    monthly: string
    total: string
    grandTotal: string
}

// Source type styling configuration
const SOURCE_TYPE_CONFIG: Record<SourceType, {
    order: number
    labelKey: string
    badge: { bg: string; text: string; border: string }
    row: { bg: string; text: string }
}> = {
    mission: {
        order: 0,
        labelKey: 'timegate.badge.mission',
        badge: { bg: 'bg-blue-900/50', text: 'text-blue-300', border: 'border-blue-700/50' },
        row: { bg: 'bg-blue-950/20', text: 'text-blue-200' },
    },
    guild: {
        order: 1,
        labelKey: 'progress.shop.guild',
        badge: { bg: 'bg-purple-900/50', text: 'text-purple-300', border: 'border-purple-700/50' },
        row: { bg: 'bg-purple-950/20', text: 'text-purple-200' },
    },
    adventurer: {
        order: 2,
        labelKey: 'progress.settings.tab.shop',
        badge: { bg: 'bg-amber-900/50', text: 'text-amber-300', border: 'border-amber-700/50' },
        row: { bg: '', text: 'text-gray-200' },
    },
    craft: {
        order: 3,
        labelKey: 'progress.settings.tab.craft',
        badge: { bg: 'bg-emerald-900/50', text: 'text-emerald-300', border: 'border-emerald-700/50' },
        row: { bg: 'bg-emerald-950/20', text: 'text-emerald-200' },
    },
}

// Determine source type based on translation key
function getSourceType(sourceKey: string): SourceType {
    if (sourceKey === 'progress.shop.guild-shop') return 'guild'
    if (sourceKey.startsWith('progress.craft.')) return 'craft'
    if (sourceKey.startsWith('progress.shop.')) return 'adventurer'
    return 'mission'
}

// i18n helper functions
export function getTabs(t: (key: string) => string) {
    return [
        { key: 'books' as TabKey, label: t('timegate.tabs.books'), icon: '/images/items/basic-skill-manual.webp' },
        { key: 'transistones' as TabKey, label: t('timegate.tabs.transistones'), icon: '/images/items/transistone-individual.webp' },
        { key: 'special' as TabKey, label: t('timegate.tabs.special'), icon: '/images/items/blue-memory-stone.webp' },
        { key: 'glunite' as TabKey, label: t('timegate.tabs.glunite'), icon: '/images/items/refined-glunite.webp' },
    ]
}

export function getHeaders(t: (key: string) => string): TableHeaders {
    return {
        source: t('timegate.headers.source'),
        weekly: t('timegate.headers.weekly'),
        monthly: t('timegate.headers.monthly'),
        total: t('timegate.headers.total'),
        grandTotal: t('timegate.headers.grandTotal'),
    }
}

// Badge component
function SourceTypeBadge({ type, t }: { type: SourceType; t: (key: string) => string }) {
    const { badge, labelKey } = SOURCE_TYPE_CONFIG[type]
    return (
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${badge.bg} ${badge.text} border ${badge.border} mr-2`}>
            {t(labelKey)}
        </span>
    )
}

// Resource Table Component
type ResourceTableProps = {
    item: ResourceItem
    renderSourceLabel: SourceLabelRenderer
    headers: TableHeaders
}

export function ResourceTable({ item, renderSourceLabel, headers }: ResourceTableProps) {
    const { t } = useI18n()

    const totalWeekly = item.sources.reduce((sum, s) => sum + (s.weekly || 0), 0)
    const totalMonthly = item.sources.reduce((sum, s) => sum + (s.monthly || 0), 0)
    const grandTotalMonthly = totalMonthly + (totalWeekly * 4)

    // Sort sources by type order and build rows with separators
    const sortedSources = [...item.sources].sort((a, b) =>
        SOURCE_TYPE_CONFIG[getSourceType(a.sourceKey)].order - SOURCE_TYPE_CONFIG[getSourceType(b.sourceKey)].order
    )

    const rows: { src: ResourceSource; type: SourceType; showSeparator: boolean }[] = []
    let prevType: SourceType | null = null
    for (const src of sortedSources) {
        const type = getSourceType(src.sourceKey)
        rows.push({ src, type, showSeparator: prevType !== null && prevType !== type })
        prevType = type
    }

    return (
        <div className="flex justify-center my-6">
            <div className="w-full max-w-2xl">
                <h3 className="font-semibold text-lg mb-3 text-center">
                    <ItemInlineDisplay names={[item.name]} />
                </h3>
                <table className="w-auto mx-auto border border-gray-700 rounded-md text-sm text-center">
                    <thead className="bg-gray-800">
                        <tr>
                            <th className="border px-3 py-2">{headers.source}</th>
                            <th className="border px-3 py-2">{headers.weekly}</th>
                            <th className="border px-3 py-2">{headers.monthly}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => {
                            const config = SOURCE_TYPE_CONFIG[row.type]
                            return (
                                <Fragment key={i}>
                                    {row.showSeparator && (
                                        <tr className="h-1 bg-gray-700/30">
                                            <td colSpan={3} className="p-0 border-0"></td>
                                        </tr>
                                    )}
                                    <tr className={config.row.bg}>
                                        <td className="border px-3 py-2 text-left">
                                            <div className="flex items-center">
                                                <SourceTypeBadge type={row.type} t={t} />
                                                <span className={config.row.text}>
                                                    {renderSourceLabel(row.src)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="border px-3 py-2">{row.src.weekly ?? '–'}</td>
                                        <td className="border px-3 py-2">{row.src.monthly ?? '–'}</td>
                                    </tr>
                                </Fragment>
                            )
                        })}
                        <tr className="bg-gray-900 font-bold">
                            <td className="border px-3 py-2 text-left">{headers.total}</td>
                            <td className="border px-3 py-2">{totalWeekly || '–'}</td>
                            <td className="border px-3 py-2">{totalMonthly || '–'}</td>
                        </tr>
                        <tr className="bg-gray-800 font-bold">
                            <td className="border px-3 py-2 text-left">{headers.grandTotal}</td>
                            <td className="border px-3 py-2">–</td>
                            <td className="border px-3 py-2">{grandTotalMonthly || '–'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

// Main Guide Component
type TimegateGuideProps = {
    data: TimegateData
    tabs: { key: TabKey; label: string; icon: string }[]
    title: string
    intro: string
    renderSourceLabel: SourceLabelRenderer
    headers: TableHeaders
}

export function TimegateGuideContent({
    data,
    tabs,
    title,
    intro,
    renderSourceLabel,
    headers,
}: TimegateGuideProps) {
    const searchParams = useSearchParams()
    const tabParam = searchParams.get('tab') as TabKey | null
    const [selected, setSelected] = useState<TabKey>('books')

    useEffect(() => {
        if (tabParam && ['books', 'transistones', 'special', 'glunite'].includes(tabParam)) {
            setSelected(tabParam as TabKey)
        }
    }, [tabParam])

    const handleTabChange = (key: TabKey) => {
        setSelected(key)
        const params = new URLSearchParams(window.location.search)
        if (key === 'books') {
            params.delete('tab')
        } else {
            params.set('tab', key)
        }
        const newUrl = `${window.location.pathname}?${params.toString()}`
        window.history.replaceState(null, '', newUrl)
    }

    return (
        <div className="space-y-6">
            <GuideHeading>{title}</GuideHeading>

            <p className="text-sm text-gray-300 leading-relaxed">
                {intro}
            </p>

            <div className="flex justify-center mb-4">
                <AnimatedTabs
                    tabs={tabs}
                    selected={selected}
                    onSelect={handleTabChange}
                    pillColor="#0ea5e9"
                />
            </div>

            <div className="space-y-6">
                {data[selected].map((item, idx) => (
                    <ResourceTable
                        key={idx}
                        item={item}
                        renderSourceLabel={renderSourceLabel}
                        headers={headers}
                    />
                ))}
            </div>
        </div>
    )
}
