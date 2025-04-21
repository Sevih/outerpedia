import React, { useEffect,useRef, useState } from "react";
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
  class: string | null;
  source: string;
  boss: string | null;
  mode?: string| null;
}

const WeaponCard = ({ weapon }: { weapon: Weapon }) => {
  const subStatCount = equipmentTypes.weapon.subStatNumber;

  const [mouseY, setMouseY] = useState(0);
  const [tooltipTop, setTooltipTop] = useState(0);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseY(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const height = tooltipRef.current?.offsetHeight || 0;
    const padding = 16;
    const maxY = window.innerHeight - height - padding;
    setTooltipTop(Math.min(mouseY + padding, maxY));
  }, [mouseY]);
  return (
    
    <div className="relative group w-[110px] h-[110px]">
      {/* Background */}
      <Image
        src="/images/ui/bg_item_leg.png"
        alt="Background"
        width={110}
        height={110}
        className="absolute inset-0 w-full h-full object-cover z-0 rounded"
        unoptimized
      />

      {/* Icons top-right */}
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

      {/* Weapon image */}
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

      {/* Tooltip on hover */}
      {(weapon.source || weapon.boss || weapon.mode || weapon.effect_desc4 || weapon.effect_name) && (
        <div
        ref={tooltipRef}
        className="
          fixed left-1/2 -translate-x-1/2
          z-50 w-[min(320px,90vw)] bg-gray-900 text-white text-xs rounded-lg p-4 shadow-lg
          opacity-0 translate-y-2 scale-95
          transition-all duration-150 ease-out
          pointer-events-none
          group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100
        "
        style={{ top: `${tooltipTop}px` }}
      >
          
          <p className="text-red-400 font-bold text-sm mb-1">{weapon.name}</p>
          <p className="text-red-300 mb-2 text-sm">{weapon.rarity} Weapon</p>

          <div className="flex items-center gap-2 mb-1">
            <Image src="/images/ui/effect/CM_Stat_Icon_ATK.png" alt="ATK" width={16} height={16} className="w-4 h-4" unoptimized />
            <p>ATK</p>
            <span className="ml-auto">1 200</span>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <Image src="/images/ui/effect/CM_Stat_Icon_ATK.png" alt="ATK%" width={16} height={16} className="w-4 h-4" unoptimized />
            <Image src="/images/ui/effect/CM_Stat_Icon_DEF.png" alt="DEF%" width={16} height={16} className="w-4 h-4" unoptimized />
            <Image src="/images/ui/effect/CM_Stat_Icon_HP.png" alt="HP%" width={16} height={16} className="w-4 h-4" unoptimized />
            <p>At Random</p>
          </div>

          <p className="text-center mt-1 font-semibold text-sm">
            Apply {subStatCount} random substat(s)
          </p>

          <div className="mt-3 bg-gray-700 rounded p-2">
            <p className="text-xs font-bold text-yellow-300 mb-2">Set Effects</p>

            <div className="space-y-2">
              <p className="text-sm leading-snug break-words">
                <span className="text-cyan-400 font-semibold">Tier 0:</span> {highlightNumbersOnly(weapon.effect_desc1)}
              </p>
              <p className="text-sm leading-snug break-words">
                <span className="text-cyan-400 font-semibold">Tier 4:</span> {highlightNumbersOnly(weapon.effect_desc4)}
              </p>
            </div>
          </div>


          <div className="mt-2 text-[11px] text-gray-300 border-t border-gray-600 pt-2">
            {weapon.source && <p><strong>Source:</strong> {weapon.source}</p>}
            {weapon.boss && <p><strong>Boss:</strong> {weapon.boss}</p>}
            {!weapon.boss && weapon.mode && <p><strong>Mode:</strong> {weapon.mode}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeaponCard;
