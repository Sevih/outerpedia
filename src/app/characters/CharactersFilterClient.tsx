'use client'

import BuffDebuffDisplayMini from '@/app/components/BuffDebuffDisplayMini'
import { groupEffects } from '@/utils/groupEffects'


interface CharactersFilterClientProps {
  allBuffs: string[]
  allDebuffs: string[]
  selectedBuffs: string[]
  selectedDebuffs: string[]
  setSelectedBuffs: (buffs: string[]) => void
  setSelectedDebuffs: (debuffs: string[]) => void
  showUniqueEffects: boolean
  orderedBuffGroups: { title: string; items: string[] }[]
  orderedDebuffGroups: { title: string; items: string[] }[]
}


export default function CharactersFilterClient({
  allBuffs,
  allDebuffs,
  selectedBuffs,
  selectedDebuffs,
  setSelectedBuffs,
  setSelectedDebuffs,
  showUniqueEffects,
  orderedBuffGroups,
  orderedDebuffGroups,
}: CharactersFilterClientProps) {
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

  return (
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
  )
}
