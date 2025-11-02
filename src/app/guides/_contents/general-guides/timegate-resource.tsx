'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import GuideHeading from '@/app/components/GuideHeading'
import ItemInlineDisplay from '@/app/components/ItemInline'
import { AnimatedTabs } from '@/app/components/AnimatedTabs'
// Typage des catégories
type TabKey = 'books' | 'transistones' | 'special' | 'glunite'

const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'books', label: 'Skill Books', icon: '/images/items/basic-skill-manual.webp' },
    { key: 'transistones', label: 'Transistones', icon: '/images/items/transistone-individual.webp' },
    { key: 'special', label: 'Special Gear', icon: '/images/items/blue-memory-stone.webp' },
    { key: 'glunite', label: 'Glunite', icon: '/images/items/refined-glunite.webp' },
]

type ResourceSource = {
    source: string
    weekly?: number
    monthly?: number
}

type ResourceItem = {
    name: string
    sources: ResourceSource[]
}

const data: Record<TabKey, ResourceItem[]> = {
    'books': [
        {
            name: 'Basic Skill Manual',
            sources: [
                { source: "Irregular Infiltration (Floor 3)", monthly: 28 },
                { source: 'Skyward Tower Shop', monthly: 25 },
                { source: 'Guild Shop', weekly: 3 },
                { source: 'Resource Shop', weekly: 5 },
                { source: 'Arena Shop', weekly: 3 },
                { source: 'Survey Hub Shop', weekly: 3 },
                { source: 'Arena Chest (30 games)', weekly: 5 },
                { source: 'Weekly Mission', weekly: 1 },
            ],
        },
        {
            name: 'Intermediate Skill Manual',
            sources: [
                { source: "Irregular Infiltration (Floor 3)", monthly: 17 },
                { source: 'Skyward Tower Shop', monthly: 15 },
                { source: 'Guild Shop', weekly: 2 },
                { source: 'Resource Shop', weekly: 2 },
                { source: 'Arena Shop', weekly: 3 },
                { source: 'Star\'s memory Shop', weekly: 2 },
                { source: 'Survey Hub Shop', weekly: 2 },
                { source: "Archdemon's Ruins (Infinite Corridor, 3-day reset)", weekly: 3 },
                { source: 'Arena Chest (30 games)', weekly: 3 },
                { source: 'Weekly Mission', weekly: 1 },
            ],
        },
        {
            name: 'Professional Skill Manual',
            sources: [
                { source: "Irregular Infiltration (Floor 3)", monthly: 3 },
                { source: 'Skyward Tower Shop', monthly: 5 },
                { source: 'Guild Shop', weekly: 1 },
                { source: 'Arena Shop', weekly: 2 },
                { source: 'Star\'s memory Shop', weekly: 1 },
                { source: 'Survey Hub Shop', weekly: 1 },
                { source: 'Arena Chest (30 games)', weekly: 1 },
            ],
        },
    ],
    'transistones': [
        {
            name: 'Transistone (Total)',
            sources: [
                { source: "Joint Challenge Shop", monthly: 1 },
                { source: 'Star\'s memory Shop', weekly: 2 },
                { source: 'World Boss Shop', monthly: 2 },
                { source: 'Skyward Tower Shop', monthly: 1 },
                { source: 'Irregular Extermination Point', monthly: 12 },
                { source: "Irregular Infiltration (Floor 3)", monthly: 9 },
                { source: 'Kate\'s Workshop', monthly: 3 },

            ],
        },
        {
            name: 'Transistone (Individual)',
            sources: [
                { source: "Joint Challenge Shop", monthly: 1 },
                { source: 'Star\'s memory Shop', monthly: 2 },
                { source: 'World Boss Shop', monthly: 2 },
                { source: 'Skyward Tower Shop', monthly: 1 },
                { source: 'Irregular Extermination Point', monthly: 12 },
                { source: "Irregular Infiltration (Floor 3)", monthly: 9 },
                { source: 'Kate\'s Workshop', monthly: 3 },
            ],
        }
    ],
    'special': [
        {
            name: 'Blue Stardust',
            sources: [
                { source: "Irregular Extermination Point", monthly: 150 },
                { source: 'Kate\'s Workshop', weekly: 40 },
            ],
        },
        {
            name: 'Purple Stardust',
            sources: [
                { source: "Irregular Extermination Point", monthly: 300 },
                { source: 'Kate\'s Workshop (cost 30 Blue Stardust)', weekly: 10 },
            ],
        },
        {
            name: 'Blue Memory Stone',
            sources: [
                { source: "Irregular Extermination Point", monthly: 150 },
                { source: 'Kate\'s Workshop', weekly: 40 },
            ],
        },
        {
            name: 'Purple Memory Stone',
            sources: [
                { source: "Irregular Extermination Point", monthly: 300 },
                { source: 'Kate\'s Workshop (cost 30 Blue Memory Stone)', weekly: 10 },
            ],
        },
    ],
    'glunite': [
        {
            name: 'Refined Glunite',
            sources: [
                { source: "Joint Challenge Shop", monthly: 1 },
                { source: 'Star\'s memory Shop', monthly: 1 },
                { source: "Archdemon's Ruins (Infinite Corridor, 3-day reset)", weekly: 1 },
                { source: 'Survey Hub Shop', weekly: 1 },

            ],
        },
        {
            name: 'Armor Glunite',
            sources: [
                { source: "Joint Challenge Shop", monthly: 1 },
                { source: "Irregular Extermination Point", monthly: 9 },
                { source: 'Kate\'s Workshop', weekly: 2 },
            ],
        },
        {
            name: 'Glunite',
            sources: [
                { source: 'Star\'s memory Shop', weekly: 1 },
                { source: "Archdemon's Ruins (Infinite Corridor, 3-day reset)", weekly: 3 },
                { source: 'Survey Hub Shop', weekly: 3 },

            ],
        }
    ],
}


function ResourceTable({ item }: { item: ResourceItem }) {
    const totalWeekly = item.sources.reduce((sum, s) => sum + (s.weekly || 0), 0)
    const totalMonthly = item.sources.reduce((sum, s) => sum + (s.monthly || 0), 0)
    const grandTotalMonthly = totalMonthly + (totalWeekly * 4)

    return (
        <div className="flex justify-center my-6">
            <div className="w-full max-w-2xl">
                <h3 className="font-semibold text-lg mb-3 text-center">
                    <ItemInlineDisplay names={[item.name]} />
                </h3>
                <table className="w-auto mx-auto border border-gray-700 rounded-md text-sm text-center">
                    <thead className="bg-gray-800">
                        <tr>
                            <th className="border px-3 py-2">Source</th>
                            <th className="border px-3 py-2">Weekly</th>
                            <th className="border px-3 py-2">Monthly</th>
                        </tr>
                    </thead>
                    <tbody>
                        {item.sources.map((src, i) => (
                            <tr key={i}>
                                <td className="border px-3 py-2 text-left">{src.source}</td>
                                <td className="border px-3 py-2">{src.weekly ?? '–'}</td>
                                <td className="border px-3 py-2">{src.monthly ?? '–'}</td>
                            </tr>
                        ))}
                        <tr className="bg-gray-900 font-bold">
                            <td className="border px-3 py-2 text-left">Total</td>
                            <td className="border px-3 py-2">{totalWeekly || '–'}</td>
                            <td className="border px-3 py-2">{totalMonthly || '–'}</td>
                        </tr>
                        <tr className="bg-gray-800 font-bold">
                            <td className="border px-3 py-2 text-left">Grand Total Monthly</td>
                            <td className="border px-3 py-2">–</td>
                            <td className="border px-3 py-2">{grandTotalMonthly || '–'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default function TimegatedResourcesGuide() {
    const searchParams = useSearchParams()

    const tabParam = searchParams.get('tab') as TabKey | null
    const [selected, setSelected] = useState<TabKey>('books')

    // Appliquer la tab depuis l’URL au chargement
    useEffect(() => {
        if (tabParam && ['books', 'transistones', 'special', 'glunite'].includes(tabParam)) {
            setSelected(tabParam as TabKey)
        }
    }, [tabParam])

    // Fonction qui change de tab et met à jour l’URL
    const handleTabChange = (key: TabKey) => {
        setSelected(key)

        // Crée une copie des query params actuels
        const params = new URLSearchParams(window.location.search)

        if (key === 'books') {
            // Onglet par défaut : on enlève le paramètre pour garder une URL clean
            params.delete('tab')
        } else {
            params.set('tab', key)
        }

        const newUrl = `${window.location.pathname}?${params.toString()}`
        window.history.replaceState(null, '', newUrl)
    }

    return (
        <div className="space-y-6">
            <GuideHeading>Timegated Resources Guide</GuideHeading>

            <p className="text-sm text-gray-300 leading-relaxed">
                This guide lists all regular weekly and monthly sources of timegated resources in Outerplane.
                Please note that the items shown here can also occasionally be obtained through limited-time
                events or as part of special cash shop packs, which are not included in the tables below.
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
                    <ResourceTable key={idx} item={item} />
                ))}
            </div>
        </div>
    )
}