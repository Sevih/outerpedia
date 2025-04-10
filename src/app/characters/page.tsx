'use client'

import characters from '@/data/characters.json'
import effects from '@/data/effects.json'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EffectIcon({ effect, type }: { effect: any; type: 'buff' | 'debuff' }) {
  const style =
    type === 'buff' ? 'bg-gray-700 hover:bg-blue-800/70' : 'bg-gray-700 hover:bg-red-800/70'
  return (
    <div
      className={`w-8 h-8 rounded flex items-center justify-center cursor-pointer ${style}`}
      title={effect.label}
    >
      {effect.icon ? (
        <div className="w-6 h-6 bg-black p-0.5 rounded flex items-center justify-center">
          <Image
            src={`/images/ui/effect/SC_Buff_${effect.icon}.png`}
            alt={effect.label}
            width={30}
            height={30}
            className={`object-contain ${type}`}
          />
        </div>
      ) : (
        <span className="text-[10px] text-white text-center px-1">{effect.label}</span>
      )}
    </div>
  )
}

export default function CharactersPage() {
  const [filter, setFilter] = useState<string | null>(null)
  const [classFilter, setClassFilter] = useState<string | null>(null)
  const [rarityFilter, setRarityFilter] = useState<number | null>(null)
  const [selectedBuffs, setSelectedBuffs] = useState<string[]>([])
  const [selectedDebuffs, setSelectedDebuffs] = useState<string[]>([])
  const [effectLogic, setEffectLogic] = useState<'AND' | 'OR'>('OR')

  const allBuffs = Object.entries(effects.buffs).map(([key, data]) => ({ key, ...data }))
  const allDebuffs = Object.entries(effects.debuffs).map(([key, data]) => ({ key, ...data }))

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
    const elementMatch = !filter || char.element === filter
    const classMatch = !classFilter || char.class === classFilter
    const rarityMatch = rarityFilter === null || char.rarity === rarityFilter

    const hasBuffs = selectedBuffs.length > 0
  ? (effectLogic === 'AND'
    ? selectedBuffs.every((b) => char.buffs?.includes(b))
    : selectedBuffs.some((b) => char.buffs?.includes(b)))
  : false

    const hasDebuffs = selectedDebuffs.length > 0
      ? (effectLogic === 'AND'
        ? selectedDebuffs.every((d) => (char.debuffs as string[])?.includes(d))
        : selectedDebuffs.some((d) => (char.debuffs as string[])?.includes(d))      )
      : false

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

  return (
    <div className="space-y-6">
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
              key={buff.key}
              onClick={() => toggleEffect(buff.key, selectedBuffs, setSelectedBuffs)}
              className={selectedBuffs.includes(buff.key) ? 'ring-2 ring-cyan-400 rounded' : ''}
            >
              <EffectIcon effect={buff} type="buff" />
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-300 mt-4">Filter by debuffs</p>
        <div className="flex flex-wrap justify-center gap-1">
          {allDebuffs.map((debuff) => (
            <div
              key={debuff.key}
              onClick={() => toggleEffect(debuff.key, selectedDebuffs, setSelectedDebuffs)}
              className={selectedDebuffs.includes(debuff.key) ? 'ring-2 ring-cyan-400 rounded' : ''}
            >
              <EffectIcon effect={debuff} type="debuff" />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <button
            onClick={() =>
              setEffectLogic(effectLogic === 'AND' ? 'OR' : 'AND')
            }
            className="bg-gray-700 hover:bg-cyan-600 px-4 py-1 rounded text-sm"
          >
            Filter logic: {effectLogic}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-6">
        {filteredCharacters.map((char) => (
          <Link
            href={`/characters/${char.name.toLowerCase()}`}
            key={char.id}
            className="w-[120px] text-center shadow hover:shadow-lg transition relative overflow-hidden"
          >
            <div className="relative w-[120px] h-[231px]">
              <Image
                src={char.portrait}
                alt={char.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
              <div className="absolute top-4 right-1 z-30 flex flex-col items-end -space-y-1 ">
                {rarityToStars(char.rarity).map((_, i) => (
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
                <ClassIcon className={char.class} />
              </div>
              <div className="absolute bottom-5.5 right-1.5 z-30">
                <ElementIcon element={char.element} />
              </div>
              <div className="absolute bottom-5 left-2.5 z-30 text-white text-lg custom-text-shadow">
                {char.name}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
