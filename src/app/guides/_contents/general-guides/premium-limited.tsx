"use client"

import { useMemo, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import GuideHeading from "@/app/components/GuideHeading"
import { AnimatedTabs } from "@/app/components/AnimatedTabs"
import type { ReactNode } from "react"
import { toKebabCase } from "@/utils/formatText"
import DATA from "@/data/premium_limited_data.json"
import ElementInlineTag from "@/app/components/ElementInline"
import ClassInlineTag from "@/app/components/ClassInlineTag"
import type { CharacterLite } from "@/types/types"
import StarLevel from "@/app/components/StarLevel"
import Link from "next/link"
import type { ElementType, ClassType } from "@/types/enums"
import TranscendInline from "@/app/components/TranscendInline"
import Image from "next/image"
import { RecoTrans } from "@/app/components/GlowCardTrans"

/* ===================== Types ===================== */
type Impact = { pve: string; pvp: string }
export interface HeroReview {
    name: string
    review: string
    recommended_pve: string
    recommended_pvp: string
    impact: Record<"3" | "4" | "5" | "6", Impact>
}
export interface PremiumLimitedData {
    Premium: HeroReview[]
    Limited: HeroReview[]
}
interface Entry { name: string; stars: number; op: ">" | ">=" | null }

type TabKey = "Premium" | "Limited"
interface TabDef { key: TabKey; label: string; icon: string }

/* ===================== Constantes ===================== */
const TABS: TabDef[] = [
    { key: "Premium", label: "Premium", icon: "/images/ui/tags/premium.webp" },
    { key: "Limited", label: "Limited", icon: "/images/ui/tags/limited.webp" },
]

/* ===================== UI bits ===================== */
function StarIcons({ count, size = 20 }: { count: number; size?: number }) {
    return (
        <div className="flex -space-y-1 flex-col items-end">
            {Array.from({ length: count }).map((_, i) => (
                <Image key={i} src="/images/ui/star.webp" alt="star" width={size} height={size}
                    style={{ width: size, height: size }} />
            ))}
        </div>
    )
}

interface CharacterCardProps {
    char?: CharacterLite
    stars: number
    isPriority?: boolean
}
function CharacterCard({ char, stars, isPriority = false }: CharacterCardProps) {
    const slug = char ? toKebabCase(char.Fullname.toLowerCase()) : null
    const href = slug ? `/characters/${slug}` : "#"
    return (
        <Link
            href={href}
            prefetch={false}
            className="relative w-[60px] h-[115px] text-center shadow hover:shadow-lg transition overflow-hidden rounded"
            aria-disabled={!char}
        >
            {char?.ID ? (
                <Image
                    src={`/images/characters/portrait/CT_${char.ID}.webp`}
                    alt={char.Fullname}
                    width={60}
                    height={115}
                    style={{ width: 60, height: 115 }}
                    className="object-cover rounded opacity-80"
                    priority={isPriority}
                    loading={isPriority ? undefined : "lazy"}
                    unoptimized
                />
            ) : (
                <div
                    className="w-[60px] h-[115px] flex items-center justify-center bg-gray-800/50 rounded text-xs text-gray-400"
                >
                    ?
                </div>
            )}

            <div className="absolute top-4 right-1 z-30 flex flex-col items-end -space-y-1">
                <StarIcons count={stars} size={18} />
            </div>
        </Link>
    )
}

function Badge({ children }: { children: ReactNode }) {
    return (
        <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[11px] uppercase tracking-wide">
            {children}
        </span>
    )
}

function ImpactTable({ impact }: { impact: HeroReview["impact"] }) {
    const rows = ["3", "4", "5", "6"] as const
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left opacity-80">
                        <th className="py-1 pr-2">★</th>
                        <th className="py-1 pr-2">PvE</th>
                        <th className="py-1 pr-2">PvP</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => (
                        <tr key={r} className="border-t border-white/5">
                            <td className="py-1 pr-2 font-medium"><StarLevel levelLabel={r} /></td>
                            <td className="py-1 pr-2"><StarLevel levelLabel={impact[r]?.pve || "—"} /></td>
                            <td className="py-1 pr-2"><StarLevel levelLabel={impact[r]?.pvp || "—"} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

/* ===================== Premium pulling order ===================== */
const PREMIUM_ORDER: Entry[] = [
    { name: "Monad Eva", stars: 5, op: ">" },
    { name: "Demiurge Stella", stars: 3, op: ">" },
    { name: "Demiurge Luna", stars: 3, op: ">=" },
    { name: "Demiurge Astei", stars: 3, op: ">=" },
    { name: "Demiurge Drakhan", stars: 3, op: ">=" },
    { name: "Gnosis Beth", stars: 4, op: ">=" },
    { name: "Demiurge Vlada", stars: 5, op: ">=" },
    { name: "Demiurge Delta", stars: 3, op: null },
]

function PremiumPullingOrder({
    title = "Who do I pick?",
    entries,
    charIndex,
}: {
    title?: string
    entries: Entry[]
    charIndex: Record<string, CharacterLite>
}) {
    return (
        <section className="rounded-2xl border border-white/10 p-4 bg-white/5">
            <h3 className="text-center text-lg font-semibold tracking-wide mb-3">{title}</h3>

            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-4">
                {entries.map((e, i) => {
                    const char = charIndex[toKebabCase(e.name)]
                    return (
                        <div key={`${e.name}-${i}`} className="flex items-center">
                            <CharacterCard char={char} stars={e.stars} isPriority={i === 0} />
                            {e.op && i < entries.length - 1 && (
                                <div className="mx-2 text-2xl font-bold opacity-80 select-none">{e.op}</div>
                            )}
                        </div>
                    )
                })}
            </div>

            <p className="text-center text-xs opacity-70 mt-3">
                Note: after <strong>D.Stella</strong>, the order is more flexible depending on your needs (PvE/PvP).
            </p>
        </section>
    )
}


function Stars({ count }: { count: number }) {
  return (
    <span className="inline-flex gap-[1px] align-middle">
      {Array.from({ length: count }).map((_, i) => (
        <Image
          key={i}
          src="/images/ui/CM_icon_star_y.webp"
          alt="★"
          width={16}
          height={16}
          className="object-contain"
        />
      ))}
    </span>
  )
}

export function TargetDisplay({ value }: { value: string }) {
  if (!value) return <span>—</span>

  // On split par motifs "nombre + optionnel (…)" 
  // ex: "5 (support) 6 (dps)" → ["5 (support)", "6 (dps)"]
  const parts = value.match(/\d+(?:\s*\([^)]*\))?|[^\d]+/g) || []

  return (
    <div className="text-sm text-gray-200 space-y-1 text-center">
      {parts.map((part, idx) => {
        const num = parseInt(part, 10)
        if (!isNaN(num)) {
          // retire le nombre pour extraire la mention éventuelle
          const extra = part.replace(/^\d+\s*/, '')
          return (
            <div key={idx}>
              <Stars count={num} /> {extra}
            </div>
          )
        }
        return <div key={idx}>{part.trim()}</div>
      })}
    </div>
  )
}


/* ===================== Hero Card ===================== */
function HeroCard({ h, char }: { h: HeroReview; char?: CharacterLite }) {
    const element = char?.Element as ElementType | undefined
    const cls = char?.Class as ClassType | undefined
    const sub = char?.SubClass || "—"
    const name = char?.Fullname || "—"
    const portraitSrc = char?.ID ? `/images/characters/atb/IG_Turn_${char.ID}.webp` : undefined

    type AllowedTag = "limited" | "seasonal" | "collab"
    const isAllowedTag = (t: string): t is AllowedTag =>
        t === "limited" || t === "seasonal" || t === "collab"

    const tags: string[] = Array.isArray(char?.tags)
        ? char!.tags
        : char?.tags
            ? [char.tags]
            : []

    const specialTag = tags.find(isAllowedTag)
    const slug = char ? toKebabCase(char.Fullname) : null
    const href = slug ? `/characters/${slug}` : undefined

    return (
        <section className="rounded-md border border-gray-800 bg-black/30 p-5">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="m-0 text-xl font-semibold flex items-center gap-3">
                    {href && portraitSrc ? (
                        <Link href={href} prefetch={false} aria-label={`Open ${name} page`}>
                            <Image
                                src={portraitSrc}
                                alt={name}
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-lg object-contain"
                                unoptimized
                            />
                        </Link>
                    ) : (
                        portraitSrc && (
                            <Image
                                src={portraitSrc}
                                alt={name}
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-lg object-contain"
                                unoptimized
                            />
                        )
                    )}

                    {href ? (
                        <Link
                            href={href}
                            prefetch={false}
                            className="underline underline-offset-4 decoration-blue-400 text-blue-400 hover:text-red-400 hover:decoration-red-400"
                            title={`Open ${name} character page`}
                        >
                            {name}
                        </Link>
                    ) : (
                        <span>{name}</span>
                    )}

                    {char?.limited && specialTag && (
                        <Image
                            src={`/images/ui/tags/${specialTag}.webp`}
                            alt={`${specialTag} tag`}
                            width={60}
                            height={60}
                            style={{ width: 60, height: 60 }}
                            className="object-cover"
                            unoptimized
                        />
                    )}
                </h2>

                <div className="flex items-center gap-2 text-xs opacity-80">
                    {element && <Badge><ElementInlineTag element={element} /></Badge>}
                    {cls && <Badge><ClassInlineTag name={cls} /></Badge>}
                    {sub && sub !== "—" && cls && (
                        <Badge><ClassInlineTag name={cls} subclass={sub} /></Badge>
                    )}
                </div>
            </header>

            <p className="mt-3 mb-4 whitespace-pre-line text-sm text-gray-200">{h.review}</p>

            <div className="grid gap-4">
                {/* Ligne 1 */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Targets */}
                    <div className="max-w-4xl w-full rounded border border-gray-800 p-4">
                        <h3 className="m-0 text-sm opacity-80 text-center mb-4">Recommended targets</h3>

                        <div className="
      grid grid-cols-1 md:grid-cols-2 gap-8
      items-stretch
      divide-y md:divide-y-0 md:divide-x divide-gray-800
    ">
                            {/* PvE */}
                            <div className="flex flex-col items-center justify-center px-4">
                                <RecoTrans
                                    title="PvE"
                                    description={<TargetDisplay value={h.recommended_pve || "—"} />}
                                    image="/images/ui/nav/pve.png"
                                    type="pve"
                                />
                            </div>

                            {/* PvP */}
                            <div className="flex flex-col items-center justify-center px-4">
                                <RecoTrans
                                    title="PvP"
                                    description={<TargetDisplay value={h.recommended_pvp || "—"} />}
                                    image="/images/ui/nav/pvp.png"
                                    type="pvp"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Impact */}
                    <div className="rounded-md border border-gray-800 p-3">
                        <h3 className="m-0 text-sm opacity-80">Transcendence impact</h3>
                        <ImpactTable impact={h.impact} />
                    </div>
                </div>


                {/* Ligne 2 */}
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Trans 4 */}
                    <div className="rounded-md border border-gray-800 p-3">
                        <TranscendInline
                            character={char?.Fullname ?? h.name}
                            levels={["4_1"]}
                        />
                    </div>

                    {/* Trans 5 */}
                    <div className="rounded-md border border-gray-800 p-3">
                        <TranscendInline
                            character={char?.Fullname ?? h.name}
                            levels={["5_1"]}
                        />
                    </div>

                    {/* Trans 6 */}
                    <div className="rounded-md border border-gray-800 p-3">
                        <TranscendInline
                            character={char?.Fullname ?? h.name}
                            levels={["6"]}
                        />
                    </div>
                </div>
            </div>


        </section>
    )
}


/* ===================== Page ===================== */
const Intro = () => (
    <p className="text-sm text-gray-300 leading-relaxed">
        Quick recommendations for Premium and Limited banners. See PvE/PvP targets and the key transcendence sweetspots (3★→6★) for each hero.
    </p>
)

export default function PremiumLimitedGuide() {
    const searchParams = useSearchParams()
    const tabParam = searchParams.get("tab") as TabKey | null

    // 👉 index des persos construit depuis l’API
    const [charIndex, setCharIndex] = useState<Record<string, CharacterLite>>({})

    useEffect(() => {
        const fetchCharacters = async () => {
            const res = await fetch("/api/characters-lite")
            if (!res.ok) return
            const data: CharacterLite[] = await res.json()
            setCharIndex(Object.fromEntries(data.map(c => [toKebabCase(c.Fullname), c])))
        }
        fetchCharacters()
    }, [])

    // State d’onglet (option B : URL cosmétique)
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

    const sorted = useMemo(() => {
        const list = (DATA as PremiumLimitedData)[selected] ?? []
        return [...list].sort((a, b) => a.name.localeCompare(b.name))
    }, [selected])


    return (
        <div className="space-y-6">
            <GuideHeading>Premium & Limited — Reviews & Transcendence Sweetspots</GuideHeading>

            <Intro />

            <div className="flex justify-center mb-4">
                <AnimatedTabs tabs={TABS} selected={selected} onSelect={handleTabChange} pillColor="#8b5cf6" />
            </div>

            {selected === "Premium" && (
                <PremiumPullingOrder
                    title="Recommended Pulling Order (Premium)"
                    entries={PREMIUM_ORDER}
                    charIndex={charIndex}
                />
            )}

            {sorted.length === 0 ? (
                <div className="rounded-md border border-gray-700 p-6 text-sm text-gray-300">
                    No entries for <strong>{selected}</strong> yet. Add them to <code>data/premium_limited_data.json</code>.
                </div>
            ) : (
                <div className="grid gap-6">
                    {sorted.map((h) => {
                        const char = charIndex[toKebabCase(h.name)]
                        return <HeroCard key={h.name} h={h} char={char} />
                    })}
                </div>
            )}
        </div>
    )
}
