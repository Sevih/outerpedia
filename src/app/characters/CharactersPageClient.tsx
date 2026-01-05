'use client'

import { useEffect, useState, useRef, useMemo, useDeferredValue } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import type { CharacterLite } from '@/types/types'
import { toKebabCase } from '@/utils/formatText'
import {
  type ElementType, type ClassType, type RoleType, type SkillKey,
  ELEMENTS as ELEMENTS_ENUM, CLASSES as CLASSES_ENUM, CHAIN_TYPES, CHAIN_TYPE_LABELS,
  RARITIES as RARITIES_ENUM, ROLES, GIFTS as GIFTS_ENUM, GIFT_LABELS, SKILL_SOURCES
} from '@/types/enums'
import type { WithLocalizedFields } from '@/types/common'
import { groupEffects } from '@/utils/groupEffects'
import SearchBar from '@/app/components/SearchBar'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import LZString from 'lz-string'
import { EL, CL, CH, GF, EL_INV, CL_INV, CH_INV, GF_INV } from '@/data/filterCodes'
import effectsIndex from '@/data/effectsIndex.json'
import type { TenantKey } from '@/tenants/config'
import { getAvailableLanguages } from '@/tenants/config'
import { useI18n } from '@/lib/contexts/I18nContext'
import { l } from '@/lib/localize'

// Type for buff/debuff data structure
type BaseEffectFullData = {
  name: string
  category?: string
  group?: string
  label: string
  description: string
  icon: string
}
type EffectFullData = WithLocalizedFields<WithLocalizedFields<BaseEffectFullData, 'label'>, 'description'>

// Type for effect categories data structure
type BaseEffectCategory = {
  label: string
  description: string
}
type EffectCategory = WithLocalizedFields<WithLocalizedFields<BaseEffectCategory, 'label'>, 'description'>

type EffectCategoriesData = {
  buff: Record<string, EffectCategory>
  debuff: Record<string, EffectCategory>
}

type RecruitBadge = { src: string; altKey: string }

function getRecruitBadge(char: CharacterLite): RecruitBadge | null {
  const tags = new Set(char.tags ?? [])

  // Priorité : Collab > Seasonal > Premium > Limited (fallback)
  if (tags.has('collab')) {
    return { src: "/images/ui/CM_Recruit_Tag_Collab.webp", altKey: 'collab' }
  }
  if (tags.has('seasonal')) {
    return { src: "/images/ui/CM_Recruit_Tag_Seasonal.webp", altKey: 'seasonal' }
  }
  if (tags.has('premium')) {
    return { src: "/images/ui/CM_Recruit_Tag_Premium.webp", altKey: 'premium' }
  }
  if (tags.has('free')) {
    return { src: "/images/ui/CM_Recruit_Tag_Free.webp", altKey: 'free' }
  }
  if (char.limited) {
    return { src: "/images/ui/CM_Recruit_Tag_Fes.webp", altKey: 'limited' }
  }
  return null
}


// ===== Helpers for effect lookup
const buffToId: Record<string, number> = effectsIndex.buffs
const debuffToId: Record<string, number> = effectsIndex.debuffs
const idToBuff = Object.fromEntries(Object.entries(buffToId).map(([k, v]) => [v, k])) as Record<number, string>
const idToDebuff = Object.fromEntries(Object.entries(debuffToId).map(([k, v]) => [v, k])) as Record<number, string>


// ===== Dynamic components
const CharacterNameDisplay = dynamic(() => import('@/app/components/CharacterNameDisplay').then(m => m.CharacterNameDisplay))
const BuffDebuffDisplayMini = dynamic(() => import('@/app/components/BuffDebuffDisplayMini').then(m => m.default))
const TagDisplayMini = dynamic(() => import('@/app/components/TagDisplayMini').then(m => m.default))
const ElementIcon = dynamic(() => import('@/app/components/ElementIcon').then(m => m.ElementIcon))
const ClassIcon = dynamic(() => import('@/app/components/ClassIcon').then(m => m.ClassIcon))

type BaseTagMeta = { label: string; image: string; desc: string; type: string }
type TagMeta = WithLocalizedFields<WithLocalizedFields<BaseTagMeta, 'label'>, 'desc'>

// ===== Types
type Payload = {
  el?: string[]; cl?: string[]; r?: number[]; chain?: string[]; gift?: string[];
  buffs?: string[]; debuffs?: string[];
  logic?: 'AND' | 'OR'; q?: string; uniq?: boolean; role?: string[]; tags?: string[]; tagLogic?: 'AND' | 'OR'
  sources?: SkillKey[]
}
type ZPayload = {
  e?: number[]
  c?: number[]
  r?: number[]
  ch?: number[]
  g?: number[]
  b?: number[]
  d?: number[]
  l?: 0 | 1         // old lg
  q?: string
  u?: 0 | 1
  r2?: string[]     // old rl
  t?: string[]      // old tg
  tl?: 0 | 1
  src?: string[]    // NEW: source filters (abbreviated)
}


// ===== Helper to check role type
const isRoleType = (v: unknown): v is RoleType => ROLES.includes(v as RoleType)

// ===== Small helpers
const isArr = <T,>(v: T[] | undefined): v is T[] => Array.isArray(v) && v.length > 0
const getAllEffects = (char: CharacterLite, type: 'buff' | 'debuff') => (Array.isArray(char[type]) ? char[type]! : [])
const extractAllEffects = (list: CharacterLite[], type: 'buff' | 'debuff') => [...new Set(list.flatMap(c => (Array.isArray(c[type]) ? c[type]! : [])))].sort()

// ===== Effect grouping helpers - will be populated lazily
let effectGroupMap = new Map<string, string>()

// Check if a character has an effect, considering groups
// If the filter is for "BT_CALL_BACKUP", it should match characters with "BT_CALL_BACKUP" OR "BT_CALL_BACKUP_2" (grouped)
function charHasEffect(char: CharacterLite, filterEffect: string, type: 'buff' | 'debuff'): boolean {
  const charEffects = getAllEffects(char, type)

  // Direct match
  if (charEffects.includes(filterEffect)) return true

  // Check if the character's effects belong to the same group as filterEffect
  for (const charEffect of charEffects) {
    const charGroup = effectGroupMap.get(charEffect)
    if (charGroup && charGroup === filterEffect) {
      return true
    }
  }

  return false
}

// NEW: Check if character has effect from specific sources
function charHasEffectFromSources(
  char: CharacterLite,
  filterEffect: string,
  type: 'buff' | 'debuff',
  sources: SkillKey[]
): boolean {
  // If no sources specified, use original function
  if (sources.length === 0) {
    return charHasEffect(char, filterEffect, type)
  }

  // Check if character has the effect in the specified sources
  if (!char.effectsBySource) {
    return charHasEffect(char, filterEffect, type)
  }

  for (const source of sources) {
    const sourceEffects = char.effectsBySource[source]?.[type] || []

    // Direct match
    if (sourceEffects.includes(filterEffect)) return true

    // Check groups
    for (const effect of sourceEffects) {
      const effectGroup = effectGroupMap.get(effect)
      if (effectGroup && effectGroup === filterEffect) {
        return true
      }
    }
  }

  return false
}

// ===== URL (de)serialization
function encodeStateToZ(p: Payload): string {
  const compact: ZPayload = {
    e: isArr(p.el) ? p.el!.map(x => EL[x as keyof typeof EL]).filter(Boolean) : undefined,
    c: isArr(p.cl) ? p.cl!.map(x => CL[x as keyof typeof CL]).filter(Boolean) : undefined,
    r: isArr(p.r) ? p.r : undefined,
    ch: isArr(p.chain) ? p.chain!.map(x => CH[x as keyof typeof CH]).filter(Boolean) : undefined,
    g: isArr(p.gift) ? p.gift!.map(x => GF[x as keyof typeof GF]).filter(Boolean) : undefined,
    b: isArr(p.buffs) ? p.buffs!.map(b => buffToId[b]).filter(Boolean) : undefined,
    d: isArr(p.debuffs) ? p.debuffs!.map(d => debuffToId[d]).filter(Boolean) : undefined,
    r2: isArr(p.role) ? p.role : undefined,
    t: isArr(p.tags) ? p.tags : undefined,
    l: p.logic === 'AND' ? 1 : undefined,
    q: p.q || undefined,
    u: p.uniq ? 1 : undefined,
    tl: p.tagLogic === 'AND' ? 1 : undefined,
    src: isArr(p.sources) ? p.sources : undefined,  // NEW: encode sources
  }
  return LZString.compressToEncodedURIComponent(JSON.stringify(compact))
}

function decodeZToState(z?: string): Partial<Payload> | null {
  if (!z) return null
  try {
    const raw = JSON.parse(LZString.decompressFromEncodedURIComponent(z) || '{}') as ZPayload
    return {
      el: raw.e?.map(id => EL_INV[id]).filter(Boolean),
      cl: raw.c?.map(id => CL_INV[id]).filter(Boolean),
      r: raw.r,
      chain: raw.ch?.map(id => CH_INV[id]).filter(Boolean),
      gift: raw.g?.map(id => GF_INV[id]).filter(Boolean),
      buffs: raw.b?.map(id => idToBuff[id]).filter(Boolean),
      debuffs: raw.d?.map(id => idToDebuff[id]).filter(Boolean),
      role: raw.r2 ?? [],
      tags: raw.t ?? [],
      logic: raw.l === 1 ? 'AND' : 'OR',
      q: raw.q,
      uniq: raw.u === 1,
      tagLogic: raw.tl === 1 ? 'AND' : 'OR',
      sources: (raw.src ?? []) as SkillKey[],
    }
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') console.warn('[Characters] decodeZToState failed', e)
    return null
  }
}

// ===== Reusable UI bits
function FilterPill({
  active,
  children,
  onClick,
  className,
  title,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
  title?: string
  className?: string
}) {
  const base =
    "inline-flex items-center justify-center rounded cursor-pointer select-none transition"
  const state = active
    ? "bg-cyan-500/25 text-white ring-1 ring-cyan-400"
    : "bg-slate-700/60 text-slate-200 hover:bg-cyan-700"

  // ⬇️ compaction + centrage vertical + fix baseline des enfants (img/texte)
  const size = "h-8 px-2.5 text-[12px] leading-none py-0"
  const fix = "[&_*]:leading-none [&_img]:align-middle [&_img]:block"

  const cls = [base, state, size, fix, className].filter(Boolean).join(" ")

  return (
    <button onClick={onClick} title={title} aria-pressed={active}
      className={`${cls} focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400`} type="button">
      {children}
    </button>
  )
}


function StarIcons({ count, size = 20 }: { count: number; size?: number }) {
  return (
    <div className="flex -space-y-1 flex-col items-end">
      {Array.from({ length: count }).map((_, i) => (
        <Image key={i} src="/images/ui/star.webp" alt="star" width={size} height={size} style={{ width: size, height: size }} />
      ))}
    </div>
  )
}

function splitIntoRows<T>(arr: T[], rows = 2): T[][] {
  if (rows <= 1) return [arr]
  const perRow = Math.ceil(arr.length / rows)
  const out: T[][] = []
  for (let i = 0; i < rows; i++) out.push(arr.slice(i * perRow, (i + 1) * perRow))
  return out
}




function norm(s: unknown): string {
  return (typeof s === 'string' ? s : '')
    .normalize('NFKC')
    .toLowerCase()
    .trim()
}

function getSearchableNames(char: CharacterLite): string[] {
  // Utilise toutes les langues disponibles dynamiquement
  const languages = getAvailableLanguages()
  const names: string[] = []

  for (const lang of languages) {
    const name = l(char, 'Fullname', lang)
    if (name) names.push(name)
  }

  return names.map(norm)
}

type ClientProps = {
  langue: TenantKey
  initialCharacters: CharacterLite[]
}
export default function CharactersPage({ langue, initialCharacters }: ClientProps) {
  const [characters] = useState<CharacterLite[]>(initialCharacters)
  const [loading] = useState(false)
  const [showTagsPanel, setShowTagsPanel] = useState(false)

  const [elementFilter, setElementFilter] = useState<string[]>([])
  const [classFilter, setClassFilter] = useState<string[]>([])
  const [rarityFilter, setRarityFilter] = useState<number[]>([])
  const [chainFilter, setChainFilter] = useState<string[]>([])
  const [giftFilter, setGiftFilter] = useState<string[]>([])
  const [roleFilter, setRoleFilter] = useState<RoleType[]>([])
  // state
  const [tagFilter, setTagFilter] = useState<string[]>([])
  const [tagLogic, setTagLogic] = useState<'AND' | 'OR'>('OR') // +++


  const [selectedBuffs, setSelectedBuffs] = useState<string[]>([])
  const [selectedDebuffs, setSelectedDebuffs] = useState<string[]>([])
  const [allBuffs, setAllBuffs] = useState<string[]>([])
  const [allDebuffs, setAllDebuffs] = useState<string[]>([])

  // NEW: Source filters
  const [sourceFilter, setSourceFilter] = useState<SkillKey[]>([])

  const [showUniqueEffects, setShowUniqueEffects] = useState<boolean>(false)
  const [showFilters, setShowFilters] = useState(false)
  const [copied, setCopied] = useState(false)

  // NEW: Lazy-loaded data
  const [buffsMetadata, setBuffsMetadata] = useState<EffectFullData[]>([])
  const [debuffsMetadata, setDebuffsMetadata] = useState<EffectFullData[]>([])
  const [effectCategoriesData, setEffectCategoriesData] = useState<EffectCategoriesData | null>(null)
  const [tagsData, setTagsData] = useState<Record<string, TagMeta> | null>(null)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastSerializedRef = useRef('')
  const didHydrateFromURL = useRef(false)

  const [effectLogic, setEffectLogic] = useState<'AND' | 'OR'>('OR')
  const [rawQuery, setRawQuery] = useState('')
  const query = useDeferredValue(rawQuery)
  const { t } = useI18n()

  const copyShareUrl = () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    if (!url) return
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    })
  }

  // Raretés (juste l'étiquette "All" dépend du t)
  const RARITIES_UI = useMemo(() => ([
    { label: t('filters.common.all'), value: null as number | null },
    { label: 1, value: 1 },
    { label: 2, value: 2 },
    { label: 3, value: 3 },
  ]), [t])

  const ELEMENTS_UI = useMemo(() => ([
    { name: t('filters.common.all'), value: null as string | null },
    ...ELEMENTS_ENUM.map(v => ({ name: v, value: v })),
  ]), [t])

  const CLASSES_UI = useMemo(() => ([
    { name: t('filters.common.all'), value: null as string | null },
    ...CLASSES_ENUM.map(v => ({ name: v, value: v })),
  ]), [t])

  const CHAINS_UI = useMemo(() => ([
    { name: t('filters.common.all'), value: null as string | null },
    ...CHAIN_TYPES.map(v => ({ name: t(`characters.chains.${CHAIN_TYPE_LABELS[v]?.toLowerCase()}`), value: v })),
  ]), [t])

  const GIFTS_UI = useMemo(() => ([
    { name: t('filters.common.all'), value: null as string | null },
    ...GIFTS_ENUM.map(v => ({ name: t(`characters.gifts.${GIFT_LABELS[v]}`), value: v })),
  ]), [t])

  const ROLES_UI = useMemo(() => ([
    { name: t('filters.common.all'), value: null as RoleType | null },
    ...ROLES.map(v => ({ name: t(`filters.roles.${v}`), value: v })),
  ]), [t])

  const buffGroups = useMemo(() => {
    if (!effectCategoriesData || buffsMetadata.length === 0) return []
    const buffCategoryKeys = Object.keys(effectCategoriesData.buff)
    return groupEffects(allBuffs, buffsMetadata, buffCategoryKeys, 'buff', showUniqueEffects)
  }, [allBuffs, showUniqueEffects, buffsMetadata, effectCategoriesData]);

  const debuffGroups = useMemo(() => {
    if (!effectCategoriesData || debuffsMetadata.length === 0) return []
    const debuffCategoryKeys = Object.keys(effectCategoriesData.debuff)
    return groupEffects(allDebuffs, debuffsMetadata, debuffCategoryKeys, 'debuff', showUniqueEffects)
  }, [allDebuffs, showUniqueEffects, debuffsMetadata, effectCategoriesData]);

  const payload = useMemo<Payload>(() => ({
    el: elementFilter.length ? elementFilter : undefined,
    cl: classFilter.length ? classFilter : undefined,
    r: rarityFilter.length ? rarityFilter : undefined,
    chain: chainFilter.length ? chainFilter : undefined,
    gift: giftFilter.length ? giftFilter : undefined,
    buffs: selectedBuffs.length ? selectedBuffs : undefined,
    debuffs: selectedDebuffs.length ? selectedDebuffs : undefined,
    logic: effectLogic !== 'OR' ? effectLogic : undefined,
    q: rawQuery.trim() || undefined,
    uniq: showUniqueEffects || undefined,
    role: roleFilter.length ? roleFilter : undefined,
    tags: tagFilter.length ? tagFilter : undefined,
    tagLogic: tagLogic !== 'OR' ? tagLogic : undefined,
    sources: sourceFilter.length ? sourceFilter : undefined,  // NEW
  }), [elementFilter, classFilter, rarityFilter, chainFilter, giftFilter, selectedBuffs, selectedDebuffs, effectLogic, rawQuery, showUniqueEffects, roleFilter, tagFilter, tagLogic, sourceFilter])

  const applyPayload = (p: Partial<Payload>) => {
    setElementFilter(p.el ?? [])
    setClassFilter(p.cl ?? [])
    setRarityFilter(p.r ?? [])
    setChainFilter(p.chain ?? [])
    setGiftFilter(p.gift ?? [])
    setSelectedBuffs(p.buffs ?? [])
    setSelectedDebuffs(p.debuffs ?? [])
    setRawQuery(p.q ?? '')
    setEffectLogic(p.logic === 'AND' || p.logic === 'OR' ? p.logic : 'OR')
    setShowUniqueEffects(Boolean(p.uniq))
    setRoleFilter((p.role ?? []).filter(isRoleType))
    setTagFilter((p.tags ?? []))
    setTagLogic(p.tagLogic === 'AND' || p.tagLogic === 'OR' ? p.tagLogic : 'OR')
    setSourceFilter(p.sources ?? [])  // NEW
  }

  type TagGroup = { type: string; items: { key: string; meta: TagMeta }[] }
  const TAG_GROUPS = useMemo<TagGroup[]>(() => {
    if (!tagsData) return []

    const mapByType: Record<string, { key: string; meta: TagMeta }[]> = {}
    for (const [key, meta] of Object.entries(tagsData)) {
      (mapByType[meta.type] ||= []).push({ key, meta })
    }
    return Object.entries(mapByType).map(([type, items]) => ({ type, items }))
  }, [tagsData])

  // 1) Hydration from URL once
  useEffect(() => {
    if (didHydrateFromURL.current) return
    didHydrateFromURL.current = true

    const z = searchParams.get('z')
    const decoded = decodeZToState(z || undefined)
    if (decoded) {
      applyPayload(decoded)
      if ((decoded.buffs?.length || 0) + (decoded.debuffs?.length || 0) > 0) setShowFilters(true)
    }
  }, [searchParams])

  // 2) Initialize buffs/debuffs from initial characters
  useEffect(() => {
    setAllBuffs(extractAllEffects(characters, 'buff'))
    setAllDebuffs(extractAllEffects(characters, 'debuff'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 3) Normalize "All"
  useEffect(() => {
    if (roleFilter.length === ROLES.length) setRoleFilter([])
  }, [roleFilter])
  useEffect(() => {
    if (elementFilter.length === ELEMENTS_ENUM.length) setElementFilter([])
  }, [elementFilter])
  useEffect(() => {
    if (classFilter.length === CLASSES_ENUM.length) setClassFilter([])
  }, [classFilter])
  useEffect(() => {
    if (rarityFilter.length === RARITIES_ENUM.length) setRarityFilter([])
  }, [rarityFilter])
  useEffect(() => {
    if (chainFilter.length === CHAIN_TYPES.length) setChainFilter([])
  }, [chainFilter])
  useEffect(() => {
    if (giftFilter.length === GIFTS_ENUM.length) setGiftFilter([])
  }, [giftFilter])

  // 3.5) Lazy load metadata when filters panel opens
  useEffect(() => {
    if (showFilters && buffsMetadata.length === 0) {
      Promise.all([
        import('@/data/buffs.json'),
        import('@/data/debuffs.json'),
        import('@/data/effect_categories.json'),
      ]).then(([buffs, debuffs, categories]) => {
        setBuffsMetadata(buffs.default as EffectFullData[])
        setDebuffsMetadata(debuffs.default as EffectFullData[])
        setEffectCategoriesData(categories.default)

        // Build effect group map
        const newMap = new Map<string, string>()
          ;[...buffs.default, ...debuffs.default].forEach((effect: { name: string; group?: string }) => {
            if (effect.group) {
              newMap.set(effect.name, effect.group)
            }
          })
        effectGroupMap = newMap
      })
    }
  }, [showFilters, buffsMetadata.length])

  // 3.6) Lazy load tags when tags panel opens
  useEffect(() => {
    if (showTagsPanel && !tagsData) {
      import('@/data/tags.json').then(module => {
        setTagsData(module.default as Record<string, TagMeta>)
      })
    }
  }, [showTagsPanel, tagsData])

  // 4) Sync filters → URL (OPTIMIZED: serialization moved inside timeout)
  useEffect(() => {
    const handle = setTimeout(() => {
      const isEmpty = !payload.el && !payload.cl && !payload.r && !payload.chain && !payload.gift && !payload.buffs && !payload.debuffs && !payload.role && !payload.tags && !payload.logic && !payload.q && !payload.uniq
      const serialized = isEmpty ? pathname : `${pathname}?z=${encodeStateToZ(payload)}`
      if (lastSerializedRef.current !== serialized) {
        lastSerializedRef.current = serialized
        router.replace(serialized, { scroll: false })
      }
    }, 150) // Reduced from 250ms
    return () => clearTimeout(handle)
  }, [pathname, router, payload])

  // 5) Pre-index characters for faster filtering (OPTIMIZED)
  type IndexedCharacter = CharacterLite & {
    searchNames: string[]
    buffSet: Set<string>
    debuffSet: Set<string>
  }

  const indexedCharacters = useMemo<IndexedCharacter[]>(() => {
    return characters.map(char => ({
      ...char,
      searchNames: getSearchableNames(char),
      buffSet: new Set(char.buff || []),
      debuffSet: new Set(char.debuff || []),
    }))
  }, [characters])

  // 5.5) Derived filtered characters (OPTIMIZED: uses pre-indexed data)
  const filtered = useMemo(() => {
    const q = (query || '').toLowerCase()

    return indexedCharacters.filter(char => {
      // Early return optimizations
      if (q && !char.searchNames.some(name => name.includes(q))) return false
      if (elementFilter.length && !elementFilter.includes(char.Element)) return false
      if (classFilter.length && !classFilter.includes(char.Class)) return false
      if (rarityFilter.length && !rarityFilter.includes(char.Rarity)) return false
      if (chainFilter.length && !chainFilter.includes(char.Chain_Type || '')) return false
      if (giftFilter.length && !giftFilter.includes((char.gift || '').trim().toLowerCase())) return false

      // Effect matching
      const hasBuffs = selectedBuffs.length > 0 ? (effectLogic === 'AND' ? selectedBuffs.every(b => charHasEffectFromSources(char, b, 'buff', sourceFilter)) : selectedBuffs.some(b => charHasEffectFromSources(char, b, 'buff', sourceFilter))) : true
      const hasDebuffs = selectedDebuffs.length > 0 ? (effectLogic === 'AND' ? selectedDebuffs.every(d => charHasEffectFromSources(char, d, 'debuff', sourceFilter)) : selectedDebuffs.some(d => charHasEffectFromSources(char, d, 'debuff', sourceFilter))) : true
      const effectMatch = (selectedBuffs.length > 0 && selectedDebuffs.length > 0)
        ? (effectLogic === 'AND' ? hasBuffs && hasDebuffs : hasBuffs || hasDebuffs)
        : (selectedBuffs.length > 0 ? hasBuffs : selectedDebuffs.length > 0 ? hasDebuffs : true)

      if (!effectMatch) return false

      // Role matching
      if (roleFilter.length && (!char.role || !roleFilter.includes(char.role as RoleType))) return false

      // Tag matching
      if (tagFilter.length) {
        const tagMatch = tagLogic === 'AND'
          ? tagFilter.every(t => char.tags?.includes(t))
          : tagFilter.some(t => char.tags?.includes(t))
        if (!tagMatch) return false
      }

      return true
    })
  }, [indexedCharacters, query, elementFilter, classFilter, chainFilter, giftFilter, rarityFilter, selectedBuffs, selectedDebuffs, effectLogic, roleFilter, tagFilter, tagLogic, sourceFilter])

  if (loading) return <div className="text-center mt-8 text-white">
    {t('characters.loading')}
  </div>

  return (
    <div className="mx-auto max-w-[1400px] px-2 md:px-4 space-y-3">

      <SearchBar searchTerm={rawQuery} setSearchTerm={setRawQuery} />
      {(payload.el || payload.cl || payload.r || payload.chain || payload.gift || payload.role || payload.tags || payload.buffs || payload.debuffs) && (
        <div className="flex flex-wrap justify-center gap-2">
          <span className="text-xs text-slate-400">
            {t('characters.common.matches', { count: filtered.length })}
          </span>
        </div>
      )}


      {/* Rarities */}
      <p className="text-xs uppercase tracking-wide text-slate-300 text-center mb-1">{t('filters.rarity')}</p>
      <div className="flex justify-center gap-2 mb-1">
        {RARITIES_UI.map(r => {
          const active = (r.value === null && rarityFilter.length === 0) || (r.value !== null && rarityFilter.includes(r.value))
          return (
            <FilterPill
              key={String(r.label)}
              active={active}
              onClick={() => {
                if (r.value === null) setRarityFilter([])
                else setRarityFilter(prev => prev.includes(r.value!) ? prev.filter(v => v !== r.value) : [...prev, r.value!])
              }}
              className="h-8 px-3"
            >
              {r.value === null ? t('filters.common.all') : (
                <div className="flex items-center -space-x-1">
                  {Array.from({ length: r.label as number }).map((_, i) => (
                    <Image key={i} src="/images/ui/star.webp" alt="star" width={16} height={16} style={{ width: 16, height: 16 }} />
                  ))}
                </div>
              )}
            </FilterPill>
          )
        })}
      </div>

      {/* Elements + Classes — rapprochés, titres centrés */}
      <div className="mx-auto max-w-[820px] grid grid-cols-1 md:grid-cols-2 gap-y-2 md:gap-x-6 place-items-center">
        {/* Elements */}
        <div className="w-full flex flex-col items-center">
          <p className="text-xs uppercase tracking-wide text-slate-300 text-center mb-1">{t('filters.elements')}</p>
          <div className="flex gap-2 justify-center">
            {ELEMENTS_UI.map(el => (
              <FilterPill
                key={el.name}
                title={el.name}
                active={(el.value === null && elementFilter.length === 0) || (el.value !== null && elementFilter.includes(el.value))}
                onClick={() => (el.value ? setElementFilter(p => p.includes(el.value as string) ? p.filter(v => v !== el.value) : [...p, el.value as string]) : setElementFilter([]))}
                className="w-9 h-9 px-0"
              >
                {el.value
                  ? <span className="scale-125 inline-block"><ElementIcon element={el.value as ElementType} /></span>
                  : <span className="text-[11px]">{t('filters.common.all')}</span>}
              </FilterPill>
            ))}
          </div>
        </div>

        {/* Classes */}
        <div className="w-full flex flex-col items-center">
          <p className="text-xs uppercase tracking-wide text-slate-300 text-center mb-1">{t('filters.classes')}</p>
          <div className="flex gap-2 justify-center">
            {CLASSES_UI.map(cl => (
              <FilterPill
                key={cl.name}
                title={cl.name}
                active={(cl.value === null && classFilter.length === 0) || (cl.value !== null && classFilter.includes(cl.value))}
                onClick={() => (cl.value ? setClassFilter(p => p.includes(cl.value as string) ? p.filter(v => v !== cl.value) : [...p, cl.value as string]) : setClassFilter([]))}
                className="w-9 h-9 px-0"
              >
                {cl.value
                  ? <span className="scale-150 inline-block"><ClassIcon className={cl.name as ClassType} /></span>
                  : <span className="text-[11px]">{t('filters.common.all')}</span>}
              </FilterPill>
            ))}
          </div>
        </div>
      </div>



      {/* Chains + Roles — rapprochés, titres centrés */}
      <div className="mx-auto max-w-[820px] grid grid-cols-1 md:grid-cols-2 gap-y-2 md:gap-x-6 place-items-center">
        {/* Chains */}
        <div className="w-full flex flex-col items-center">
          <p className="text-xs uppercase tracking-wide text-slate-300 text-center mb-1">{t('characters.filters.chains')}</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {CHAINS_UI.map(ct => (
              <FilterPill
                key={ct.name}
                active={(ct.value === null && chainFilter.length === 0) || (ct.value !== null && chainFilter.includes(ct.value))}
                onClick={() => (ct.value ? setChainFilter(p => p.includes(ct.value as string) ? p.filter(v => v !== ct.value) : [...p, ct.value as string]) : setChainFilter([]))}
              >
                {ct.name}
              </FilterPill>
            ))}
          </div>
        </div>

        {/* Roles */}
        <div className="w-full flex flex-col items-center">
          <p className="text-xs uppercase tracking-wide text-slate-300 text-center mb-1">{t('characters.filters.roles')}</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {ROLES_UI.map(r => (
              <FilterPill
                key={r.name}
                active={
                  (r.value === null && roleFilter.length === 0) ||
                  (r.value !== null && roleFilter.includes(r.value))
                }
                onClick={() => {
                  const val = r.value; // RoleType | null
                  if (val === null) {
                    setRoleFilter([]);           // reset "All"
                    return;
                  }
                  setRoleFilter(prev =>
                    prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
                  );
                }}
              >
                {r.name}
              </FilterPill>
            ))}
          </div>
        </div>
      </div>



      {/* Gifts */}
      <p className="text-xs uppercase tracking-wide text-slate-300 text-center mb-1">{t('characters.filters.gifts')}</p>
      <div className="flex flex-wrap justify-center gap-2 mb-1">
        {GIFTS_UI.map(g => (
          <FilterPill
            key={g.name}
            active={(g.value === null && giftFilter.length === 0) || (g.value !== null && giftFilter.includes(g.value))}
            onClick={() => (g.value ? setGiftFilter(p => p.includes(g.value as string) ? p.filter(v => v !== g.value) : [...p, g.value as string]) : setGiftFilter([]))}
          >
            {g.name}
          </FilterPill>
        ))}
      </div>

      {/* Toggle Buff/Debuff filters */}
      <div className="text-center mt-4">
        <div className='flex gap-2 justify-center'>
          <button onClick={() => setShowFilters(s => !s)} className="bg-gray-700 hover:bg-cyan-600 px-4 py-2 rounded text-sm mb-4">
            {showFilters ? t('characters.filters.hideBuffs') : t('characters.filters.showBuffs')}
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-col items-center gap-2 w-full mb-2">
            {/* Header */}
            <div className="flex justify-center gap-3 items-center">
              <label htmlFor="show-unique-effects" className="inline-flex items-center gap-2 h-9 px-3 rounded text-sm text-white cursor-pointer select-none bg-gray-700 hover:bg-cyan-600 transition">
                <input type="checkbox" id="show-unique-effects" checked={showUniqueEffects} onChange={() => setShowUniqueEffects(v => !v)} className="accent-cyan-500 w-4 h-4" />
                {t('characters.filters.unique')}
              </label>

              <div className="inline-grid grid-cols-2 rounded bg-slate-700 text-xs">
                <button className={`px-2 py-1 ${effectLogic === 'AND' ? 'bg-cyan-600' : ''}`} onClick={() => setEffectLogic('AND')}>{t('characters.filters.and')}</button>
                <button className={`px-2 py-1 ${effectLogic === 'OR' ? 'bg-cyan-600' : ''}`} onClick={() => setEffectLogic('OR')}>{t('characters.filters.or')}</button>
              </div>
            </div>

            {/* Source Filter Toggles */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-slate-300">{t('characters.filters.sources.filterBySource')}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SKILL_SOURCES.map(source => (
                  <FilterPill
                    key={source.key}
                    active={sourceFilter.includes(source.key)}
                    onClick={() => setSourceFilter(prev =>
                      prev.includes(source.key)
                        ? prev.filter(s => s !== source.key)
                        : [...prev, source.key]
                    )}
                    className="text-xs"
                  >
                    {t(source.labelKey)}
                  </FilterPill>
                ))}
              </div>
            </div>

            {/* Panel Buffs/Debuffs */}
            <div className="mx-auto max-w-screen-lg w-full rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
              {/* Buffs */}
              <div className="w-full">
                <p className="text-xs uppercase tracking-wide text-cyan-300 text-center mb-2">{t('characters.filters.buffs')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {buffGroups.map((group, i) => {
                    const visible = group.effects
                      .map(k => k?.trim()).filter(Boolean)
                      .filter(key => showUniqueEffects || !key.startsWith('UNIQUE_'))
                    if (!visible.length) return null
                    return (
                      <div key={`${group.title ?? 'group'}-buff-${i}`} className="rounded-xl bg-slate-800/40 ring-1 ring-slate-700 p-2">
                        {group.title && <p className="text-cyan-300 font-semibold text-center mb-2">{t(group.title)}</p>}
                        <div className="grid grid-cols-5 md:grid-cols-6 gap-1.5 justify-items-center">
                          {visible.map(effectKey => (
                            <div
                              key={effectKey}
                              onClick={() => setSelectedBuffs(prev => prev.includes(effectKey) ? prev.filter(v => v !== effectKey) : [...prev, effectKey])}
                              className={`cursor-pointer ${selectedBuffs.includes(effectKey) ? 'ring-2 ring-cyan-400 rounded' : ''}`}
                            >
                              <BuffDebuffDisplayMini buffs={[effectKey]} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="my-4 border-t border-slate-700" />

              {/* Debuffs */}
              <div className="w-full">
                <p className="text-xs uppercase tracking-wide text-red-300 text-center mb-2">{t('characters.filters.debuffs')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {debuffGroups.map((group, i) => {
                    const visible = group.effects
                      .map(k => k?.trim()).filter(Boolean)
                      .filter(key => showUniqueEffects || !key.startsWith('UNIQUE_'))
                    if (!visible.length) return null
                    return (
                      <div key={`${group.title ?? 'group'}-debuff-${i}`} className="rounded-xl bg-slate-800/40 ring-1 ring-slate-700 p-2">
                        {group.title && <p className="text-red-300 font-semibold text-center mb-2">{t(group.title)}</p>}
                        <div className="grid grid-cols-5 md:grid-cols-6 gap-1.5 justify-items-center">
                          {visible.map(effectKey => (
                            <div
                              key={effectKey}
                              onClick={() => setSelectedDebuffs(prev => prev.includes(effectKey) ? prev.filter(v => v !== effectKey) : [...prev, effectKey])}
                              className={`cursor-pointer ${selectedDebuffs.includes(effectKey) ? 'ring-2 ring-red-800 rounded' : ''}`}
                            >
                              <BuffDebuffDisplayMini debuffs={[effectKey]} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        <div>
          <button onClick={() => setShowTagsPanel(s => !s)} className="bg-gray-700 hover:bg-cyan-600 px-4 py-2 rounded text-sm">
            {showTagsPanel ? t('characters.filters.hideTags') : t('characters.filters.showTags')}
          </button>
        </div>

        {showTagsPanel && (
          <div className="w-full mt-2">
            {/* Tags header controls (dans le panel tags) */}
            <div className="flex justify-center gap-3 items-center mb-2">
              <div className="inline-grid grid-cols-2 rounded bg-slate-700 text-xs">
                <button
                  className={`px-2 py-1 ${tagLogic === 'AND' ? 'bg-cyan-600' : ''}`}
                  onClick={() => setTagLogic('AND')}
                >
                  {t('characters.filters.and')}
                </button>
                <button
                  className={`px-2 py-1 ${tagLogic === 'OR' ? 'bg-cyan-600' : ''}`}
                  onClick={() => setTagLogic('OR')}
                >
                  {t('characters.filters.or')}
                </button>
              </div>
            </div>
            <div className="mx-auto max-w-screen-lg rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
              <div className="grid md:grid-cols-2 gap-6">
                {TAG_GROUPS.map(group => (
                  <div key={group.type}>
                    <p className="text-xs uppercase tracking-wide text-slate-300 text-center mb-2">
                      {t(`characters.tags.types.${group.type}`)}
                    </p>
                    {/* 2 rangées max, centrées et compactes */}
                    <div className="space-y-2">
                      {splitIntoRows(group.items, 2).map((row, ridx) => (
                        <div
                          key={`row-${group.type}-${ridx}`}
                          className="grid grid-cols-[repeat(auto-fit,minmax(120px,max-content))] gap-2 justify-center justify-items-center"
                        >
                          {row.map(({ key, meta }) => {
                            const active = tagFilter.includes(key)
                            return (
                              <FilterPill
                                key={key}
                                title={l(meta, 'desc', langue)}
                                active={active}
                                onClick={() =>
                                  setTagFilter(prev =>
                                    prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
                                  )
                                }
                                className="w-auto min-w-[120px] h-8 px-2 text-[11px] gap-1 justify-center"
                              >
                                <TagDisplayMini tags={key} />
                              </FilterPill>
                            )
                          })}
                        </div>
                      ))}
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex flex-wrap justify-center gap-4 mb-4">
          <button
            onClick={() => {
              // reset des filtres
              setElementFilter([]);
              setClassFilter([]);
              setRarityFilter([]);
              setSelectedBuffs([]);
              setSelectedDebuffs([]);
              setChainFilter([]);
              setGiftFilter([]);
              setEffectLogic('OR');
              setRawQuery('');
              setRoleFilter([]);
              setTagFilter([])
              setTagLogic('OR')
              setShowUniqueEffects(false);
              setSourceFilter([]);  // NEW: reset source filter

              // ⬇️ collapse des panneaux
              setShowFilters(false);     // ferme Buffs/Debuffs
              setShowTagsPanel(false);   // ferme Tags

              // nettoie l'URL
              lastSerializedRef.current = pathname;
              router.replace(pathname, { scroll: false });
            }}
            className="bg-gray-700 hover:bg-red-700 px-4 py-1 rounded text-sm"
          >
            {t('characters.filters.reset')}
          </button>


          <button onClick={copyShareUrl} className="bg-gray-700 hover:bg-cyan-600 px-4 py-1 rounded text-sm">
            {copied ? t('characters.filters.copied') : t('characters.filters.copy')}
          </button>
        </div>

        {/* Cards */}
        <div className="flex flex-wrap justify-center gap-6">
          {filtered.map((char, index) => {
            const isPriority = index <= 5
            const badge = getRecruitBadge(char)
            return (
              <Link
                href={`/characters/${toKebabCase(char.Fullname.toLowerCase())}`}
                prefetch={false}
                key={char.ID}
                className="relative w-[120px] h-[231px] text-center shadow hover:shadow-lg transition overflow-hidden rounded"
              >
                {badge && (
                  <Image
                    src={badge.src}
                    alt={badge.altKey}
                    width={0}
                    height={0}
                    sizes={`75px`}
                    className={`absolute w-[75px] h-[30px]  top-1 left-1 z-30 object-contain drop-shadow-md`}
                  />
                )}

                <Image
                  src={`/images/characters/portrait/CT_${char.ID}.webp`}
                  alt={char.Fullname}
                  width={120}
                  height={231}
                  style={{ width: 120, height: 231 }}
                  className="object-cover rounded"
                  priority={isPriority}
                  loading={isPriority ? undefined : 'lazy'}
                  unoptimized
                />

                <div className="absolute top-4 right-1 z-30 flex flex-col items-end -space-y-1">
                  <StarIcons count={char.Rarity} size={20} />
                </div>

                <div className="absolute bottom-12.5 right-2 z-30">
                  <ClassIcon className={char.Class as ClassType} />
                </div>

                <div className="absolute bottom-5.5 right-1.5 z-30">
                  <ElementIcon element={char.Element as ElementType} />
                </div>

                <CharacterNameDisplay fullname={l(char, 'Fullname', langue)} />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
