"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import WeaponMiniCard from "@/app/components/WeaponMiniCard"
import AccessoryMiniCard from "@/app/components/AccessoryMiniCard"
import type { WeaponMini, AmuletMini, EquipmentBase, MiniSet, Talisman } from "@/types/equipment"
import fullSets from "@/data/sets.json"
import rawStats from '@/data/stats.json' assert { type: 'json' }
import SetVisual from "./SetVisual"
import MiniTalismanCard from "@/app/components/MiniTalismanCard"
import { AnimatedTabs } from '@/app/components/AnimatedTabs'


const stats = rawStats as Record<string, { label: string; icon: string }>
type SubstatPriority = {
  code: string
  label: string
  icon: string
  weight: number // 1 à 5
}

function parseSubstatPrio(str: string): SubstatPriority[] {
  const groups = str.split('>').map(group => group.trim().split('=').map(s => s.trim().toUpperCase()))
  const maxWeight = groups.length
  const result: SubstatPriority[] = []

  groups.forEach((group, index) => {
    const weight = maxWeight - index
    group.forEach(code => {
      const data = stats[code]
      if (data) {
        result.push({
          code,
          label: data.label,
          icon: data.icon,
          weight
        })
      }
    })
  })

  return result
}

function SubstatPriorityBar({ priorities }: { priorities: SubstatPriority[] }) {
  return (
    <div className="flex flex-col items-center gap-4 mt-6">
      <p className="text-white font-semibold text-base flex items-center gap-2">
        <Image
          src="/images/ui/stats.webp"
          alt="Substat icon"
          width={32}
          height={32}
          style={{ width: 32, height: 32 }}
        />
        Substat Priority
      </p>
      <div className="flex flex-col gap-4 w-full max-w-md">
        {priorities.map((stat, i) => (
          <div key={i} className="flex flex-col items-start">
            <div className="flex items-center gap-2 mb-1">
              <Image
                src={`/images/ui/effect/${stat.icon}`}
                alt={stat.label}
                width={18}
                height={18}
                style={{ width: 18, height: 18 }}
              />
              <span className="text-sm text-white font-medium">{stat.label}</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, j) => (
                <div
                  key={j}
                  className={`h-2 rounded-sm ${j < stat.weight ? 'bg-yellow-400' : 'bg-gray-700'}`}
                  style={{ width: '50px' }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

type GearReference = { name: string; mainStat: string; usage?: string }

export type RecommendedGearSet = {
  Weapon?: GearReference[]
  Amulet?: GearReference[]
  Set?: MiniSet[][]
  Talisman?: string[]
  SubstatPrio?: string
  Note?: string
}

type CharacterGearData = {
  builds: Record<string, RecommendedGearSet>
}

function buildRecommendedMini<T extends EquipmentBase>(
  refs: GearReference[] | undefined,
  fullList: T[]
): T[] {
  return (
    refs?.map(ref => {
      const item = fullList.find(i => i.name === ref.name)
      if (!item) return null
      return {
        ...item,
        forcedMainStat: ref.mainStat,
        ...(ref.usage ? { usage: ref.usage } : {}),
      } as T
    }).filter((x): x is T => x !== null) ?? []
  )
}

export default function RecommendedGearTabs({
  character,
  weapons,
  amulets,
  talismans,
}: {
  character: CharacterGearData
  weapons: EquipmentBase[]
  amulets: EquipmentBase[]
  talismans: Talisman[]
}) {
  const buildNames = Object.keys(character.builds)
  const [gearTab, setGearTab] = useState(buildNames[0])

  const gear = character.builds[gearTab]
  const recommendedWeapons = buildRecommendedMini<WeaponMini>(gear?.Weapon, weapons)
  const recommendedAmulets = buildRecommendedMini<AmuletMini>(gear?.Amulet, amulets)
  const recommendedTalismanNames = gear?.Talisman
  const recommendedTalismans = recommendedTalismanNames?.map(name => talismans.find(t => t.name === name)).filter((x): x is Talisman => x !== undefined) ?? []

  const tabList = buildNames.map(name => ({
    key: name,
    label: name
  }))

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold text-white mb-4 text-center">Recommended Build and Gear</h2>

      <div className="flex justify-center mb-6">
        <AnimatedTabs
          tabs={tabList}
          selected={gearTab}
          onSelect={setGearTab}
          pillColor="#06b6d4" // cyan-500
          
        />
      </div>


      <AnimatePresence mode="wait">
        <motion.div
          key={gearTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col md:flex-row justify-center gap-10 text-center">
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-lg font-semibold text-white mb-1">Weapons</h3>
              {recommendedWeapons.map((weapon, idx) => (
                <WeaponMiniCard key={`weapon-${gearTab}-${idx}`} weapon={weapon} />
              ))}
            </div>
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-lg font-semibold text-white mb-1">Accessories</h3>
              {recommendedAmulets.map((amulet, idx) => (
                <AccessoryMiniCard key={`amulet-${gearTab}-${idx}`} amulet={amulet} />
              ))}
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-semibold text-white mb-1">Sets</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {gear?.Set?.map((combo, comboIdx) => {
                  if (combo.length === 1 && combo[0].count === 4) {
                    const full = fullSets.find((s) => s.name === combo[0].name)
                    if (!full) return null

                    return (
                      <div key={`set-4p-${comboIdx}`} className="flex justify-center mb-2">
                        <SetVisual
                          name={full.name}
                          image_prefix={full.image_prefix}
                          set_icon={full.set_icon}
                          part="full"
                          effect_2_4={full.effect_2_4}
                          effect_4_4={full.effect_4_4}
                        />

                      </div>
                    )
                  }

                  if (combo.length === 2 && combo[0].count === 2 && combo[1].count === 2) {
                    const setA = fullSets.find((s) => s.name === combo[0].name)
                    const setB = fullSets.find((s) => s.name === combo[1].name)
                    if (!setA || !setB) return null

                    return (
                      <div key={`set-2p-${comboIdx}`} className="flex gap-2 justify-center mb-2">
                        <SetVisual
                          name={setA.name}
                          image_prefix={setA.image_prefix}
                          set_icon={setA.set_icon}
                          part="head_chest"
                          effect_2_4={setA.effect_2_4}
                        />
                        <SetVisual
                          name={setB.name}
                          image_prefix={setB.image_prefix}
                          set_icon={setB.set_icon}
                          part="gloves_boots"
                          effect_2_4={setB.effect_2_4}
                        />
                      </div>
                    )
                  }

                  return null // fallback si mauvais format
                })}

              </div>
            </div>
          </div>

          {(gear?.SubstatPrio || gear?.Note) && (
            <div className="flex flex-col md:flex-row justify-center gap-8 mt-6 items-start w-full max-w-4xl mx-auto">
              {gear?.SubstatPrio && (
                <div className="flex-1 flex justify-center">
                  <SubstatPriorityBar priorities={parseSubstatPrio(gear.SubstatPrio)} />
                </div>
              )}
              <div className="flex-1 flex flex-col gap-4 items-center">
                <div className="flex-1 flex flex-col gap-4 items-center">
                  <div className="w-full">
                    <h4 className="text-sm text-white font-bold mb-1 text-center">Talisman</h4>
                    <div className="w-full rounded-lg p-4 flex flex-wrap justify-center gap-3 overflow-visible">
                      {recommendedTalismans.length > 0 ? (
                        recommendedTalismans.map((talisman, idx) => (
                          <MiniTalismanCard key={`talisman-${gearTab}-${idx}`} talisman={talisman} />
                        ))
                      ) : (
                        <div className="w-full max-w-[220px] min-h-[130px] flex items-center justify-center text-gray-400 italic">
                          No talisman recommended
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {gear?.Note && (
                  <div className="w-full max-w-[280px] text-sm text-white bg-black/30 border border-white/10 rounded-lg p-4">

                    <div className="flex items-center gap-2 mb-2">
                      <div className="relative w-[20px] h-[20px]">
                        <Image
                          src="/images/ui/nav/TI_Item_Growth_Book_01.webp"
                          alt="Note icon"
                          fill
                          className="object-contain"
                          sizes="20px"
                        />
                      </div>
                      <p className="font-bold">
                        Notes
                      </p>
                    </div>

                    <div className="text-gray-300 text-base space-y-3">
                      {gear.Note.split('\n').map((line, i) => {
                        const [label, rest] = line.split(':');
                        const matches = rest?.match(/([\w\s'\-]+?Charm)(\d)/g) || [];

                        if (!rest || matches.length === 0) {
                          return <p key={i}>{line}</p>; // 🔁 Rendu brut si aucun match
                        }

                        return (
                          <div key={i}>
                            <p className="font-semibold text-white text-base">{label.trim()}:</p>
                            <ul className="ml-4 space-y-1">
                              {matches.map((entry, j) => {
                                const name = entry.slice(0, -1).trim();
                                const rating = parseInt(entry.slice(-1), 10);

                                return (
                                  <li key={j} className="flex items-center gap-2">
                                    <span className="text-white">{name}</span>
                                    <div className="flex gap-[2px]">
                                      {[...Array(3)].map((_, idx) => (
                                        <Image
                                          key={idx}
                                          src={`/images/ui/${idx < rating ? 'CM_icon_star_y.webp' : 'CM_icon_star_w.webp'}`}
                                          alt={idx < rating ? '★' : '☆'}
                                          width={16}
                                          height={16}
                                          className="object-contain"
                                        />
                                      ))}
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}