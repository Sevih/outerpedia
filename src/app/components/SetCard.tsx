import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { toKebabCase } from "@/utils/formatText";

interface ArmorSet {
  name: string;
  image_prefix: string;
  set_icon: string;
  class?: string | null;
  effect_2_1?: string | null;
  effect_4_1?: string | null;
  effect_2_4?: string | null;
  effect_4_4?: string | null;
  source?: string | null // ← autoriser null
  boss?: string | null
  mode?: string | null
}

export default function SetCard({ set }: { set: ArmorSet }) {
  const [expanded, setExpanded] = useState(false);

  const parts = ["Helmet", "Armor", "Gloves", "Shoes"];

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className={`relative bg-white/5 p-1 rounded-2xl shadow flex flex-col items-center text-center transition-all duration-300 ${expanded ? "w-[260px]" : "w-[220px]"
        } cursor-pointer`}
    >
      {/* Miniatures avec logo d’effet set */}
      <div className="grid grid-cols-2 gap-1">
        {parts.map((part, i) => (
          <div key={i} className="relative w-[80px] h-[80px]">
            <Image
              src="/images/ui/bg_item_leg.webp"
              alt="bg"
              fill
              className="absolute inset-0 z-0"
              sizes="80px"
            />
            <div className="relative w-[80px] h-[80px]">
              <Image
                src={`/images/equipment/TI_Equipment_${part}_${set.image_prefix}.webp`}
                alt={part}
                fill
                className="relative z-10 object-contain"
                sizes="80px"
              />
            </div>

            {/* Logo effet set */}
            <div className="absolute top-1.5 right-1.5 z-20 translate-x-1/4 -translate-y-1/4">
              <div className="relative w-[20px] h-[20px]">
                <Image
                  src={`/images/ui/effect/TI_Icon_Set_Enchant_${set.set_icon}.webp`}
                  alt="Set Icon"
                  fill
                  className="relative z-10 object-contain"
                  sizes="20px"
                />
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Classe éventuelle */}
      {set.class && (
        <div className="absolute top-0 left-0 z-20 -translate-x-1/3 -translate-y-1/3 w-[24px] h-[24px]">
          <Image
            src={`/images/ui/class/${set.class.toLowerCase()}.webp`}
            alt="Class"
            fill
            className="object-contain"
            sizes="24px"
          />
        </div>
      )}

      {/* Nom */}
      <h3 className="text-sm font-bold text-red-400 mt-2 leading-tight">
        <Link href={`/item/set/${toKebabCase(set.name)}`}>
          <span className="hover:underline cursor-pointer">
            {set.name.includes('[') ? (
              <>
                {set.name.split('[')[0].trim()}
                <br />
                [{set.name.split('[')[1]}
              </>
            ) : (
              set.name
            )}
          </span>
        </Link>
      </h3>

      {/* Flèche ▼▲ */}
      <div className="text-white/40 text-lg mt-1">{expanded ? "▲" : "▼"}</div>

      {/* Effets */}
      {expanded && (
        <div className="bg-gray-800/90 rounded-xl px-4 py-3 text-xs text-white/90 w-full mt-2 flex flex-col gap-2">
          <p className="text-yellow-300 font-semibold text-sm">Set Effects</p>

          {(set.effect_2_1 || set.effect_4_1) && (
            <div>
              <p className="text-cyan-400 font-semibold text-sm">Tier 0</p>
              {set.effect_2_1 && <p>{set.effect_2_1}</p>}
              {set.effect_4_1 && <p>{set.effect_4_1}</p>}
            </div>
          )}

          {(set.effect_2_4 || set.effect_4_4) && (
            <div>
              <p className="text-yellow-300 font-semibold text-sm">Tier 4</p>
              {set.effect_2_4 && <p>{set.effect_2_4}</p>}
              {set.effect_4_4 && <p>{set.effect_4_4}</p>}
            </div>
          )}

          <div className="mt-2">
            <p className="text-gray-400 font-semibold text-xs">Obtained : </p>
            <p className="text-gray-400 text-xs">
              {set.source} <br />
              {set.boss || set.mode}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
