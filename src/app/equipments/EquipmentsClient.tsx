"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

import weapons from "@/data/weapon.json";
import accessories from "@/data/amulet.json";
import talismans from "@/data/talisman.json";
import sets from "@/data/sets.json";
import eeData from "@/data/ee.json";

import WeaponCard from "@/app/components/WeaponCard";
import AccessoryCard from "@/app/components/AccessoryCard";
import SetCard from "@/app/components/SetCard";
import bossData from "@/data/boss.json";
import statsData from "@/data/stats.json";
import { cleanAccessory } from '@/lib/cleaner';

import TalismanCard from "@/app/components/TalismanCard";

import ExclusiveEquipmentList from "@/app/components/ExclusiveEquipmentCard";

import { AnimatedTabs } from "@/app/components/AnimatedTabs"
// en haut du fichier EquipmentsClient.tsx, après les imports
import { useSearchParams } from "next/navigation";
import type { TenantKey } from '@/tenants/config'
import { useI18n } from '@/lib/contexts/I18nContext'

type TabKey = "weapon" | "accessory" | "set" | "talisman" | "exclusive";




type Props = {
  lang: TenantKey
}


export default function EquipmentsClient({ lang = "en" }: Props) {
  const searchParams = useSearchParams();
  const tabParam = (searchParams.get("tab") as TabKey | null) ?? null;
  const { t } = useI18n()


  const TABS: { key: TabKey; label: string; icon: string }[] = [
    { key: "weapon", label: t("equipments_tabs.weapon"), icon: "/images/ui/nav/weapon.webp" },
    { key: "accessory", label: t("equipments_tabs.accessory"), icon: "/images/ui/nav/accessory.webp" },
    { key: "set", label: t("equipments_tabs.armor"), icon: "/images/ui/nav/armor.webp" },
    { key: "talisman", label: t("equipments_tabs.talisman"), icon: "/images/ui/nav/talisman.webp" },
    { key: "exclusive", label: t("equipments_tabs.exclusive"), icon: "/images/ui/nav/exclusive.webp" }
  ];


  // 👇 remplace l'ancien: const [tab, setTab] = useState<...>("weapon");
  const [selected, setSelected] = useState<TabKey>("weapon");

  // initialise depuis l’URL
  useEffect(() => {
    const allowed: TabKey[] = ["weapon", "accessory", "set", "talisman", "exclusive"];
    if (tabParam && (allowed as string[]).includes(tabParam)) {
      setSelected(tabParam as TabKey);
    } else if (tabParam == null) {
      setSelected("weapon"); // défaut propre
    }
  }, [tabParam]);

  // handler identique à ta page Premium
  const handleTabChange = (key: TabKey) => {
    setSelected(key);
    const params = new URLSearchParams(window.location.search);
    if (key === "weapon") params.delete("tab"); // onglet par défaut → URL propre
    else params.set("tab", key);
    const qs = params.toString();
    const newUrl = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
    window.history.replaceState(null, "", newUrl);
  };



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
  }, [selected]);


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



  return (
    <main className="p-3">
      <div className="sr-only">
        <h1>Weapon, Set, Amulet, Exclusive Equipment, Talismans  Database</h1>
      </div>

      <div className="flex justify-center mb-6">
        <AnimatedTabs
          tabs={TABS}
          selected={selected}
          onSelect={(key) => handleTabChange(key as TabKey)}
          pillColor="#06b6d4" // cyan-500
          compact
        />
      </div>






      {selected === "weapon" && (
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
              <WeaponCard key={weapon.name} weapon={weapon} langue={lang} />
            ))}
          </div>
        </>
      )}

      {selected === "accessory" && (
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
              <AccessoryCard key={accessory.name} accessory={cleanAccessory(accessory)} langue={lang} />
            ))}
          </div>
        </>
      )}

      {selected === "set" && (
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
                <SetCard key={set.name} set={set}  langue={lang}/>
              ))}
          </div>
        </>
      )}
      {selected === "talisman" && (
        <div className="flex flex-wrap gap-2 justify-center">
          {talismans.map((t) => (
            <TalismanCard key={t.name} talisman={t} langue={lang} />
          ))}
        </div>
      )}


      {selected === "exclusive" && (
        <ExclusiveEquipmentList exdata={eeData} lang={lang} />
      )}





    </main>
  );
}
