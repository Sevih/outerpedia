"use client";

import React, { useState, useEffect } from "react";
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
import { AnimatedTabs } from "@/app/components/AnimatedTabs"



export default function EquipmentsClient() {
  const tabList = [
    { key: "weapon", label: "Weapons", icon: "weapon.webp" },
    { key: "accessory", label: "Accessories", icon: "accessory.webp" },
    { key: "armor", label: "Armor Set", icon: "armor.webp" },
    { key: "talisman", label: "Talismans", icon: "talisman.webp" },
    { key: "exclusive", label: "Exclusive", icon: "exclusive.webp" }
  ];


  const [tab, setTab] = useState<"weapon" | "accessory" | "armor" | "talisman" | "exclusive">("weapon");

  const [weaponClassFilter, setWeaponClassFilter] = useState<string | null>(null);
  const [weaponBossFilter, setWeaponBossFilter] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<number | null>(null);

  const [weaponSearch, setWeaponSearch] = useState("");
  const [accessorySearch, setAccessorySearch] = useState("");

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
    (!levelFilter || w.level === levelFilter) &&
    (!weaponClassFilter || w.class === weaponClassFilter) &&
    (!weaponSearch || w.name.toLowerCase().includes(weaponSearch.toLowerCase())) &&
    ((weaponBossFilter === null || (w.boss || w.mode) === weaponBossFilter))
  );


  const filteredAccessories = accessories.filter(a =>
    (!levelFilter || a.level === levelFilter) &&
    (!accessoryClassFilter || a.class === accessoryClassFilter) &&
    (!accessorySearch || a.name.toLowerCase().includes(accessorySearch.toLowerCase())) &&
    (!accessoryBossFilter || (a.boss || a.mode) === accessoryBossFilter) &&
    (!accessoryMainStatFilter || a.mainStats.includes(accessoryMainStatFilter))
  );

  useEffect(() => {
    // Reset de tous les filtres quand on change d'onglet
    setLevelFilter(null);
    setWeaponClassFilter(null);
    setWeaponBossFilter(null);
    setAccessoryClassFilter(null);
    setAccessoryBossFilter(null);
    setAccessoryMainStatFilter(null);
    setArmorBossFilter(null);
    setWeaponSearch("");
    setAccessorySearch("");
  }, [tab]);


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
            bossMap[name] = `/images/characters/boss/mini/IG_Turn_${id}.webp`;
          }
        });
      });
    }

    // Cas classiques : Irregular Extermination + Adventure License (image directe)
    ["Irregular Extermination", "Adventure License", "Event Shop"].forEach(key => {
      const entries = group[key];
      if (entries) {
        entries.forEach(entry => {
          Object.entries(entry).forEach(([name, data]) => {
            const fileName = data?.[0]?.id;
            if (fileName) {
              bossMap[name] = `/images/characters/boss/mini/${fileName}.webp`;
            }
          });
        });
      }
    });
  });

  const TruetabList = tabList.map(({ key, label, icon }) => ({
    key,
    label,
    icon: `/images/ui/nav/${icon}`
  }))


  return (
    <main className="p-3">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoGame",
            "name": "Outerplane",
            "url": "https://outerpedia.com/",
            "description": "Outerpedia is a fan-made encyclopedia for the mobile RPG Outerplane. Browse equipments, characters, sets and more.",
            "hasPart": [
              ...weapons.map(w => ({
                "@type": "CreativeWork",
                "name": w.name,
                "image": `https://outerpedia.com/images/equipment/${w.image}`
              })),
              ...accessories.map(a => ({
                "@type": "CreativeWork",
                "name": a.name,
                "image": `https://outerpedia.com/images/equipment/${a.image}`
              })),
              ...sets.map((s, i) => {
                const variants = ["Helmet", "Armor", "Gloves", "Shoes"];
                const variant = variants[i % variants.length];
                return {
                  "@type": "CreativeWork",
                  "name": s.name,
                  "image": `https://outerpedia.com/images/equipment/TI_Equipment_${variant}_06.webp`
                };
              }),
              ...talismans.map(t => ({
                "@type": "CreativeWork",
                "name": t.name,
                "image": `https://outerpedia.com/images/equipment/TI_Equipment_Talisman_${t.icon}.webp`
              })),
              ...Object.entries(eeData).map(([charKey, ee]) => ({
                "@type": "CreativeWork",
                "name": ee.name,
                "image": `https://outerpedia.com/images/characters/ex/${charKey}.webp`
              }))
            ]
          })
        }}
      />


      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            className="bg-cyan-600 text-white px-4 py-2 rounded shadow-lg hover:bg-cyan-700"
            onClick={() => {
              const data = {
                "@context": "https://schema.org",
                "@type": "VideoGame",
                "name": "Outerplane",
                "url": "https://outerpedia.com/",
                "description": "Outerpedia is a fan-made encyclopedia for the mobile RPG Outerplane. Browse equipments, characters, sets and more.",
                "hasPart": [
                  ...weapons.map(w => ({
                    "@type": "CreativeWork",
                    "name": w.name,
                    "image": `https://outerpedia.com/images/equipment/${w.image}`
                  })),
                  ...accessories.map(a => ({
                    "@type": "CreativeWork",
                    "name": a.name,
                    "image": `https://outerpedia.com/images/equipment/${a.image}`
                  })),
                  ...sets.map((s, i) => {
                    const variants = ["Helmet", "Armor", "Gloves", "Shoes"];
                    const variant = variants[i % variants.length];
                    return {
                      "@type": "CreativeWork",
                      "name": s.name,
                      "image": `https://outerpedia.com/images/equipment/TI_Equipment_${variant}_06.webp`
                    };
                  }),
                  ...talismans.map(t => ({
                    "@type": "CreativeWork",
                    "name": t.name,
                    "image": `https://outerpedia.com/images/equipment/TI_Equipment_Talisman_${t.icon}.webp`
                  })),
                  ...Object.entries(eeData).map(([charKey, ee]) => ({
                    "@type": "CreativeWork",
                    "name": ee.name,
                    "image": `https://outerpedia.com/images/characters/ex/${charKey}.webp`,
                    "url": `https://outerpedia.com/characters/${charKey}`
                  }))
                ]
              };
              console.log("Generated JSON-LD:", data);
              alert("JSON-LD logged in console ✅");
            }}
          >
            Show JSON-LD
          </button>
        </div>
      )}
      <div className="sr-only">
        <h1>Weapon, Set, Amulet, Exclusive Equipment, Talismans  Database</h1>
      </div>

      <div className="flex justify-center mb-6">
        <AnimatedTabs
          tabs={TruetabList}
          selected={tab}
          onSelect={(key) => setTab(key as typeof tab)}
          pillColor="#06b6d4" // cyan-500
          compact

        />
      </div>





      {tab === "weapon" && (
        <>
          <div className="mb-4 flex flex-col items-center gap-4">
            <input
              type="text"
              placeholder="Search weapons..."
              value={weaponSearch}
              onChange={(e) => setWeaponSearch(e.target.value)}
              className="w-full max-w-sm px-4 py-2 border border-white/20 rounded-full bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring focus:border-cyan-400 transition"
            />

            <div className="flex gap-2 flex-wrap justify-center">
              {[null, 5, 6].map((lvl) => (
                <button
                  key={lvl ?? 'all'}
                  onClick={() => setLevelFilter(lvl)}
                  className={`border px-3 py-1 rounded text-sm font-semibold ${levelFilter === lvl || (lvl === null && levelFilter === null)
                    ? "bg-cyan-500 text-white"
                    : "text-white hover:bg-gray-200"
                    }`}
                >
                  {lvl ? `${lvl}★` : "All"}
                </button>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap justify-center">
              <button
                onClick={() => setWeaponClassFilter(null)}
                className={`border p-1 rounded ${!weaponClassFilter ? "bg-cyan-500" : "bg-transparent"}`}
              >
                <span className={`px-2 text-sm font-semibold ${!weaponClassFilter ? "text-white" : "text-white"}`}>All</span>
              </button>
              {weaponClasses.map((cls) => (
                <button
                  key={cls}
                  onClick={() => setWeaponClassFilter(cls)}
                  className={`border p-1 rounded ${weaponClassFilter === cls ? "bg-cyan-500" : "bg-transparent"}`}
                >
                  <div className="relative w-[24px] h-[24px]">
                    <Image
                      src={`/images/ui/class/${cls.toLowerCase()}.webp`}
                      alt={cls}
                      fill
                      className="object-contain"
                      sizes="24px"
                    />
                  </div>

                </button>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap justify-center">
              <button
                onClick={() => setWeaponBossFilter(null)}
                className={`border px-4 py-2 rounded text-sm font-semibold transition-colors duration-200 ${weaponBossFilter === null ? "bg-cyan-500 text-white" : "bg-transparent text-white hover:bg-gray-200"}`}
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
                    <div className="relative w-[60px] h-[60px]">
                      <Image
                        src={bossMap[src]}
                        alt={src || "boss"}
                        fill
                        className="object-contain"
                        sizes="60px"
                      />
                    </div>

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
            <input
              type="text"
              placeholder="Search accessories..."
              value={accessorySearch}
              onChange={(e) => setAccessorySearch(e.target.value)}
              className="w-full max-w-sm px-4 py-2 border border-white/20 rounded-full bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring focus:border-cyan-400 transition"
            />

            <div className="flex gap-2 flex-wrap justify-center">
              {[null, 5, 6].map((lvl) => (
                <button
                  key={lvl ?? 'all'}
                  onClick={() => setLevelFilter(lvl)}
                  className={`border px-3 py-1 rounded text-sm font-semibold ${levelFilter === lvl || (lvl === null && levelFilter === null)
                    ? "bg-cyan-500 text-white"
                    : "text-white hover:bg-gray-200"
                    }`}
                >
                  {lvl ? `${lvl}★` : "All"}
                </button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              <button
                onClick={() => setAccessoryClassFilter(null)}
                className={`border p-1 rounded ${!accessoryClassFilter ? "bg-cyan-500" : "bg-transparent"}`}
              >
                <span className={`px-2 text-sm font-semibold ${!accessoryClassFilter ? "text-white" : "text-white"}`}>All</span>
              </button>
              {accessoryClasses.filter((cls): cls is string => cls !== null).map((cls) => (
                <button
                  key={cls}
                  onClick={() => setAccessoryClassFilter(cls)}
                  className={`border p-1 rounded ${accessoryClassFilter === cls ? "bg-cyan-500" : "bg-transparent"}`}
                >

                  <div className="relative w-[24px] h-[24px]">
                    <Image
                      src={`/images/ui/class/${cls.toLowerCase()}.webp`}
                      alt={cls}
                      fill
                      className="object-contain"
                      sizes="24px"
                    />
                  </div>
                </button>
              ))}

            </div>

            <div className="flex gap-2 flex-wrap justify-center">
              <button
                onClick={() => setAccessoryBossFilter(null)}
                className={`border px-4 py-2 rounded text-sm font-semibold transition-colors duration-200 ${accessoryBossFilter === null ? "bg-cyan-500 text-white" : "bg-transparent text-white hover:bg-gray-200"}`}
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
                    <div className="relative w-[60px] h-[60px]">
                      <Image
                        src={bossMap[src]}
                        alt={src || "boss"}
                        fill
                        className="object-contain"
                        sizes="60px"
                      />
                    </div>
                  ) : (
                    <span className="text-xs px-2 truncate max-w-[100px] inline-block">{src}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap justify-center">
              <button
                onClick={() => setAccessoryMainStatFilter(null)}
                className={`border px-3 py-1 rounded text-sm font-semibold ${!accessoryMainStatFilter ? "bg-cyan-500 text-white" : "bg-transparent text-white hover:bg-gray-200"}`}
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
                    <div className="relative w-[24px] h-[24px]">
                      <Image
                        src={`/images/ui/effect/${data?.icon || "CM_Stat_Icon_ATK.webp"}`}
                        alt={stat}
                        fill
                        className="object-contain"
                        sizes="24px"
                      />
                    </div>
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
              className={`border px-4 py-2 rounded text-sm font-semibold transition-colors duration-200 ${armorBossFilter === null ? "bg-cyan-500 text-white" : "bg-transparent text-white hover:bg-gray-200"}`}
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
                  <div className="relative w-[60px] h-[60px]">
                    <Image
                      src={bossMap[src]}
                      alt={src || "boss"}
                      fill
                      className="object-contain"
                      sizes="60px"
                    />
                  </div>
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
