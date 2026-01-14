'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from "react"
import classDataRaw from '@/data/class.json'
import eeDataRaw from '@/data/ee.json'
import rawTAGS from '@/data/tags.json'
import { getRarityBg } from '@/utils/gear'

import type { ClassDataMap, StatKey } from '@/types/types'
import type { ExclusiveEquipment } from '@/types/equipment'
import type { Character, Skill, TranscendMap, Lang, LevelId } from '@/types/character'
import { CharacterJsonLdServeur } from '@/app/components/seo';
import slugToCharJson from "@/data/_SlugToChar.json";
import { CharacterNameDisplayBigNoH } from '@/app/components/CharacterNameDisplay'
import RecommendedGearTabs, { RecommendedGearBuild } from "@/app/components/RecommendedGearTabs"
import BuffDebuffDisplay from '@/app/components/BuffDebuffDisplayClient'
import SkillPriorityTabs from '@/app/components/SkillPriorityTabs'
import StatInlineTag from '@/app/components/StatInlineTag'
import GuideIconInline from '@/app/components/GuideIconInline'
import GiftCard from '@/app/components/GiftCard'
import rawProfiles from '@/data/character-profiles.json';
import CharacterProfileDescription from '@/app/components/CharacterProfileDescription'
import TranscendenceSlider from '@/app/components/TranscendenceSlider'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'
import TagDisplayMini from '@/app/components/TagDisplayInline'
import ItemInline from '@/app/components/ItemInline'
import type { PartnerEntry } from '@/types/partners';
import PartnerList from '@/app/components/PartnerList'
import ProsConsSection, { hasProsCons } from '@/app/components/ProsConsSection'
import type { Talisman, Accessory, Weapon, ArmorSet } from '@/types/equipment'

import formatEffectText from '@/utils/formatText'
import { useI18n } from '@/lib/contexts/I18nContext'
import { getAvailableLanguages, type TenantKey } from '@/tenants/config'
import { l, lEnhancement } from '@/lib/localize'
import type { WithLocalizedFields } from '@/types/common'

interface CharNameEntryBase {
    Fullname: string;
    ID?: string;
}
type CharNameEntry = WithLocalizedFields<CharNameEntryBase, 'Fullname'>
type SlugToCharMap = Record<string, CharNameEntry>
const SLUG_TO_CHAR = slugToCharJson as SlugToCharMap;




// Removed: use l() and lRec() from @/lib/localize instead

// ---------- helpers & constants (repris tels quels) ----------
type TagDef = { label: string; image: string; desc: string; type: string }
type TagsMap = Record<string, TagDef>
const TAGS: TagsMap = rawTAGS as TagsMap
const UNIT_TYPE_ORDER = ['premium', 'limited', 'seasonal', 'collab'] as const
type TocSection = { id: string; label: string }

function useSectionObserver(ids: string[]) {
    const [active, setActive] = useState<string>(ids[0] ?? "")
    const observerRef = useRef<IntersectionObserver | null>(null)

    useEffect(() => {
        const els = ids
            .map((id) => document.getElementById(id))
            .filter((el): el is HTMLElement => !!el)

        if (!els.length) return

        observerRef.current?.disconnect()
        observerRef.current = new IntersectionObserver(
            (entries) => {
                // On choisit la section la plus visible dans le viewport
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
                if (visible?.target?.id) setActive(visible.target.id)
            },
            { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
        )

        els.forEach((el) => observerRef.current!.observe(el))
        return () => observerRef.current?.disconnect()
    }, [ids])

    return active
}

function QuickToc({ sections }: { sections: TocSection[] }) {
    const ids = useMemo(() => sections.map((s) => s.id), [sections])
    const active = useSectionObserver(ids)

    return (
        <nav
            aria-label="Page sections"
            className="
        sticky top-4 z-30 mb-6 mx-auto w-fit
        rounded-xl border border-white/10 bg-black/40 backdrop-blur
        px-3 py-2 shadow-sm
      "
        >
            <ul className="flex flex-wrap items-center justify-center gap-2">
                {sections.map((s) => {
                    const isActive = s.id === active
                    return (
                        <li key={s.id}>
                            <a
                                href={`#${s.id}`}
                                onClick={(e) => {
                                    e.preventDefault()
                                    const el = document.getElementById(s.id)
                                    if (el) {
                                        el.scrollIntoView({ behavior: "smooth", block: "start" })
                                        history.replaceState(null, "", `#${s.id}`)
                                    }
                                }}
                                className={[
                                    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm",
                                    "transition ring-1",
                                    isActive
                                        ? "bg-yellow-500/20 text-yellow-300 ring-yellow-400/40"
                                        : "bg-white/5 text-gray-200 hover:bg-white/10 ring-white/10",
                                ].join(" ")}
                            >
                                {s.label}
                            </a>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}


function UnitTypeBadge({ tags }: { tags?: string[] | string }) {
    const all = Array.isArray(tags) ? tags : tags ? [tags] : []
    const unitTypeKeys = all.filter((k) => TAGS[k]?.type === 'unit-type')
    if (unitTypeKeys.length === 0) return null
    const picked = UNIT_TYPE_ORDER.find((k) => unitTypeKeys.includes(k)) ?? unitTypeKeys[0]
    return <TagDisplayMini tags={[picked]} />
}

// Removed: use l() from @/lib/localize instead

const ORDER: LevelId[] = ['1', '2', '3', '4', '4_1', '4_2', '5', '5_1', '5_2', '5_3', '6'];

function pickTranscendForLang(
    t: TranscendMap | undefined,
    lang: Lang
): Record<LevelId, string | null> {
    const src = t ?? {};
    const out = {} as Record<LevelId, string | null>;

    for (const k of ORDER) {
        out[k] = l(src as Record<string, unknown>, k, lang) as string | null;
    }
    return out;
}

// Removed: use l() from @/lib/localize instead

function splitChainDual(desc: string) {
    const marker = /<color=#ffd732>[^<]+<\/color>\s*:\s*/gi
    const matches = [...desc.matchAll(marker)]

    if (matches.length < 2) {
        // Si on n’a qu’un seul bloc => tout est "chain"
        return { chain: desc.trim(), dual: '' }
    }

    const splitIndex = matches[1].index ?? 0

    // ✅ On garde le <color=...>Assist Effect</color> complet dans dual
    const chain = desc.slice(0, splitIndex).trim()
    const dual = desc.slice(splitIndex).trim()

    return { chain, dual }
}

function getEEText(
    ee: ExclusiveEquipment,
    base: 'effect' | 'effect10',
    langKey: TenantKey
): string | undefined {
    const value = l(ee as Record<string, unknown>, base, langKey);
    return typeof value === 'string' ? value : undefined; // évite buff/debuff (string[])
}

function getRoleBadge(role?: string) {
    if (!role) return null
    const label: Record<string, string> = { dps: 'DPS', support: 'Support', sustain: 'Sustain' }
    const color: Record<string, string> = {
        dps: 'bg-rose-600/70', support: 'bg-sky-600/70', sustain: 'bg-emerald-600/70',
    }
    if (!label[role]) return null
    return { label: label[role], className: color[role] }
}

function toKebabCase(str: string): string {
    return str
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
}

// Demote rank for 1-2 star characters in PvE (same logic as TierListPVE)
const RANKS_PVE = ['S', 'A', 'B', 'C', 'D', 'E'] as const
type PveRank = (typeof RANKS_PVE)[number]

function demoteOnce(rank: string): PveRank {
    const i = RANKS_PVE.indexOf((rank as PveRank) ?? 'E')
    return RANKS_PVE[Math.min(i < 0 ? RANKS_PVE.length - 1 : i + 1, RANKS_PVE.length - 1)]
}
// Removed: use l() from @/lib/localize instead

// helper local (type-guard) — à mettre au dessus de l’usage
type BurnCard = { level: number; cost: number; effect: string }
function getBurns(s?: Skill): BurnCard[] {
    const be = s?.burnEffect as unknown
    if (!be) return []
    if (Array.isArray(be)) {
        // si jamais ton JSON est déjà un array
        return be as BurnCard[]
    }
    if (typeof be === 'object') {
        return Object.values(be as Record<string, BurnCard>)
    }
    return []
}

// ---------- composant ----------
export default function CharacterDetailClient({ character, slug, langKey, recoData, partners, weapons, amulets, talismans, sets }: {
    character: Character
    slug: string
    langKey: TenantKey
    recoData: Record<string, unknown> | null
    partners: PartnerEntry[]
    weapons: Weapon[]
    amulets: Accessory[]
    talismans: Talisman[]
    sets: ArmorSet[]
}) {
    const { t } = useI18n()

    type LocalizedString = Partial<Record<TenantKey, string>>
    type CharacterProfile = {
        birthday?: string
        height?: string
        weight?: string
        story?: LocalizedString
    }


    const classData = classDataRaw as ClassDataMap
    const eeData = eeDataRaw as Record<string, ExclusiveEquipment>
    const characterProfiles = rawProfiles as Record<string, CharacterProfile>

    const classInfo = classData[character.Class as keyof typeof classData]
    const subclassInfo = classInfo?.subclasses?.[character.SubClass as keyof typeof classInfo.subclasses]
    const baseStats = subclassInfo?.[`stats${character.Rarity}`]
    const statLabels = [
        t('SYS_STAT_HP'),
        t('SYS_STAT_DEF'),
        t('SYS_STAT_EVA'),
        t('SYS_STAT_ACC'),
        t('SYS_STAT_SPD'),
        t('SYS_STAT_ATK'),
    ]


    const ee = eeData[toKebabCase(character.Fullname)]
    const profile = characterProfiles[character.Fullname]
    const jobTitle = [character.Class, character.SubClass].filter(Boolean).join(' ')
    const skills = [
        character.skills.SKT_FIRST?.name,
        character.skills.SKT_SECOND?.name,
        character.skills.SKT_ULTIMATE?.name,
    ].filter((s): s is string => Boolean(s))
    const roleBadge = getRoleBadge(character.role)


    const heroSlug = toKebabCase(character.Fullname)
    const showProsCons = hasProsCons(heroSlug)


    // util local (comme avant)
    function renderMainStat(stat: string) {
        return (
            <div className="text-sm italic text-gray-300 flex items-center gap-2">
                <span className="font-semibold text-white">{t('main_stat')}</span>
                <span>{stat}</span>
            </div>
        )
    }

    /** Récupère les enhancements localisés pour un skill */
    function getLocalizedEnhancements(skill: Skill | undefined): Record<string, string[]> {
        if (!skill?.enhancement) return {}
        const rawEnh = skill.enhancement as unknown as Record<string, string[]>
        return lEnhancement(rawEnh, langKey) ?? {}
    }

    const ln = (s?: Skill) => (s ? l(s, 'name', langKey) : undefined);
    const localizedTranscend = pickTranscendForLang(character.transcend, langKey);
    const hasVideo = typeof character.video === 'string' && character.video.trim().length > 0

    // --- Sommaire : ordre et libellés (i18n-friendly) ---
    const SECTIONS: { id: string; label: string }[] = [
        { id: "overview", label: t("toc.overview", { defaultValue: "Overview" }) },
        baseStats && { id: "base-stats", label: t("toc.base_stats", { defaultValue: "Base Stats" }) },
        (ee || character.transcend) && { id: "ee-transcend", label: t("toc.ee_transcend", { defaultValue: "EE & Transcend" }) },
        { id: "skills", label: t("toc.skills", { defaultValue: "Skills" }) },
        // (optionnel) 
        showProsCons && { id: "pros-cons", label: t("toc.pros_cons", { defaultValue: "Pros & Cons" }) },

        // hasBurn && { id: "burn", label: t("toc.burn", { defaultValue: "Burn Cards" }) },
        character.skills?.SKT_CHAIN_PASSIVE && { id: "chain-dual", label: t("toc.chain_dual", { defaultValue: "Chain & Dual" }) },
        partners.length > 0 && { id: "partners", label: t("toc.partners", { defaultValue: "Partners" }) },
        { id: "gear", label: t("toc.gear", { defaultValue: "Recommended Gear" }) },
        hasVideo && { id: "video", label: t("toc.video", { defaultValue: "Official Video" }) },
    ].filter(Boolean) as { id: string; label: string }[]

    return (
        <>

            <CharacterJsonLdServeur
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "VideoGame",
                    name: "Outerplane",
                    url: "https://outerpedia.com",
                    character: {
                        "@type": "Person",
                        name: character.Fullname,
                        description: `${character.Element} ${character.Class} ${character.Fullname} overview — skill breakdown, ranking, exclusive equipment, and more.`,
                        image: `https://outerpedia.com/images/characters/atb/IG_Turn_${character.ID}.webp`,
                        url: `https://outerpedia.com/characters/${slug}`,
                        birthDate: profile?.birthday,
                        height: profile?.height,
                        weight: profile?.weight,
                        jobTitle: jobTitle,
                        skills: skills
                    },
                    mainEntityOfPage: {
                        "@type": "WebPage",
                        "@id": `https://outerpedia.com/characters/${slug}`
                    }
                }}
            />

            {/* Flèche retour */}
            <div className="relative top-4 left-4 z-20 h-[32px] w-[32px]">
                <Link href={`/characters`} className="relative block h-full w-full">
                    <Image
                        src="/images/ui/CM_TopMenu_Back.webp"
                        alt={t('back')}
                        fill
                        sizes="32px"
                        className="opacity-80 hover:opacity-100 transition-opacity"
                    />
                </Link>
            </div>

            {/* Core Fusion Work in Progress Banner */}
            {character.fusionType === 'core-fusion' && (
                <div className="max-w-6xl mx-auto px-6 pt-6">
                    <div className="px-4 py-3 bg-yellow-900/30 border border-yellow-500/50 rounded-lg text-yellow-200 text-sm">
                        <p className="font-semibold">
                            ⚠️ {t('core_fusion.wip_notice', { defaultValue: 'This Core Fusion character page is still under development. Some information may be incomplete or subject to change.' })}
                        </p>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto p-6">
                {/* Partie haute : illustration + infos principales */}
                <section id="overview">
                    <CharacterNameDisplayBigNoH fullname={l(character, 'Fullname', langKey)} />
                    <div className="mt-3 flex justify-center">
                        <QuickToc sections={SECTIONS} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[400px_1fr] gap-6">
                        {/* Illustration du personnage */}
                        <div className="relative rounded overflow-hidden shadow mt-10">
                            <Image
                                src={`/images/characters/full/IMG_${character.ID}.webp`}
                                alt={character.Fullname}
                                width={360}
                                height={400}
                                priority
                                style={{ width: 360, height: 400, maxHeight: 400, maxWidth: 360 }}
                                className="object-contain"
                            />
                        </div>


                        {/* Détails à droite : nom, rareté, classe, etc. */}
                        <div className="space-y-4">
                            {/* Rareté sous forme d'étoiles */}
                            <div className="flex items-center gap-2">
                                {[...Array(character.Rarity)].map((_, i) => (
                                    <Image key={i} src="/images/ui/star.webp" alt="star" width={20} height={20} style={{ width: 20, height: 20 }} />
                                ))}
                            </div>

                            {/* Élément, Classe, Sous-classe */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    <Image src={`/images/ui/elem/${character.Element.toLowerCase()}.webp`} alt={character.Element} width={24} height={24} style={{ width: 24, height: 24 }} />
                                    <span className="text-base">{t(`SYS_ELEMENT_NAME_${character.Element.toUpperCase()}`)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Image src={`/images/ui/class/${character.Class.toLowerCase()}.webp`} alt={character.Class} width={24} height={24} style={{ width: 24, height: 24 }} />
                                    <span className="text-base">
                                        {t(`SYS_CLASS_${character.Class.toUpperCase()}`, {
                                            defaultValue: character.Class
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Image src={`/images/ui/class/${character.SubClass.toLowerCase()}.webp`} alt={character.SubClass} width={24} height={24} style={{ width: 24, height: 24 }} />
                                    <span className="text-base">
                                        {t(`SYS_CLASS_NAME_${character.SubClass.toUpperCase()}`, {
                                            defaultValue: character.SubClass
                                        })}
                                    </span>
                                </div>

                                <div className="mt-2 mb-3 flex flex-wrap items-center gap-2">
                                    <span><UnitTypeBadge tags={character.tags} /></span>
                                    {roleBadge && (
                                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm text-white ring-1 ring-white/10 ${roleBadge.className}`}>
                                            <span>{roleBadge.label}</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                            {/* Voice Actor */}
                            {(() => {
                                const voiceActor = l(character, 'VoiceActor', langKey)
                                const languages = getAvailableLanguages()
                                const hasVoiceActor = voiceActor || languages.some((lang: TenantKey) =>
                                    l(character, 'VoiceActor', lang)
                                )

                                if (!hasVoiceActor) return null

                                const displayVoiceActor = voiceActor || languages
                                    .map((lang: TenantKey) => l(character, 'VoiceActor', lang))
                                    .find((v: string | undefined) => v)

                                return (
                                    <div className="mt-2 p-2 rounded">
                                        <div className="text-sm text-white/80 max-w-2xl mx-auto">
                                            <span>🎤 <strong className="text-white">{t('characters.profile.voice_actor')}:</strong> {displayVoiceActor}</span>
                                        </div>
                                    </div>
                                )
                            })()}

                            {/* Core Fusion info or Character Profile */}
                            {character.fusionType === 'core-fusion' && character.originalCharacter ? (
                                <div className="mt-2 p-4 rounded bg-purple-900/30 border border-purple-500/50">
                                    <div className="flex items-center gap-3">
                                        <Image
                                            src="/images/ui/CM_Skill_Icon_Burst.webp"
                                            alt="Core Fusion"
                                            width={32}
                                            height={32}
                                            className="object-contain"
                                        />
                                        <div className="flex-1">
                                            <p className="text-lg font-semibold text-purple-300 mb-1">
                                                {t('core_fusion.title', { defaultValue: 'Core Fusion Character' })}
                                            </p>
                                            <p className="text-sm text-gray-300">
                                                {t('core_fusion.base_character', { defaultValue: 'Base Character' })}:{' '}
                                                {(() => {
                                                    const originalSlug = Object.entries(SLUG_TO_CHAR).find(
                                                        ([, char]) => char.ID === character.originalCharacter
                                                    )?.[0];

                                                    if (originalSlug) {
                                                        const originalChar = SLUG_TO_CHAR[originalSlug];
                                                        return (
                                                            <Link
                                                                href={`/characters/${originalSlug}`}
                                                                className="text-purple-400 hover:text-purple-300 underline font-semibold"
                                                            >
                                                                {l(originalChar, 'Fullname', langKey)}
                                                            </Link>
                                                        );
                                                    }
                                                    return character.originalCharacter;
                                                })()}
                                            </p>
                                            {character.fusionRequirements && (
                                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                    <span>{t('core_fusion.requirements', { defaultValue: 'Requires' })}: T{character.fusionRequirements.transcendence}</span>
                                                    {character.fusionRequirements.material && (
                                                        <>
                                                            <span>+</span>
                                                            <ItemInline names={character.fusionRequirements.material.id} text={false} size={20} />
                                                            <span className="font-semibold">×{character.fusionRequirements.material.quantity}</span>
                                                        </>
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-2 p-2 rounded">
                                    <CharacterProfileDescription fullname={character.Fullname} lng={langKey} />
                                </div>
                            )}



                            {/* Statistiques + descriptions de classe + base stats */}
                            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
                                <div className="relative p-2 rounded text-sm w-fit h-fit">
                                    {subclassInfo?.image ? (
                                        <div className="relative mx-auto">
                                            <Image
                                                src={subclassInfo.image}
                                                alt={character.SubClass}
                                                width={200}
                                                height={200}
                                                style={{ width: 200, height: 200 }}
                                                className="object-contain"
                                            />
                                            {statLabels.map((label, index) => {
                                                const angle = (index / statLabels.length) * 2 * Math.PI - Math.PI / 2
                                                let labelRadius = 120
                                                if (label === t('SYS_STAT_HP') || label === t('SYS_STAT_ACC')) labelRadius = 110
                                                const x = 100 + Math.cos(angle) * labelRadius
                                                const y = 100 + Math.sin(angle) * labelRadius
                                                return (
                                                    <div
                                                        key={index}
                                                        className="absolute text-[12px] text-center text-white whitespace-nowrap"
                                                        style={{ left: `${x}px`, top: `${y}px`, transform: 'translate(-50%, -50%)' }}
                                                    >
                                                        {label}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <p>{t('no_subclass_image')}</p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-4 w-fit">
                                    <div className="p-2 rounded text-sm">
                                        <p className="font-semibold">
                                            {t('class_effects_details', { class: t(`SYS_CLASS_${character.Class.toUpperCase()}`) })}
                                        </p>
                                        <p className="whitespace-pre-line">
                                            {t(`SYS_CLASS_PASSIVE_${character.Class.toUpperCase()}`, {
                                                defaultValue: t('no_class_description')
                                            }).replace(/([。\.])\s*/g, '$1\n')}
                                        </p>


                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {showProsCons && <ProsConsSection slug={heroSlug} />}




                {/* Base Stats */}
                {baseStats && (() => {
                    const entries = Object.entries(baseStats)
                    return (
                        <section id="base-stats">
                            <div>
                                <div className="mt-6 px-4 py-2 bg-yellow-800/50 border-l-4 border-yellow-400 rounded text-yellow-300 text-sm italic">
                                    {t('characters.basestats.note')}{' '}
                                    <GuideIconInline name='CM_Evolution_05' text={t('characters.basestats.stage6')} size={20} />.
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-sm text-white mt-5 m-auto">
                                    {entries.map(([key, value]) => {
                                        const upperKey = key.toUpperCase() as StatKey
                                        return (
                                            <div key={key} className="flex items-center gap-2 px-2 py-1 bg-black/30 rounded">
                                                <StatInlineTag name={upperKey} abbr={true} />
                                                <span className="text-white mt-1">{key === 'chc' || key === 'chd' ? `${value}%` : value}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </section>
                    )
                })()}

                {(ee || character.transcend) && (
                    <section id="ee-transcend" className="mt-8 text-white flex flex-col gap-4 items-start">
                        <div className="flex flex-wrap md:flex-nowrap gap-4 w-full items-start">
                            {/* EE à gauche */}
                            {ee && (
                                <div className="flex flex-col md:flex-row rounded p-4 shadow hover:shadow-lg transition relative w-full md:w-[500px] min-w-[320px]">
                                    <div className="flex flex-col items-center md:items-start w-full md:w-[140px] min-w-[140px] rounded shadow hover:shadow-lg transition relative">
                                        {/* Image EE */}
                                        <div
                                            id="ee"
                                            className="w-[120px] h-[120px] relative shrink-0 rounded overflow-hidden"
                                            style={{
                                                backgroundImage: `url(${getRarityBg()})`,
                                                backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
                                            }}
                                        >
                                            <Image
                                                src={`/images/characters/ex/${toKebabCase(character.Fullname)}.webp`}
                                                alt={`${character.Fullname} Exclusive Equipment`}
                                                fill sizes="120px" className="object-contain p-2"
                                            />
                                        </div>

                                        {/* GiftCard sous l’image */}
                                        {character.gift && (
                                            <div className="mt-2 flex flex-col gap-1">
                                                <p className="text-sm font-semibold text-white text-center underline">
                                                    <GuideIconInline name="CM_Goods_FriendPoint" text={t('preferred_gift')} />
                                                </p>
                                                <div className="mx-auto">
                                                    <GiftCard category={character.gift} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {/*EE */}
                                    <div className="flex flex-col gap-2">
                                        <p className="text-lg font-semibold">{l(ee, 'name', langKey)}</p>
                                        {renderMainStat(l(ee, 'mainStat', langKey))}

                                        <div className="text-sm text-gray-300 flex flex-col gap-2">
                                            {ee.icon_effect && (
                                                <div className="bg-gray-500/80 rounded-full px-3 py-1 flex items-center gap-2 w-fit">
                                                    <Image
                                                        src={`/images/ui/effect/${ee.icon_effect}.webp`}
                                                        alt={ee.icon_effect}
                                                        width={20} height={20} style={{ width: 20, height: 20 }} className="object-contain"
                                                    />
                                                    <span className="text-sm font-semibold text-white">
                                                        {t('exclusive_equipment_title', { name: l(character, 'Fullname', langKey) })}
                                                    </span>
                                                </div>
                                            )}


                                            <p>
                                                <span className="font-semibold text-white">{t('effect_label')}</span>{' '}
                                                {formatEffectText(getEEText(ee, 'effect', langKey) ?? ee.effect ?? '—')}
                                            </p>

                                            {(() => {
                                                const eff10 = getEEText(ee, 'effect10', langKey) ?? ee.effect10;
                                                return eff10 ? (
                                                    <p>
                                                        <span className="font-semibold text-white">{t('effect_lv10_label')}</span>{' '}
                                                        {formatEffectText(eff10)}
                                                    </p>
                                                ) : null;
                                            })()}

                                            {(ee.buff || ee.debuff) && (
                                                <div className="mt-2">
                                                    <BuffDebuffDisplay buffs={ee.buff} debuffs={ee.debuff} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Colonne à droite : Tier + Priority + Transcend */}
                            <div className="flex flex-col gap-4 w-full md:w-auto">
                                <div className="flex gap-4">
                                    {/* EE Priority */}
                                    <div className="border border-gray-600 rounded-md p-4 w-[122px] h-[100px] flex flex-col justify-center items-center">
                                        <p className="font-semibold text-white mb-2 text-center">{t('ee_priority')}</p>
                                        {ee?.rank ? (
                                            <Image src={`/images/ui/IG_Event_Rank_${ee.rank}.webp`} alt={`EE Rank ${ee.rank}`} width={32} height={32} style={{ width: 32, height: 32 }} className="object-contain" />
                                        ) : <p className="text-gray-400 italic text-center">Coming soon...</p>}
                                    </div>
                                    {/* PvE */}
                                    <div className="border border-gray-600 rounded-md p-4 w-[122px] h-[100px] flex flex-col justify-center items-center">
                                        <p className="font-semibold text-white mb-2 text-center">{t('pve_tier')}</p>
                                        {character.rank ? (() => {
                                            const effectiveRank = character.Rarity <= 2 ? demoteOnce(character.rank) : character.rank;
                                            return <Image src={`/images/ui/IG_Event_Rank_${effectiveRank}.webp`} alt={`Rank ${effectiveRank}`} width={32} height={32} style={{ width: 32, height: 32 }} className="object-contain" />;
                                        })() : <p className="text-gray-400 italic text-center">{t('not_available')}</p>}
                                    </div>
                                    {/* PvP */}
                                    <div className="border border-gray-600 rounded-md p-4 w-[122px] h-[100px] flex flex-col justify-center items-center">
                                        <p className="font-semibold text-white mb-2">{t('pvp_tier')}</p>
                                        {character.rank_pvp ? (
                                            <Image src={`/images/ui/IG_Event_Rank_${character.rank_pvp}.webp`} alt={`Rank ${character.rank_pvp}`} width={32} height={32} style={{ width: 32, height: 32 }} className="object-contain" />
                                        ) : <p className="text-gray-400 italic text-center">{t('not_available')}</p>}
                                    </div>
                                </div>

                                {character.transcend && (
                                    <div className="w-full md:w-[400px] min-w-[320px]">
                                        <TranscendenceSlider transcendData={localizedTranscend} lang={langKey} t={t} rarity={character.Rarity} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                <div className="mt-6 px-4 py-2 bg-yellow-800/50 border-l-4 border-yellow-400 rounded text-yellow-300 text-sm italic">
                    {t('skills_note')}
                </div>

                {/* Core Fusion Levels */}
                {character.fusionType === 'core-fusion' && character.fusionLevels && character.fusionLevels.length > 0 && (
                    <section className="mt-8">
                        <h2 className="text-2xl font-bold text-white mb-4 text-center">
                            {t('core_fusion.fusion_levels', { defaultValue: 'Core Fusion Levels' })}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {character.fusionLevels.map((fusionLevel) => (
                                <div
                                    key={fusionLevel.level}
                                    className="bg-black/30 border border-purple-500/30 rounded-lg p-4"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-purple-600/30 text-purple-300 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                                                {fusionLevel.level}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-semibold text-purple-300 truncate">
                                                    {(() => {
                                                        const originalSlug = Object.entries(SLUG_TO_CHAR).find(
                                                            ([, char]) => char.ID === character.originalCharacter
                                                        )?.[0];
                                                        const originalChar = originalSlug ? SLUG_TO_CHAR[originalSlug] : null;
                                                        const baseName = originalChar ? l(originalChar, 'Fullname', langKey) : '';

                                                        return `${baseName} ${t('core_fusion.core_fusion_short', { defaultValue: 'Core Fusion' })} ${t('level', { defaultValue: 'Lv' })} ${fusionLevel.level}`;
                                                    })()}
                                                </h3>
                                                <p className="text-xs text-gray-400 whitespace-pre-line">
                                                    {fusionLevel.level === 5
                                                        ? t('core_fusion.skill_lv_max', { defaultValue: 'Skill Lv Max\nCore-Fused Passive Lv Max' })
                                                        : `Skill ${t('level', { defaultValue: 'Lv' })} ${fusionLevel.level}`
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        {/* Required Item */}
                                        {fusionLevel.requireItemID && (
                                            <div className="flex items-center gap-1">
                                                <ItemInline names={fusionLevel.requireItemID} text={false} size={28} />
                                                <span className="text-white font-bold text-base">×{fusionLevel.level === 1 ? '300' : '150'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Section des 3 skills */}
                <section id="skills">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        {[character.skills.SKT_FIRST, character.skills.SKT_SECOND, character.skills.SKT_ULTIMATE].filter((s): s is Skill => Boolean(s))
                            .map((skill, index) => (
                                <div key={index} className="p-4 rounded text-white">
                                    {/* Header : icône + nom + WGR + CD */}
                                    <div className="flex items-start gap-2 mb-2">
                                        <div className="relative w-12 h-12 shrink-0">
                                            <Image
                                                src={`/images/characters/skills/${skill.IconName}.webp`}
                                                alt={l(skill, 'name', langKey)}
                                                width={48} height={48} className="object-contain w-12 h-12"
                                            />
                                            {skill.burnEffect && Object.keys(skill.burnEffect).length > 0 && (
                                                <div className="absolute top-0 left-0 bg-black text-white text-xs font-bold px-1 rounded-full border border-white">B</div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-lg font-semibold">{l(skill, 'name', langKey)}</p>
                                            <p className="text-sm text-gray-400 italic mb-1">
                                                {t('weakness_gauge_reduction')}: {skill.wgr ?? '—'}<br />
                                                {t('cooldown')}: {skill.cd ? `${skill.cd} ${t('turn_s')}` : '—'}
                                            </p>
                                            <BuffDebuffDisplay buffs={skill.buff} debuffs={skill.debuff} />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="text-sm text-gray-200 whitespace-pre-line">
                                        {formatEffectText(l(skill, 'true_desc', langKey) || '—')}
                                    </div>

                                    {/* Enhancement */}
                                    {skill.enhancement && (
                                        <div className="mt-3 text-xs text-gray-300 border-t border-gray-600 pt-2">
                                            <p className="font-bold mb-1">{t('enhancements_label')}</p>
                                            <div className="space-y-2">
                                                {(() => {
                                                    const enh = getLocalizedEnhancements(skill)
                                                    const levels = Object.keys(enh)
                                                        .filter(k => /^\d+$/.test(k))
                                                        .sort((a, b) => Number(a) - Number(b))

                                                    return levels.map(level => {
                                                        const lines = enh[level]
                                                        if (!lines || !lines.length) return null
                                                        return (
                                                            <div key={level} className="flex gap-2">
                                                                <div className="w-10 font-bold text-white flex-shrink-0">+{parseInt(level, 10)}:</div>
                                                                <div className="text-gray-300 whitespace-pre-wrap flex-1">
                                                                    {lines.map((line: string, i: number) => <div key={i}>{formatEffectText(line)}</div>)}
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                        {/* Placeholder si skill manquant */}
                        {Array.from({ length: 3 - Object.values(character.skills || {}).length }).map((_, i) => (
                            <div key={`empty-${i}`} className="bg-gray-800 p-4 rounded text-center text-gray-500">
                                {t('no_skill')}
                            </div>
                        ))}
                    </div>
                </section>


                {/* Section burn + chain/dual attack */}

                <div className="flex flex-col gap-6 mt-6">

                    {/* Burn cards centrées */}
                    <section id="burn" className="mt-6">
                        <div className="flex justify-center">
                            <div className="flex flex-wrap justify-center gap-2">
                                {(() => {
                                    const entries = Object.entries(character.skills || {}) as [string, Skill][]
                                    // trouve le premier skill qui possède des burns
                                    const skillWithBurnEntry = entries.find(([, s]) => getBurns(s).length > 0)
                                    if (!skillWithBurnEntry) return null

                                    const [, skillWithBurn] = skillWithBurnEntry
                                    const burns = getBurns(skillWithBurn).sort((a, b) => a.level - b.level)

                                    return (
                                        <div className="flex justify-center gap-6 items-center">
                                            {/* Colonne gauche : icône + nom du skill */}
                                            <div className="flex flex-col items-center gap-2 relative w-16 h-16">
                                                <Image
                                                    src={`/images/characters/skills/${skillWithBurn.IconName}.webp`}
                                                    alt={l(skillWithBurn, 'name', langKey)}
                                                    width={48} height={48} className="object-contain"
                                                />
                                                <Image
                                                    src="/images/ui/CM_Skill_Icon_Burst.webp"
                                                    alt="Burn icon"
                                                    width={20} height={20}
                                                    className="absolute top-0 left-0 w-5 h-5 z-10 pointer-events-none"
                                                />
                                                <span className="text-sm font-semibold text-white text-center mt-1">
                                                    {l(skillWithBurn, 'name', langKey)}
                                                </span>
                                            </div>

                                            {/* Cartes burn */}
                                            <div className="flex flex-wrap justify-center gap-2">
                                                {burns.map((burn) => (
                                                    <div
                                                        key={burn.level}
                                                        className="relative w-[185px] h-[262px] bg-cover bg-center rounded overflow-hidden text-white transform transition-transform duration-200 hover:scale-105 hover:shadow-lg hover:ring-[1px] hover:ring-yellow-400 hover:ring-offset-[0.2px] cursor-pointer"
                                                        style={{ backgroundImage: `url(/images/ui/Burst${burn.level}.webp)` }}
                                                    >
                                                        <div className="absolute top-2.5 right-2.5 text-[15px] font-bold rounded-full flex items-center justify-center" style={{ width: '26px', height: '26px' }}>
                                                            {burn.cost}
                                                        </div>
                                                        <div
                                                            className="absolute text-center text-[11px] leading-snug text-white drop-shadow-md"
                                                            style={{
                                                                top: '125px', left: '20.5px', width: '139px', height: '109px', overflow: 'hidden',
                                                                display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3,
                                                            }}
                                                        >
                                                            <div className="flex items-center justify-center w-full h-full text-center">
                                                                {formatEffectText(l(burn, 'effect', langKey))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })()}

                            </div>
                        </div>

                        {/* Skill Priority & Sweetspots */}
                        {character.skill_priority && (
                            <SkillPriorityTabs
                                priority={character.skill_priority}
                                skillNames={{
                                    First: ln(character.skills.SKT_FIRST),
                                    Second: ln(character.skills.SKT_SECOND),
                                    Ultimate: ln(character.skills.SKT_ULTIMATE),
                                }}
                                skillIcons={{
                                    First: character.skills.SKT_FIRST?.IconName,
                                    Second: character.skills.SKT_SECOND?.IconName,
                                    Ultimate: character.skills.SKT_ULTIMATE?.IconName,
                                }}
                            />
                        )}
                    </section>

                    {/* Chain & Dual */}
                    {character.skills?.SKT_CHAIN_PASSIVE && (() => {
                        const s = character.skills.SKT_CHAIN_PASSIVE
                        const localizedDesc = l(s, 'true_desc', langKey)
                        const { chain, dual } = splitChainDual(localizedDesc)

                        return (
                            <section id="chain-dual" className="mt-6">
                                <div className="flex flex-col gap-6 text-white">
                                    <div className="flex gap-4 items-start">
                                        <div className="w-16 h-16 shrink-0">
                                            <Image
                                                src={`/images/characters/chain/Skill_ChainPassive_${character.Element}_${character.Chain_Type}.webp`}
                                                alt={`Chain icon for ${character.Element} ${character.Chain_Type}`}
                                                width={64} height={64} className="object-contain"
                                            />
                                        </div>

                                        <div>
                                            <p className="font-semibold mb-1">{t('chain_dual_title')}</p>

                                            <p className="text-sm text-gray-400 italic mb-1">
                                                {t('weakness_gauge_reduction')} : {s.wgr ?? '—'}
                                            </p>

                                            <BuffDebuffDisplay buffs={s.buff} debuffs={s.debuff} />

                                            {/* CHAIN part */}
                                            <div className="text-sm text-gray-200 whitespace-pre-line mt-1">
                                                {formatEffectText(chain || '—')}
                                            </div>

                                            {/* DUAL part */}
                                            <div className="flex gap-4 items-start mt-2">
                                                <div>
                                                    <p className="text-sm text-gray-400 italic mb-1">
                                                        {t('weakness_gauge_reduction')} : {s.wgr_dual ?? '—'}
                                                    </p>

                                                    <BuffDebuffDisplay
                                                        buffs={Array.isArray(s.dual_buff) ? s.dual_buff : s.dual_buff ? [s.dual_buff] : []}
                                                        debuffs={Array.isArray(s.dual_debuff) ? s.dual_debuff : s.dual_debuff ? [s.dual_debuff] : []}
                                                    />

                                                    <div className="text-sm text-gray-200 whitespace-pre-line mt-1">
                                                        {formatEffectText(dual || '—')}
                                                    </div>

                                                    {s.enhancement && (
                                                        <div className="mt-3 text-xs text-gray-300 border-t border-gray-600 pt-2">
                                                            <p className="font-bold mb-1">{t('enhancements_label')}</p>
                                                            <div className="space-y-2">
                                                                {(() => {
                                                                    const enh = getLocalizedEnhancements(s)
                                                                    const levels = Object.keys(enh)
                                                                        .filter(k => /^\d+$/.test(k))
                                                                        .sort((a, b) => Number(a) - Number(b))

                                                                    return levels.map(level => {
                                                                        const lines = enh[level]
                                                                        if (!lines || !lines.length) return null
                                                                        return (
                                                                            <div key={level} className="flex gap-2">
                                                                                <div className="w-10 font-bold text-white flex-shrink-0">+{parseInt(level, 10)}:</div>
                                                                                <div className="text-gray-300 whitespace-pre-wrap flex-1">
                                                                                    {lines.map((line: string, i: number) => (<div key={i}>{formatEffectText(line)}</div>))}
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    })
                                                                })()}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )
                    })()}

                </div>

                {/* Partners */}
                <PartnerList partners={partners} />



                {/* Gear */}
                <section id="gear" className="mt-6">
                    <h2 className="text-2xl font-bold text-white mb-4 text-center">
                        {t('recommended_build_and_gear')}
                    </h2>
                    {recoData ? (
                        <RecommendedGearTabs
                            character={{ builds: recoData as Record<string, RecommendedGearBuild> }}
                            weapons={weapons}
                            amulets={amulets}
                            talismans={talismans}
                            sets={sets}
                        />

                    ) : (
                        <p className="text-sm text-gray-400 text-center italic">
                            {t('no_reco_gear')}
                        </p>
                    )}
                </section>

                {/* Vidéo */}
                {character.video && (
                    <section id="video" className="mt-6">
                        <h2 className="text-2xl font-bold text-white mb-4 text-center">{t('official_video')}</h2>
                        <YoutubeEmbed videoId={character.video} title={`Skill video of ${character.Fullname}`} />
                    </section>
                )}
            </div>
        </>
    )
}