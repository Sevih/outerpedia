"use client";

import React, { useState } from "react";
import Image from "next/image";
import eeData from "@/data/ee.json";
import statsData from "@/data/stats.json";
import Link from "next/link";

type EEEntry = {
  name: string;
  mainStat: string;
  effect: string;
  effect10?: string;
  icon_effect: string;
  rank?: string;
};

function parseColoredText(text: string): string {
  return text
    .replace(/<color=#[0-9a-fA-F]{6}>/g, match => {
      const color = match.match(/#[0-9a-fA-F]{6}/)?.[0] ?? '#fff';
      return `<span style="color:${color}">`;
    })
    .replace(/<\/color>/g, '</span>')
    .replace(/\\n/g, '<br>');
}

export default function ExclusiveEquipmentList() {
  const [search, setSearch] = useState("");

  const filtered = Object.entries(eeData).filter(([slug, data]) => {
    const lowerSearch = search.toLowerCase();
    return (
      slug.toLowerCase().includes(lowerSearch) ||
      data.name.toLowerCase().includes(lowerSearch)
    );
  });

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Champ de recherche */}
      <input
        type="text"
        placeholder="Search exclusive equipment..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm px-4 py-2 border border-white/20 rounded-full bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring focus:border-cyan-400 transition"
      />

      {/* Liste filtrée */}
      <div className="flex flex-wrap gap-4 justify-center">
        {filtered.length === 0 && (
          <p className="text-white/50 italic">No results found.</p>
        )}
        {filtered.map(([slug, data]: [string, EEEntry]) => (
          <Link
            href={`/characters/${slug}`}
            key={slug}
            className="relative bg-white/5 p-4 rounded-2xl shadow flex flex-col items-center text-center gap-2 w-[260px] hover:bg-white/10 transition"
          >
            {/* Image EE */}
            <div className="relative w-[80px] h-[80px]">
              <Image
                src="/images/ui/bg_item_leg.webp"
                alt="background"
                fill
                sizes="80px"
                className="absolute inset-0 z-0"
              />
              <div className="relative w-[80px] h-[80px]">
                <Image
                  src={`/images/characters/ex/${slug}.webp`}
                  alt={data.name}
                  fill
                  className="object-contain"
                  sizes="80px"
                />
              </div>

              <div className="absolute top-1.5 right-1.5 z-20 translate-x-1/4 -translate-y-1/4 w-[24px] h-[24px]">
                <Image
                  src={`/images/ui/effect/CM_UO_EXCLUSIVE.webp`}
                  alt="Effect"
                  fill
                  className="object-contain"
                  sizes="24px"
                />
              </div>
            </div>

            <h3 className="text-red-400 text-base font-semibold leading-tight text-center">
              {data.name}
            </h3>

            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm text-white font-medium whitespace-nowrap mx-auto justify-center">
              <div className="relative w-[18px] h-[18px]">
                <Image
                  src={`/images/ui/effect/${data.icon_effect}.webp`}
                  alt="icon"
                  fill
                  className="object-contain"
                  sizes="18px"
                />
              </div>
              <span className="exclusive-equipment-text">
                {slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}’s Exclusive Equipment
              </span>
            </div>

            {/* Main stat avec icônes */}
            <div className="text-white/80 text-sm italic mt-1 text-center">
              <div className="flex items-center justify-center gap-1">
                {(() => {
                  const [statPart] = data.mainStat.split("(To:");
                  const statKey = statPart.trim().split(" ")[0];
                  const stat = statKey.replace(/[^A-Z%]/gi, "");
                  const statInfo = statsData[stat as keyof typeof statsData];
                  const icon = stat && stat in statsData ? statInfo.icon : null;
                  const label = stat && stat in statsData ? statInfo.label : statPart.trim();

                  return (
                    <>
                      {icon && (
                        <div className="relative w-[16px] h-[16px] inline-block">
                          <Image
                            src={`/images/ui/effect/${icon}`}
                            alt={stat}
                            fill
                            className="object-contain"
                            sizes="16px"
                          />
                        </div>
                      )}
                      <span>{label}</span>
                    </>
                  );
                })()}
              </div>

              {/* Ligne (To: X) en dessous */}
              {data.mainStat.includes("(To:") && (
                <div className="text-white/50 text-xs mt-0.5">
                  {data.mainStat.match(/\(To: ([^)]+)\)/)?.[0]}
                </div>
              )}
            </div>



            {/* Description */}
            <p
              className="text-white text-sm mt-1"
              dangerouslySetInnerHTML={{ __html: parseColoredText(data.effect) }}
            />

            {data.effect10 && (
              <p
                className="text-xs text-amber-300 mt-1 italic"
                dangerouslySetInnerHTML={{
                  __html: `[LV 10]: <span class="text-white">${parseColoredText(data.effect10)}</span>`
                }}
              />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
