"use client"

import React from "react"
import Image from "next/image"
import type { AmuletMini } from "@/types/equipment"
import rawStats from "@/data/stats.json"
import { highlightNumbersOnly } from "@/utils/textHighlighter"

type StatIconMap = {
  [statName: string]: {
    label: string
    icon: string
  }
}

const stats = rawStats as StatIconMap

const amuletMiniCard = ({ amulet }: { amulet: AmuletMini }) => {
  const iconPath = stats[amulet.forcedMainStat]?.icon ?? "/images/ui/stat/default.png"

  return (
    <div className="flex flex-col items-center">
  {/* Zone de hover */}
  <div className="relative group">
    <div
      className="w-[48px] h-[48px] rounded shadow-md"
      style={{
        backgroundImage: "url(/images/ui/bg_item_leg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Image
        src={`/images/equipment/${amulet.image}`}
        alt={amulet.name}
        width={48}
        height={48}
        className="w-full h-full object-contain"
        unoptimized
      />

      {amulet.effect_icon && (
        <Image
          src={`/images/ui/effect/TI_Icon_UO_Accessary_${amulet.effect_icon}.png`}
          alt="Effect"
          width={16}
          height={16}
          className="absolute top-1 right-1 z-10"
          unoptimized
        />
      )}

      {amulet.class && (
        <Image
          src={`/images/ui/class/${amulet.class.toLowerCase()}.png`}
          alt={amulet.class}
          width={16}
          height={16}
          className="absolute bottom-1 right-1 z-10"
          unoptimized
        />
      )}
    </div>

    {/* Tooltip : n'apparaît que quand on survole l'image */}
    {(amulet.source || amulet.boss || amulet.mode || amulet.effect_name || amulet.effect_desc4) && (
      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max max-w-[250px] bg-gray-900 text-white text-[12px] rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg pointer-events-none">
        <p className="text-red-400 font-bold text-sm leading-tight mb-2">{amulet.name}</p>

        <div className="flex justify-between items-center gap-1 mt-1 mb-1">
          <div className="flex items-center gap-1">
            <Image
              src={`/images/ui/effect/${iconPath}`}
              alt={`${amulet.forcedMainStat} Icon`}
              width={14}
              height={14}
              style={{ width: 14, height: 14 }}
              className="inline"
              unoptimized
            />
            <span>{amulet.forcedMainStat}</span>
          </div>
          
        </div>

        <p className="mt-1 text-gray-300">Apply 4 random substat(s)</p>

        <div className="border-t border-gray-600 bg-gray-700 rounded p-2 pt-2 mt-2">
        {amulet.effect_name && (
  <div className="bg-gray-500/80 rounded-full px-3 py-1 flex items-center gap-2 w-full justify-center mb-1">
    <div className="relative w-[14px] h-[14px]">
      <Image
        src={`/images/ui/effect/SC_Buff_Effect_Freeze.png`}
        alt={amulet.effect_name}
        fill
        className="object-contain"
        unoptimized
      />
    </div>
    <span>Lv. 5 {amulet.effect_name}</span>
  </div>
)}

          {amulet.effect_desc4 && (
            <p className="text-gray-300">
              <span className="text-cyan-400 font-semibold">Tier 4: </span>
              {highlightNumbersOnly(amulet.effect_desc4)}
            </p>
          )}
        </div>

        <div className="mt-2 text-xs text-gray-400">
          <div className="border-t border-gray-600 pt-2 mt-2">
            {amulet.source && <p><strong>Source:</strong> {amulet.source}</p>}
            {amulet.boss && <p><strong>Boss:</strong> {amulet.boss}</p>}
            {!amulet.boss && amulet.mode && <p><strong>Mode:</strong> {amulet.mode}</p>}
          </div>
        </div>
      </div>
    )}
  </div>

  {/* Bloc en dessous : ne déclenche rien */}
  <div className="mt-1 text-center text-white text-[12px] leading-tight w-full z-0">
    <p className="font-semibold text-center line-clamp-2">
    {amulet.name.includes("[") ? (
        <>
          <span className="block">
            {amulet.name.split("[")[0].trim()}
          </span>
          <span className="block">
            [{amulet.name.split("[")[1]}
          </span>
        </>
      ) : (
        <span>{amulet.name}</span>
      )}
    </p>
    <div className="flex justify-center items-center gap-1 text-yellow-300">
      <Image
        src={`/images/ui/effect/${iconPath}`}
        alt={amulet.forcedMainStat}
        width={14}
        height={14}
        style={{ width: 14, height: 14 }}
        className="inline"
        unoptimized
      />
      <span>Main: {amulet.forcedMainStat}</span>
    </div>
  </div>
</div>

  )
}

export default amuletMiniCard
