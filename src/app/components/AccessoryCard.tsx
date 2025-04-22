import Image from "next/image";
import { useState } from "react";
import { highlightNumbersOnly } from "@/utils/textHighlighter";
import type { Accessory } from "@/types/equipment";
import StatIconsRow from "@/app/components/StatIconsRow";


export default function AccessoryCard({ accessory }: { accessory: Accessory }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className={`relative bg-white/5 p-1 rounded-2xl shadow flex flex-col items-center text-center transition-all duration-300 ${
        expanded ? "w-[260px]" : "w-[220px]"
      } cursor-pointer`}
    >
      {/* Image centrale */}
      <div className="relative w-[100px] h-[100px]">
        <Image
          src="/images/ui/bg_item_leg.png"
          alt="background"
          fill
          className="absolute inset-0 z-0"
          sizes="100px"
        />
        <Image
          src={`/images/equipment/${accessory.image}`}
          alt={accessory.name}
          fill
          className="relative z-10 object-contain"
          sizes="100px"
        />
        {accessory.effect_icon && (
          <div className="absolute top-0 right-0 z-20 translate-x-1/3 -translate-y-1/3">
            <Image
              src={`/images/ui/effect/TI_Icon_UO_Accessary_${accessory.effect_icon}.png`}
              alt="Effect"
              width={28}
              height={28}
              style={{ width: 28, height: 28 }}
            />
          </div>
        )}
        {accessory.class && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 translate-x-1/3">
            <Image
              src={`/images/ui/class/${accessory.class.toLowerCase()}.png`}
              alt="Class"
              width={24}
              height={24}
              style={{ width: 24, height: 24 }}
            />
          </div>
        )}
      </div>

      {/* Nom avec retour à la ligne sur [ */}
      <h3 className="text-sm font-bold text-red-400 mt-2 leading-tight">
        {accessory.name.includes("[") ? (
          <>
            {accessory.name.split("[")[0].trim()}
            <br />
            {accessory.name.split("[")[1]}
          </>
        ) : (
          accessory.name
        )}
      </h3>

      {/* Badge effet */}
      <div className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full text-xs text-white font-medium mt-1 max-w-[180px] mx-auto whitespace-nowrap justify-center">
      <Image
  src="/images/ui/effect/SC_Buff_Effect_Freeze.png"
  alt={accessory.effect_name}
  width={16}
  height={16}
  style={{ width: 16, height: 16 }}
                      className="object-contain"
/>

        <span>{accessory.effect_name}</span>
      </div>

      {/* Indicateur ▼ ▲ */}
      <div className="text-white/40 text-lg mt-1">{expanded ? "▲" : "▼"}</div>

      {/* Bloc étendu */}
      {expanded && (
        <div className="bg-gray-800/90 rounded-xl px-4 py-3 text-xs text-white/90 w-full mt-2 flex flex-col gap-2">
          {/* Substats */}
          {accessory.mainStats && accessory.mainStats.length > 0 && (
  <StatIconsRow statsList={accessory.mainStats} />
)}

          {/* Effets */}
          <div>
            <p className="text-cyan-400 font-semibold text-sm">Tier 0</p>
            <p className="leading-snug">
              {highlightNumbersOnly(accessory.effect_desc1)}
            </p>
          </div>
          <div>
            <p className="text-yellow-300 font-semibold text-sm">Tier 4</p>
            <p className="leading-snug">
              {highlightNumbersOnly(accessory.effect_desc4)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
