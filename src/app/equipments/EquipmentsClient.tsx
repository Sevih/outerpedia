"use client";

import React, { useRef, useState } from "react";
import weapons from "@/data/weapon.json";
import equipmentTypes from "@/data/equipment_types.json";

interface Weapon {
  name: string;
  type: string;
  rarity: string;
  image: string;
  effect_name: string;
  effect_desc: string;
  effect_icon: string;
  class: string;
  source: string;
  boss: string;
  mode: string;
}

const WeaponCard = ({ weapon }: { weapon: Weapon }) => {
  const secondStats = equipmentTypes.weapon.mainStats.secondOptions;
  const subStatCount = equipmentTypes.weapon.subStatNumber;

  const hoverRef = useRef<HTMLDivElement>(null);
  const posRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    posRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const getHoverStyle = () => {
    const hoverWidth = 320;
    const hoverHeight = 200;
    let left = posRef.current.x + 10;
    let top = posRef.current.y + 10;

    const container = hoverRef.current?.getBoundingClientRect();
    if (container) {
      if (container.left + left + hoverWidth > window.innerWidth) {
        left = posRef.current.x - hoverWidth - 10;
      }
      if (container.top + top + hoverHeight > window.innerHeight) {
        top = posRef.current.y - hoverHeight - 10;
      }
    }

    return {
      top,
      left,
      position: "absolute" as const,
    };
  };

  return (
    <div
      className="relative group w-[110px] h-[110px]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={hoverRef}
    >
      <img
        src="/images/ui/bg_item_leg.png"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover z-0 rounded"
      />
      <div className="absolute top-1 right-1 z-30 flex flex-col items-end gap-1">
        {weapon.effect_icon && (
          <img
            src={`/images/ui/effect/${weapon.effect_icon}`}
            alt="Effect Icon"
            className="w-6 h-6"
          />
        )}
        {weapon.class && (
          <img
            src={`/images/ui/class/${weapon.class.toLowerCase()}.png`}
            alt={weapon.class}
            className="w-6 h-6"
          />
        )}
      </div>
      <div className="absolute inset-0 z-10">
        <img
          src={`/images/equipment/${weapon.image}`}
          alt={weapon.name}
          className="w-full h-full object-contain rounded"
        />
      </div>
      {isHovering && (
  <div
    className="z-50 w-[320px] min-h-[200px] bg-gray-900 text-white rounded p-4 text-xs flex flex-col shadow-lg transition-opacity duration-150 ease-in-out opacity-100"
    style={getHoverStyle()}
  >
    <p className="text-red-400 font-bold text-sm leading-tight mb-2">{weapon.name}</p>
    <p className="text-red-300 mb-2 text-sm">{weapon.rarity} Weapon</p>

    <div className="flex items-center gap-2">
      <img src="/images/ui/effect/CM_Stat_Icon_ATK.png" alt="ATK" className="w-4 h-4" />
      <p>ATK</p>
      <span className="ml-auto">1 200</span>
    </div>
    <div className="flex items-center gap-2 mt-2">
      <img src="/images/ui/effect/CM_Stat_Icon_ATK.png" alt="ATK%" className="w-4 h-4" />
      <img src="/images/ui/effect/CM_Stat_Icon_DEF.png" alt="DEF%" className="w-4 h-4" />
      <img src="/images/ui/effect/CM_Stat_Icon_HP.png" alt="HP%" className="w-4 h-4" />
      <p>At Random</p>
    </div>

    <p className="text-center mt-2 font-semibold text-sm">Apply {subStatCount} random substat(s)</p>

    <div className="mt-3 bg-gray-700 rounded p-2">
      <div className="flex items-center gap-2 font-semibold">
        {weapon.effect_icon && (
          <img
            src={`/images/ui/effect/${weapon.effect_icon}`}
            alt="Effect Icon"
            className="w-6 h-6"
          />
        )}
        <p>{weapon.effect_name}</p>
      </div>
      <p className="mt-2 text-sm">{weapon.effect_desc}</p>
    </div>

    {/* NEW: Source and Boss info */}
    {(weapon.source || weapon.boss || weapon.mode) && (
    <div className="mt-3 border-t border-gray-600 pt-2 text-[11px] text-gray-300">
        {weapon.source && (
            <p><span className="text-gray-400 font-semibold">Source:</span> {weapon.source}</p>
        )}
        {weapon.boss && (
            <p>
                <span className="text-gray-400 font-semibold">Boss:</span> {weapon.boss}
            </p>
        )}
        {!weapon.boss && weapon.mode && (
            <p>
                <span className="text-gray-400 font-semibold">Mode:</span> {weapon.mode}
            </p>
        )}
    </div>
    )}
    </div>
)}

    </div>
  );
};

export default function EquipmentsClient() {
  return (
    <main className="p-3">
      <h1 className="text-xl font-bold mb-4">Basic Weapons</h1>
      <div className="flex flex-wrap gap-2">
        {weapons.map((weapon) => (
          <WeaponCard key={weapon.name} weapon={weapon} />
        ))}
      </div>
    </main>
  );
}
