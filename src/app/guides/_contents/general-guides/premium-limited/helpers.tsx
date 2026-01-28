"use client"

import { type ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"
import { toKebabCase } from "@/utils/formatText"
import ElementInlineTag from "@/app/components/ElementInline"
import ClassInlineTag from "@/app/components/ClassInlineTag"
import StarLevel from "@/app/components/StarLevel"
import TranscendInline from "@/app/components/TranscendInline"
import { RecoTrans } from "@/app/components/GlowCardTrans"
import { CharacterPortrait } from "@/app/components/CharacterPortrait"
import type { CharacterLite } from "@/types/types"
import type { WithLocalizedFields } from "@/types/common"
import type { ElementType, ClassType } from "@/types/enums"
import type { TenantKey } from "@/tenants/config"
import { l, lRec} from "@/lib/localize"
import ALL_CHARACTERS from "@/data/_allCharacters.json"
import CharacterInlineTag from "@/app/components/CharacterLinkCard"
import parseText from "@/utils/parseText"

/* ===================== Character Index ===================== */
export const CHARACTER_INDEX: Record<string, CharacterLite> = Object.fromEntries(
    (ALL_CHARACTERS as CharacterLite[]).map(c => [toKebabCase(c.Fullname), c])
)

/* ===================== Types ===================== */
export type Impact = { pve: string; pvp: string }

interface BaseHeroReview {
    name: string
    review: string
    recommended_pve: string
    recommended_pvp: string
    impact: Record<"3" | "4" | "5" | "6", Impact>
}

export type HeroReview = WithLocalizedFields<BaseHeroReview, 'review'>

export interface PremiumLimitedData {
    Premium: HeroReview[]
    Limited: HeroReview[]
}

export interface Entry {
    name: string
    stars: number
    op: ">" | ">=" | null
}

export type TabKey = "Premium" | "Limited"

export interface TabDef {
    key: TabKey
    label: string
    icon: string
}

/* ===================== Tab Config ===================== */
export const TAB_CONFIG: { key: TabKey; i18nKey: string; icon: string }[] = [
    { key: "Premium", i18nKey: "guides.premium-limited.tabs.premium", icon: "/images/ui/tags/premium.webp" },
    { key: "Limited", i18nKey: "guides.premium-limited.tabs.limited", icon: "/images/ui/tags/limited.webp" },
]

export function getTabs(t: (key: string) => string): TabDef[] {
    return TAB_CONFIG.map(tab => ({
        key: tab.key,
        label: t(tab.i18nKey),
        icon: tab.icon
    }))
}

/* ===================== Priority Data ===================== */
export const PREMIUM_ORDER_1ST: Entry[] = [
    { name: "Monad Eva", stars: 3, op: null },
    { name: "Demiurge Stella", stars: 3, op: null },
    { name: "Demiurge Luna", stars: 3, op: null },
]

export const PREMIUM_ORDER_2ND: Entry[] = [
    { name: "Demiurge Astei", stars: 3, op: null },
    { name: "Gnosis Beth", stars: 3, op: null },
    { name: "Gnosis Viella", stars: 3, op: null },
    { name: "Demiurge Vlada", stars: 3, op: null },
]

export const PREMIUM_ORDER_3RD: Entry[] = [
    { name: "Demiurge Drakhan", stars: 3, op: null },
    { name: "Demiurge Delta", stars: 3, op: null },
    { name: "Demiurge Vlada", stars: 3, op: null },
]

export const TRANSCEND_PRIORITY: Entry[] = [
    { name: "Monad Eva", stars: 5, op: null },
    { name: "Gnosis Beth", stars: 4, op: null },
    { name: "Demiurge Vlada", stars: 5, op: null },
    { name: "Demiurge Luna", stars: 6, op: null },
]

/* ===================== Localized Labels ===================== */
export const LABELS = {
    title: {
        en: "Premium & Limited — Reviews & Transcendence Sweetspots",
        jp: "プレミアム＆限定 — レビュー＆超越スイートスポット",
        kr: "프리미엄 & 한정 — 리뷰 & 초월 스위트스팟",
        zh: "高级与限定 — 评测与超越甜点"
    },
    intro: {
        en: "Quick recommendations for Premium and Limited banners. See PvE/PvP targets and the key transcendence sweetspots (3★→6★) for each hero.",
        jp: "プレミアムおよび限定バナーのおすすめガイド。各ヒーローのPvE/PvP目標と重要な超越スイートスポット（3★→6★）をご覧ください。",
        kr: "프리미엄 및 한정 배너 추천 가이드입니다. 각 영웅의 PvE/PvP 목표와 주요 초월 스위트스팟(3★→6★)을 확인하세요.",
        zh: "高级和限定卡池快速推荐指南。查看每位英雄的PvE/PvP目标和关键超越甜点（3★→6★）。"
    },
    recommendedChoices: {
        en: "Recommended Choices",
        jp: "おすすめの選択",
        kr: "추천 선택",
        zh: "推荐选择"
    },
    priority1st: {
        en: "1st Priority",
        jp: "第1優先",
        kr: "1순위",
        zh: "第一优先"
    },
    priority2nd: {
        en: "2nd Priority",
        jp: "第2優先",
        kr: "2순위",
        zh: "第二优先"
    },
    priority3rd: {
        en: "3rd Priority",
        jp: "第3優先",
        kr: "3순위",
        zh: "第三优先"
    },
    transcendPriority: {
        en: "Transcendence Priority",
        jp: "超越優先順位",
        kr: "초월 우선순위",
        zh: "超越优先级"
    },
    transcendFocusNote: {
        en: "Focus on transcending these heroes first for maximum impact.",
        jp: "最大の効果を得るため、まずこれらのヒーローの超越を優先してください。",
        kr: "최대 효과를 위해 이 영웅들의 초월을 먼저 집중하세요.",
        zh: "为获得最大效果，请优先超越这些英雄。"
    },
    recommendedTargets: {
        en: "Recommended targets",
        jp: "推奨目標",
        kr: "추천 목표",
        zh: "推荐目标"
    },
    transcendImpact: {
        en: "Transcendence impact",
        jp: "超越の影響",
        kr: "초월 영향",
        zh: "超越影响"
    },
    colStar: {
        en: "★",
        jp: "★",
        kr: "★",
        zh: "★"
    },
    noEntries: {
        en: "No entries for {tab} yet. Add them to data/premium_limited_data.json.",
        jp: "{tab}のエントリはまだありません。data/premium_limited_data.jsonに追加してください。",
        kr: "{tab}에 대한 항목이 아직 없습니다. data/premium_limited_data.json에 추가하세요.",
        zh: "{tab}暂无条目。请添加到data/premium_limited_data.json。"
    },
} as const

/* ===================== UI Components ===================== */

interface CharacterCardProps {
    char?: CharacterLite
    stars: number
    isPriority?: boolean
}

export function CharacterCard({ char, stars, isPriority = false }: CharacterCardProps) {
    const slug = char ? toKebabCase(char.Fullname.toLowerCase()) : null
    const href = slug ? `/characters/${slug}` : "#"
    return (
        <Link
            href={href}
            prefetch={false}
            className="relative flex-shrink-0 text-center shadow hover:shadow-lg transition"
            aria-disabled={!char}
        >
            {char?.ID ? (
                <div className="relative">
                    <CharacterPortrait
                        characterId={char.ID}
                        characterName={char.Fullname}
                        size={80}
                        className="rounded-lg border-2 border-gray-600 bg-gray-900"
                        priority={isPriority}
                        showIcons={true}
                    />
                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex justify-center items-center -space-x-1">
                        {Array(stars)
                            .fill(0)
                            .map((_, i) => (
                                <Image
                                    key={i}
                                    src="/images/ui/star.webp"
                                    alt="star"
                                    width={17}
                                    height={17}
                                />
                            ))}
                    </div>
                </div>
            ) : (
                <div className="w-[80px] h-[80px] flex items-center justify-center bg-gray-800/50 rounded-lg border-2 border-gray-600 text-xs text-gray-400">
                    ?
                </div>
            )}
        </Link>
    )
}

export function Badge({ children }: { children: ReactNode }) {
    return (
        <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[11px] uppercase tracking-wide">
            {children}
        </span>
    )
}

export function Stars({ count }: { count: number }) {
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

    const parts = value.match(/\d+(?:\s*\([^)]*\))?|[^\d]+/g) || []

    return (
        <div className="text-sm text-gray-200 space-y-1 text-center">
            {parts.map((part, idx) => {
                const num = parseInt(part, 10)
                if (!isNaN(num)) {
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

interface ImpactTableProps {
    impact: HeroReview["impact"]
    lang: TenantKey
}

export function ImpactTable({ impact, lang }: ImpactTableProps) {
    const rows = ["3", "4", "5", "6"] as const
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left opacity-80">
                        <th className="py-1 pr-2">{lRec(LABELS.colStar, lang)}</th>
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

interface PremiumPriorityRowProps {
    title: string
    entries: Entry[]
    charIndex: Record<string, CharacterLite>
}

export function PremiumPriorityRow({ title, entries, charIndex }: PremiumPriorityRowProps) {
    return (
        <div className="space-y-2">
            <h4 className="text-sm font-semibold tracking-wide opacity-90 text-center">{title}</h4>
            <div className="flex flex-wrap items-center justify-center gap-3">
                {entries.map((e, i) => {
                    const char = charIndex[toKebabCase(e.name)]
                    return <CharacterCard key={`${e.name}-${i}`} char={char} stars={e.stars} isPriority={i === 0} />
                })}
            </div>
        </div>
    )
}

interface PremiumPullingOrderProps {
    charIndex: Record<string, CharacterLite>
    lang: TenantKey
}

export function PremiumPullingOrder({ charIndex, lang }: PremiumPullingOrderProps) {
    return (
        <section className="rounded-2xl border border-white/10 p-6 bg-white/5 space-y-6">
            <h3 className="text-center text-xl font-semibold tracking-wide">{lRec(LABELS.recommendedChoices, lang)}</h3>

            <div className="space-y-5">
                <PremiumPriorityRow
                    title={lRec(LABELS.priority1st, lang)}
                    entries={PREMIUM_ORDER_1ST}
                    charIndex={charIndex}
                />
                <PremiumPriorityRow
                    title={lRec(LABELS.priority2nd, lang)}
                    entries={PREMIUM_ORDER_2ND}
                    charIndex={charIndex}
                />
                <PremiumPriorityRow
                    title={lRec(LABELS.priority3rd, lang)}
                    entries={PREMIUM_ORDER_3RD}
                    charIndex={charIndex}
                />
            </div>

            <div className="border-t border-white/10 pt-5 mt-5">
                <h4 className="text-sm font-semibold tracking-wide opacity-90 mb-2 text-center">
                    {lRec(LABELS.transcendPriority, lang)}
                </h4>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    {TRANSCEND_PRIORITY.map((e, i) => {
                        const char = charIndex[toKebabCase(e.name)]
                        return <CharacterCard key={`${e.name}-${i}`} char={char} stars={e.stars} isPriority={i === 0} />
                    })}
                </div>
                <p className="text-xs opacity-70 mt-3 text-center">
                    {lRec(LABELS.transcendFocusNote, lang)}
                </p>
            </div>
        </section>
    )
}

interface HeroCardProps {
    h: HeroReview
    char?: CharacterLite
    lang: TenantKey
}

export function HeroCard({ h, char, lang }: HeroCardProps) {
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

                    <span
                        className="underline underline-offset-4 decoration-blue-400 text-blue-400 hover:text-red-400 hover:decoration-red-400"
                        title={`Open ${name} character page`}
                    >
                        <CharacterInlineTag name={name} icon={false} />
                    </span>

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

            <p className="mt-3 mb-4 whitespace-pre-line text-sm text-gray-200">{parseText(l(h, 'review', lang))}</p>

            <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="max-w-4xl w-full rounded border border-gray-800 p-4">
                        <h3 className="m-0 text-sm opacity-80 text-center mb-4">{lRec(LABELS.recommendedTargets, lang)}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch divide-y md:divide-y-0 md:divide-x divide-gray-800">
                            <div className="flex flex-col items-center justify-center px-4">
                                <RecoTrans
                                    title="PvE"
                                    description={<TargetDisplay value={h.recommended_pve || "—"} />}
                                    image="/images/ui/nav/pve.png"
                                    type="pve"
                                />
                            </div>

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

                    <div className="rounded-md border border-gray-800 p-3">
                        <h3 className="m-0 text-sm opacity-80">{lRec(LABELS.transcendImpact, lang)}</h3>
                        <ImpactTable impact={h.impact} lang={lang} />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-md border border-gray-800 p-3">
                        <TranscendInline
                            character={char?.Fullname ?? h.name}
                            levels={["4_1"]}
                        />
                    </div>

                    <div className="rounded-md border border-gray-800 p-3">
                        <TranscendInline
                            character={char?.Fullname ?? h.name}
                            levels={["5_1"]}
                        />
                    </div>

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
