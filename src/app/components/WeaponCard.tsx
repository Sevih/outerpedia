import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import equipmentTypes from "@/data/equipment_types.json";
import { highlightNumbersOnly } from '@/utils/textHighlighter';

interface Weapon {
  name: string;
  type: string;
  rarity: string;
  image: string;
  effect_name: string;
  effect_desc1: string;
  effect_desc4: string;
  effect_icon: string;
  class: string;
  source: string;
  boss: string | null;
  mode?: string;
}

const WeaponCard = ({ weapon }: { weapon: Weapon }) => {
  const subStatCount = equipmentTypes.weapon.subStatNumber;
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
    <div ref={cardRef} className={`relative group w-[110px] h-[110px] ${tooltipAlign}`}>
      <Image
        src="/images/ui/bg_item_leg.png"
        alt="Background"
        width={110}
        height={110}
        className="absolute inset-0 w-full h-full object-cover z-0 rounded"
        unoptimized
      />

      <div className="absolute top-1 right-1 z-30 flex flex-col items-end gap-1">
        {weapon.effect_icon && (
          <Image
            src={`/images/ui/effect/TI_Icon_UO_Weapon_${weapon.effect_icon}.png`}
            alt="Effect Icon"
            width={24}
            height={24}
            className="w-6 h-6"
            unoptimized
          />
        )}
        {weapon.class && (
          <Image
            src={`/images/ui/class/${weapon.class.toLowerCase()}.png`}
            alt={weapon.class}
            width={24}
            height={24}
            className="w-6 h-6"
            unoptimized
          />
        )}
      </div>

      <div className="absolute inset-0 z-10">
        <Image
          src={`/images/equipment/${weapon.image}`}
          alt={weapon.name}
          width={110}
          height={110}
          className="w-full h-full object-contain rounded"
          unoptimized
        />
      </div>

      <div className="tooltip absolute top-full z-50 w-[320px] min-h-[200px] bg-gray-900 text-white rounded p-4 text-xs flex flex-col shadow-lg
        opacity-0 scale-95 translate-y-1 invisible
        transition-all duration-200 ease-out delay-100
        group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 group-hover:visible group-hover:delay-0">
        <p className="text-red-400 font-bold text-sm leading-tight mb-2">{weapon.name}</p>
        <p className="text-red-300 mb-2 text-sm">{weapon.rarity} Weapon</p>

        <div className="flex items-center gap-2">
          <Image src="/images/ui/effect/CM_Stat_Icon_ATK.png" alt="ATK" width={16} height={16} className="w-4 h-4" unoptimized />
          <p>ATK</p>
          <span className="ml-auto">1 200</span>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <Image src="/images/ui/effect/CM_Stat_Icon_ATK.png" alt="ATK%" width={16} height={16} className="w-4 h-4" unoptimized />
          <Image src="/images/ui/effect/CM_Stat_Icon_DEF.png" alt="DEF%" width={16} height={16} className="w-4 h-4" unoptimized />
          <Image src="/images/ui/effect/CM_Stat_Icon_HP.png" alt="HP%" width={16} height={16} className="w-4 h-4" unoptimized />
          <p>At Random</p>
        </div>

        <p className="text-center mt-2 font-semibold text-sm">Apply {subStatCount} random substat(s)</p>

        <div className="mt-3 bg-gray-700 rounded p-2">
          <p className="text-xs font-bold text-yellow-300 mb-1">Set Effects</p>
          <p className="text-sm whitespace-normal break-words">
            <span className="text-cyan-400 font-semibold">Tier 1:</span> {highlightNumbersOnly(weapon.effect_desc1)}
          </p>
          <p className="text-sm whitespace-normal break-words">
            <span className="text-cyan-400 font-semibold">Tier 4:</span> {highlightNumbersOnly(weapon.effect_desc4)}
          </p>
        </div>

        {(weapon.source || weapon.boss || weapon.mode) && (
          <div className="mt-3 border-t border-gray-600 pt-2 text-[11px] text-gray-300">
            {weapon.source && (
              <p><span className="text-gray-400 font-semibold">Source:</span> {weapon.source}</p>
            )}
            {weapon.boss && (
              <p><span className="text-gray-400 font-semibold">Boss:</span> {weapon.boss}</p>
            )}
            {!weapon.boss && weapon.mode && (
              <p><span className="text-gray-400 font-semibold">Mode:</span> {weapon.mode}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeaponCard;
