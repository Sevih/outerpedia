'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { toKebabCase } from '@/utils/formatText'

/* ===================== Types ===================== */
export type TransMap = Record<string, string | null>
type Step = { key: string; label: string }

interface CharacterJSON {
  ID: number
  Fullname: string
  Element?: string
  Class?: string
  SubClass?: string
  tags?: string[] | string
  transcend?: TransMap
  transcends?: TransMap
  transcendance?: TransMap
}

/* ===================== Constantes ===================== */
const ORDER: Step[] = [
  { key: '1', label: 'Lv 1' },
  { key: '2', label: 'Lv 2' },
  { key: '3', label: 'Lv 3' },
  { key: '4', label: 'Lv 4' },
  { key: '4_1', label: 'Lv 4' },
  { key: '4_2', label: 'Lv 4+' },
  { key: '5', label: 'Lv 5' },
  { key: '5_1', label: 'Lv 5' },
  { key: '5_2', label: 'Lv 5+' },
  { key: '5_3', label: 'Lv 5++' },
  { key: '6', label: 'Lv 6' },
]

const starIcons = {
  gray: "/images/ui/CM_icon_star_w.webp",
  yellow: "/images/ui/CM_icon_star_y.webp",
  orange: "/images/ui/CM_icon_star_o.webp",
  red: "/images/ui/CM_icon_star_r.webp",
  purple: "/images/ui/CM_icon_star_v.webp",
}

/* ===================== Utils ===================== */
function stripColorTags(input: string) {
  if (!input) return input
  return input
    .replace(/<color=#[0-9a-fA-F]{6,8}>(.*?)<\/color>/g, '$1')
    .replace(/<color=.*?>(.*?)<\/color>/g, '$1')
}

/** supprime les lignes "ATK DEF HP +xx%" et lignes vides résiduelles */
function sanitizeTransText(input: string) {
  const rAtkDefHp = /^ATK DEF HP \+\d+%$/i
  return input
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !rAtkDefHp.test(l))
    .join('\n')
}

function TranscendenceStars({ levelLabel }: { levelLabel: string }) {
  const stars: string[] = []
  switch (levelLabel) {
    case "Lv 1": stars.push(...Array(1).fill(starIcons.yellow), ...Array(5).fill(starIcons.gray)); break
    case "Lv 2": stars.push(...Array(2).fill(starIcons.yellow), ...Array(4).fill(starIcons.gray)); break
    case "Lv 3": stars.push(...Array(3).fill(starIcons.yellow), ...Array(3).fill(starIcons.gray)); break
    case "Lv 4": stars.push(...Array(4).fill(starIcons.yellow), ...Array(2).fill(starIcons.gray)); break
    case "Lv 4+": stars.push(...Array(3).fill(starIcons.yellow), starIcons.orange, ...Array(2).fill(starIcons.gray)); break
    case "Lv 5": stars.push(...Array(5).fill(starIcons.yellow), starIcons.gray); break
    case "Lv 5+": stars.push(...Array(4).fill(starIcons.yellow), starIcons.red, starIcons.gray); break
    case "Lv 5++": stars.push(...Array(4).fill(starIcons.yellow), starIcons.purple, starIcons.gray); break
    case "Lv 6": stars.push(...Array(6).fill(starIcons.yellow)); break
    default: stars.push(...Array(6).fill(starIcons.gray)); break
  }
  return (
    <div className="flex gap-[1px]">
      {stars.map((src, idx) => (
        <Image key={idx} src={src} alt="star" width={18} height={18}
          style={{ width: 18, height: 18 }} className="object-contain" />
      ))}
    </div>
  )
}

/* ============== TranscendList (avec filtre levels et purge ATK/DEF/HP) ============== */
export function TranscendList({
  transcendData,
  className = '',
  levels,
}: {
  transcendData: TransMap
  className?: string
  levels?: string[]
}) {
  const steps = useMemo(
    () =>
      ORDER.filter(s => {
        if (levels && !levels.includes(s.key)) return false
        const v = transcendData[s.key]
        return typeof v === 'string' && v.trim().length > 0
      }),
    [transcendData, levels]
  )

  if (steps.length === 0) return null

  return (
    <div className={`bg-[#1a1c28] border border-gray-700 p-4 space-y-3 text-white ${className}`}>
      {steps.map(({ key, label }) => {
        const raw = transcendData[key] ?? ''
        let clean = sanitizeTransText(stripColorTags(raw || ''))

        if (key === "5_1") {
          clean = `Burst Lv3 Unlocked\n${clean}`
        }

        if (!clean) return null

        return (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="text-xs opacity-80">{label}</div>
              <TranscendenceStars levelLabel={label} />
            </div>
            <div className="text-xs whitespace-pre-line leading-tight">{clean}</div>
          </div>
        )
      })}
    </div>
  )
}

/* ================= TranscendInline (import direct JSON + levels) ================= */
export default function TranscendInline({
  character,
  className = '',
  levels,
}: {
  character: string
  className?: string
  levels?: string[]
}) {
  const [data, setData] = useState<TransMap | null>(null)

  useEffect(() => {
    let cancelled = false
    const slug = toKebabCase(character)

    ;(async () => {
      try {
        const mod: CharacterJSON = await import(
          /* webpackMode: "lazy", webpackInclude: /\.json$/ */
          `@/data/char/${slug}.json`
        )
        const t = mod.transcend ?? mod.transcends ?? mod.transcendance ?? null
        if (!cancelled) setData(t)
      } catch {
        if (!cancelled) setData(null)
      }
    })()

    return () => { cancelled = true }
  }, [character])

  if (!data) return null
  return <TranscendList transcendData={data} className={className} levels={levels} />
}
