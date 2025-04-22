'use client'

import { useEffect, useState } from 'react'
import buffs from '@/data/buffs.json'
import debuffs from '@/data/debuffs.json'
import Image from 'next/image'
import Link from 'next/link'
import type { EffectData, CharacterLite, SkillLite} from '@/types/types'

const allEffectsRef: Record<string, EffectData & { type: 'buff' | 'debuff' }> = {}

for (const b of buffs) {
  const key = `buff:${b.name}`
  allEffectsRef[key] = { ...b, type: 'buff' }
}

for (const d of debuffs) {
  const key = `debuff:${d.name}`
  allEffectsRef[key] = { ...d, type: 'debuff' }
}

function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD") // enlever accents
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function ElementIcon({ element }: { element: string }) {
  return (
    <div className="w-6 h-6 relative">
      <Image
        src={`/images/ui/elem/${element.toLowerCase()}.png`}
        alt={element}
        width={24}
        height={24}
        style={{ width: 24, height: 24 }}
        className="object-contain"
      />
    </div>
  )
}

function ClassIcon({ className }: { className: string }) {
  return (
    <Image
      src={`/images/ui/class/${className.toLowerCase()}.png`}
      alt={className}
      width={24}
      height={24}
      style={{ width: 24, height: 24 }}
      className="inline-block"
    />
  )
}

function EffectIconRaw({ name, type }: { name: string; type: 'buff' | 'debuff' }) {
  const effect = allEffectsRef[`${type}:${name}`]
  const label = effect?.label || name
  const icon = effect?.icon || name
  const style =
    type === 'buff' ? 'bg-gray-700 hover:bg-blue-800/70' : 'bg-gray-700 hover:bg-red-800/70'

  return (
    <div
      className={`w-8 h-8 rounded flex items-center justify-center cursor-pointer ${style}`}
      title={effect?.description || label}
    >
      <div className="w-6 h-6 bg-black p-0.5 rounded flex items-center justify-center">
        <Image
          src={`/images/ui/effect/${icon}.png`}
          alt={label}
          width={30}
          height={30}
          className={`object-contain ${type}`}
          onError={(e) => {
            const el = e.target as HTMLImageElement
            el.style.display = 'none'
          }}
        />
      </div>
    </div>
  )
}



function extractAllEffects(characters: CharacterLite[], type: 'buff' | 'debuff'): string[] {
  const all = characters.flatMap((char) => getAllEffects(char, type))
  return [...new Set(all)].sort()
}

function normalizeEffectField(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    // Cas où c’est un effet unique bien formaté
    if (raw.startsWith('BT_')) return [raw]
    return []
  }
  return []
}

function getAllEffects(char: CharacterLite, type: 'buff' | 'debuff'): string[] {
  const skills = Object.values(char.skills || {}) as SkillLite[]

  const skillEffects = skills.flatMap((s) => normalizeEffectField(s[type]))

  const chainPassive = char.skills?.SKT_CHAIN_PASSIVE
  const chainDualEffects = [
    ...normalizeEffectField(chainPassive?.[type]),
    ...normalizeEffectField(chainPassive?.[`dual_${type}`])
  ]

  return [...new Set([...skillEffects, ...chainDualEffects])]
}




export default function CharactersPage() {
  const [characters, setCharacters] = useState<CharacterLite[]>([])
  const [loading, setLoading] = useState(true)

  const [filter, setFilter] = useState<string | null>(null)
  const [classFilter, setClassFilter] = useState<string | null>(null)
  const [rarityFilter, setRarityFilter] = useState<number | null>(null)
  const [selectedBuffs, setSelectedBuffs] = useState<string[]>([])
  const [selectedDebuffs, setSelectedDebuffs] = useState<string[]>([])
  const [effectLogic, setEffectLogic] = useState<'AND' | 'OR'>('OR')

  useEffect(() => {
    const fetchCharacters = async () => {
      const res = await fetch('/api/characters')
      const data = await res.json()
      setCharacters(data)
      setLoading(false)
    }
    fetchCharacters()
  }, [])

  const allBuffs = extractAllEffects(characters, 'buff')
  const allDebuffs = extractAllEffects(characters, 'debuff')
  
  //console.log('BUFFS:', allBuffs)
  //console.log('DEBUFFS:', allDebuffs)


  const toggleEffect = (
    key: string,
    selected: string[],
    setSelected: (v: string[]) => void
  ) => {
    if (selected.includes(key)) {
      setSelected(selected.filter((v) => v !== key))
    } else {
      setSelected([...selected, key])
    }
  }

  const filteredCharacters = characters.filter((char) => {
    const elementMatch = !filter || char.Element === filter
    const classMatch = !classFilter || char.Class === classFilter
    const rarityMatch = rarityFilter === null || char.Rarity === rarityFilter

    const hasBuffs = selectedBuffs.length > 0
      ? (effectLogic === 'AND'
        ? selectedBuffs.every((b) => getAllEffects(char, 'buff').includes(b))
        : selectedBuffs.some((b) => getAllEffects(char, 'buff').includes(b)))
      : true

    const hasDebuffs = selectedDebuffs.length > 0
      ? (effectLogic === 'AND'
        ? selectedDebuffs.every((d) => getAllEffects(char, 'debuff').includes(d))
        : selectedDebuffs.some((d) => getAllEffects(char, 'debuff').includes(d)))
      : true

    let effectMatch = true
    if (selectedBuffs.length > 0 && selectedDebuffs.length > 0) {
      effectMatch = effectLogic === 'AND'
        ? hasBuffs && hasDebuffs
        : hasBuffs || hasDebuffs
    } else if (selectedBuffs.length > 0) {
      effectMatch = hasBuffs
    } else if (selectedDebuffs.length > 0) {
      effectMatch = hasDebuffs
    }

    return elementMatch && classMatch && rarityMatch && effectMatch
  })

  const elements = [
    { name: 'All', value: null },
    { name: 'Fire', value: 'Fire' },
    { name: 'Water', value: 'Water' },
    { name: 'Earth', value: 'Earth' },
    { name: 'Light', value: 'Light' },
    { name: 'Dark', value: 'Dark' },
  ]

  const classes = [
    { name: 'All', value: null },
    { name: 'Striker', value: 'Striker' },
    { name: 'Defender', value: 'Defender' },
    { name: 'Ranger', value: 'Ranger' },
    { name: 'Healer', value: 'Healer' },
    { name: 'Mage', value: 'Mage' },
  ]

  const rarities = [
    { label: 'All', value: null },
    { label: 1, value: 1 },
    { label: 2, value: 2 },
    { label: 3, value: 3 },
  ]

  const rarityToStars = (rarity: number) => Array(rarity).fill(0)

  if (loading) {
    return <div className="text-center mt-8 text-white">Loading characters...</div>
  }

  return (    
    <div className="space-y-6">
      <script type="application/ld+json">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Characters – Outerpedia",
  "url": "https://outerpedia.com/characters",
  "description": "Browse all characters in Outerplane with builds, skills, stats and exclusive equipment.",  
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": characters.map((char, index) => ({
      "@type": "VideoGameCharacter",
      "name": char.Fullname,
      "url": `https://outerpedia.com/characters/${toKebabCase(char.Fullname)}`, // ou kebab-case
      "image": `https://outerpedia.com/images/characters/atb/IG_Turn_${char.ID}.png`,
      "position": index + 1,
    }))
  }
})}
</script>
      <h1 className="text-3xl font-bold">Characters</h1>

      <div className="flex justify-center gap-2 mb-4">
        {rarities.map((r) => (
          <button
            key={r.label}
            onClick={() => setRarityFilter(r.value === rarityFilter ? null : r.value)}
            className={`flex items-center justify-center ${
              rarityFilter === r.value ? 'bg-cyan-500' : 'bg-gray-700'
            } hover:bg-cyan-600 px-2 py-1 rounded border`}
          >
            {r.value === null ? (
              <span className="text-white text-sm font-bold">All</span>
            ) : (
              <div className="flex items-center -space-x-1">
                {Array(r.label)
                  .fill(0)
                  .map((_, i) => (
                    <Image
                      key={i}
                      src="/images/ui/star.png"
                      alt="star"
                      width={14}
                      height={14}
                      style={{ width: 14, height: 14 }}
                      className="object-contain"
                    />
                  ))}
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-8 mb-4 flex-wrap">
        <div className="flex gap-2">
          {elements.map((el) => (
            <button
              key={el.name}
              onClick={() => setFilter(el.value === filter ? null : el.value)}
              className={`flex items-center justify-center w-7 h-7 rounded border ${
                filter === el.value ? 'bg-cyan-500' : 'bg-gray-700'
              } hover:bg-cyan-600 transition`}
              title={el.name}
            >
              {el.value ? (
                <ElementIcon element={el.value} />
              ) : (
                <span className="text-white text-sm font-bold">All</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {classes.map((cl) => (
            <button
              key={cl.name}
              onClick={() => setClassFilter(cl.value === classFilter ? null : cl.value)}
              className={`flex items-center justify-center w-7 h-7 rounded border ${
                classFilter === cl.value ? 'bg-cyan-500' : 'bg-gray-700'
              } hover:bg-cyan-600 transition`}
              title={cl.name}
            >
              {cl.value ? (
                <Image
                  src={`/images/ui/class/${cl.value.toLowerCase()}.png`}
                  alt={cl.name}
                  width={24}
                  height={24}
                  style={{ width: 24, height: 24 }}
                />
              ) : (
                <span className="text-white text-sm font-bold">All</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-sm text-gray-300">Filter by buffs</p>
        <div className="flex flex-wrap justify-center gap-1">
        {allBuffs.map((buff) => (
            <div
              key={buff}
              onClick={() => toggleEffect(buff, selectedBuffs, setSelectedBuffs)}
              className={selectedBuffs.includes(buff) ? 'ring-2 ring-cyan-400 rounded' : ''}
            >
              <EffectIconRaw name={buff} type="buff" />
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-300 mt-4">Filter by debuffs</p>
        <div className="flex flex-wrap justify-center gap-1">
        {allDebuffs.map((debuff) => (
          <div
            key={debuff}
            onClick={() => toggleEffect(debuff, selectedDebuffs, setSelectedDebuffs)}
            className={selectedDebuffs.includes(debuff) ? 'ring-2 ring-red-800 rounded' : ''}
          >
            <EffectIconRaw name={debuff} type="debuff" />
          </div>
        ))}
        </div>
        <div className="mt-4 flex justify-center gap-4">
  <button
    onClick={() => setEffectLogic(effectLogic === 'AND' ? 'OR' : 'AND')}
    className="bg-gray-700 hover:bg-cyan-600 px-4 py-1 rounded text-sm"
  >
    Filter logic: {effectLogic}
  </button>
  <button
    onClick={() => {
      setFilter(null)
      setClassFilter(null)
      setRarityFilter(null)
      setSelectedBuffs([])
      setSelectedDebuffs([])
      setEffectLogic('OR')
    }}
    className="bg-gray-700 hover:bg-red-700 px-4 py-1 rounded text-sm"
  >
    Reset filters
  </button>
</div>

      </div>

      <div className="flex flex-wrap justify-center gap-6">
        {filteredCharacters.map((char,index) => (
          <Link
            href={`/characters/${char.Fullname.toLowerCase()}`}
            key={char.ID}
            className="w-[120px] text-center shadow hover:shadow-lg transition relative overflow-hidden"
          >
            <div className="relative w-[120px] h-[231px]">
              <Image
                src={`/images/characters/portrait/CT_${char.ID}.png`}
                alt={char.Fullname}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                priority={index === 0} //
              />
              <div className="absolute top-4 right-1 z-30 flex flex-col items-end -space-y-1 ">
                {rarityToStars(char.Rarity).map((_, i) => (
                  <Image
                    key={i}
                    src="/images/ui/star.png"
                    alt="star"
                    width={20}
                    height={20}
                    style={{ width: 20, height: 20 }}
                  />
                ))}
              </div>
              <div className="absolute bottom-12.5 right-2 z-30">
                <ClassIcon className={char.Class} />
              </div>
              <div className="absolute bottom-5.5 right-1.5 z-30">
                <ElementIcon element={char.Element} />
              </div>
              <div className="absolute bottom-5 left-2.5 z-30 text-white text-lg custom-text-shadow">
                {char.Fullname}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
