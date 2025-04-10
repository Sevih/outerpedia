"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import WeaponMiniCard from "@/app/components/WeaponMiniCard"
import AccessoryMiniCard from "@/app/components/AccessoryMiniCard"
import SetMiniCard from "@/app/components/SetMiniCard"
import type { WeaponMini, AmuletMini, EquipmentBase, MiniSet } from "@/types/equipment"

type GearReference = { name: string; mainStat: string; usage?: string }

type RecommendedGearSet = {
  Weapon?: GearReference[]
  Amulet?: GearReference[]
  Set?: MiniSet[][]
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
}: {
  character: CharacterGearData
  weapons: EquipmentBase[]
  amulets: EquipmentBase[]
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
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
