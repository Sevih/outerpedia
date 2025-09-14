"use client"

import React from "react"
import Image from "next/image"
import { highlightNumbersOnly } from "@/utils/textHighlighter"

type Props = {
  name: string
  image_prefix: string
  set_icon: string
  part: "head_chest" | "gloves_boots" | "full"
  effect_2_4?: string | null
  effect_4_4?: string | null
}

const imageMap = {
  head_chest: ["Helmet", "Armor"],
  gloves_boots: ["Gloves", "Shoes"],
  full: ["Helmet", "Armor", "Gloves", "Shoes"],
}

const SetVisual = ({
  name,
  image_prefix,
  set_icon,
  part,
  effect_2_4,
  effect_4_4,
}: Props) => {
  return (
    <div className="relative group">
      <div className="grid grid-cols-2 gap-0.5 p-1 rounded">
        {imageMap[part].map((piece) => (
          <div
            key={piece}
            className="relative w-[48px] h-[48px] rounded shadow-md"
            style={{
              backgroundImage: "url(/images/ui/bg_item_leg.webp)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >

            <div className="relative w-[48px] h-[48px]">
              <Image
                src={`/images/equipment/TI_Equipment_${piece}_${image_prefix}.webp`}
                alt={piece}
                fill
                className="object-contain"
                sizes="48px"
              />
            </div>

            <div className="absolute top-0 right-0 z-10 w-[16px] h-[16px]">
              <Image
                src={`/images/ui/effect/TI_Icon_Set_Enchant_${set_icon}.webp`}
                alt="Set Icon"
                fill
                className="object-contain"
                sizes="16px"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {(effect_2_4 || effect_4_4) && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max max-w-[250px] bg-gray-900 text-white text-[12px] rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg pointer-events-none">
          <p className="text-red-400 font-bold text-sm mb-1 text-center">{name}</p>
          {effect_2_4 && (
            <p className="text-gray-300">
              <span className="text-cyan-400 font-semibold">2 Piece: </span>
              {highlightNumbersOnly(effect_2_4)}
            </p>
          )}
          {effect_4_4 && (
            <p className="text-gray-300 mt-1">
              <span className="text-cyan-400 font-semibold">4 Piece: </span>
              {highlightNumbersOnly(effect_4_4)}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default SetVisual
