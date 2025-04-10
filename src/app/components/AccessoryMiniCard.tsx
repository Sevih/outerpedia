"use client"

import React from "react"
import Image from "next/image"
import type { AmuletMini } from "@/types/equipment"
import rawStats from "@/data/stats.json"

// pour que TypeScript accepte l'accès dynamique aux clés du JSON
type StatIconMap = {
  [statName: string]: {
    label: string
    icon: string
  }
}

const stats = rawStats as StatIconMap

const AccessoryMiniCard = ({ accessory }: { accessory: AmuletMini }) => {
  const iconPath = stats[accessory.forcedMainStat]?.icon ?? "/images/ui/stat/default.png"

  return (
    <div className="flex flex-col items-center group">
      <div
        className="relative w-[48px] h-[48px] rounded shadow-md"
        style={{
          backgroundImage: "url(/images/ui/bg_item_leg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Image
          src={`/images/equipment/${accessory.image}`}
          alt={accessory.name}
          width={96}
          height={96}
          className="w-full h-full object-contain"
          unoptimized
        />

        {accessory.effect_icon && (
          <Image
            src={`/images/ui/effect/TI_Icon_UO_Weapon_${accessory.effect_icon}.png`}
            alt="Effect"
            width={20}
            height={20}
            className="absolute top-1 right-1 z-10"
            unoptimized
          />
        )}

        {accessory.class && (
          <Image
            src={`/images/ui/class/${accessory.class.toLowerCase()}.png`}
            alt={accessory.class}
            width={20}
            height={20}
            className="absolute bottom-1 right-1 z-10"
            unoptimized
          />
        )}

        {(accessory.source || accessory.boss || accessory.mode) && (
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max max-w-[200px] bg-black text-white text-[10px] rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
            {accessory.source && <p><strong>Source:</strong> {accessory.source}</p>}
            {accessory.boss && <p><strong>Boss:</strong> {accessory.boss}</p>}
            {!accessory.boss && accessory.mode && <p><strong>Mode:</strong> {accessory.mode}</p>}
          </div>
        )}
      </div>

      <div className="mt-1 text-center text-white text-[12px] leading-tight w-full">
      <p className="font-semibold text-center line-clamp-2">{accessory.name}</p>

        <div className="flex justify-center items-center gap-1 text-yellow-300">
          <Image
            src={`/images/ui/effect/${iconPath}`}
            alt={accessory.forcedMainStat}
            width={14}
            height={14}
            style={{ width: 14, height: 14 }}
            className="inline"
            unoptimized
          />
          <span>Main: {accessory.forcedMainStat}</span>
        </div>
      </div>
    </div>
  )
}

export default AccessoryMiniCard
