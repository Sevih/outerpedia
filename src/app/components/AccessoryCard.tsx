import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import equipmentTypes from "@/data/equipment_types.json";
import { highlightNumbersOnly } from '@/utils/textHighlighter';
import statsData from "@/data/stats.json";
import type { Accessory } from "@/types/equipment";


const subStatCount = equipmentTypes.amulet.subStatNumber;
const AccessoryCard = ({ accessory }: { accessory: Accessory }) => {
  const cardRef = useRef<HTMLDivElement>(null);
const [tooltipAlign, setTooltipAlign] = useState("tooltip-center");

useEffect(() => {
  const updateTooltipAlignment = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const padding = 30;
      const tooltipWidth = 320;

      if (rect.left < tooltipWidth / 2 + padding) {
        setTooltipAlign("tooltip-left");
      } else if (rect.right + tooltipWidth / 2 > window.innerWidth - padding) {
        setTooltipAlign("tooltip-right");
      } else {
        setTooltipAlign("tooltip-center");
      }
    }
  };

  updateTooltipAlignment();
  window.addEventListener("resize", updateTooltipAlignment);
  return () => window.removeEventListener("resize", updateTooltipAlignment);
}, []);

  return (
    <div ref={cardRef} className={`w-[110px] h-[110px] relative group ${tooltipAlign}`}>
      <Image
        src="/images/ui/bg_item_leg.png"
        alt="Background"
        width={110}
        height={110}
        className="absolute inset-0 w-full h-full object-cover z-0 rounded"
        unoptimized
      />

      {accessory.image && (
        <Image
          src={`/images/equipment/${accessory.image}`}
          alt={accessory.name}
          width={110}
          height={110}
          className="absolute z-10 w-full h-full object-contain rounded"
          unoptimized
        />
      )}

      <div className="absolute top-1 right-1 z-30 flex flex-col items-end gap-1">
        {accessory.effect_icon && accessory.effect_icon !== null && (
          <Image
            src={`/images/ui/effect/TI_Icon_UO_Accessary_${accessory.effect_icon}.png`}
            alt="Effect Icon"
            width={24}
            height={24}
            className="w-6 h-6"
            unoptimized
          />
        )}
        {accessory.class && (
          <Image
            src={`/images/ui/class/${accessory.class.toLowerCase()}.png`}
            alt={accessory.class}
            width={24}
            height={24}
            className="w-6 h-6"
            unoptimized
          />
        )}
      </div>

      <div className="tooltip absolute top-full mt-2 z-50 w-[320px] min-h-[200px] bg-gray-900 text-white rounded p-4 text-xs flex flex-col shadow-lg
              opacity-0 scale-95 translate-y-1 invisible
              transition-all duration-200 ease-out delay-0
              group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 group-hover:visible group-hover:delay-100">
              <p className="text-red-400 font-bold text-sm leading-tight mb-2">{accessory.name}</p>
              <p className="text-red-300 mb-2 text-sm">{accessory.rarity} Accessory</p>
      

<div className="flex items-center gap-1 flex-wrap mt-2">
  {accessory.mainStats.map((stat) => {
    const data = (statsData as Record<string, { label: string; icon: string }>)[stat];
    return data ? (
      <Image
        key={stat}
        src={`/images/ui/effect/${data.icon}`}
        alt={data.label}
        width={16}
        height={16}
        className="w-4 h-4"
        unoptimized
      />
    ) : null;
  })}
  <p>At Random</p>
</div>

      
              <p className="text-center mt-2 font-semibold text-sm">Apply {subStatCount} random substat(s)</p>
      
              <div className="mt-3 bg-gray-700 rounded p-2">
                <p className="text-xs font-bold text-yellow-300 mb-1">Set Effects</p>
                <p className="text-sm whitespace-normal break-words">
                  <span className="text-cyan-400 font-semibold">Tier 0:</span> {highlightNumbersOnly(accessory.effect_desc1)}
                </p>
                <p className="text-sm whitespace-normal break-words">
                  <span className="text-cyan-400 font-semibold">Tier 4:</span> {highlightNumbersOnly(accessory.effect_desc4)}
                </p>
              </div>
      
              {(accessory.source || accessory.boss || accessory.mode) && (
                <div className="mt-3 border-t border-gray-600 pt-2 text-[11px] text-gray-300">
                  {accessory.source && (
                    <p><span className="text-gray-400 font-semibold">Source:</span> {accessory.source}</p>
                  )}
                  {accessory.boss && (
                    <p><span className="text-gray-400 font-semibold">Boss:</span> {accessory.boss}</p>
                  )}
                  {!accessory.boss && typeof accessory.mode === "string" && (
                    <p><span className="text-gray-400 font-semibold">Mode:</span> {accessory.mode}</p>
                  )}
                </div>
              )}
            </div>
    </div>
  );
};

export default AccessoryCard;
