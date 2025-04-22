"use client";

import React, { useState,useEffect, useRef } from "react";
import Image from "next/image";
import weapons from "@/data/weapon.json";
import WeaponCard from "@/app/components/WeaponCard";
import AccessoryCard from "@/app/components/AccessoryCard";
import accessories from "@/data/amulet.json";
import sets from "@/data/sets.json";
import SetCard from "@/app/components/SetCard";
import bossData from "@/data/boss.json";
import statsData from "@/data/stats.json";
import { cleanAccessory } from '@/lib/cleaner';
import talismans from "@/data/talisman.json";
import TalismanGrid from "@/app/components/TalismanGrid";
import ExclusiveEquipmentList from "@/app/components/ExclusiveEquipmentCard";
import eeData from "@/data/ee.json";


export default function EquipmentsClient() {
  const tabList = [
    { key: "weapon", label: "Weapons", icon: "weapon.png" },
    { key: "accessory", label: "Accessories", icon: "accessory.png" },
    { key: "armor", label: "Armor Set", icon: "armor.png" },
    { key: "talisman", label: "Talismans", icon: "talisman.png" },
    { key: "exclusive", label: "Exclusive", icon: "exclusive.png" }
  ];
  
  const [activeTabRef, setActiveTabRef] = useState<HTMLButtonElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (activeTabRef && indicatorRef.current) {
      const { offsetLeft, offsetWidth } = activeTabRef;
      indicatorRef.current.style.transform = `translateX(${offsetLeft}px)`;
      indicatorRef.current.style.width = `${offsetWidth}px`;
    }
  }, [activeTabRef]);
  const [tab, setTab] = useState<"weapon" | "accessory" | "armor" | "talisman" | "exclusive">("weapon");

  const [weaponClassFilter, setWeaponClassFilter] = useState<string | null>(null);
  const [weaponBossFilter, setWeaponBossFilter] = useState<string | null>(null);

  const [accessoryClassFilter, setAccessoryClassFilter] = useState<string | null>(null);
  const [accessoryBossFilter, setAccessoryBossFilter] = useState<string | null>(null);
  const [accessoryMainStatFilter, setAccessoryMainStatFilter] = useState<string | null>(null);

  const weaponClasses = Array.from(
    new Set(weapons.map(w => w.class).filter((cls): cls is string => cls !== null))
  );
  
  const weaponBossesOrModes = Array.from(new Set(weapons.map(w => w.boss || w.mode).filter((v): v is string => Boolean(v))));

  const accessoryClasses = Array.from(new Set(accessories.map(a => a.class).filter(Boolean)));
  const accessoryBossesOrModes = Array.from(new Set(accessories.map(a => a.boss || a.mode).filter((v): v is string => Boolean(v))));
  const allAccessoryMainStats = Array.from(new Set(accessories.flatMap(a => a.mainStats || [])));

  const [armorBossFilter, setArmorBossFilter] = useState<string | null>(null);
  const armorBossesOrModes = Array.from(new Set(sets.map(s => s.boss || s.mode).filter((v): v is string => Boolean(v))));


  const filteredWeapons = weapons.filter(w =>
    (!weaponClassFilter || w.class === weaponClassFilter) &&
    ((weaponBossFilter === null || (w.boss || w.mode) === weaponBossFilter))
  );

  const filteredAccessories = accessories.filter(a =>
    (!accessoryClassFilter || a.class === accessoryClassFilter) &&
    (!accessoryBossFilter || (a.boss || a.mode) === accessoryBossFilter) &&
    (!accessoryMainStatFilter || a.mainStats.includes(accessoryMainStatFilter))
  );

  type BossEntry = {
    [bossName: string]: { id: string }[];
  };
  
  type BossGroup = {
    [category: string]: BossEntry[];
  };
  
  

  const bossMap: Record<string, string> = {};

  (bossData as BossGroup[]).forEach(group => {
    // Cas spécial : Special Request avec nom d'image particulier
    const specialRequest = group["Special Request"];
    if (specialRequest) {
      specialRequest.forEach(entry => {
        Object.entries(entry).forEach(([name, data]) => {
          const id = data?.[0]?.id;
          if (id) {
            bossMap[name] = `/images/characters/boss/mini/IG_Turn_${id}.png`;
          }
        });
      });
    }
  
    // Cas classiques : Irregular Extermination + Adventure License (image directe)
    ["Irregular Extermination", "Adventure License"].forEach(key => {
      const entries = group[key];
      if (entries) {
        entries.forEach(entry => {
          Object.entries(entry).forEach(([name, data]) => {
            const fileName = data?.[0]?.id;
            if (fileName) {
              bossMap[name] = `/images/characters/boss/mini/${fileName}.png`;
            }
          });
        });
      }
    });
  });
  
  const items = [
    ...weapons.map((w, i) => ({
      name: w.name,
      url: null, // pas de page dédiée
      position: i + 1
    })),
    ...accessories.map((a, i) => ({
      name: a.name,
      url: null,
      position: i + 1 + weapons.length
    })),
    ...sets.map((s, i) => ({
      name: s.name,
      url: null,
      position: i + 1 + weapons.length + accessories.length
    })),
    ...talismans.map((t, i) => ({
      name: t.name,
      url: null,
      position: i + 1 + weapons.length + accessories.length + sets.length
    })),
    ...Object.entries(eeData).map(([charKey, ee], i) => ({
      name: ee.name,
      url: `https://outerpedia.com/characters/${charKey}#ee`,
      position: i + 1 + weapons.length + accessories.length + sets.length + talismans.length
    }))
  ];
  
  


  return (
    <main className="p-3">
      <script type="application/ld+json">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Equipments – Outerpedia",
  "url": "https://outerpedia.com/equipments",
  "description": "View all basic and exclusive equipment, sets, amulets, talismans and more for Outerplane.",
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": items
  .filter(item => item.url !== null)
  .map(({ name, url, position }) => ({
    "@type": "Product",
    name,
    url,
    position
  }))
  }
})}
</script>

<div className="relative flex justify-center mb-6">
  <div className="relative bg-gray-100 dark:bg-gray-800 rounded-full p-1 flex gap-1 min-w-[300px]">
    {/* Barre animée */}
    <div
      ref={indicatorRef}
      className="absolute top-1 left-0 h-[calc(100%-0.5rem)] bg-cyan-500 rounded-full transition-all duration-300 z-0"
    ></div>

    {tabList.map(({ key, label, icon }) => (
      <button
        key={key}
        onClick={() => setTab(key as typeof tab)}
        ref={el => {
          if (tab === key) setActiveTabRef(el);
        }}
        className={`relative z-10 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors duration-300 ${
          tab === key
            ? "text-white"
            : "text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
        }`}
      >
        <Image
          src={`/images/ui/nav/${icon}`}
          alt={label}
          width={18}
          height={18}
          style={{ width: 24, height: 24 }}
          className="w-[18px] h-[18px]"
          unoptimized
        />
        {label}
      </button>
    ))}
  </div>
</div>




      {tab === "weapon" && (
        <>
          <div className="mb-4 flex flex-col items-center gap-4">
            <div className="flex gap-2 flex-wrap justify-center">
              <button
                onClick={() => setWeaponClassFilter(null)}
                className={`border p-1 rounded ${!weaponClassFilter ? "bg-cyan-500" : "bg-gray-100"}`}
              >
                <span className={`px-2 text-sm font-semibold ${!weaponClassFilter ? "text-white" : "text-black"}`}>All</span>
              </button>
              {weaponClasses.map((cls) => (
                <button
                  key={cls}
                  onClick={() => setWeaponClassFilter(cls)}
                  className={`border p-1 rounded ${weaponClassFilter === cls ? "bg-cyan-500" : "bg-transparent"}`}
                >
                  <Image
                    src={`/images/ui/class/${cls.toLowerCase()}.png`}
                    alt={cls}
                    width={24}
                    height={24}
                    className="w-6 h-6"
                    unoptimized
                  />
                </button>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap justify-center">
              <button
                onClick={() => setWeaponBossFilter(null)}
                className={`border px-4 py-2 rounded text-sm font-semibold transition-colors duration-200 ${weaponBossFilter === null ? "bg-cyan-500 text-white" : "bg-gray-100 text-black hover:bg-gray-200"}`}
              >
                All
              </button>
              {weaponBossesOrModes.map((src) => (
                <button
                  key={src}
                  onClick={() => setWeaponBossFilter(src)}
                  className={`border rounded transition-colors duration-200 ${weaponBossFilter === src ? "bg-cyan-500" : "bg-transparent hover:bg-gray-100"}`}
                  title={src}
                >
                  {bossMap[src] ? (
                    <Image
                      src={bossMap[src]}
                      alt={src || "boss"}
                      width={60}
                      height={60}
                      className="w-15 h-15"
                      unoptimized
                    />
                  ) : (
                    <span className="text-xs px-2 truncate max-w-[100px] inline-block">{src}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {filteredWeapons.map((weapon) => (
              <WeaponCard key={weapon.name} weapon={weapon} />
            ))}
          </div>
        </>
      )}

      {tab === "accessory" && (
        <>
          <div className="mb-4 flex flex-col items-center gap-4">
            <div className="flex gap-2 flex-wrap justify-center">
              <button
                onClick={() => setAccessoryClassFilter(null)}
                className={`border p-1 rounded ${!accessoryClassFilter ? "bg-cyan-500" : "bg-gray-100"}`}
              >
                <span className={`px-2 text-sm font-semibold ${!accessoryClassFilter ? "text-white" : "text-black"}`}>All</span>
              </button>
              {accessoryClasses.filter((cls): cls is string => cls !== null).map((cls) => (
                  <button
                    key={cls}
                    onClick={() => setAccessoryClassFilter(cls)}
                    className={`border p-1 rounded ${accessoryClassFilter === cls ? "bg-cyan-500" : "bg-transparent"}`}
                  >
                    <Image
                      src={`/images/ui/class/${cls.toLowerCase()}.png`}
                      alt={cls}
                      width={24}
                      height={24}
                      className="w-6 h-6"
                      unoptimized
                    />
                  </button>
                ))}

            </div>

            <div className="flex gap-2 flex-wrap justify-center">
              <button
                onClick={() => setAccessoryBossFilter(null)}
                className={`border px-4 py-2 rounded text-sm font-semibold transition-colors duration-200 ${accessoryBossFilter === null ? "bg-cyan-500 text-white" : "bg-gray-100 text-black hover:bg-gray-200"}`}
              >
                All
              </button>
              {accessoryBossesOrModes.map((src) => (
                <button
                  key={src}
                  onClick={() => setAccessoryBossFilter(src)}
                  className={`border rounded transition-colors duration-200 ${accessoryBossFilter === src ? "bg-cyan-500" : "bg-transparent hover:bg-gray-100"}`}
                  title={src}
                >
                  {bossMap[src] ? (
                    <Image
                      src={bossMap[src]}
                      alt={src || "boss"}
                      width={60}
                      height={60}
                      className="w-15 h-15"
                      unoptimized
                    />
                  ) : (
                    <span className="text-xs px-2 truncate max-w-[100px] inline-block">{src}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap justify-center">
              <button
                onClick={() => setAccessoryMainStatFilter(null)}
                className={`border px-3 py-1 rounded text-sm font-semibold ${!accessoryMainStatFilter ? "bg-cyan-500 text-white" : "bg-gray-100 text-black hover:bg-gray-200"}`}
              >
                All Stats
              </button>
              {allAccessoryMainStats.map(stat => {
                const data = statsData[stat as keyof typeof statsData];
                return (
                  <button
                    key={stat}
                    onClick={() => setAccessoryMainStatFilter(stat)}
                    className={`border p-1 rounded ${accessoryMainStatFilter === stat ? "bg-cyan-500" : "bg-transparent hover:bg-gray-100"}`}
                    title={data?.label || stat}
                  >
                    <Image
                      src={`/images/ui/effect/${data?.icon || "CM_Stat_Icon_ATK.png"}`}
                      alt={stat}
                      width={24}
                      height={24}
                      className="w-6 h-6"
                      unoptimized
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {filteredAccessories.map((accessory) => (
              <AccessoryCard key={accessory.name} accessory={cleanAccessory(accessory)} />
            ))}
          </div>
        </>
      )}

{tab === "armor" && (
  <>
    {/* Filtres boss/mode pour les armors */}
    <div className="mb-4 flex flex-wrap justify-center gap-2">
      <button
        onClick={() => setArmorBossFilter(null)}
        className={`border px-4 py-2 rounded text-sm font-semibold transition-colors duration-200 ${armorBossFilter === null ? "bg-cyan-500 text-white" : "bg-gray-100 text-black hover:bg-gray-200"}`}
      >
        All
      </button>
      {armorBossesOrModes.map((src) => (
        <button
          key={src}
          onClick={() => setArmorBossFilter(src)}
          className={`border rounded transition-colors duration-200 ${armorBossFilter === src ? "bg-cyan-500" : "bg-transparent hover:bg-gray-100"}`}
          title={src}
        >
          {bossMap[src] ? (
            <Image
              src={bossMap[src]}
              alt={src || "boss"}
              width={60}
              height={60}
              className="w-15 h-15"
              unoptimized
            />
          ) : (
            <span className="text-xs px-2 truncate max-w-[100px] inline-block">{src}</span>
          )}
        </button>
      ))}
    </div>

    {/* Sets filtrés */}
    <div className="flex flex-wrap gap-2 justify-center">
      {sets
        .filter(set => !armorBossFilter || (set.boss || set.mode) === armorBossFilter)
        .map(set => (
          <SetCard key={set.name} set={set} />
        ))}
    </div>
  </>
)}
{tab === "talisman" && (
  <TalismanGrid talismans={talismans} />
)}

{tab === "exclusive" && (
  <ExclusiveEquipmentList />
)}





    </main>
  );
}
