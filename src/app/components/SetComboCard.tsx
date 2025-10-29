"use client"

import Image from "next/image"
import Link from "next/link"
import { useI18n } from "@/lib/contexts/I18nContext"
import { toKebabCase } from "@/utils/formatText"
import type { ArmorSet } from "@/types/equipment"
import type { TenantKey } from "@/tenants/config"
import { l } from "@/lib/localize"

// ---- Helpers ----
function highlightNums(text?: string | null) {
  if (!text || !text.trim()) return null
  // Wrap numbers (with optional %) in a span like tes autres tooltips
  const numRe = /(\d+(?:\.\d+)?\s*%?)/g
  const html = text.replace(numRe, '<span style="color:#28d9ed">$1</span>').replace(/\\n|\\\\n/g, "<br />")
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

type TwoOrFour =
  | { left: { set: ArmorSet; count: 2 }; right: { set: ArmorSet; count: 2 } } // 2×2
  | { solo: { set: ArmorSet; count: 4 } }                                      // 4-pc

// Un slot image (bg + item + icône d’effet)
function Slot({ set, part }: { set: ArmorSet; part: "Helmet" | "Armor" | "Gloves" | "Shoes" }) {
  const bgPath = `/images/bg/CT_Slot_${set.rarity}.webp`
  const itemPath = `/images/equipment/TI_Equipment_${part}_${set.image_prefix}.webp`
  const effectPath = `/images/ui/effect/${set.set_icon}.webp`
  return (
    <div className="relative w-[50px] h-[50px]">
      <Image src={bgPath} alt="bg" fill className="absolute inset-0 z-0" sizes="50px" />
      <div className="relative w-[50px] h-[50px]">
        <Image src={itemPath} alt={part} fill className="relative z-10 object-contain" sizes="40px" />
      </div>
      <div className="absolute top-1.5 right-1.5 z-20 translate-x-1/4 -translate-y-1/4">
        <div className="relative w-[20px] h-[20px]">
          <Image src={effectPath} alt="Set Icon" fill className="relative z-10 object-contain" sizes="20px" />
        </div>
      </div>
    </div>
  )
}

export default function SetComboCard(props: (TwoOrFour & { langue: TenantKey })) {
  const { t } = useI18n()
  const langue = props.langue
  const isTwoByTwo = "left" in props && "right" in props

  // --- 2×2 : 2 groupes indépendants (hover + tooltip séparés), nom SOUS chaque groupe ---
  if (isTwoByTwo) {
    const leftSet = props.left.set
    const rightSet = props.right.set

    const leftName = l(leftSet, "name", langue)
    const rightName = l(rightSet, "name", langue)

    const leftTier4 = l(leftSet, "effect_2_4", langue)
    const rightTier4 = l(rightSet, "effect_2_4", langue)

    return (
      <div className="relative bg-white/5 p-1 rounded-2xl shadow inline-flex flex-col items-center text-center">
        <div className="flex items-start gap-6">
          {/* Bloc gauche */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="grid grid-cols-2 gap-1">
                <Slot set={leftSet} part="Helmet" />
                <Slot set={leftSet} part="Armor" />
              </div>

              {/* Tooltip (Tier 4 uniquement) */}
              {(leftTier4 || leftSet.source || leftSet.boss || leftSet.mode) && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max max-w-[320px] bg-gray-900 text-white text-[12px] rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg pointer-events-none">
                  <p className="text-red-400 font-bold text-sm leading-tight mb-2">
                    <Link href={`/item/set/${toKebabCase(leftSet.name)}`} className="hover:underline">{leftName}</Link>
                  </p>

                  <div className="border-t border-gray-600 bg-gray-700 rounded p-2 pt-2 mt-2">
                    <p className="text-cyan-400 font-semibold">2-pc</p>
                    {leftTier4 ? (
                      <p className="leading-snug">{highlightNums(leftTier4)}</p>
                    ) : (
                      <em className="text-zinc-400">{t("items.noAdditional", { defaultValue: "No additional effect" })}</em>
                    )}
                  </div>

                  <div className="mt-2 text-xs text-gray-400">
                    <div className="border-t border-gray-600 pt-2 mt-2">
                      {leftSet.source && <p><strong>Source:</strong> {leftSet.source}</p>}
                      {leftSet.boss && <p><strong>Boss:</strong> {leftSet.boss}</p>}
                      {!leftSet.boss && leftSet.mode && <p><strong>Mode:</strong> {leftSet.mode}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Nom SOUS le bloc (sans "×2") */}
            <div className="mt-2 text-[12px] font-semibold text-red-400 leading-tight">
              <Link href={`/item/set/${toKebabCase(leftSet.name)}`} className="hover:underline">
                {leftName}
              </Link>
            </div>
          </div>

          {/* Séparateur */}
          <div className="w-px h-[64px] bg-white/10 rounded" />

          {/* Bloc droit */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="grid grid-cols-2 gap-1">
                <Slot set={rightSet} part="Gloves" />
                <Slot set={rightSet} part="Shoes" />
              </div>

              {/* Tooltip (Tier 4 uniquement) */}
              {(rightTier4 || rightSet.source || rightSet.boss || rightSet.mode) && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max max-w-[320px] bg-gray-900 text-white text-[12px] rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg pointer-events-none">
                  <p className="text-red-400 font-bold text-sm leading-tight mb-2">
                    <Link href={`/item/set/${toKebabCase(rightSet.name)}`} className="hover:underline">{rightName}</Link>
                  </p>

                  <div className="border-t border-gray-600 bg-gray-700 rounded p-2 pt-2 mt-2">
                    <p className="text-cyan-400 font-semibold">2-pc</p>
                    {rightTier4 ? (
                      <p className="leading-snug">{highlightNums(rightTier4)}</p>
                    ) : (
                      <em className="text-zinc-400">{t("items.noAdditional", { defaultValue: "No additional effect" })}</em>
                    )}
                  </div>

                  <div className="mt-2 text-xs text-gray-400">
                    <div className="border-t border-gray-600 pt-2 mt-2">
                      {rightSet.source && <p><strong>Source:</strong> {rightSet.source}</p>}
                      {rightSet.boss && <p><strong>Boss:</strong> {rightSet.boss}</p>}
                      {!rightSet.boss && rightSet.mode && <p><strong>Mode:</strong> {rightSet.mode}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Nom SOUS le bloc (sans "×2") */}
            <div className="mt-2 text-[12px] font-semibold text-red-400 leading-tight">
              <Link href={`/item/set/${toKebabCase(rightSet.name)}`} className="hover:underline">
                {rightName}
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- 4 pièces : un seul groupe + tooltip Tier 4 (2-pc + 4-pc), nom SOUS le bloc (sans "×4") ---
  const set = props.solo.set
  const displayName = l(set, "name", langue)
  const tier4_2p = l(set, "effect_2_4", langue) // ← ajouté
  const tier4_4p = l(set, "effect_4_4", langue) // ← renommé


  return (
    <div className="relative bg-white/5 p-1 rounded-2xl shadow inline-flex flex-col items-center text-center">
      <div className="relative group">
        <div className="grid grid-cols-2 gap-1">
          <Slot set={set} part="Helmet" />
          <Slot set={set} part="Armor" />
          <Slot set={set} part="Gloves" />
          <Slot set={set} part="Shoes" />
        </div>

        {(tier4_2p || tier4_4p || set.source || set.boss || set.mode) && (
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max max-w-[320px] bg-gray-900 text-white text-[12px] rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg pointer-events-none">
            <p className="text-red-400 font-bold text-sm leading-tight mb-2">
              <Link href={`/item/set/${toKebabCase(set.name)}`} className="hover:underline">
                {displayName}
              </Link>
            </p>

            <div className="border-t border-gray-600 bg-gray-700 rounded p-2 pt-2 mt-2 space-y-1">
              {/* Tier 4 (2-pc) */}
              <div>
                <p className="text-cyan-400 font-semibold">2-pc</p>
                {tier4_2p ? (
                  <p className="leading-snug">{highlightNums(tier4_2p)}</p>
                ) : (
                  <em className="text-zinc-400">{t("items.noAdditional", { defaultValue: "No additional effect" })}</em>
                )}
              </div>

              {/* Tier 4 (4-pc) */}
              <div>
                <p className="text-yellow-400 font-semibold">4-pc</p>
                {tier4_4p ? (
                  <p className="leading-snug">{highlightNums(tier4_4p)}</p>
                ) : (
                  <em className="text-zinc-400">{t("items.noAdditional", { defaultValue: "No additional effect" })}</em>
                )}
              </div>
            </div>

            <div className="mt-2 text-xs text-gray-400">
              <div className="border-t border-gray-600 pt-2 mt-2">
                {set.source && <p><strong>Source:</strong> {set.source}</p>}
                {set.boss && <p><strong>Boss:</strong> {set.boss}</p>}
                {!set.boss && set.mode && <p><strong>Mode:</strong> {set.mode}</p>}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Nom SOUS le bloc (sans "×4") */}
      <div className="mt-2 text-[12px] font-semibold text-red-400 leading-tight">
        <Link href={`/item/set/${toKebabCase(set.name)}`} className="hover:underline">
          {displayName}
        </Link>
      </div>
    </div>
  )
}
