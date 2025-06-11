'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import type { CharacterLite } from '@/types/types'
import { toKebabCase } from '@/utils/formatText'
import type { ElementType, ClassType } from '@/types/enums';
import { groupEffects } from '@/utils/groupEffects'
import SearchBar from '@/app/components/SearchBar'

// Components dynamiques
const CharacterNameDisplay = dynamic(() => import('@/app/components/CharacterNameDisplay').then(mod => mod.CharacterNameDisplay))
const BuffDebuffDisplayMini = dynamic(() => import('@/app/components/BuffDebuffDisplayMini').then(mod => mod.default))
const ElementIcon = dynamic(() => import('@/app/components/ElementIcon').then(mod => mod.ElementIcon));
const ClassIcon = dynamic(() => import('@/app/components/ClassIcon').then(mod => mod.ClassIcon));



const orderedBuffGroups = [
  {
    title: 'Stat Boosts', items: [
      "BT_STAT|ST_ATK", "BT_STAT|ST_DEF", "BT_STAT|ST_SPEED",
      "BT_STAT|ST_CRITICAL_RATE", "BT_STAT|ST_CRITICAL_DMG_RATE",
      "BT_STAT|ST_BUFF_CHANCE", "BT_STAT|ST_BUFF_RESIST",
      "BT_STAT|ST_AVOID", "BT_STAT|ST_ACCURACY", "BT_STAT|ST_PIERCE_POWER_RATE", "BT_RANDOM_STAT"
    ]
  },
  {
    title: 'Supporting', items: [
      "BT_INVINCIBLE", "BT_SHIELD_BASED_CASTER", "BT_IMMUNE", "IG_Buff_BuffdurationIncrease",
      "BT_UNDEAD", "BT_STEALTHED", "BT_REMOVE_DEBUFF",
      "BT_REVIVAL", "BT_RESURRECTION_G", "SYS_CONTINU_HEAL", "BT_STAT|ST_VAMPIRIC"
    ]
  },
  {
    title: 'Utility', items: [
      "BT_COOL_CHARGE", "BT_ACTION_GAUGE", "BT_AP_CHARGE", "BT_STAT|ST_COUNTER_RATE", "BT_CP_CHARGE", "Heavy Strike",
      "BT_DMG_ELEMENT_SUPERIORITY", "BT_ADDITIVE_TURN",
      "SYS_BUFF_REVENGE", "SYS_REVENGE_HEAL", "SYS_BUFF_BREAK_DMG", "BT_CALL_BACKUP",
    ]
  },
  {
    title: 'Unique', items: [
      "UNIQUE_ARIEL", "UNIQUE_SAKURA_CHIRU", "UNIQUE_UME_ICHIRIN",
      "UNIQUE_GRACE_OF_THE_VIRGIN_GODDESS", "UNIQUE_CHARISMA",
      "UNIQUE_DOLL_GARDEN_CARETAKER", "UNIQUE_ETHER_BOOST",
      "UNIQUE_DESTROYER_PUNISHMENT", "UNIQUE_PUREBLOOD_DOMINION",
      "UNIQUE_RADIANT_WILL", "UNIQUE_RETRIBUTION_DOMINION",
      "UNIQUE_HUBRIS_DOMINION", "UNIQUE_GIFT_OF_BUFF",
      "UNIQUE_FIERCE_OFFENSIVE", "UNIQUE_REGINA_WORLD", "UNIQUE_NINJA_AFTERIMAGE", "UNIQUE_POLAR_KNIGHT", "UNIQUE_WHITE_KNIGHT"
    ]
  },
]

const orderedDebuffGroups = [
  {
    title: 'Stat Reduction', items: [
      "BT_STAT|ST_ATK", "BT_STAT|ST_DEF", "BT_STAT|ST_SPEED",
      "BT_STAT|ST_CRITICAL_RATE", "BT_STAT|ST_CRITICAL_DMG_RATE"
      , "BT_STAT|ST_BUFF_CHANCE", "BT_STAT|ST_BUFF_RESIST"
      , "BT_STAT|ST_AVOID", "BT_STAT|ST_ACCURACY"
    ]
  },
  {
    title: 'Control Effects (CC)', items: [
      "BT_FREEZE", "BT_STONE", "BT_STUN", "BT_SILENCE", "BT_AGGRO", "BT_MARKING"
    ]
  },
  {
    title: 'Damage Over Time (DoT)', items: [
      "BT_DOT_BURN", "BT_DOT_BURN_IR", "BT_DOT_CURSE", "BT_DOT_CURSE_IR",
      "BT_DOT_BLEED", "BT_DOT_BLEED_IR", "BT_DOT_POISON", "BT_DOT_LIGHTNING",
      "BT_DOT_ETERNAL_BLEED", "BT_DETONATE"
    ]
  },
  {
    title: 'Utility Debuffs', items: [
      "BT_COOL_CHARGE", "BT_ACTION_GAUGE", "BT_AP_CHARGE", "BT_SEAL_COUNTER", "BT_SEALED", "BT_SEALED_IR",
      "BT_SEALED_RESURRECTION", "BT_SEAL_ADDITIVE_ATTACK",

      "BT_STATBUFF_CONVERT_TO_STATDEBUFF", "BT_STEAL_BUFF", "BT_REMOVE_BUFF", "IG_Buff_BuffdurationReduce", "IG_Buff_DeBuffdurationIncrease",
      "BT_SEALED_RECEIVE_HEAL", "BT_WG_DMG", "BT_FIXED_DAMAGE"
    ]
  },
  {
    title: 'Unique', items: [
      "UNIQUE_MARTYRDOM", "UNIQUE_IRREGULAR_INFECTION"
    ]
  }
]
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

const chainTypes = [
  { name: 'All', value: null },
  { name: 'Starter', value: 'Start' },
  { name: 'Companion', value: 'Join' },
  { name: 'Finisher', value: 'Finish' },
]

const GiftTypes = [
  { name: 'All', value: null },
  { name: 'Science', value: 'science' },
  { name: 'Luxury', value: 'luxury' },
  { name: 'Magic Tool', value: 'magic tool' },
  { name: 'Craftwork', value: 'craftwork' },
  { name: 'Natural Object', value: 'natural object' }
]




// Buffs/Debuffs d'un personnage
// Récupère tous les buffs ou debuffs d'un personnage
function getAllEffects(char: CharacterLite, type: 'buff' | 'debuff'): string[] {
  return Array.isArray(char[type]) ? char[type]! : []
}

// Récupère tous les buffs ou debuffs de la liste complète
function extractAllEffects(characters: CharacterLite[], type: 'buff' | 'debuff'): string[] {
  return [...new Set(
    characters.flatMap((char) => Array.isArray(char[type]) ? char[type]! : [])
  )].sort()
}


export default function CharactersPage() {


  const [characters, setCharacters] = useState<CharacterLite[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string[]>([])
  const [classFilter, setClassFilter] = useState<string[]>([])

  const [rarityFilter, setRarityFilter] = useState<number[]>([])

  const [selectedBuffs, setSelectedBuffs] = useState<string[]>([])
  const [selectedDebuffs, setSelectedDebuffs] = useState<string[]>([])
  const [allBuffs, setAllBuffs] = useState<string[]>([])
  const [allDebuffs, setAllDebuffs] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [effectLogic, setEffectLogic] = useState<'AND' | 'OR'>('OR')
  const [showUniqueEffects, setShowUniqueEffects] = useState(false)
  const [showFilters, setShowFilters] = useState(false) // toogle on/off par defaut
  const [chainFilter, setChainFilter] = useState<string[]>([])
  const [giftFilter, setgiftFilter] = useState<string[]>([])

  useEffect(() => {
    const fetchCharacters = async () => {
      const res = await fetch('/api/characters-lite')
      const data = await res.json()
      setCharacters(data)
      setAllBuffs(extractAllEffects(data, 'buff'))
      setAllDebuffs(extractAllEffects(data, 'debuff'))
      setLoading(false)
    }

    fetchCharacters()
  }, [])

  // Si tous les éléments sont sélectionnés, on considère que All est activé
  useEffect(() => {
    const allElements = elements.slice(1).map((el) => el.value!) // sans null
    if (filter.length === allElements.length) {
      setFilter([]) // Reset to All
    }
  }, [filter])

  useEffect(() => {
    const allClasses = classes.slice(1).map((cl) => cl.value!)
    if (classFilter.length === allClasses.length) {
      setClassFilter([]) // Reset to All
    }
  }, [classFilter])

  useEffect(() => {
    const allRarities = rarities.slice(1).map((r) => r.value!)
    if (rarityFilter.length === allRarities.length) {
      setRarityFilter([]) // Reset to All
    }
  }, [rarityFilter])

  useEffect(() => {
    const allChains = chainTypes.slice(1).map((c) => c.value!)
    if (chainFilter.length === allChains.length) {
      setChainFilter([]) // Reset to All
    }
  }, [chainFilter])

  useEffect(() => {
    const allGift = GiftTypes.slice(1).map((c) => c.value!)
    if (giftFilter.length === allGift.length) {
      setgiftFilter([]) // Reset to All
    }
  }, [giftFilter])





  const toggleMultiSelect = (value: string, list: string[], setList: (v: string[]) => void) => {
    if (list.includes(value)) {
      setList(list.filter((v) => v !== value))
    } else {
      setList([...list, value])
    }
  }


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

  if (loading) {
    return <div className="text-center mt-8 text-white">Loading characters...</div>
  }





  const rarityToStars = (rarity: number) => Array(rarity).fill(0)




  return (
    <div className="space-y-6">
      {/* JSON-LD SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
                "url": `https://outerpedia.com/characters/${toKebabCase(char.Fullname)}`,
                "image": `https://outerpedia.com/images/characters/atb/IG_Turn_${char.ID}.webp`,
                "position": index + 1,
              })),
            },
          }),
        }}
      />


      <div className="sr-only">
        <h1>Outerplane Full Characters Database</h1>
      </div>
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="flex justify-center gap-2 mb-4">
        {rarities.map((r) => (
          <button
            key={r.label}
            onClick={() => {
              if (r.value === null) {
                setRarityFilter([]) // reset si "All"
              } else {
                toggleMultiSelect(String(r.value), rarityFilter.map(String), (v) => setRarityFilter(v.map(Number)))
              }
            }}
            className={`flex items-center justify-center ${(
              (r.value === null && rarityFilter.length === 0) ||
              (r.value !== null && rarityFilter.includes(r.value))
            ) ? 'bg-cyan-500' : 'bg-gray-700'} hover:bg-cyan-600 px-2 py-1 rounded border`}
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
                      src="/images/ui/star.webp"
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
              onClick={() =>
                el.value
                  ? toggleMultiSelect(el.value, filter, setFilter)
                  : setFilter([])
              }
              className={`flex items-center justify-center w-7 h-7 rounded border transition ${(el.value === null && filter.length === 0) ||
                (el.value === null && filter.length === elements.slice(1).length) ||
                (el.value !== null && filter.includes(el.value))
                ? 'bg-cyan-500'
                : 'bg-gray-700'
                } hover:bg-cyan-600`}

              title={el.name}
            >

              {el.value ? (
                <ElementIcon element={el.value as ElementType} />
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
              onClick={() =>
                cl.value
                  ? toggleMultiSelect(cl.value, classFilter, setClassFilter)
                  : setClassFilter([])
              }
              className={`flex items-center justify-center w-7 h-7 rounded border transition ${(cl.value === null && classFilter.length === 0) ||
                (cl.value === null && classFilter.length === classes.slice(1).length) ||
                (cl.value !== null && classFilter.includes(cl.value))
                ? 'bg-cyan-500'
                : 'bg-gray-700'
                } hover:bg-cyan-600`}

              title={cl.name}
            >

              {cl.value ? (
                <ClassIcon className={cl.name as ClassType} />
              ) : (
                <span className="text-white text-sm font-bold">All</span>
              )}
            </button>
          ))}
        </div>


        <div className="flex gap-2 justify-center">
          {chainTypes.map((ct) => (
            <button
              key={ct.name}
              onClick={() =>
                ct.value
                  ? toggleMultiSelect(ct.value, chainFilter, setChainFilter)
                  : setChainFilter([])
              }
              className={`flex items-center justify-center px-2 h-7 rounded border text-xs font-semibold transition ${(ct.value === null && chainFilter.length === 0) ||
                (ct.value === null && chainFilter.length === chainTypes.slice(1).length) ||
                (ct.value !== null && chainFilter.includes(ct.value))
                ? 'bg-cyan-500'
                : 'bg-gray-700'
                } hover:bg-cyan-600 text-white`}
            >

              {ct.value ? (
                <span className="text-white text-sm font-bold">{ct.name}</span>
              ) : (
                <span className="text-white text-sm font-bold">All</span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 justify-center">
        {GiftTypes.map((ct) => (
          <button
            key={ct.name}
            onClick={() =>
              ct.value
                ? toggleMultiSelect(ct.value, giftFilter, setgiftFilter)
                : setgiftFilter([])
            }
            className={`flex items-center justify-center px-2 h-7 rounded border text-xs font-semibold transition ${(ct.value === null && giftFilter.length === 0) ||
              (ct.value !== null && giftFilter.includes(ct.value))
              ? 'bg-cyan-500'
              : 'bg-gray-700'
              } hover:bg-cyan-600 text-white`}
          >
            <span className="text-white text-sm font-bold">{ct.name}</span>
          </button>
        ))}
      </div>



      <div className="text-center space-y-6">
        {/* Bouton pour afficher/masquer toute la section de filtres */}
        <div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-700 hover:bg-cyan-600 px-4 py-2 rounded text-sm mb-4"
          >
            {showFilters ? 'Hide Buffs/Debuffs Filters' : 'Show Buffs/Debuffs Filters'}
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-col items-center gap-8 w-full">
            {/* Buffs */}
            <div className="w-full">
              <div className="flex justify-center">
                <div className="flex flex-wrap justify-center gap-6 max-w-screen-lg">
                  {groupEffects(allBuffs, orderedBuffGroups, showUniqueEffects).map((group) => {
                    const visibleEffects = group.effects.filter(
                      (buffs) => showUniqueEffects || !buffs.startsWith('UNIQUE_')
                    )

                    return (
                      <div key={group.title}>
                        {group.title && visibleEffects.length > 0 && (
                          <p className="text-cyan-400 font-semibold mb-1 text-center">{group.title}</p>
                        )}
                        <div className="flex flex-wrap justify-center gap-1">
                          {visibleEffects.map((buffs) => (
                            <div
                              key={buffs}
                              onClick={() => toggleEffect(buffs, selectedBuffs, setSelectedBuffs)}
                              className={`cursor-pointer ${selectedBuffs.includes(buffs) ? 'ring-2 ring-cyan-400 rounded' : ''}`}
                            >
                              <BuffDebuffDisplayMini buffs={[buffs]} />
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
                  {groupEffects(allDebuffs, orderedDebuffGroups, showUniqueEffects).map((group) => {
                    const visibleEffects = group.effects.filter(
                      (debuffs) => showUniqueEffects || !debuffs.startsWith('UNIQUE_')
                    )

                    return (
                      <div key={group.title}>
                        {group.title && visibleEffects.length > 0 && (
                          <p className="text-red-400 font-semibold mb-1 text-center">{group.title}</p>
                        )}
                        <div className="flex flex-wrap justify-center gap-1">
                          {visibleEffects.map((debuffs) => (
                            <div
                              key={debuffs}
                              onClick={() => toggleEffect(debuffs, selectedDebuffs, setSelectedDebuffs)}
                              className={`cursor-pointer ${selectedDebuffs.includes(debuffs) ? 'ring-2 ring-red-800 rounded' : ''}`}
                            >
                              <BuffDebuffDisplayMini debuffs={[debuffs]} />
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




        {/* Options toujours visibles (logic and/or, reset, etc) */}
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => setEffectLogic(effectLogic === 'AND' ? 'OR' : 'AND')}
            className="bg-gray-700 hover:bg-cyan-600 px-4 py-1 rounded text-sm"
          >
            Filter logic: {effectLogic}
          </button>

          <button
            onClick={() => {
              setFilter([])
              setClassFilter([])
              setRarityFilter([])
              setSelectedBuffs([])
              setSelectedDebuffs([])
              setChainFilter([])
              setgiftFilter([])
              setEffectLogic('OR')
              setSearchTerm('') // 👈 Ajout ici
            }}
            className="bg-gray-700 hover:bg-red-700 px-4 py-1 rounded text-sm"
          >
            Reset filters
          </button>


          {/* Checkbox mieux intégrée */}
          <label
            htmlFor="show-unique-effects"
            className="flex items-center gap-2 rounded px-3 py-1 text-sm text-white cursor-pointer select-none transition bg-gray-700 hover:bg-cyan-600"
          >
            <input
              type="checkbox"
              id="show-unique-effects"
              checked={showUniqueEffects}
              onChange={() => setShowUniqueEffects(!showUniqueEffects)}
              className="accent-cyan-500 w-4 h-4"
            />
            Show Unique Effects
          </label>
        </div>
        {/* Carte personnage*/}
        <div className="flex flex-wrap justify-center gap-6">
          {characters
            .filter((char) =>
              char.Fullname.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((char, index) => {
              const elementMatch = filter.length === 0 || filter.includes(char.Element)
              const classMatch = classFilter.length === 0 || classFilter.includes(char.Class)
              const chainMatch = chainFilter.length === 0 || chainFilter.includes(char.Chain_Type || '')

              const giftMatch = giftFilter.length === 0 || giftFilter.includes((char.gift || '').trim().toLowerCase())


              const rarityMatch = rarityFilter.length === 0 || rarityFilter.includes(char.Rarity)


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

              const isVisible = elementMatch && classMatch && rarityMatch && chainMatch && effectMatch && giftMatch
              const isPriority = index <= 5;
              return (
                <Link
                  href={`/characters/${toKebabCase(char.Fullname.toLowerCase())}`}
                  prefetch={false}
                  key={char.ID}
                  className={`relative w-[120px] h-[231px] text-center shadow hover:shadow-lg transition overflow-hidden rounded ${isVisible ? '' : 'hidden'}`}
                >
                  {char.limited && (
                    <Image
                      src="/images/ui/CM_Shop_Tag_Limited.webp"
                      alt="Limited"
                      width={75}
                      height={30}
                      className="absolute top-1 left-1 z-30 object-contain"
                      style={{ width: 75, height: 30 }}
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
                  {/* Les décorations (étoiles, icônes) que tu avais dans l'ancien <div> tu peux aussi les garder ici, ABSOLUMENT rien ne change */}
                  <div className="absolute top-4 right-1 z-30 flex flex-col items-end -space-y-1">
                    {rarityToStars(char.Rarity).map((_, i) => (
                      <Image
                        key={i}
                        src="/images/ui/star.webp"
                        alt="star"
                        width={20}
                        height={20}
                        style={{ width: 20, height: 20 }}
                      />
                    ))}
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