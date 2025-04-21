"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import WeaponMiniCard from "@/app/components/WeaponMiniCard"
import AccessoryMiniCard from "@/app/components/AccessoryMiniCard"
import SetMiniCard from "@/app/components/SetMiniCard"
import TalismanMiniCard from "@/app/components/TalismanMiniCard"
import type { WeaponMini, AmuletMini, EquipmentBase, MiniSet,Talisman} from "@/types/equipment"
import rawStats from '@/data/stats.json' assert { type: 'json' }

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
        src="/images/ui/stats.png"
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
            {/* Nom + icône au-dessus */}
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

            {/* Barre de segments (all yellow if active) */}
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, j) => (
                <div
                  key={j}
                  className={`h-2 rounded-sm ${
                    j < stat.weight ? 'bg-yellow-400' : 'bg-gray-700'
                  }`}
                  style={{ width: '50px' }} // ajustable selon ton feeling
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

type RecommendedGearSet = {
  Weapon?: GearReference[]
  Amulet?: GearReference[]
  Set?: MiniSet[][]
  Talisman?: string[]  
  SubstatPrio?: string
  Note?: string
}

type CharacterGearData = {
  recommendedGearPVE?: RecommendedGearSet
  recommendedGearPVP?: RecommendedGearSet
}

function buildRecommendedMini<T extends EquipmentBase>(
  refs: GearReference[] | undefined,
  fullList: T[]
): T[] {
  return (
    refs
      ?.map(ref => {
        const item = fullList.find(i => i.name === ref.name)
        if (!item) return null
        return {
          ...item,
          forcedMainStat: ref.mainStat,
          ...(ref.usage ? { usage: ref.usage } : {}),
        } as T
      })
      .filter((x): x is T => x !== null) ?? []
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
  talismans: Talisman[] //
}) {

  const [gearTab, setGearTab] = useState<"PVE" | "PVP">("PVE")
  const tabList = [
    { key: "PVE", label: "PVE", icon: "pve.png" },
    { key: "PVP", label: "PVP", icon: "pvp.png" },
  ]

  const isPVE = gearTab === "PVE"
  const activeColor = isPVE ? "bg-cyan-500" : "bg-red-500"
  const [activeTabRef, setActiveTabRef] = useState<HTMLButtonElement | null>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (activeTabRef && indicatorRef.current) {
      const { offsetLeft, offsetWidth } = activeTabRef
      indicatorRef.current.style.transform = `translateX(${offsetLeft}px)`
      indicatorRef.current.style.width = `${offsetWidth}px`
    }
  }, [activeTabRef])

  const gear = isPVE ? character.recommendedGearPVE : character.recommendedGearPVP
  const recommendedWeapons = buildRecommendedMini<WeaponMini>(gear?.Weapon, weapons)
  const recommendedAmulets = buildRecommendedMini<AmuletMini>(gear?.Amulet, amulets)
  

  const recommendedTalismanNames = gear?.Talisman
  const recommendedTalismans = recommendedTalismanNames
  ?.map(name => talismans.find(t => t.name === name))
  .filter((x): x is Talisman => x !== undefined) ?? []


  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold text-white mb-4 text-center">Recommended Gear</h2>

      {/* Onglets animés */}
      <div className="flex justify-center mb-6">
        <div className="relative bg-gray-800 rounded-full p-1 flex gap-1 w-fit">
          {/* Slider animé */}
          <div
            ref={indicatorRef}
            className={`absolute top-1 left-0 h-[calc(100%-0.5rem)] ${activeColor} rounded-full transition-all duration-300 z-0`}
          ></div>

          {tabList.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setGearTab(key as "PVE" | "PVP")}
              ref={el => {
                if (gearTab === key) setActiveTabRef(el)
              }}
              className={`relative z-10 w-[100px] justify-center px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors duration-300 ${
                gearTab === key
                  ? "text-white"
                  : `text-gray-300 hover:${isPVE ? "bg-cyan-700" : "bg-red-700"}`
              }`}
            >
              <Image
                src={`/images/ui/nav/${icon}`}
                alt={label}
                width={18}
                height={18}
                className="w-[18px] h-[18px]"
                unoptimized
              />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu animé */}
      <AnimatePresence mode="wait">
        <motion.div
          key={gearTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col md:flex-row justify-center gap-10 text-center">
            {/* Armes */}
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-lg font-semibold text-white mb-1">Weapons</h3>
              {recommendedWeapons.map((weapon, idx) => (
                <WeaponMiniCard key={`weapon-${gearTab}-${idx}`} weapon={weapon} />
              ))}
            </div>

            {/* Accessoires */}
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-lg font-semibold text-white mb-1">Accessories</h3>
              {recommendedAmulets.map((amulet, idx) => (
                <AccessoryMiniCard key={`amulet-${gearTab}-${idx}`} accessory={amulet} />
              ))}
            </div>

            {/* Sets */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-semibold text-white mb-1">Sets</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {gear?.Set?.map((setCombo, idx) => (
                  <SetMiniCard key={`set-${gearTab}-${idx}`} sets={setCombo} />
                ))}
              </div>
            </div>
          </div>
           {/* Substats */}
           {(gear?.SubstatPrio || gear?.Note) && (
  <div className="flex flex-col md:flex-row justify-center gap-8 mt-6 items-start w-full max-w-4xl mx-auto">
    {/* Substat Priority (à gauche) */}
    {gear?.SubstatPrio && (
      <div className="flex-1 flex justify-center">
        <SubstatPriorityBar priorities={parseSubstatPrio(gear.SubstatPrio)} />
      </div>
    )}

    {/* Note (à droite) */}
    <div className="flex-1 flex flex-col gap-4 items-center">

    <div className="w-full bg-black/30 border border-white/10 rounded-lg p-4 flex flex-wrap justify-center gap-3 overflow-visible">

  {recommendedTalismans.length > 0 ? (
    recommendedTalismans.map((talisman, idx) => (
      <TalismanMiniCard key={`talisman-${gearTab}-${idx}`} talisman={talisman} />
    ))
  ) : (
    <div className="w-full max-w-[220px] min-h-[130px] flex items-center justify-center text-gray-400 italic">
      No talisman recommended
    </div>
  )}
</div>


  {/* Notes */}
  {gear?.Note && (
    <div className="w-full max-w-[220px] text-sm text-white bg-black/30 border border-white/10 rounded-lg p-4">
      <p className="font-bold mb-2 flex items-center gap-2">
        <Image
          src="/images/ui/note.png"
          alt="Note icon"
          width={20}
          height={20}
          className="object-contain"
        />
        Notes
      </p>
      <p className="text-gray-300 italic whitespace-pre-line">{gear.Note}</p>
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
