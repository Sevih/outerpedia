'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
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
import rawTAG_TYPES from '@/data/tagTypes.json'

// ===== Helpers for effect lookup
const buffToId: Record<string, number> = effectsIndex.buffs
const debuffToId: Record<string, number> = effectsIndex.debuffs
const idToBuff = Object.fromEntries(Object.entries(buffToId).map(([k, v]) => [v, k])) as Record<number, string>
const idToDebuff = Object.fromEntries(Object.entries(debuffToId).map(([k, v]) => [v, k])) as Record<number, string>

// ===== Dynamic components (keep client bundle small)
const CharacterNameDisplay = dynamic(() => import('@/app/components/CharacterNameDisplay').then(m => m.CharacterNameDisplay))
const BuffDebuffDisplayMini = dynamic(() => import('@/app/components/BuffDebuffDisplayMini').then(m => m.default))
const TagDisplayMini = dynamic(() => import('@/app/components/TagDisplayMini').then(m => m.default))
const ElementIcon = dynamic(() => import('@/app/components/ElementIcon').then(m => m.ElementIcon))
const ClassIcon = dynamic(() => import('@/app/components/ClassIcon').then(m => m.ClassIcon))

type TagMeta = {
  label: string
  image: string
  desc: string
  type: string
}

type TagTypeStyle = {
  className: string
}
const typeLabel = (t: string) => t.slice(0, 1).toUpperCase() + t.slice(1)

// ===== Types
type Payload = {
  el?: string[]
  cl?: string[]
  r?: number[]
  chain?: string[]
  gift?: string[]
  buffs?: string[]
  debuffs?: string[]
  logic?: 'AND' | 'OR'
  q?: string
  uniq?: boolean
  role?: string[]
  tags?: string[]
}

type ZPayload = {
  e?: number[]
  c?: number[]
  r?: number[]
  ch?: number[]
  g?: number[]
  b?: number[]
  d?: number[]
  lg?: 0 | 1
  q?: string
  u?: 0 | 1
  rl?: string[]
  tg?: string[]
}

// ===== Constants (could live in a shared "filterOptions.ts")
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
const TAG_TYPES = rawTAG_TYPES as Record<string, TagTypeStyle>
const TAG_KEYS = Object.keys(TAG_INDEX)
const TAGS = TAG_KEYS.map(k => ({
  key: k,
  label: TAG_INDEX[k].label,
  image: TAG_INDEX[k].image,
  desc: TAG_INDEX[k].desc,
  type: TAG_INDEX[k].type,
}))

// ——— Tag helpers: one-per-category
const TAG_KEY_TO_TYPE: Record<string, string> = Object.fromEntries(
  TAGS.map(t => [t.key, t.type])
)

/** Garde au plus 1 tag par catégorie, en conservant le premier rencontré */
function keepOnePerType(keys: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const k of keys) {
    const type = TAG_KEY_TO_TYPE[k] || TAG_INDEX[k]?.type
    if (!type) continue
    if (seen.has(type)) continue
    seen.add(type)
    out.push(k)
  }
  return out
}

const ROLES = [
  { name: "All", value: null },
  { name: "DPS", value: "dps" },
  { name: "Support", value: "support" },
  { name: "Sustain", value: "sustain" },
] as const

const isRole = (v: unknown): v is RoleType =>
  v === 'DPS' || v === 'Support' || v === 'Sustain'




const orderedBuffGroups = [
  {
    title: 'Stat Boosts',
    items: [
      'BT_STAT|ST_ATK', 'BT_STAT|ST_DEF', 'BT_STAT|ST_SPEED',
      'BT_STAT|ST_CRITICAL_RATE', 'BT_STAT|ST_CRITICAL_DMG_RATE',
      'BT_STAT|ST_BUFF_CHANCE', 'BT_STAT|ST_BUFF_RESIST',
      'BT_STAT|ST_AVOID', 'BT_STAT|ST_ACCURACY', 'BT_STAT|ST_PIERCE_POWER_RATE', 'BT_RANDOM_STAT',
    ],
  },
  {
    title: 'Supporting',
    items: [
      'BT_INVINCIBLE', 'BT_SHIELD_BASED_CASTER', 'BT_IMMUNE', 'IG_Buff_BuffdurationIncrease',
      'BT_UNDEAD', 'BT_STEALTHED', 'BT_REMOVE_DEBUFF',
      'BT_REVIVAL', 'BT_RESURRECTION_G', 'SYS_CONTINU_HEAL', 'BT_STAT|ST_VAMPIRIC',
    ],
  },
  {
    title: 'Utility',
    items: [
      'BT_COOL_CHARGE', 'BT_ACTION_GAUGE', 'BT_AP_CHARGE', 'BT_STAT|ST_COUNTER_RATE', 'BT_CP_CHARGE', 'Heavy Strike',
      'BT_DMG_ELEMENT_SUPERIORITY', 'BT_ADDITIVE_TURN',
      'SYS_BUFF_REVENGE', 'SYS_REVENGE_HEAL', 'SYS_BUFF_BREAK_DMG', 'BT_CALL_BACKUP',
    ],
  },
  {
    title: 'Unique',
    items: [
      'UNIQUE_ARIEL', 'UNIQUE_SAKURA_CHIRU', 'UNIQUE_UME_ICHIRIN',
      'UNIQUE_GRACE_OF_THE_VIRGIN_GODDESS', 'UNIQUE_CHARISMA',
      'UNIQUE_DOLL_GARDEN_CARETAKER', 'UNIQUE_ETHER_BOOST',
      'UNIQUE_DESTROYER_PUNISHMENT', 'UNIQUE_PUREBLOOD_DOMINION',
      'UNIQUE_RADIANT_WILL', 'UNIQUE_RETRIBUTION_DOMINION',
      'UNIQUE_HUBRIS_DOMINION', 'UNIQUE_GIFT_OF_BUFF',
      'UNIQUE_FIERCE_OFFENSIVE', 'UNIQUE_REGINA_WORLD', 'UNIQUE_NINJA_AFTERIMAGE', 'UNIQUE_POLAR_KNIGHT', 'UNIQUE_WHITE_KNIGHT',
    ],
  },
]

const orderedDebuffGroups = [
  {
    title: 'Stat Reduction',
    items: [
      'BT_STAT|ST_ATK', 'BT_STAT|ST_DEF', 'BT_STAT|ST_SPEED',
      'BT_STAT|ST_CRITICAL_RATE', 'BT_STAT|ST_CRITICAL_DMG_RATE',
      'BT_STAT|ST_BUFF_CHANCE', 'BT_STAT|ST_BUFF_RESIST',
      'BT_STAT|ST_AVOID', 'BT_STAT|ST_ACCURACY',
    ],
  },
  {
    title: 'Control Effects (CC)',
    items: ['BT_FREEZE', 'BT_STONE', 'BT_STUN', 'BT_SILENCE', 'BT_AGGRO', 'BT_MARKING'],
  },
  {
    title: 'Damage Over Time (DoT)',
    items: [
      'BT_DOT_BURN', 'BT_DOT_BURN_IR', 'BT_DOT_CURSE', 'BT_DOT_CURSE_IR',
      'BT_DOT_BLEED', 'BT_DOT_BLEED_IR', 'BT_DOT_POISON', 'BT_DOT_LIGHTNING',
      'BT_DOT_ETERNAL_BLEED', 'BT_DETONATE',
    ],
  },
  {
    title: 'Utility Debuffs',
    items: [
      'BT_COOL_CHARGE', 'BT_ACTION_GAUGE', 'BT_AP_CHARGE', 'BT_SEAL_COUNTER', 'BT_SEALED', 'BT_SEALED_IR',
      'BT_SEALED_RESURRECTION', 'BT_SEAL_ADDITIVE_ATTACK',
      'BT_STATBUFF_CONVERT_TO_STATDEBUFF', 'BT_STEAL_BUFF', 'BT_REMOVE_BUFF', 'IG_Buff_BuffdurationReduce', 'IG_Buff_DeBuffdurationIncrease',
      'BT_SEALED_RECEIVE_HEAL', 'BT_WG_DMG', 'BT_FIXED_DAMAGE', 'BT_RESOURCE_DOWN'
    ],
  },
  { title: 'Unique', items: ['UNIQUE_MARTYRDOM', 'UNIQUE_IRREGULAR_INFECTION'] },
]

// ===== Small pure helpers
const isArr = <T,>(v: T[] | undefined): v is T[] => Array.isArray(v) && v.length > 0
const getAllEffects = (char: CharacterLite, type: 'buff' | 'debuff') => (Array.isArray(char[type]) ? char[type]! : [])
const extractAllEffects = (list: CharacterLite[], type: 'buff' | 'debuff') =>
  [...new Set(list.flatMap(c => (Array.isArray(c[type]) ? c[type]! : [])))].sort()

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
  title,
  className,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
  title?: string
  className?: string
}) {
  const base = 'inline-flex items-center justify-center rounded border transition text-white hover:bg-cyan-600'
  const state = active ? 'bg-cyan-500' : 'bg-gray-700'
  // className est mis en DERNIER pour que ses utilitaires Tailwind prennent le dessus
  const cls = [base, state, className].filter(Boolean).join(' ')
  return (
    <button onClick={onClick} title={title} className={cls}>
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

export default function CharactersPage() {
  const [characters, setCharacters] = useState<CharacterLite[]>([])
  const [loading, setLoading] = useState(true)
  const [showTagsPanel, setShowTagsPanel] = useState(false)

  const [elementFilter, setElementFilter] = useState<string[]>([])
  const [classFilter, setClassFilter] = useState<string[]>([])
  const [rarityFilter, setRarityFilter] = useState<number[]>([])
  const [chainFilter, setChainFilter] = useState<string[]>([])
  const [giftFilter, setGiftFilter] = useState<string[]>([])
  const [roleFilter, setRoleFilter] = useState<RoleType[]>([])
  const [tagFilter, setTagFilter] = useState<string[]>([])



  const [selectedBuffs, setSelectedBuffs] = useState<string[]>([])
  const [selectedDebuffs, setSelectedDebuffs] = useState<string[]>([])
  const [allBuffs, setAllBuffs] = useState<string[]>([])
  const [allDebuffs, setAllDebuffs] = useState<string[]>([])

  const [searchTerm, setSearchTerm] = useState('')
  const [effectLogic, setEffectLogic] = useState<'AND' | 'OR'>('OR')
  const [showUniqueEffects, setShowUniqueEffects] = useState<boolean>(false)
  const [showFilters, setShowFilters] = useState(false)
  const [copied, setCopied] = useState(false)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastSerializedRef = useRef('')
  const didHydrateFromURL = useRef(false)

  const copyShareUrl = () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    if (!url) return
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    })
  }

  const payload = useMemo<Payload>(() => ({
    el: elementFilter.length ? elementFilter : undefined,
    cl: classFilter.length ? classFilter : undefined,
    r: rarityFilter.length ? rarityFilter : undefined,
    chain: chainFilter.length ? chainFilter : undefined,
    gift: giftFilter.length ? giftFilter : undefined,
    buffs: selectedBuffs.length ? selectedBuffs : undefined,
    debuffs: selectedDebuffs.length ? selectedDebuffs : undefined,
    logic: effectLogic !== 'OR' ? effectLogic : undefined,
    q: searchTerm.trim() || undefined,
    uniq: showUniqueEffects || undefined,
    role: roleFilter.length ? roleFilter : undefined,
    tags: tagFilter.length ? tagFilter : undefined,
  }), [elementFilter, classFilter, rarityFilter, chainFilter, giftFilter,
    selectedBuffs, selectedDebuffs, effectLogic, searchTerm, showUniqueEffects,
    roleFilter, tagFilter])

  const applyPayload = (p: Partial<Payload>) => {
    setElementFilter(p.el ?? [])
    setClassFilter(p.cl ?? [])
    setRarityFilter(p.r ?? [])
    setChainFilter(p.chain ?? [])
    setGiftFilter(p.gift ?? [])
    setSelectedBuffs(p.buffs ?? [])
    setSelectedDebuffs(p.debuffs ?? [])
    setSearchTerm(p.q ?? '')
    setEffectLogic(p.logic === 'AND' || p.logic === 'OR' ? p.logic : 'OR')
    setShowUniqueEffects(Boolean(p.uniq))
    setRoleFilter((p.role ?? []).filter(isRole))
    setTagFilter(keepOnePerType(p.tags ?? []))
  }

  const TAG_GROUPS = useMemo(() => {
    const byType: Record<string, TagMeta[]> = {}
    for (const k of Object.keys(TAG_INDEX)) {
      const meta = TAG_INDEX[k as keyof typeof TAG_INDEX] as TagMeta
      if (!meta) continue
        ; (byType[meta.type] ||= []).push(meta)
    }
    // on veut aussi la key (slug) → on reconstruit depuis TAGS (qui a key+meta)
    const byTypeWithKeys: { title: string; items: { key: string; meta: TagMeta }[] }[] = []
    const mapByType: Record<string, { key: string; meta: TagMeta }[]> = {}
    for (const t of TAGS) {
      (mapByType[t.type] ||= []).push({ key: t.key, meta: { label: t.label, image: t.image, desc: t.desc, type: t.type } })
    }
    for (const [t, items] of Object.entries(mapByType)) {
      byTypeWithKeys.push({ title: typeLabel(t), items })
    }
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



  // 3) Normalize "All" selections (if all chosen → reset)
  useEffect(() => {
    const all = ['DPS', 'Support', 'Sustain'] as RoleType[]
    if (roleFilter.length === all.length) setRoleFilter([])
  }, [roleFilter])


  useEffect(() => {
    const all = ELEMENTS.slice(1).map(e => e.value!)
    if (elementFilter.length === all.length) setElementFilter([])
  }, [elementFilter])

  useEffect(() => {
    const all = CLASSES.slice(1).map(c => c.value!)
    if (classFilter.length === all.length) setClassFilter([])
  }, [classFilter])

  useEffect(() => {
    const all = RARITIES.slice(1).map(r => r.value!)
    if (rarityFilter.length === all.length) setRarityFilter([])
  }, [rarityFilter])

  useEffect(() => {
    const all = CHAINS.slice(1).map(c => c.value!)
    if (chainFilter.length === all.length) setChainFilter([])
  }, [chainFilter])

  useEffect(() => {
    const all = GIFTS.slice(1).map(g => g.value!)
    if (giftFilter.length === all.length) setGiftFilter([])
  }, [giftFilter])

  useEffect(() => {
    const groups = groupEffects(allDebuffs, orderedDebuffGroups, showUniqueEffects)
    const other = groups.find(g => g.title?.toLowerCase() === 'other')
    if (other) console.log('[DEBUG Other debuffs]', other.effects)
  }, [allDebuffs, showUniqueEffects])

  useEffect(() => {
    setTagFilter(prev => keepOnePerType(prev))
  }, [showTagsPanel]) // ou [] si tu veux le faire une fois après mount



  // 4) Sync filters → URL
  useEffect(() => {
    const isEmpty =
      !payload.el && !payload.cl && !payload.r &&
      !payload.chain && !payload.gift &&
      !payload.buffs && !payload.debuffs &&
      !payload.role && !payload.tags &&
      !payload.logic && !payload.q && !payload.uniq

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

  // 5) Derived filtered characters (memoized)
  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase()
    return characters.filter(char => {
      if (!char.Fullname.toLowerCase().includes(q)) return false

      const elementMatch = elementFilter.length === 0 || elementFilter.includes(char.Element)
      const classMatch = classFilter.length === 0 || classFilter.includes(char.Class)
      const chainMatch = chainFilter.length === 0 || chainFilter.includes(char.Chain_Type || '')
      const giftMatch = giftFilter.length === 0 || giftFilter.includes((char.gift || '').trim().toLowerCase())
      const rarityMatch = rarityFilter.length === 0 || rarityFilter.includes(char.Rarity)

      const hasBuffs = selectedBuffs.length > 0
        ? (effectLogic === 'AND'
          ? selectedBuffs.every(b => getAllEffects(char, 'buff').includes(b))
          : selectedBuffs.some(b => getAllEffects(char, 'buff').includes(b)))
        : true

      const hasDebuffs = selectedDebuffs.length > 0
        ? (effectLogic === 'AND'
          ? selectedDebuffs.every(d => getAllEffects(char, 'debuff').includes(d))
          : selectedDebuffs.some(d => getAllEffects(char, 'debuff').includes(d)))
        : true

      const effectMatch = (selectedBuffs.length > 0 && selectedDebuffs.length > 0)
        ? (effectLogic === 'AND' ? hasBuffs && hasDebuffs : hasBuffs || hasDebuffs)
        : (selectedBuffs.length > 0 ? hasBuffs : selectedDebuffs.length > 0 ? hasDebuffs : true)

      // ✅ NOUVEAU — safe avec optional fields
      const roleMatch = roleFilter.length === 0 || (char.role && roleFilter.includes(char.role))
      const tagMatch = tagFilter.length === 0 || tagFilter.every(t => char.tags?.includes(t))

      return elementMatch && classMatch && rarityMatch && chainMatch && effectMatch && giftMatch && roleMatch && tagMatch
    })
  }, [
    characters, searchTerm, elementFilter, classFilter, chainFilter, giftFilter, rarityFilter,
    selectedBuffs, selectedDebuffs, effectLogic,
    roleFilter, tagFilter
  ])


  // ===== Render
  if (loading) return <div className="text-center mt-8 text-white">Loading characters...</div>

  return (
    <div className="space-y-6">
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

      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {/* Rarities */}
      <div className="flex justify-center gap-2 mb-4"> {/* gap augmenté */}
        {RARITIES.map(r => (
          <FilterPill
            key={String(r.label)}
            active={(r.value === null && rarityFilter.length === 0) || (r.value !== null && rarityFilter.includes(r.value))}
            onClick={() => {
              if (r.value === null) setRarityFilter([])
              else {
                const has = rarityFilter.includes(r.value)
                setRarityFilter(has ? rarityFilter.filter(v => v !== r.value) : [...rarityFilter, r.value])
              }
            }}
            className="px-1 py-1 text-sm font-semibold"
          >
            {r.value === null ? (
              <span className="text-white font-bold">All</span>
            ) : (
              <div className="flex items-center -space-x-1">
                {Array.from({ length: r.label as number }).map((_, i) => (
                  <Image
                    key={i}
                    src="/images/ui/star.webp"
                    alt="star"
                    width={16}
                    height={16}
                    style={{ width: 16, height: 16 }}
                    className="object-contain"
                  />
                ))}
              </div>
            )}
          </FilterPill>
        ))}
      </div>


      {/* Elements + Classes */}
      <div className="flex justify-center gap-4 mb-4 flex-wrap">
        {/* Elements */}
        <div className="flex gap-2">
          {ELEMENTS.map(el => (
            <FilterPill
              key={el.name}
              title={el.name}
              active={(el.value === null && elementFilter.length === 0) || (el.value !== null && elementFilter.includes(el.value))}
              onClick={() => (el.value ? setElementFilter(prev => prev.includes(el.value as string) ? prev.filter(v => v !== el.value) : [...prev, el.value as string]) : setElementFilter([]))}
              className="w-7 h-7 px-0"
            >
              {el.value ? <ElementIcon element={el.value as ElementType} /> : <span className="text-white text-sm font-bold">All</span>}
            </FilterPill>
          ))}
        </div>
        {/* Classes */}
        <div className="flex gap-2">
          {CLASSES.map(cl => (
            <FilterPill
              key={cl.name}
              title={cl.name}
              active={(cl.value === null && classFilter.length === 0) || (cl.value !== null && classFilter.includes(cl.value))}
              onClick={() => (cl.value ? setClassFilter(prev => prev.includes(cl.value as string) ? prev.filter(v => v !== cl.value) : [...prev, cl.value as string]) : setClassFilter([]))}
              className="w-7 h-7 px-0"
            >
              {cl.value ? <ClassIcon className={cl.name as ClassType} /> : <span className="text-white text-sm font-bold">All</span>}
            </FilterPill>
          ))}
        </div>
        {/* Chains */}
        <div className="overflow-x-auto -mx-2 px-2">
          <div className="flex gap-2 w-max"> {/* gap augmenté */}
            {CHAINS.map(ct => (
              <FilterPill
                key={ct.name}
                active={(ct.value === null && chainFilter.length === 0) || (ct.value !== null && chainFilter.includes(ct.value))}
                onClick={() => (ct.value ? setChainFilter(prev => prev.includes(ct.value as string) ? prev.filter(v => v !== ct.value) : [...prev, ct.value as string]) : setChainFilter([]))}
                className="px-1 py-1 text-sm font-semibold"
              >
                <span className="text-white">{ct.name}</span>
              </FilterPill>
            ))}
          </div>
        </div>
      </div>

      {/* Gifts */}
      <div className="w-full flex justify-center">
        <div className="flex flex-wrap justify-center gap-2 sm:overflow-x-auto sm:flex-nowrap sm:w-max sm:-mx-2 sm:px-2"> {/* gap augmenté */}
          {GIFTS.map(g => (
            <FilterPill
              key={g.name}
              active={(g.value === null && giftFilter.length === 0) || (g.value !== null && giftFilter.includes(g.value))}
              onClick={() => (g.value ? setGiftFilter(prev => prev.includes(g.value as string) ? prev.filter(v => v !== g.value) : [...prev, g.value as string]) : setGiftFilter([]))}
              className="px-1 py-1 text-sm font-semibold"
            >
              <span className="text-white">{g.name}</span>
            </FilterPill>
          ))}
        </div>
      </div>
      {/* Roles */}
      <div className="flex gap-2 justify-center mb-2">
        {ROLES.map(r => (
          <FilterPill
            key={r.name}
            title={r.name}
            active={(r.value === null && roleFilter.length === 0) || (r.value !== null && roleFilter.includes(r.value as RoleType))}
            onClick={() => {
              if (!r.value) return setRoleFilter([])
              setRoleFilter(prev =>
                prev.includes(r.value as RoleType)
                  ? prev.filter(v => v !== (r.value as RoleType))
                  : [...prev, r.value as RoleType]
              )
            }}
            className="px-2 py-1 text-sm font-semibold"
          >
            <span className="text-white">{r.name}</span>
          </FilterPill>
        ))}
      </div>

      {/* Toggle filters */}
      <div className="text-center space-y-6">
        <div className='flex gap-2 justify-center'>
          <button onClick={() => setShowFilters(s => !s)} className="bg-gray-700 hover:bg-cyan-600 px-4 py-2 rounded text-sm mb-4">
            {showFilters ? 'Hide Buffs/Debuffs Filters' : 'Show Buffs/Debuffs Filters'}
          </button>
          <button onClick={() => setEffectLogic(l => (l === 'AND' ? 'OR' : 'AND'))} className="bg-gray-700 hover:bg-cyan-600 px-4 py-2 rounded text-sm mb-4">
            Buff Filter logic: {effectLogic}
          </button>
        </div>

        {showFilters && (

          <div className="flex flex-col items-center gap-8 w-full">
            <label htmlFor="show-unique-effects" className="flex items-center gap-2 rounded px-3 py-1 text-sm text-white cursor-pointer select-none transition bg-gray-700 hover:bg-cyan-600">
              <input type="checkbox" id="show-unique-effects" checked={showUniqueEffects} onChange={() => setShowUniqueEffects(v => !v)} className="accent-cyan-500 w-4 h-4" />
              Show Unique Effects
            </label>
            {/* Buffs */}
            <div className="w-full">
              <div className="flex justify-center">
                <div className="flex flex-wrap justify-center gap-6 max-w-screen-lg">
                  {groupEffects(allBuffs, orderedBuffGroups, showUniqueEffects).map(group => {
                    const visible = group.effects
                      .map(k => k?.trim())
                      .filter(Boolean)
                      .filter(key => showUniqueEffects || !key.startsWith('UNIQUE_'))

                    if (visible.length === 0) return null  // ⬅️ ne pas rendre "Other" vide

                    return (
                      <div key={group.title}>
                        {group.title && <p className="text-cyan-400 font-semibold mb-1 text-center">{group.title}</p>}
                        <div className="flex flex-wrap justify-center gap-1">
                          {visible.map(key => (
                            <div
                              key={key}
                              onClick={() =>
                                setSelectedBuffs(prev => prev.includes(key) ? prev.filter(v => v !== key) : [...prev, key])
                              }
                              className={`cursor-pointer ${selectedBuffs.includes(key) ? 'ring-2 ring-cyan-400 rounded' : ''}`}
                            >
                              <BuffDebuffDisplayMini buffs={[key]} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}

                </div>
              </div>
            </div>

            {/* Debuffs */}
            <div className="w-full">
              <div className="flex justify-center">
                <div className="flex flex-wrap justify-center gap-6 max-w-screen-lg">
                  {groupEffects(allDebuffs, orderedDebuffGroups, showUniqueEffects).map(group => {
                    const visible = group.effects
                      .map(k => k?.trim())
                      .filter(Boolean)
                      .filter(key => showUniqueEffects || !key.startsWith('UNIQUE_'))

                    if (visible.length === 0) return null  // ⬅️ ne pas rendre "Other" vide

                    return (
                      <div key={group.title}>
                        {group.title && <p className="text-red-400 font-semibold mb-1 text-center">{group.title}</p>}
                        <div className="flex flex-wrap justify-center gap-1">
                          {visible.map(key => (
                            <div
                              key={key}
                              onClick={() =>
                                setSelectedDebuffs(prev => prev.includes(key) ? prev.filter(v => v !== key) : [...prev, key])
                              }
                              className={`cursor-pointer ${selectedDebuffs.includes(key) ? 'ring-2 ring-red-800 rounded' : ''}`}
                            >
                              <BuffDebuffDisplayMini debuffs={[key]} />
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

        {/* NEW: toggle Tags */}
        <div>
          <button
            onClick={() => setShowTagsPanel(s => !s)}
            className="bg-gray-700 hover:bg-cyan-600 px-4 py-2 rounded text-sm"
          >
            {showTagsPanel ? 'Hide Tags' : 'Show Tags'}
          </button>
        </div>
        {showTagsPanel && (
          <div className="w-full">
            <div className="flex justify-center">
              <div className="flex flex-wrap justify-center gap-8 max-w-screen-lg">
                {TAG_GROUPS.map(group => (
                  <div key={group.title}>
                    <p className="text-white-400 font-semibold mb-1 text-center">
                      {group.title
                        .split('-')
                        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(' ')}
                    </p>

                    <div className="flex flex-wrap justify-center gap-2">
                      {group.items.map(({ key, meta }) => (
                        <button
                          key={key}
                          title={meta.desc}
                          onClick={() =>
                            setTagFilter(prev => {
                              const type = meta.type
                              const isSelected = prev.includes(key)
                              // retire tout tag de la même catégorie
                              const withoutType = prev.filter(k => (TAG_KEY_TO_TYPE[k] || TAG_INDEX[k]?.type) !== type)
                              // toggle: si déjà sélectionné → on retire (donc rien), sinon on ajoute
                              return isSelected ? withoutType : [...withoutType, key]
                            })
                          }
                          className={[
                            "px-2 py-1 text-xs font-semibold border rounded inline-flex items-center gap-1 transition",
                            TAG_TYPES[meta.type]?.className ?? "bg-gray-700 text-white border-gray-600",
                            tagFilter.includes(key) ? "ring-2 ring-cyan-400" : ""
                          ].join(' ')}
                        >
                          <span><TagDisplayMini tags={key} /></span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}



        {/* Options: logic / reset / share / unique */}
        <div className="mt-4 flex flex-wrap justify-center gap-4">


          <button
            onClick={() => {
              setElementFilter([])
              setClassFilter([])
              setRarityFilter([])
              setSelectedBuffs([])
              setSelectedDebuffs([])
              setChainFilter([])
              setGiftFilter([])
              setEffectLogic('OR')
              setSearchTerm('')
              setRoleFilter([])
              setTagFilter([])
              setShowUniqueEffects(false)
              lastSerializedRef.current = pathname
              router.replace(pathname, { scroll: false })
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
