"use client"

import React from "react"
import Image from "next/image"
import type { WeaponMini } from "@/types/equipment"
import rawStats from "@/data/stats.json"

// pour que TypeScript accepte l'accès dynamique aux clés du JSON
type StatIconMap = {
  [statName: string]: {
    label: string
    icon: string
  }
}

const stats = rawStats as StatIconMap

const WeaponMiniCard = ({ weapon }: { weapon: WeaponMini }) => {

  const iconPath = stats[weapon.forcedMainStat]?.icon ?? "/images/ui/stat/default.png"

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
          src={`/images/equipment/${weapon.image}`}
          alt={weapon.name}
          width={48}
          height={48}
          className="w-full h-full object-contain"
          unoptimized
        />
  
        {weapon.effect_icon && (
          <Image
            src={`/images/ui/effect/TI_Icon_UO_Weapon_${weapon.effect_icon}.png`}
            alt="Effect"
            width={20}
            height={20}
            className="absolute top-1 right-1 z-10"
            unoptimized
          />
        )}
  
        {weapon.class && (
          <Image
            src={`/images/ui/class/${weapon.class.toLowerCase()}.png`}
            alt={weapon.class}
            width={20}
            height={20}
            className="absolute bottom-1 right-1 z-10"
            unoptimized
          />
        )}
  
        {/* Tooltip DOIT être dans ce bloc relatif */}
        {(weapon.source || weapon.boss || weapon.mode) && (
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max max-w-[200px] bg-black text-white text-[10px] rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
            {weapon.source && <p><strong>Source:</strong> {weapon.source}</p>}
            {weapon.boss && <p><strong>Boss:</strong> {weapon.boss}</p>}
            {!weapon.boss && weapon.mode && <p><strong>Mode:</strong> {weapon.mode}</p>}
          </div>
        )}
      </div>
  
      <div className="mt-1 text-center text-white text-[12px] leading-tight w-full">
      <p className="font-semibold text-center line-clamp-2">{weapon.name}</p>
        <div className="flex justify-center items-center gap-1 text-yellow-300">
          <Image
            src={`/images/ui/effect/${iconPath}`}
            alt={weapon.forcedMainStat}
            width={14}
            height={14}
            style={{ width: 14, height: 14 }}
            className="inline"
            unoptimized
          />
          <span>Main: {weapon.forcedMainStat}</span>
        </div>
      </div>
    </div>
  )
}

export default WeaponMiniCard
