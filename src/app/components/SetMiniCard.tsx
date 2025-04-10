"use client";

import React from "react";
import setsData from "@/data/sets.json";
import Image from "next/image";

type MiniSet = {
  name: string;
  count: number;
};

const setsLookup = Object.fromEntries(setsData.map((set) => [set.name, set]));
const setsSource = Object.fromEntries(
  setsData.map((set) => [set.name, { source: set.source, boss: set.boss }])
);

const equipmentOrder = ["Helmet", "Armor", "Gloves", "Shoes"];

const SetMiniCard = ({ sets }: { sets: MiniSet[] }) => {
  if (!Array.isArray(sets)) {
    return <div className="text-red-400 text-xs">⚠️ Invalid set data</div>;
  }

  const getEquipmentTypes = (count: number, setIndex: number) => {
    if (count === 4) return equipmentOrder;
    return setIndex === 0 ? equipmentOrder.slice(0, 2) : equipmentOrder.slice(2, 4);
  };

  return (
    <div className="flex flex-col items-center text-white px-3 py-2 rounded w-fit shadow gap-3">
      {sets.map((miniSet, idx) => {
        const fullSet = setsLookup[miniSet.name];

        return (
          <div key={idx} className="flex flex-col items-center gap-2">
            <div className="grid grid-cols-2 gap-1 bg-gray-900 p-1 rounded">
              {getEquipmentTypes(miniSet.count, idx).map((type, i) => (
                <div key={i} className="w-12 h-12 relative group">
                  {/* Fond */}
                  <Image
                    src="/images/ui/bg_item_leg.png"
                    alt="item background"
                    fill
                    sizes="48px"
                    style={{ objectFit: "contain" }}
                  />
                  {/* Image de l'équipement */}
                  <Image
                    src={`/images/equipment/TI_Equipment_${type}_06.png`}
                    alt={`${miniSet.name} ${type}`}
                    fill
                    sizes="48px"
                    style={{ objectFit: "contain" }}
                    className="z-10"
                  />
                  {/* Icône de set dans chaque pièce */}
                  {fullSet?.set_icon && (
                    <div className="absolute top-0.5 right-0.5 w-4 h-4 z-20">
                      <Image
                        src={`/images/ui/effect/TI_Icon_Set_Enchant_${fullSet.set_icon}.png`}
                        alt={`${miniSet.name} icon`}
                        fill
                        sizes="16px"
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                  )}

                  {/* Tooltip */}
                  {(setsSource[miniSet.name]?.source || setsSource[miniSet.name]?.boss) && (
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max max-w-[200px] bg-black text-white text-[10px] rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                      {setsSource[miniSet.name]?.source && (
                        <p>
                          <strong>Source:</strong> {setsSource[miniSet.name].source}
                        </p>
                      )}
                      {setsSource[miniSet.name]?.boss && (
                        <p>
                          <strong>Boss:</strong> {setsSource[miniSet.name].boss}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs font-semibold">{miniSet.name} Set</p>

            {miniSet.count && (
              <div className="text-xs bg-gray-700 rounded px-2 py-1 text-yellow-400">
                {miniSet.count} pcs
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SetMiniCard;
