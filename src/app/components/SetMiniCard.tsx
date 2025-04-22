"use client"

import React from "react"
import Image from "next/image"
import { highlightNumbersOnly } from "@/utils/textHighlighter"

type SetMiniCardProps = {
  name: string
  image_prefix: string
  set_icon: string
  count: number
  effect: string
}

const SetMiniCard = ({ name, image_prefix, set_icon, count, effect }: SetMiniCardProps) => {
  return (
    <div className="flex flex-col items-center">
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
            src={`/images/equipment/TI_Equipment_Helmet_${image_prefix}.png`}
            alt={name}
            width={48}
            height={48}
            className="w-full h-full object-contain"
            unoptimized
          />
          {set_icon && (
            <Image
              src={`/images/ui/effect/${set_icon}.png`}
              alt="Effect"
              width={16}
              height={16}
              className="absolute top-1 right-1 z-10"
              unoptimized
            />
          )}
        </div>

        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max max-w-[250px] bg-gray-900 text-white text-[12px] rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg pointer-events-none">
          <p className="text-red-400 font-bold text-sm leading-tight mb-2">{name}</p>
          <div className="border-t border-gray-600 bg-gray-700 rounded p-2 pt-2 mt-2">
            <p className="text-gray-300">
              <span className="text-cyan-400 font-semibold">{count}-Piece Effect: </span>
              {highlightNumbersOnly(effect)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-1 text-center text-white text-[12px] leading-tight w-full z-0">
        <p className="font-semibold text-center line-clamp-2">
          {name.includes("[") ? (
            <>
              <span className="block">{name.split("[")[0].trim()}</span>
              <span className="block">[{name.split("[")[1]}</span>
            </>
          ) : (
            <span>{name}</span>
          )}
        </p>
      </div>
    </div>
  )
}

export default SetMiniCard
