"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { toKebabCase } from "@/utils/formatText"
import { useI18n } from "@/lib/contexts/I18nContext"
import type { Weapon } from "@/types/equipment"
import rawStats from "@/data/stats.json"
import { highlightNumbersOnly } from "@/utils/textHighlighter"

type StatIconMap = {
  [statName: string]: { label: string; icon: string }
}
const stats = rawStats as StatIconMap

// ---- Types exacts pour la carte ----
export type WeaponForCard = Weapon & {
  forcedMainStat: string
  usage?: string
}

// Normalise un ID d'icône d'effet : accepte suffixe ("09") ou ID complet ("TI_Icon_UO_Weapon_09")
function normalizeEffectIcon(id?: string | null) {
  if (!id) return null
  return id.startsWith("TI_") ? id : `TI_Icon_UO_Weapon_${id}`
}

// Ajoute .webp si manquant
function ensureWebp(path: string) {
  return path.endsWith(".webp") ? path : `${path}.webp`
}

// Localisation sûre
function getLocalized<
  T extends Partial<Record<K | `${K}_jp` | `${K}_kr`, string | null>>,
  K extends string
>(obj: T, key: K, lang: "en" | "jp" | "kr") {
  const base = obj[key]
  const jp = obj[`${key}_jp` as `${K}_jp`]
  const kr = obj[`${key}_kr` as `${K}_kr`]
  if (lang === "jp" && jp) return String(jp)
  if (lang === "kr" && kr) return String(kr)
  return String(base ?? "")
}

export default function WeaponMiniCard({ weapon }: { weapon: WeaponForCard }) {
  const { lang } = useI18n()

  const hasDualStats = weapon.forcedMainStat?.includes("/")
  const mainStats = hasDualStats
    ? weapon.forcedMainStat.split("/")
    : [weapon.forcedMainStat].filter(Boolean)

  const locName = getLocalized(weapon, "name", lang)
  const locEffectName = getLocalized(weapon, "effect_name", lang)
  const locEffectDesc4 = getLocalized(weapon, "effect_desc4", lang)

  const effectIconId = normalizeEffectIcon(weapon.effect_icon ?? undefined)
  const equipmentImage = ensureWebp(String(weapon.image ?? ""))

  const renderStatIcons = () => (
    <div className="flex items-center gap-1">
      {mainStats.map((stat, index) => {
        const trimmed = (stat ?? "").trim()
        const icon = stats[trimmed]?.icon ?? "CM_Stat_Icon_Default.webp"
        return (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-white">/</span>}
            <div className="relative w-[14px] h-[14px] inline">
              <Image
                src={`/images/ui/effect/${icon}`}
                alt={`${trimmed} Icon`}
                fill
                className="object-contain"
                sizes="14px"
              />
            </div>
            <span>{trimmed}</span>
          </React.Fragment>
        )
      })}
    </div>
  )

  return (
    <div className="flex flex-col items-center">
      {/* Zone de hover */}
      <div className="relative group">
        <div
          className="w-[48px] h-[48px] rounded shadow-md"
          style={{
            backgroundImage: "url(/images/ui/bg_item_leg.webp)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="relative w-[48px] h-[48px]">
            <Image
              src={`/images/equipment/${equipmentImage}`}
              alt={locName}
              fill
              className="object-contain"
              sizes="48px"
            />
          </div>

          {effectIconId && (
            <div className="absolute top-1 right-1 z-10 w-[16px] h-[16px]">
              <Image
                src={`/images/ui/effect/${ensureWebp(effectIconId)}`}
                alt="Effect"
                fill
                className="object-contain"
                sizes="16px"
              />
            </div>
          )}

          {weapon.class && (
            <div className="absolute bottom-1 right-1 z-10 w-[16px] h-[16px]">
              <Image
                src={`/images/ui/class/${String(weapon.class).toLowerCase()}.webp`}
                alt={weapon.class}
                fill
                className="object-contain"
                sizes="16px"
              />
            </div>
          )}
        </div>

        {/* Tooltip */}
        {((weapon.source || weapon.boss || weapon.mode) || locEffectName || locEffectDesc4) && (
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max max-w-[260px] bg-gray-900 text-white text-[12px] rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg pointer-events-none">
            <p className="text-red-400 font-bold text-sm leading-tight mb-2">{locName}</p>

            {/* bloc stats principales (dummy valeurs d’exemple) */}
            <div className="flex justify-between items-center gap-1 mt-1 mb-1">
              {renderStatIcons()}
              <span>
                {mainStats.map((stat, index) => {
                  const value = String(stat).includes("HP%") ? "48%" : "60%"
                  return (
                    <React.Fragment key={index}>
                      {index > 0 && " / "}
                      {value}
                    </React.Fragment>
                  )
                })}
              </span>
            </div>

            <div className="border-t border-gray-600 bg-gray-700 rounded p-2 pt-2 mt-2">
              {locEffectName && (
                <div className="bg-gray-500/80 rounded-full px-3 py-1 flex items-center gap-2 w-full justify-center mb-1">
                  <div className="relative w-[14px] h-[14px]">
                    <Image
                      src={`/images/ui/effect/SC_Buff_Effect_Freeze.webp`}
                      alt={locEffectName}
                      fill
                      className="object-contain"
                      sizes="14px"
                    />
                  </div>
                  <span>Lv. 5 {locEffectName}</span>
                </div>
              )}

              {locEffectDesc4 && (
                <p className="text-gray-300">
                  <span className="text-cyan-400 font-semibold">Tier 4: </span>
                  {highlightNumbersOnly(locEffectDesc4)}
                </p>
              )}
            </div>

            <div className="mt-2 text-xs text-gray-400">
              <div className="border-t border-gray-600 pt-2 mt-2">
                {weapon.source && <p><strong>Source:</strong> {weapon.source}</p>}
                {weapon.boss && <p><strong>Boss:</strong> {weapon.boss}</p>}
                {!weapon.boss && weapon.mode && <p><strong>Mode:</strong> {weapon.mode}</p>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bloc en dessous */}
      <div className="mt-1 text-center text-white text-[12px] leading-tight w-full z-0">
        <p className="text-red-400 text-sm leading-tight">
          <Link href={`/item/weapon/${toKebabCase(locName)}`} className="hover:underline">
          {locName.includes("[") ? (
            <>
              <span className="block">{locName.split("[")[0].trim()}</span>
              <span className="block">[{locName.split("[")[1]}</span>
            </>
          ) : (
            <span>{locName}</span>
          )}
          </Link>
        </p>
        <div className="flex justify-center items-center gap-1 text-yellow-300">
          {renderStatIcons()}
        </div>
      </div>
    </div>
  )
}
