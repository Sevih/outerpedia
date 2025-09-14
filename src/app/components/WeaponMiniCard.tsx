"use client"

import React from "react"
import Image from "next/image"
import type { WeaponMini } from "@/types/equipment"
import rawStats from "@/data/stats.json"
import { highlightNumbersOnly } from "@/utils/textHighlighter"

type StatIconMap = {
  [statName: string]: {
    label: string
    icon: string
  }
}

const stats = rawStats as StatIconMap

const WeaponMiniCard = ({ weapon }: { weapon: WeaponMini }) => {
  const hasDualStats = weapon.forcedMainStat.includes("/")
  const mainStats = hasDualStats ? weapon.forcedMainStat.split("/") : [weapon.forcedMainStat]

  const renderStatIcons = () => (
    <div className="flex items-center gap-1">
      {mainStats.map((stat, index) => {
        const icon = stats[stat.trim()]?.icon ?? "/images/ui/stat/default.webp"
        return (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-white">/</span>}
            <div className="relative w-[14px] h-[14px] inline">
              <Image
                src={`/images/ui/effect/${icon}`}
                alt={`${stat.trim()} Icon`}
                fill
                className="object-contain"
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
              src={`/images/equipment/${weapon.image}`}
              alt={weapon.name}
              fill
              className="object-contain"
              sizes="48px"
            />
          </div>

          {weapon.effect_icon && (

            <div className="absolute top-1 right-1 z-10 w-[16px] h-[16px]">
              <Image
                src={`/images/ui/effect/TI_Icon_UO_Weapon_${weapon.effect_icon}.webp`}
                alt="Effect"
                fill
                className="object-contain"
                sizes="16px"
              />
            </div>
          )}

          {weapon.class && (

            <div className="absolute bottom-1 right-1 z-10 w-[16px] h-[16px]">
              <Image
                src={`/images/ui/class/${weapon.class.toLowerCase()}.webp`}
                alt={weapon.class}
                fill
                className="object-contain"
                sizes="16px"
              />
            </div>
          )}
        </div>

        {/* Tooltip */}
        {(weapon.source || weapon.boss || weapon.mode || weapon.effect_name || weapon.effect_desc4) && (
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max max-w-[250px] bg-gray-900 text-white text-[12px] rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg pointer-events-none">
            <p className="text-red-400 font-bold text-sm leading-tight mb-2">{weapon.name}</p>

            <div className="flex justify-between items-center gap-1 mb-1">
              <div className="flex items-center gap-1">
                <div className="relative inline w-[14px] h-[14px]">
                  <Image
                    src="/images/ui/effect/CM_Stat_Icon_ATK.webp"
                    alt="ATK Icon"
                    fill
                    className="object-contain"
                    sizes="14px"
                  />
                </div>
                <span>ATK</span>
              </div>
              <span>1200</span>
            </div>

            <div className="flex justify-between items-center gap-1 mt-1 mb-1">
              {renderStatIcons()}
              <span>
                {mainStats.map((stat, index) => {
                  const value = stat.includes("HP%") ? "48%" : "60%"
                  return (
                    <React.Fragment key={index}>
                      {index > 0 && " / "}
                      {value}
                    </React.Fragment>
                  )
                })}
              </span>
            </div>


            <p className="mt-1 text-gray-300">Apply 4 random substat(s)</p>

            <div className="border-t border-gray-600 bg-gray-700 rounded p-2 pt-2 mt-2">
              {weapon.effect_name && (
                <div className="bg-gray-500/80 rounded-full px-3 py-1 flex items-center gap-2 w-full justify-center mb-1">
                  <div className="relative w-[14px] h-[14px]">
                    <Image
                      src={`/images/ui/effect/SC_Buff_Effect_Freeze.webp`}
                      alt={weapon.effect_name}
                      fill
                      className="object-contain"
                      sizes="14px"
                    />
                  </div>

                  <span>Lv. 5 {weapon.effect_name}</span>
                </div>
              )}

              {weapon.effect_desc4 && (
                <p className="text-gray-300">
                  <span className="text-cyan-400 font-semibold">Tier 4: </span>
                  {highlightNumbersOnly(weapon.effect_desc4)}
                </p>
              )}
            </div>

            <div className="mt-2 text-xs text-gray-400">
              <div className="border-t border-gray-600 pt-2 mt-2">
                {weapon.source && <p><strong>Source:</strong> {weapon.source}</p>}
                {weapon.boss && <p><strong>Boss:</strong> {weapon.boss}</p>}
                {!weapon.boss && weapon.mode && <p><strong>Mode:</strong> {weapon.mode}</p>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bloc en dessous */}
      <div className="mt-1 text-center text-white text-[12px] leading-tight w-full z-0">
        <p className="font-semibold text-center line-clamp-2">
          {weapon.name.includes("[") ? (
            <>
              <span className="block">
                {weapon.name.split("[")[0].trim()}
              </span>
              <span className="block">
                [{weapon.name.split("[")[1]}
              </span>
            </>
          ) : (
            <span>{weapon.name}</span>
          )}
        </p>
        <div className="flex justify-center items-center gap-1 text-yellow-300">
          {renderStatIcons()}
        </div>
      </div>
    </div>
  )
}

export default WeaponMiniCard
