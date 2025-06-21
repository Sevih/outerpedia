import Image from "next/image";
import { useState } from "react";
import { highlightNumbersOnly } from "@/utils/textHighlighter";
import type { Accessory } from "@/types/equipment";
import StatIconsRow from "@/app/components/StatIconsRow";
import Link from "next/link";
import { toKebabCase } from "@/utils/formatText";


export default function AccessoryCard({ accessory }: { accessory: Accessory }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className={`relative bg-white/5 p-1 rounded-2xl shadow flex flex-col items-center text-center transition-all duration-300 ${expanded ? "w-[180px]" : "w-[160px]"
        } cursor-pointer`}
    >
      {/* Image centrale */}
      <div className="relative w-[100px] h-[100px]">
        <Image
          src="/images/ui/bg_item_leg.webp"
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
        {accessory.level && accessory.level > 0 && (
          <div className="absolute bottom-1 right-2 flex justify-center mt-1">
            {Array.from({ length: accessory.level }).map((_, i) => (
              <Image
                key={i}
                src="/images/ui/CM_icon_star_y.webp"
                alt="star"
                width={18}
                height={18}
                className={`object-contain ${i > 0 ? "-ml-1" : ""} z-11`}
              />
            ))}
          </div>
        )}
        {accessory.effect_icon && (
          <div className="absolute top-2 right-2 z-20 translate-x-1/3 -translate-y-1/3">
            <Image
              src={`/images/ui/effect/TI_Icon_UO_Accessary_${accessory.effect_icon}.webp`}
              alt="Effect"
              width={24}
              height={24}
              style={{ width: 24, height: 24 }}
            />
          </div>
        )}
        {accessory.class && (
          <div className="absolute right-2 top-8 -translate-y-1/3 z-20 translate-x-1/3">
            <Image
              src={`/images/ui/class/${accessory.class.toLowerCase()}.webp`}
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
        <Link href={`/item/accessory/${toKebabCase(accessory.name)}`}>
          <span className="hover:underline cursor-pointer">
            {accessory.name.includes('[') ? (
              <>
                {accessory.name.split('[')[0].trim()}
                <br />
                [{accessory.name.split('[')[1]}
              </>
            ) : (
              accessory.name
            )}
          </span>
        </Link>
      </h3>



      {/* Badge effet */}
      <div className="inline-flex items-center bg-white/10 px-1.5 py-1 rounded-full text-xs text-white mt-1 max-w-[180px] mx-auto whitespace-nowrap justify-center">
        <div className="relative w-[16px] h-[16px]">
          <Image
            src={`/images/ui/effect/SC_Buff_Effect_Freeze.webp`}
            alt={accessory.effect_name}
            fill
            className="object-contain"
            sizes="16px"
          />
        </div>

        <span>{accessory.effect_name}</span>
      </div>

      {/* Indicateur ▼ ▲ */}
      <div className="text-white/40 text-xs mt-1">{expanded ? "▲" : "▼"}</div>

      {/* Bloc étendu */}
      {expanded && (
        <div className=" rounded-xl text-xs text-white/90 w-full flex flex-col gap-1">
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

          {/* Source */}
          <div className="mt-2">
            <p className="text-gray-400 font-semibold text-xs">Obtained : </p>
            <p className="text-gray-400 text-xs">
              {accessory.source} <br />
              {accessory.boss || accessory.mode}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
