import { useI18n } from '@/lib/contexts/I18nContext'
import { useTenant } from '@/lib/contexts/TenantContext'
import { lRec } from '@/lib/localize'
import parseText from '@/utils/parseText'
import { DESCRIPTIONS } from './data'

// Types
export type Entry = {
    mode: string
    stage: string       // ex: "S1-8-5"
    unlockName: string  // i18n key ex: "dungeon.puppet"
}

// Sorting helper
function parseStage(stage: string): [number, number, number] {
    const match = stage.match(/^S(\d+)-(\d+)-(\d+)/)
    if (!match) return [999, 999, 999]
    return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)]
}

export function sortData(data: Entry[]): Entry[] {
    return [...data].sort((a, b) => {
        const [ax, ay, az] = parseStage(a.stage)
        const [bx, by, bz] = parseStage(b.stage)
        if (ax !== bx) return ax - bx
        if (ay !== by) return ay - by
        return az - bz
    })
}

// Table component
export function SectionTable({ data }: { data: Entry[] }) {
    const { t } = useI18n()
    const { key: lang } = useTenant()
    const headers = [
        t('unlock-guide.header.game-mode'),
        t('unlock-guide.header.unlock-condition'),
        t('unlock-guide.header.description')
    ]

    return (
        <div className="flex justify-center">
            <div className="w-full max-w-4xl">
                <table className="w-auto mx-auto border border-gray-700 rounded-md text-sm text-center">
                    <thead className="bg-gray-800">
                        <tr>
                            {headers.map((h, i) => (
                                <th key={i} className="border px-3 py-2">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((entry, i) => (
                            <tr key={i}>
                                <td className="border px-3 py-2 text-left">{t(entry.mode)}</td>
                                <td className="border px-3 py-2">{entry.stage} : {t(entry.unlockName)}</td>
                                <td className="border px-3 py-2">{parseText(lRec(DESCRIPTIONS[entry.mode], lang))}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
