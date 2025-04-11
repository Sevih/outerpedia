"use client"

import Image from "next/image"

type Talisman = {
  name: string
  type: string
  icon: string
  icon_item: string
  effect_name: string
  effect: string
  effect10?: string
  icon_effect?: string
  source?: string | null
  boss?: string | null
  mode?: string | null
}

export default function TalismanMiniCard({ talisman }: { talisman: Talisman }) {
  const showTooltip = talisman.source || talisman.boss || talisman.mode

  return (
    <div className="flex flex-col items-center group w-[100px]">
      {/* Image + effet dans un fond */}
      <div
        className="relative w-[80px] h-[80px] rounded shadow-md"
        style={{
          backgroundImage: "url(/images/ui/bg_item_leg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Image du talisman */}
        <Image
          src={`/images/equipment/TI_Equipment_Talisman_${talisman.icon}.png`}
          alt={talisman.name}
          fill
          className="object-contain p-1.5"
          unoptimized
        />

        {/* Icône d’effet en haut à droite */}
        {talisman.icon_effect && (
          <div className="absolute top-1.5 right-1.5 w-5 h-5">
            <Image
              src={`/images/ui/effect/TI_Icon_UO_Talisman_${talisman.icon_item}.png`}
              alt={talisman.effect_name}
              width={20}
              height={20}
              className="object-contain"
              unoptimized
            />
          </div>
        )}

        {/* Tooltip DOIT être dans ce bloc relatif */}
        {(talisman.source || talisman.boss || talisman.mode) && (
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max max-w-[200px] bg-black text-white text-[10px] rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
            {talisman.source && <p><strong>Source:</strong> {talisman.source}</p>}
            {talisman.boss && <p><strong>Boss:</strong> {talisman.boss}</p>}
            {!talisman.boss && talisman.mode && <p><strong>Mode:</strong> {talisman.mode}</p>}
          </div>
        )}
      </div>

      {/* Nom du talisman */}
      <p className="text-xs text-center leading-tight mt-1">{talisman.name}</p>
    </div>
  )
}
