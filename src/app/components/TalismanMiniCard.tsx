"use client"

import React from "react"
import Image from "next/image"
import { useI18n } from "@/lib/contexts/I18nContext"
import type { Talisman } from "@/types/equipment"
import { highlightNumbersOnly } from "@/utils/textHighlighter"

// ---- Utils ----
function ensureWebp(path: string) {
  return path?.endsWith(".webp") ? path : `${path}.webp`
}

// ex: "03" → "TI_Icon_UO_Talisman_03", ou passe-plat si déjà "TI_..."
function normalizeEffectIcon(id?: string | null) {
  if (!id) return null
  return id.startsWith("TI_") ? id : `TI_Icon_UO_Talisman_${id}`
}

// localisation sûre (name/effect_name/effect_desc*)
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

const rarityBgMap: Record<string, string> = {
  legendary: "/images/ui/bg_item_leg.webp",
  epic: "/images/ui/bg_item_epic.webp",
  rare: "/images/ui/bg_item_rare.webp",
  uncommon: "/images/ui/bg_item_uncommon.webp",
  common: "/images/ui/bg_item_common.webp",
}

export default function TalismanMiniCard({ talisman }: { talisman: Talisman }) {
  const { lang, t } = useI18n()

  const locName = getLocalized(talisman, "name", lang)
  const locEffectName = getLocalized(talisman, "effect_name", lang)
  const locTier0 = getLocalized(talisman, "effect_desc1", lang)
  const locTier4 = getLocalized(talisman, "effect_desc4", lang)

  const effectIconId = normalizeEffectIcon(talisman.effect_icon ?? undefined)
  const equipmentImage = ensureWebp(String(talisman.image ?? ""))

  const bgUrl =
    rarityBgMap[(talisman.rarity ?? "").toLowerCase()] ??
    "/images/ui/bg_item_leg.webp"

  const twoLineName =
    locName?.includes("[") && locName?.includes("]") && locName.split("[").length >= 2

  return (
    <div className="flex flex-col items-center">
      {/* vignette */}
      <div className="relative group">
        <div
          className="w-[48px] h-[48px] rounded shadow-md"
          style={{
            backgroundImage: `url(${bgUrl})`,
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
        </div>

        {/* tooltip */}
        {((talisman.source || talisman.boss || talisman.mode) || locEffectName || locTier0 || locTier4) && (
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max max-w-[260px] bg-gray-900 text-white text-[12px] rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg pointer-events-none">
            <p className="text-red-400 font-bold text-sm leading-tight mb-2">
              {locName}
            </p>

            {locEffectName && (
              <div className="bg-gray-500/80 rounded-full px-3 py-1 flex items-center gap-2 w-full justify-center mb-2">
                <div className="relative w-[14px] h-[14px]">
                  <Image
                    src={`/images/ui/effect/${ensureWebp(effectIconId ?? "SC_Buff_Effect_Default")}`}
                    alt={locEffectName}
                    fill
                    className="object-contain"
                    sizes="14px"
                  />
                </div>
                <span>Lv. 5 {locEffectName}</span>
              </div>
            )}

            {/* Effets Tier 0 / Tier 4 */}
            {(locTier0 || locTier4) && (
              <div className="border-t border-gray-600 bg-gray-700 rounded p-2 pt-2">
                {locTier0 && (
                  <p className="text-gray-200 mb-1">
                    <span className="text-cyan-400 font-semibold">Lv 0: </span>
                    {highlightNumbersOnly(locTier0)}
                  </p>
                )}
                <p className="text-gray-300">
                  <span className="text-cyan-400 font-semibold">Lv 10: </span>
                  {locTier4 ? highlightNumbersOnly(locTier4) : t("items.no_additional_effect")}
                </p>
              </div>
            )}

            {/* Source / Boss / Mode */}
            {(talisman.source || talisman.boss || talisman.mode) && (
              <div className="mt-2 text-xs text-gray-400 border-t border-gray-600 pt-2">
                {talisman.source && <p><strong>{t("items.obtained")}</strong> {talisman.source}</p>}
                {talisman.boss && <p><strong>Boss:</strong> {talisman.boss}</p>}
                {!talisman.boss && talisman.mode && <p><strong>Mode:</strong> {talisman.mode}</p>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* label */}
      <div className="mt-1 text-center text-white text-[12px] leading-tight w-full z-0">
        <p className="font-semibold text-center line-clamp-2">
          {twoLineName ? (
            <>
              <span className="block">{locName.split("[")[0].trim()}</span>
              <span className="block">[{locName.split("[")[1]}</span>
            </>
          ) : (
            <span>{locName}</span>
          )}
        </p>
      </div>
    </div>
  )
}
