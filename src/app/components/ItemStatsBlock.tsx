import React from 'react'
import statsData from '@/data/stats.json'
import rangesData from '@/data/statRanges.json'
import Image from 'next/image'

interface StatInfo {
    label: string
    icon: string
}

interface StatsData {
    [key: string]: StatInfo
}

interface StatRanges {
    [type: string]: {
        [stat: string]: {
            [rare: string]: number[] // au lieu de [number, number]
        }
    }
}


const typedStatsData = statsData as StatsData
const typedRangesData = rangesData as StatRanges

interface ItemStatsBlockProps {
    stats: string[]
    substats?: string[]
    type: string
    rare: number
}

const getStatInfo = (label: string) => typedStatsData[label]

const getStatRange = (type: string, stat: string, rare: number): [number, number] | null => {
    const raw = typedRangesData[type]?.[stat]?.[String(rare)]
    return raw && raw.length === 2 ? [raw[0], raw[1]] : null
}




export default function ItemStatsBlock({ stats, substats = [], type, rare }: ItemStatsBlockProps) {
    const renderStatRow = (stat: string) => {
        const info = getStatInfo(stat)
        const range = getStatRange(type, stat, rare)
        if (!info) return null

        return (
            <tr key={stat} className="border-t border-white/10">
                <td className="py-1 pr-4 w-1/2">
                    <div className="flex items-center gap-2">
                        <Image
                            src={`https://outerpedia.com/images/ui/effect/${info.icon.replace('.webp', '.png')}`}
                            alt={info.label}
                            width={20}
                            height={20}
                            style={{ width: 20, height: 20 }}
                        />
                        <span className="text-xs">{info.label}</span>
                    </div>
                </td>

                <td className="py-1 px-2 text-center text-neutral-300 w-1/4">
                    {!range?.[0] ? 'N/A' : range[0]}
                </td>
                <td className="py-1 px-2 text-center text-neutral-300 w-1/4">
                    {!range?.[1] ? 'N/A' : range[1]}
                </td>

            </tr>
        )
    }

    const TableHeader = () => (
        <thead>
            <tr className="text-neutral-400 text-left">
                <th className="font-medium pb-1 w-1/2">Stat</th>
                <th className="font-medium pb-1 text-center w-1/4">Lv.0 Tier 0</th>
                <th className="font-medium pb-1 text-center w-1/4">Lv.10 Tier 4</th>
            </tr>
        </thead>
    )

    return (
        <div className="bg-black/30 border border-white/10 rounded-xl p-5 w-full max-w-3xl space-y-6">
            <div>
                <p className="font-semibold text-white mb-2">Main Stat{stats.length > 1 ? 's' : ''}:</p>
                <table className="w-full table-fixed text-sm text-white">
                    <TableHeader />
                    <tbody>
                        {stats.map(renderStatRow)}
                    </tbody>
                </table>
            </div>

            {substats.length > 0 && (
                <div>
                    <p className="font-semibold text-white mb-2">Second Main Stat{substats.length > 1 ? 's' : ''}:</p>
                    <table className="w-full table-fixed text-sm text-white">
                        <TableHeader />
                        <tbody>
                            {substats.map(renderStatRow)}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

