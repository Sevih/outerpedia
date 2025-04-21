import React from "react";
import Image from "next/image";

interface ArmorSet {
  name: string;
  rarity: string;
  set_icon: string;
  effect_2_1: string | null;
  effect_4_1: string | null;
  effect_2_4: string | null;
  effect_4_4: string | null;
  source: string;
  boss?: string | null;
  mode?: string | null;
  image_prefix: string;
  class?: string | null;
}

const SetCard = ({ set }: { set: ArmorSet }) => {
  const armorImages = ["Helmet", "Armor", "Gloves", "Shoes"].map(
    (part) => `/images/equipment/TI_Equipment_${part}_${set.image_prefix}.png`
  );

  return (
    <div className="relative group w-[230px] h-[230px] bg-gray-800 rounded-lg p-2">
      <div className="grid grid-cols-2 gap-1">
        {armorImages.map((img, i) => (
          <div key={i} className="relative w-full h-[100px]">
            {/* Background */}
            <Image
              src="/images/ui/bg_item_leg.png"
              alt="Background"
              width={100}
              height={100}
              style={{ width: 100, height: 100 }}
              className="absolute inset-0 w-full h-full object-cover z-0 rounded"
              unoptimized
            />

            {/* Armor Image */}
            <Image
              src={img}
              alt={`Armor ${i + 1}`}
              width={100}
              height={100}
              style={{ width: 100, height: 100 }}
              className="w-full h-full object-contain relative z-10 rounded"
              unoptimized
            />

            {/* Set Icon */}
            <div className="absolute top-1 right-1 z-30">
              <Image
                src={`/images/ui/effect/TI_Icon_Set_Enchant_${set.set_icon}.png`}
                alt="Set Icon"
                width={20}
                height={20}
                className="w-5 h-5"
                unoptimized
              />
            </div>

            {/* Class Icon (optional) */}
            {set.class && (
              <div className="absolute top-1 left-1 z-30">
                <Image
                  src={`/images/ui/class/${set.class.toLowerCase()}.png`}
                  alt={set.class}
                  width={20}
                  height={20}
                  className="w-5 h-5"
                  unoptimized
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Set Name (sous la carte) */}
      <p className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 text-center text-[11px] text-white bg-black/60 px-3 py-1 rounded font-medium max-w-[90%] truncate">
        {set.name} Set
      </p>

      {/* Hover Tooltip */}
      <div className="absolute z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 p-3 text-white text-xs opacity-0 group-hover:opacity-100 transition duration-200 rounded flex flex-col shadow-lg w-max min-w-[240px] max-w-[300px]">
        {/* Titre avec icône + nom */}
        <div className="flex items-center gap-2 mb-2">
          <Image
            src={`/images/ui/effect/TI_Icon_Set_Enchant_${set.set_icon}.png`}
            alt="Set Icon"
            width={20}
            height={20}
            className="w-5 h-5"
            unoptimized
          />
          <p className="font-bold text-red-400 text-sm leading-tight">
            {set.name} Set
          </p>
        </div>

        {/* Tier 1 Effects */}
        <div className="bg-gray-700 rounded p-2 mb-2 w-full">
          <p className="text-xs font-bold text-yellow-300 mb-1">Tier 0 Effects</p>
          {set.effect_2_1 && (
            <p className="text-sm whitespace-normal break-words">
              <span className="text-cyan-400 font-semibold">2 pieces:</span> {set.effect_2_1}
            </p>
          )}
          {set.effect_4_1 && (
            <p className="text-sm whitespace-normal break-words">
              <span className="text-cyan-400 font-semibold">4 pieces:</span> {set.effect_4_1}
            </p>
          )}
        </div>

        {/* Tier 4 Effects */}
        <div className="bg-gray-700 rounded p-2 w-full">
          <p className="text-xs font-bold text-yellow-300 mb-1">Tier 4 Effects</p>
          {set.effect_2_4 && (
            <p className="text-sm whitespace-normal break-words">
              <span className="text-cyan-400 font-semibold">2 pieces:</span> {set.effect_2_4}
            </p>
          )}
          {set.effect_4_4 && (
            <p className="text-sm whitespace-normal break-words">
              <span className="text-cyan-400 font-semibold">4 pieces:</span> {set.effect_4_4}
            </p>
          )}
        </div>

        {/* Source / Boss */}
        {(set.source || set.boss || set.mode) && (
          <div className="mt-3 border-t border-gray-600 pt-2 text-[11px] text-gray-300">
            {set.source && (
              <p><span className="text-gray-400 font-semibold">Source:</span> {set.source}</p>
            )}
            {set.boss && (
              <p><span className="text-gray-400 font-semibold">Boss:</span> {set.boss}</p>
            )}
            {!set.boss && set.mode && (
              <p><span className="text-gray-400 font-semibold">Mode:</span> {set.mode}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SetCard;
