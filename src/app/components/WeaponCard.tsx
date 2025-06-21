import Image from "next/image";
import { useState } from "react";
import { highlightNumbersOnly } from "@/utils/textHighlighter";
import type { Weapon } from "@/types/equipment";
import { toKebabCase } from "@/utils/formatText";
import Link from "next/link";

export default function WeaponCard({ weapon }: { weapon: Weapon }) {
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
          sizes="100px"
          className="absolute inset-0 z-0"
        />
        <Image
          src={`/images/equipment/${weapon.image}`}
          alt={weapon.name}
          fill
          sizes="100px"
          className="relative z-10 object-contain"
        />
        {weapon.level && weapon.level > 0 && (
          <div className="absolute bottom-1 right-2 inline-flex items-center mt-1">
            {Array.from({ length: weapon.level }).map((_, i) => (
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

        {weapon.effect_icon && (
          <div className="absolute top-2 right-2 z-20 translate-x-1/3 -translate-y-1/3">
            <Image
              src={`/images/ui/effect/TI_Icon_UO_Weapon_${weapon.effect_icon}.webp`}
              alt="Effect"
              width={24}
              height={24}
              style={{ width: 24, height: 24 }}
            />
          </div>
        )}
        {weapon.class && (
          <div className="absolute right-2 top-8 -translate-y-1/3 z-20 translate-x-1/3">
            <Image
              src={`/images/ui/class/${weapon.class.toLowerCase()}.webp`}
              alt="Class"
              width={24}
              height={24}
              style={{ width: 24, height: 24 }}

            />
          </div>
        )}
      </div>

      {/* Nom de l’arme */}
      <h3 className="text-sm font-bold text-red-400 mt-2 leading-tight">

        <Link href={`/item/weapon/${toKebabCase(weapon.name)}`}>
          <span className="hover:underline cursor-pointer">
            {weapon.name.includes('[') ? (
              <>
                {weapon.name.split('[')[0].trim()}
                <br />
                [{weapon.name.split('[')[1]}
              </>
            ) : (
              weapon.name
            )}
          </span>
        </Link>

      </h3>

      {/* Label effet */}
      <div className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full text-xs text-white font-medium mt-1">
        <div className="relative w-[16px] h-[16px]">
          <Image
            src={`/images/ui/effect/SC_Buff_Effect_Freeze.webp`}
            alt={weapon.effect_name}
            fill
            className="object-contain"
            sizes="16px"
          />
        </div>
        <span>{weapon.effect_name}</span>
      </div>

      {/* Petit indicateur visuel (optionnel) */}
      <div className="text-white/40 text-xs mt-1">{expanded ? "▲" : "▼"}</div>

      {/* Contenu des effets */}
      {expanded && (
        <div className=" rounded-xl text-xs text-white/90 w-full flex flex-col gap-">
          <div>
            <p className="text-cyan-400 font-semibold text-sm">Tier 0</p>
            <p className="leading-snug">
              {highlightNumbersOnly(weapon.effect_desc1)}
            </p>
          </div>
          <div>
            <p className="text-yellow-300 font-semibold text-sm">Tier 4</p>
            <p className="leading-snug">
              {highlightNumbersOnly(weapon.effect_desc4)}
            </p>
          </div>
          {/* Source */}
          <div className="mt-2">
            <p className="text-gray-400 font-semibold text-xs">Obtained : </p>
            <p className="text-gray-400 text-xs">
              {weapon.source} <br />
              {weapon.boss || weapon.mode}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
