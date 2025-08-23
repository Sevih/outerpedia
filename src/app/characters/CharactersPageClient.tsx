'use client'

import { useEffect, useState, useRef, useMemo, useDeferredValue } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import type { CharacterLite, RoleType } from '@/types/types'
import { toKebabCase } from '@/utils/formatText'
import type { ElementType, ClassType } from '@/types/enums'
import { groupEffects } from '@/utils/groupEffects'
import SearchBar from '@/app/components/SearchBar'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import LZString from 'lz-string'
import { EL, CL, CH, GF, EL_INV, CL_INV, CH_INV, GF_INV } from '@/data/filterCodes'
import effectsIndex from '@/data/effectsIndex.json'
import rawTAG_INDEX from '@/data/tags.json'

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

type TagMeta = { label: string; image: string; desc: string; type: string }
const typeLabel = (t: string) => t.slice(0, 1).toUpperCase() + t.slice(1)

// ===== Types
type Payload = {
  el?: string[]; cl?: string[]; r?: number[]; chain?: string[]; gift?: string[];
  buffs?: string[]; debuffs?: string[];
  logic?: 'AND' | 'OR'; q?: string; uniq?: boolean; role?: string[]; tags?: string[]
}
type ZPayload = {
  e?: number[]; c?: number[]; r?: number[]; ch?: number[]; g?: number[]; b?: number[]; d?: number[];
  lg?: 0 | 1; q?: string; u?: 0 | 1; rl?: string[]; tg?: string[]
}

// ===== Constants
const ELEMENTS = [
  { name: 'All', value: null },
  { name: 'Fire', value: 'Fire' },
  { name: 'Water', value: 'Water' },
  { name: 'Earth', value: 'Earth' },
  { name: 'Light', value: 'Light' },
  { name: 'Dark', value: 'Dark' },
] as const

const CLASSES = [
  { name: 'All', value: null },
  { name: 'Striker', value: 'Striker' },
  { name: 'Defender', value: 'Defender' },
  { name: 'Ranger', value: 'Ranger' },
  { name: 'Healer', value: 'Healer' },
  { name: 'Mage', value: 'Mage' },
] as const

const RARITIES = [
  { label: 'All', value: null },
  { label: 1, value: 1 },
  { label: 2, value: 2 },
  { label: 3, value: 3 },
] as const

const CHAINS = [
  { name: 'All', value: null },
  { name: 'Starter', value: 'Start' },
  { name: 'Companion', value: 'Join' },
  { name: 'Finisher', value: 'Finish' },
] as const

const GIFTS = [
  { name: 'All', value: null },
  { name: 'Science', value: 'science' },
  { name: 'Luxury', value: 'luxury' },
  { name: 'Magic Tool', value: 'magic tool' },
  { name: 'Craftwork', value: 'craftwork' },
  { name: 'Natural Object', value: 'natural object' },
] as const

const TAG_INDEX = rawTAG_INDEX as Record<string, TagMeta>
const TAG_KEYS = Object.keys(TAG_INDEX)
const TAGS = TAG_KEYS.map(k => ({
  key: k,
  label: TAG_INDEX[k].label,
  image: TAG_INDEX[k].image,
  desc: TAG_INDEX[k].desc,
  type: TAG_INDEX[k].type,
}))

// ——— Tag helpers: one-per-category
const TAG_KEY_TO_TYPE: Record<string, string> = Object.fromEntries(TAGS.map(t => [t.key, t.type]))

function keepOnePerType(keys: string[]): string[] {
  const seen = new Set<string>(); const out: string[] = []
  for (const k of keys) {
    const type = TAG_KEY_TO_TYPE[k] || TAG_INDEX[k]?.type
    if (!type || seen.has(type)) continue
    seen.add(type); out.push(k)
  }
  return out
}

const ROLES = [
  { name: 'All', value: null },
  { name: 'DPS', value: 'dps' },
  { name: 'Support', value: 'support' },
  { name: 'Sustain', value: 'sustain' },
] as const satisfies ReadonlyArray<{ name: string; value: RoleSlug | null }>

// 👇 Ajoute ça (au lieu de isRole)
type RoleSlug = 'dps' | 'support' | 'sustain'
const isRoleSlug = (v: unknown): v is RoleSlug =>
  v === 'dps' || v === 'support' || v === 'sustain'


// ===== Effect groups
const orderedBuffGroups = [
  { title: 'Stat Boosts', items: ['BT_STAT|ST_ATK', 'BT_STAT|ST_DEF', 'BT_STAT|ST_SPEED', 'BT_STAT|ST_CRITICAL_RATE', 'BT_STAT|ST_CRITICAL_DMG_RATE', 'BT_STAT|ST_BUFF_CHANCE', 'BT_STAT|ST_BUFF_RESIST', 'BT_STAT|ST_AVOID', 'BT_STAT|ST_ACCURACY', 'BT_STAT|ST_PIERCE_POWER_RATE', 'BT_RANDOM_STAT'] },
  { title: 'Supporting', items: ['BT_INVINCIBLE', 'BT_SHIELD_BASED_CASTER', 'BT_IMMUNE', 'IG_Buff_BuffdurationIncrease', 'BT_UNDEAD', 'BT_STEALTHED', 'BT_REMOVE_DEBUFF', 'BT_REVIVAL', 'BT_RESURRECTION_G', 'SYS_CONTINU_HEAL', 'BT_STAT|ST_VAMPIRIC'] },
  { title: 'Utility', items: ['BT_COOL_CHARGE', 'BT_ACTION_GAUGE', 'BT_AP_CHARGE', 'BT_STAT|ST_COUNTER_RATE', 'BT_CP_CHARGE', 'Heavy Strike', 'BT_DMG_ELEMENT_SUPERIORITY', 'BT_ADDITIVE_TURN', 'SYS_BUFF_REVENGE', 'SYS_REVENGE_HEAL', 'SYS_BUFF_BREAK_DMG', 'BT_CALL_BACKUP'] },
  { title: 'Unique', items: ['UNIQUE_ARIEL', 'UNIQUE_SAKURA_CHIRU', 'UNIQUE_UME_ICHIRIN', 'UNIQUE_GRACE_OF_THE_VIRGIN_GODDESS', 'UNIQUE_CHARISMA', 'UNIQUE_DOLL_GARDEN_CARETAKER', 'UNIQUE_ETHER_BOOST', 'UNIQUE_DESTROYER_PUNISHMENT', 'UNIQUE_PUREBLOOD_DOMINION', 'UNIQUE_RADIANT_WILL', 'UNIQUE_RETRIBUTION_DOMINION', 'UNIQUE_HUBRIS_DOMINION', 'UNIQUE_GIFT_OF_BUFF', 'UNIQUE_FIERCE_OFFENSIVE', 'UNIQUE_REGINA_WORLD', 'UNIQUE_NINJA_AFTERIMAGE', 'UNIQUE_POLAR_KNIGHT', 'UNIQUE_WHITE_KNIGHT'] },
]

const orderedDebuffGroups = [
  { title: 'Stat Reduction', items: ['BT_STAT|ST_ATK', 'BT_STAT|ST_DEF', 'BT_STAT|ST_SPEED', 'BT_STAT|ST_CRITICAL_RATE', 'BT_STAT|ST_CRITICAL_DMG_RATE', 'BT_STAT|ST_BUFF_CHANCE', 'BT_STAT|ST_BUFF_RESIST', 'BT_STAT|ST_AVOID', 'BT_STAT|ST_ACCURACY'] },
  { title: 'Control Effects (CC)', items: ['BT_FREEZE', 'BT_STONE', 'BT_STUN', 'BT_SILENCE', 'BT_AGGRO', 'BT_MARKING'] },
  { title: 'Damage Over Time (DoT)', items: ['BT_DOT_BURN', 'BT_DOT_BURN_IR', 'BT_DOT_CURSE', 'BT_DOT_CURSE_IR', 'BT_DOT_BLEED', 'BT_DOT_BLEED_IR', 'BT_DOT_POISON', 'BT_DOT_LIGHTNING', 'BT_DOT_ETERNAL_BLEED', 'BT_DETONATE'] },
  { title: 'Utility Debuffs', items: ['BT_COOL_CHARGE', 'BT_ACTION_GAUGE', 'BT_AP_CHARGE', 'BT_SEAL_COUNTER', 'BT_SEALED', 'BT_SEALED_IR', 'BT_SEALED_RESURRECTION', 'BT_SEAL_ADDITIVE_ATTACK', 'BT_STATBUFF_CONVERT_TO_STATDEBUFF', 'BT_STEAL_BUFF', 'BT_REMOVE_BUFF', 'IG_Buff_BuffdurationReduce', 'IG_Buff_DeBuffdurationIncrease', 'BT_SEALED_RECEIVE_HEAL', 'BT_WG_DMG', 'BT_FIXED_DAMAGE', 'BT_RESOURCE_DOWN'] },
  { title: 'Unique', items: ['UNIQUE_MARTYRDOM', 'UNIQUE_IRREGULAR_INFECTION'] },
]

// ===== Small helpers
const isArr = <T,>(v: T[] | undefined): v is T[] => Array.isArray(v) && v.length > 0
const getAllEffects = (char: CharacterLite, type: 'buff' | 'debuff') => (Array.isArray(char[type]) ? char[type]! : [])
const extractAllEffects = (list: CharacterLite[], type: 'buff' | 'debuff') => [...new Set(list.flatMap(c => (Array.isArray(c[type]) ? c[type]! : [])))].sort()

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
    rl: isArr(p.role) ? p.role : undefined,
    tg: isArr(p.tags) ? p.tags : undefined,
    lg: p.logic === 'AND' ? 1 : undefined,
    q: p.q || undefined,
    u: p.uniq ? 1 : undefined,
  }
  return LZString.compressToEncodedURIComponent(JSON.stringify(compact))
}

function decodeZToState(z?: string): Partial<Payload> | null {
  if (!z) return null
  try {
    const raw = JSON.parse(LZString.decompressFromEncodedURIComponent(z) || '{}') as ZPayload
    return {
      el: raw.e?.map(id => EL_INV[id]).filter(Boolean) as string[] | undefined,
      cl: raw.c?.map(id => CL_INV[id]).filter(Boolean) as string[] | undefined,
      r: raw.r,
      chain: raw.ch?.map(id => CH_INV[id]).filter(Boolean) as string[] | undefined,
      gift: raw.g?.map(id => GF_INV[id]).filter(Boolean) as string[] | undefined,
      buffs: raw.b?.map(id => idToBuff[id]).filter(Boolean),
      debuffs: raw.d?.map(id => idToDebuff[id]).filter(Boolean),
      role: raw.rl ?? [],
      tags: raw.tg ?? [],
      logic: raw.lg === 1 ? 'AND' : 'OR',
      q: raw.q,
      uniq: raw.u === 1,
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

function FilterChip({ children, onClear }: { children: React.ReactNode; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-700/60 text-slate-200 px-2 py-1 text-xs">
      {children}
      <button type="button" onClick={onClear} aria-label="Remove filter" className="leading-none hover:text-white">×</button>
    </span>
  )
}


export default function CharactersPage() {
  const [characters, setCharacters] = useState<CharacterLite[]>([])
  const [loading, setLoading] = useState(true)
  const [showTagsPanel, setShowTagsPanel] = useState(false)

  const [elementFilter, setElementFilter] = useState<string[]>([])
  const [classFilter, setClassFilter] = useState<string[]>([])
  const [rarityFilter, setRarityFilter] = useState<number[]>([])
  const [chainFilter, setChainFilter] = useState<string[]>([])
  const [giftFilter, setGiftFilter] = useState<string[]>([])
  const [roleFilter, setRoleFilter] = useState<RoleSlug[]>([])
  const [tagFilter, setTagFilter] = useState<string[]>([])

  const [selectedBuffs, setSelectedBuffs] = useState<string[]>([])
  const [selectedDebuffs, setSelectedDebuffs] = useState<string[]>([])
  const [allBuffs, setAllBuffs] = useState<string[]>([])
  const [allDebuffs, setAllDebuffs] = useState<string[]>([])

  const [showUniqueEffects, setShowUniqueEffects] = useState<boolean>(false)
  const [showFilters, setShowFilters] = useState(false)
  const [copied, setCopied] = useState(false)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastSerializedRef = useRef('')
  const didHydrateFromURL = useRef(false)

  const [effectLogic, setEffectLogic] = useState<'AND' | 'OR'>('OR')
  const [rawQuery, setRawQuery] = useState('')
  const query = useDeferredValue(rawQuery)

  const copyShareUrl = () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    if (!url) return
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    })
  }

  const buffGroups = useMemo(() => groupEffects(allBuffs, orderedBuffGroups, showUniqueEffects), [allBuffs, showUniqueEffects]);
  const debuffGroups = useMemo(() => groupEffects(allDebuffs, orderedDebuffGroups, showUniqueEffects), [allDebuffs, showUniqueEffects]);

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
  }), [elementFilter, classFilter, rarityFilter, chainFilter, giftFilter, selectedBuffs, selectedDebuffs, effectLogic, rawQuery, showUniqueEffects, roleFilter, tagFilter])

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
    setRoleFilter((p.role ?? []).filter(isRoleSlug))
    setTagFilter(keepOnePerType(p.tags ?? []))
  }

  const TAG_GROUPS = useMemo(() => {
    const mapByType: Record<string, { key: string; meta: TagMeta }[]> = {}
    for (const t of TAGS) (mapByType[t.type] ||= []).push({ key: t.key, meta: { label: t.label, image: t.image, desc: t.desc, type: t.type } })
    const byTypeWithKeys: { title: string; items: { key: string; meta: TagMeta }[] }[] = []
    for (const [t, items] of Object.entries(mapByType)) byTypeWithKeys.push({ title: typeLabel(t), items })
    return byTypeWithKeys
  }, [])

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

  // 2) Fetch characters
  useEffect(() => {
    const fetchCharacters = async () => {
      const res = await fetch('/api/characters-lite')
      const data: CharacterLite[] = await res.json()
      setCharacters(data)
      setAllBuffs(extractAllEffects(data, 'buff'))
      setAllDebuffs(extractAllEffects(data, 'debuff'))
      setLoading(false)
    }
    fetchCharacters()
  }, [])

  // 3) Normalize "All"
  useEffect(() => {
    const all = ['DPS', 'Support', 'Sustain'] as RoleType[]
    if (roleFilter.length === all.length) setRoleFilter([])
  }, [roleFilter])
  useEffect(() => {
    const all = ELEMENTS.slice(1).map(e => e.value!); if (elementFilter.length === all.length) setElementFilter([])
  }, [elementFilter])
  useEffect(() => {
    const all = CLASSES.slice(1).map(c => c.value!); if (classFilter.length === all.length) setClassFilter([])
  }, [classFilter])
  useEffect(() => {
    const all = RARITIES.slice(1).map(r => r.value!); if (rarityFilter.length === all.length) setRarityFilter([])
  }, [rarityFilter])
  useEffect(() => {
    const all = CHAINS.slice(1).map(c => c.value!); if (chainFilter.length === all.length) setChainFilter([])
  }, [chainFilter])
  useEffect(() => {
    const all = GIFTS.slice(1).map(g => g.value!); if (giftFilter.length === all.length) setGiftFilter([])
  }, [giftFilter])

  useEffect(() => {
    setTagFilter(prev => keepOnePerType(prev))
  }, [showTagsPanel])

  // 4) Sync filters → URL
  useEffect(() => {
    const isEmpty = !payload.el && !payload.cl && !payload.r && !payload.chain && !payload.gift && !payload.buffs && !payload.debuffs && !payload.role && !payload.tags && !payload.logic && !payload.q && !payload.uniq
    const serialized = isEmpty ? pathname : `${pathname}?z=${encodeStateToZ(payload)}`
    if (lastSerializedRef.current === serialized) return
    const handle = setTimeout(() => {
      if (lastSerializedRef.current !== serialized) {
        lastSerializedRef.current = serialized
        router.replace(serialized, { scroll: false })
      }
    }, 250)
    return () => clearTimeout(handle)
  }, [pathname, router, payload])

  // 5) Derived filtered characters
  const filtered = useMemo(() => {
    const q = (query || '').toLowerCase()
    return characters.filter(char => {
      if (!char.Fullname.toLowerCase().includes(q)) return false
      const elementMatch = elementFilter.length === 0 || elementFilter.includes(char.Element)
      const classMatch = classFilter.length === 0 || classFilter.includes(char.Class)
      const chainMatch = chainFilter.length === 0 || chainFilter.includes(char.Chain_Type || '')
      const giftMatch = giftFilter.length === 0 || giftFilter.includes((char.gift || '').trim().toLowerCase())
      const rarityMatch = rarityFilter.length === 0 || rarityFilter.includes(char.Rarity)

      const hasBuffs = selectedBuffs.length > 0 ? (effectLogic === 'AND' ? selectedBuffs.every(b => getAllEffects(char, 'buff').includes(b)) : selectedBuffs.some(b => getAllEffects(char, 'buff').includes(b))) : true
      const hasDebuffs = selectedDebuffs.length > 0 ? (effectLogic === 'AND' ? selectedDebuffs.every(d => getAllEffects(char, 'debuff').includes(d)) : selectedDebuffs.some(d => getAllEffects(char, 'debuff').includes(d))) : true
      const effectMatch = (selectedBuffs.length > 0 && selectedDebuffs.length > 0)
        ? (effectLogic === 'AND' ? hasBuffs && hasDebuffs : hasBuffs || hasDebuffs)
        : (selectedBuffs.length > 0 ? hasBuffs : selectedDebuffs.length > 0 ? hasDebuffs : true)

      const roleMatch =
        roleFilter.length === 0 ||
        (char.role && roleFilter.includes(char.role as RoleSlug)) // char.role vient du JSON (minuscule)

      const tagMatch = tagFilter.length === 0 || tagFilter.every(t => char.tags?.includes(t))

      return elementMatch && classMatch && rarityMatch && chainMatch && effectMatch && giftMatch && roleMatch && tagMatch
    })
  }, [characters, query, elementFilter, classFilter, chainFilter, giftFilter, rarityFilter, selectedBuffs, selectedDebuffs, effectLogic, roleFilter, tagFilter])

  if (loading) return <div className="text-center mt-8 text-white">Loading characters...</div>

  return (
    <div className="mx-auto max-w-[1400px] px-2 md:px-4 space-y-3">
      {/* JSON-LD SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Characters – Outerpedia',
            url: 'https://outerpedia.com/characters',
            description: 'Browse all characters in Outerplane with builds, skills, stats and exclusive equipment.',
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: characters.map((char, index) => ({
                '@type': 'VideoGameCharacter',
                name: char.Fullname,
                url: `https://outerpedia.com/characters/${toKebabCase(char.Fullname)}`,
                image: `https://outerpedia.com/images/characters/atb/IG_Turn_${char.ID}.webp`,
                position: index + 1,
              })),
            },
          }),
        }}
      />

      <div className="sr-only"><h1>Outerplane Full Characters Database</h1></div>

      <SearchBar searchTerm={rawQuery} setSearchTerm={setRawQuery} />
      {(payload.el || payload.cl || payload.r || payload.chain || payload.gift || payload.role || payload.tags) && (
        <div className="flex flex-wrap justify-center gap-2">
          {elementFilter.map(v => <FilterChip key={'el-' + v} onClear={() => setElementFilter(el => el.filter(x => x !== v))}>{v}</FilterChip>)}
          {/* idem pour les autres */}
          <span className="text-xs text-slate-400">({filtered.length} matches)</span>
        </div>
      )}


      {/* Rarities */}
      <p className="text-xs uppercase tracking-wide text-slate-300 text-center mb-1">Rarity</p>
      <div className="flex justify-center gap-2 mb-1">
        {RARITIES.map(r => {
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
              {r.value === null ? "All" : (
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
          <p className="text-xs uppercase tracking-wide text-slate-300 text-center mb-1">Elements</p>
          <div className="flex gap-2 justify-center">
            {ELEMENTS.map(el => (
              <FilterPill
                key={el.name}
                title={el.name}
                active={(el.value === null && elementFilter.length === 0) || (el.value !== null && elementFilter.includes(el.value))}
                onClick={() => (el.value ? setElementFilter(p => p.includes(el.value as string) ? p.filter(v => v !== el.value) : [...p, el.value as string]) : setElementFilter([]))}
                className="w-9 h-9 px-0"
              >
                {el.value
                  ? <span className="scale-125 inline-block"><ElementIcon element={el.value as ElementType} /></span>
                  : <span className="text-[11px]">All</span>}
              </FilterPill>
            ))}
          </div>
        </div>

        {/* Classes */}
        <div className="w-full flex flex-col items-center">
          <p className="text-xs uppercase tracking-wide text-slate-300 text-center mb-1">Classes</p>
          <div className="flex gap-2 justify-center">
            {CLASSES.map(cl => (
              <FilterPill
                key={cl.name}
                title={cl.name}
                active={(cl.value === null && classFilter.length === 0) || (cl.value !== null && classFilter.includes(cl.value))}
                onClick={() => (cl.value ? setClassFilter(p => p.includes(cl.value as string) ? p.filter(v => v !== cl.value) : [...p, cl.value as string]) : setClassFilter([]))}
                className="w-9 h-9 px-0"
              >
                {cl.value
                  ? <span className="scale-150 inline-block"><ClassIcon className={cl.name as ClassType} /></span>
                  : <span className="text-[11px]">All</span>}
              </FilterPill>
            ))}
          </div>
        </div>
      </div>



      {/* Chains + Roles — rapprochés, titres centrés */}
      <div className="mx-auto max-w-[820px] grid grid-cols-1 md:grid-cols-2 gap-y-2 md:gap-x-6 place-items-center">
        {/* Chains */}
        <div className="w-full flex flex-col items-center">
          <p className="text-xs uppercase tracking-wide text-slate-300 text-center mb-1">Chains</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {CHAINS.map(ct => (
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
          <p className="text-xs uppercase tracking-wide text-slate-300 text-center mb-1">Roles</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {ROLES.map(r => (
              <FilterPill
                key={r.name}
                active={
                  (r.value === null && roleFilter.length === 0) ||
                  (r.value !== null && roleFilter.includes(r.value))
                }
                onClick={() =>
                  r.value === null
                    ? setRoleFilter([])
                    : setRoleFilter(p =>
                      p.includes(r.value) ? p.filter(v => v !== r.value) : [...p, r.value]
                    )
                }
              >
                {r.name}
              </FilterPill>
            ))}
          </div>
        </div>
      </div>



      {/* Gifts */}
      <p className="text-xs uppercase tracking-wide text-slate-300 text-center mb-1">Gifts</p>
      <div className="flex flex-wrap justify-center gap-2 mb-1">
        {GIFTS.map(g => (
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
            {showFilters ? 'Hide Buffs/Debuffs Filters' : 'Show Buffs/Debuffs Filters'}
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-col items-center gap-2 w-full mb-2">
            {/* Header */}
            <div className="flex justify-center gap-3 items-center">
              <label htmlFor="show-unique-effects" className="inline-flex items-center gap-2 h-9 px-3 rounded text-sm text-white cursor-pointer select-none bg-gray-700 hover:bg-cyan-600 transition">
                <input type="checkbox" id="show-unique-effects" checked={showUniqueEffects} onChange={() => setShowUniqueEffects(v => !v)} className="accent-cyan-500 w-4 h-4" />
                Show Unique Effects
              </label>

              <div className="inline-grid grid-cols-2 rounded bg-slate-700 text-xs">
                <button className={`px-2 py-1 ${effectLogic === 'AND' ? 'bg-cyan-600' : ''}`} onClick={() => setEffectLogic('AND')}>AND</button>
                <button className={`px-2 py-1 ${effectLogic === 'OR' ? 'bg-cyan-600' : ''}`} onClick={() => setEffectLogic('OR')}>OR</button>
              </div>
            </div>

            {/* Panel Buffs/Debuffs */}
            <div className="mx-auto max-w-screen-lg w-full rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
              {/* Buffs */}
              <div className="w-full">
                <p className="text-xs uppercase tracking-wide text-cyan-300 text-center mb-2">Buffs</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {buffGroups.map((group, i) => {
                    const visible = group.effects
                      .map(k => k?.trim()).filter(Boolean)
                      .filter(key => showUniqueEffects || !key.startsWith('UNIQUE_'))
                    if (!visible.length) return null
                    return (
                      <div key={`${group.title ?? 'group'}-buff-${i}`} className="rounded-xl bg-slate-800/40 ring-1 ring-slate-700 p-2">
                        {group.title && <p className="text-cyan-300 font-semibold text-center mb-2">{group.title}</p>}
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
                <p className="text-xs uppercase tracking-wide text-red-300 text-center mb-2">Debuffs</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {debuffGroups.map((group, i) => {
                    const visible = group.effects
                      .map(k => k?.trim()).filter(Boolean)
                      .filter(key => showUniqueEffects || !key.startsWith('UNIQUE_'))
                    if (!visible.length) return null
                    return (
                      <div key={`${group.title ?? 'group'}-debuff-${i}`} className="rounded-xl bg-slate-800/40 ring-1 ring-slate-700 p-2">
                        {group.title && <p className="text-red-300 font-semibold text-center mb-2">{group.title}</p>}
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
            {showTagsPanel ? 'Hide Tags' : 'Show Tags'}
          </button>
        </div>

        {showTagsPanel && (
          <div className="w-full mt-2">
            <div className="mx-auto max-w-screen-lg rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
              <div className="grid md:grid-cols-2 gap-6">
                {TAG_GROUPS.map(group => (
                  <div key={group.title}>
                    <p className="text-xs uppercase tracking-wide text-slate-300 text-center mb-2">
                      {group.title.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </p>
                    {/* 2 rangées max, centrées et compactes */}
                    <div className="space-y-2">
                      {splitIntoRows(group.items, 2).map((row, ridx) => (
                        <div
                          key={`row-${group.title}-${ridx}`}
                          className="grid grid-cols-[repeat(auto-fit,minmax(120px,max-content))] gap-2 justify-center justify-items-center"
                        >
                          {row.map(({ key, meta }) => {
                            const active = tagFilter.includes(key)
                            return (
                              <FilterPill
                                key={key}
                                title={meta.desc}
                                active={active}
                                onClick={() =>
                                  setTagFilter(prev => {
                                    const type = meta.type
                                    const isSelected = prev.includes(key)
                                    const withoutType = prev.filter(k => (TAG_KEY_TO_TYPE[k] || TAG_INDEX[k]?.type) !== type)
                                    return isSelected ? withoutType : [...withoutType, key]
                                  })
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
              setTagFilter([]);
              setShowUniqueEffects(false);

              // ⬇️ collapse des panneaux
              setShowFilters(false);     // ferme Buffs/Debuffs
              setShowTagsPanel(false);   // ferme Tags

              // nettoie l'URL
              lastSerializedRef.current = pathname;
              router.replace(pathname, { scroll: false });
            }}
            className="bg-gray-700 hover:bg-red-700 px-4 py-1 rounded text-sm"
          >
            Reset filters
          </button>


          <button onClick={copyShareUrl} className="bg-gray-700 hover:bg-cyan-600 px-4 py-1 rounded text-sm">
            {copied ? 'Copied!' : 'Copy share link'}
          </button>
        </div>

        {/* Cards */}
        <div className="flex flex-wrap justify-center gap-6">
          {filtered.map((char, index) => {
            const isPriority = index <= 5
            return (
              <Link
                href={`/characters/${toKebabCase(char.Fullname.toLowerCase())}`}
                prefetch={false}
                key={char.ID}
                className="relative w-[120px] h-[231px] text-center shadow hover:shadow-lg transition overflow-hidden rounded"
              >
                {char.limited && (
                  <Image src="/images/ui/CM_Shop_Tag_Limited.webp" alt="Limited" width={75} height={30} className="absolute top-1 left-1 z-30 object-contain" style={{ width: 75, height: 30 }} />
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

                <CharacterNameDisplay fullname={char.Fullname} />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
