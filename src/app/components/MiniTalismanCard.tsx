"use client"

import React from "react"
import Image from "next/image"
import type { Talisman } from "@/types/equipment"
import { highlightNumbersOnly } from "@/utils/textHighlighter"

const MiniTalismanCard = ({ talisman }: { talisman: Talisman }) => {
  const effect = talisman.effect?.trim()
  const effect10 = talisman.effect10?.trim()
  const showBoth = effect10 && effect10 !== effect

  return (
    <div className="relative group">
      <div
        className="w-[48px] h-[48px] rounded shadow-md"
        style={{
          backgroundImage: "url(/images/ui/bg_item_leg.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >

        <div className="relative [48px] h-[48px] ">
          <Image
            src={`/images/equipment/TI_Equipment_Talisman_${talisman.icon}.webp`}
            alt={talisman.name}
            fill
            className="object-contain"
            sizes="48px"
          />
        </div>

        {talisman.icon_effect && (

          <div className="absolute top-1 right-1 z-10 w-[16px] h-[16px]">
            <Image
              src={`/images/ui/effect/TI_Icon_UO_Talisman_${talisman.icon_item}.webp`}
              alt="Effect"
              fill
              className="object-contain"
              sizes="16px"
            />
          </div>
        )}
      </div>

      {/* Tooltip */}
      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max max-w-[250px] bg-gray-900 text-white text-[12px] rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg pointer-events-none">
        <p className="text-red-400 font-bold text-sm leading-tight mb-1">{talisman.name}</p>

        <div className="border-t border-gray-600 bg-gray-700 rounded p-2 pt-2 mt-2 flex flex-col gap-1">
          {effect && (
            <p>
              <span className="text-cyan-400 font-semibold">Lv. 1: </span>
              {highlightNumbersOnly(effect)}
            </p>
          )}
          {showBoth && (
            <p>
              <span className="text-yellow-400 font-semibold">Lv. 10: </span>
              {highlightNumbersOnly(effect10)}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default MiniTalismanCard
