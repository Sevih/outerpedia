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
  const hasDualStats = amulet.forcedMainStat.includes("/")
  const mainStats = hasDualStats ? amulet.forcedMainStat.split("/") : [amulet.forcedMainStat]

  const renderStatIcons = () => (
    <div className="flex items-center gap-1">
      {mainStats.map((stat, index) => {
        const icon = stats[stat.trim()]?.icon ?? "stat/default.webp"
        return (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-white">/</span>}

            <div className="relative w-[14px] h-[14px]">
              <Image
                src={`/images/ui/effect/${icon}`}
                alt={`${stat} Icon`}
                fill
                className="object-contain inline"
                sizes="14px"
              />
            </div>

            <span>{stat.trim()}</span>
          </React.Fragment>
        )
      })}
    </div>
  )

  return (
    <div className="flex flex-col items-center">
      {/* Zone de hover */}
      <div className="relative group">
        <div
          className="w-[48px] h-[48px] rounded shadow-md"
          style={{
            backgroundImage: "url(/images/ui/bg_item_leg.webp)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="relative w-[48px] h-[48px]">
            <Image
              src={`/images/equipment/${amulet.image}`}
              alt={amulet.name}
              fill
              className="w-full h-full object-contain"
              sizes="48px"
            />
          </div>

          {amulet.effect_icon && (
            <div className="absolute top-1 right-1 z-10 w-[16px] h-[16px]">
              <Image
                src={`/images/ui/effect/TI_Icon_UO_Accessary_${amulet.effect_icon}.webp`}
                alt="Effect"
                fill
                className="object-contain"
                sizes="16px"
              />
            </div>
          )}

          {amulet.class && (
            <div className="absolute bottom-1 right-1 z-10 w-[16px] h-[16px]">
              <Image
                src={`/images/ui/class/${amulet.class.toLowerCase()}.webp`}
                alt={amulet.class}
                fill
                className="object-contain"
                sizes="16px"
              />
            </div>


          )}
        </div>

        {/* Tooltip */}
        {(amulet.source || amulet.boss || amulet.mode || amulet.effect_name || amulet.effect_desc4) && (
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max max-w-[250px] bg-gray-900 text-white text-[12px] rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg pointer-events-none">
            <p className="text-red-400 font-bold text-sm leading-tight mb-2">{amulet.name}</p>

            <div className="flex justify-between items-center gap-1 mt-1 mb-1">
              {renderStatIcons()}

            </div>

            <p className="mt-1 text-gray-300">Apply 4 random substat(s)</p>

            <div className="border-t border-gray-600 bg-gray-700 rounded p-2 pt-2 mt-2">
              {amulet.effect_name && (
                <div className="bg-gray-500/80 rounded-full px-3 py-1 flex items-center gap-2 w-full justify-center mb-1">
                  <div className="relative w-[14px] h-[14px]">
                    <Image
                      src={`/images/ui/effect/SC_Buff_Effect_Freeze.webp`}
                      alt={amulet.effect_name}
                      fill
                      className="object-contain"
                      sizes="14px"
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

      {/* Bloc en dessous */}
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
          {renderStatIcons()}
        </div>
      </div>
    </div>
  )
}

export default amuletMiniCard
