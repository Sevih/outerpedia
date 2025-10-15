"use client"

import { useState, useMemo } from "react"
import { useI18n } from "@/lib/contexts/I18nContext"
import type { TFunction } from "@/lib/contexts/server-i18n"
import type { Weapon, Accessory, ArmorSet, Talisman, MiniSet } from "@/types/equipment"
import { AnimatedTabs } from "@/app/components/AnimatedTabs"
import WeaponMiniCard from "@/app/components/WeaponMiniCard" // ← adapte le chemin
import type { WeaponForCard } from "@/app/components/WeaponMiniCard"
import AmuletMiniCard from "@/app/components/AmuletMiniCard"
import type { AmuletForCard } from "@/app/components/AmuletMiniCard"
import SetComboCard from "@/app/components/SetComboCard"
import TalismanMiniCard from "./TalismanMiniCard"
import rawStats from '@/data/stats.json' assert { type: 'json' }
import { TenantKey } from "@/tenants/config"
import Image from "next/image"

type GearReference = { name: string; mainStat: string; usage?: string }
type SubstatPriority = {
  code: string
  label: string
  icon: string
  weight: number // 1 à 5
}
const stats = rawStats as Record<string, { label: string; icon: string }>
export type RecommendedGearBuild = {
  Weapon?: GearReference[]
  Amulet?: GearReference[]
  Set?: MiniSet[][]
  Talisman?: string[]
  SubstatPrio?: string
  Note?: string
}

type CharacterGearData = {
  builds: Record<string, RecommendedGearBuild>
}

type Props = {
  character: CharacterGearData
  weapons: Weapon[]
  amulets: Accessory[]
  talismans: Talisman[]
  sets: ArmorSet[]
}

// util local (comme ta version)
function buildRecommendedMini<T extends { name: string }>(refs: GearReference[] | undefined, fullList: T[]): Array<T & { forcedMainStat: string; usage?: string }> {
  if (!refs || refs.length === 0) return []
  return refs.reduce<Array<T & { forcedMainStat: string; usage?: string }>>((acc, ref) => {
    const item = fullList.find(i => i.name === ref.name)
    if (!item) return acc
    acc.push({
      ...item,
      forcedMainStat: ref.mainStat,
      ...(ref.usage ? { usage: ref.usage } : {}),
    })
    return acc
  }, [])
}

function resolveSet(miniName: string, sets: ArmorSet[]): ArmorSet | null {
  if (!miniName) return null
  const full = miniName.trim().endsWith("Set") ? miniName.trim() : `${miniName.trim()} Set`
  return (
    sets.find(s => s.name.toLowerCase() === full.toLowerCase()) ??
    sets.find(s => s.name.toLowerCase().includes(full.toLowerCase())) ??
    null
  )
}



// Ex: "Executioner's Charm3Sage's Charm2" → 2 entrées
function extractCharmRatings(text: string): Array<{ name: string; rating: number }> {
  const out: Array<{ name: string; rating: number }> = []
  // - capte "…Charm" comme nom (paresseux)
  // - capte un chiffre 1..3 juste après (espaces optionnels)
  // - tolère qu'il n'y ait PAS d'espace avant l’entrée suivante (lookahead)
  const re = /(.+?Charm)\s*([1-3])(?=$|[^0-9])/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const name = m[1].trim()
    const rating = parseInt(m[2], 10)
    if (name && rating >= 1 && rating <= 3) out.push({ name, rating })
  }
  return out
}

function parseSubstatPrio(str: string, t: TFunction): SubstatPriority[] {
  if (!str) return []

  const groups = str
    .split(">")
    .map(g => g.trim())
    .filter(Boolean)
    .map(g => g.split("=").map(s => s.trim().toUpperCase()))

  const maxWeight = groups.length
  const result: SubstatPriority[] = []

  groups.forEach((group, index) => {
    const weight = maxWeight - index

    group.forEach(code => {
      const data = stats[code]
      if (!data) return

      // --- conversion code → SYS_STAT_XXX key ---
      let key = "SYS_STAT_" + code
        .replace("%", "_PERCENT")
        .replace(/\s+/g, "_")
        .replace(/[^A-Z0-9_]/g, "")
        .toUpperCase()

      // fallback cohérent pour les cas manquants (CRIT RATE → SYS_STAT_CHC)
      const specialMap: Record<string, string> = {
        "CR": "SYS_STAT_CHC",
        "CRIT RATE": "SYS_STAT_CHC",
        "CRIT DMG": "SYS_STAT_CHD",
        "EFFECTIVENESS": "SYS_STAT_EFF",
        "RESISTANCE": "SYS_STAT_RES",
        "SPEED": "SYS_STAT_SPD",
      }
      if (specialMap[code]) key = specialMap[code]

      result.push({
        code,
        label: t(key, { defaultValue: code }), // ← traduit via i18n
        icon: data.icon,
        weight,
      })
    })
  })

  return result
}



function SubstatPriorityBar({ priorities, title, iconAlt, }: {
  priorities: SubstatPriority[]
  title: string
  iconAlt: string
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-white font-semibold text-base flex items-center gap-2">
        <Image
          src="/images/ui/stats.webp"
          alt={iconAlt}
          width={32}
          height={32}
          style={{ width: 32, height: 32 }}
        />
        {title}
      </p>
      <div className="flex flex-col gap-4 w-full max-w-md">
        {priorities.map((stat, i) => (
          <div key={i} className="flex flex-col items-start">
            <div className="flex items-center gap-2 mb-1">
              <Image
                src={`/images/ui/effect/${stat.icon}`}
                alt={stat.label}
                width={18}
                height={18}
                style={{ width: 18, height: 18 }}
              />

              <span className="text-sm text-white font-medium">{stat.label}</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className={`h-2 rounded-sm ${j < stat.weight ? 'bg-yellow-400' : 'bg-gray-700'}`} style={{ width: '50px' }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


export default function RecommendedGearTabs({
  character,
  weapons,
  amulets,
  talismans,
  sets,
}: Props) {
  const { t, lang } = useI18n()

  const buildKeys = useMemo(() => Object.keys(character.builds ?? {}), [character.builds])
  const [selected, setSelected] = useState<string>(buildKeys[0] ?? "")
  const tabs = useMemo(() => buildKeys.map((k) => ({ key: k, label: k })), [buildKeys])

  const currentBuild = character.builds[selected] ?? {}

  // ---- Weapons: refs -> minis (adaptés pour WeaponMiniCard)
  // buildRecommendedMini renvoie T & { forcedMainStat: string; usage?: string }
  const weaponMinis = useMemo<Array<WeaponForCard>>(
    () => buildRecommendedMini<Weapon>(currentBuild.Weapon, weapons),
    [currentBuild.Weapon, weapons]
  )

  const amuletMinis = useMemo<Array<AmuletForCard>>(
    () => buildRecommendedMini<Accessory>(currentBuild.Amulet, amulets),
    [currentBuild.Amulet, amulets]
  )
  const talismanMinis = useMemo<Talisman[]>(
    () =>
      (currentBuild.Talisman ?? [])
        .map((name) => talismans.find(t => t.name === name))
        .filter((x): x is Talisman => Boolean(x)),
    [currentBuild.Talisman, talismans]
  )

  const talismanByName = useMemo(() => {
    const map = new Map<string, Talisman>()
    talismans.forEach(t => {
      if (t.name) map.set(t.name.trim().toLowerCase(), t)
      if (t.name_jp) map.set(t.name_jp.trim().toLowerCase(), t)
      if (t.name_kr) map.set(t.name_kr.trim().toLowerCase(), t)
    })
    return map
  }, [talismans])

  function getLocalizedTalismanName(baseName: string, lang: TenantKey, byName: Map<string, Talisman>) {
    const tal = byName.get(baseName.trim().toLowerCase())
    if (!tal) return baseName
    if (lang === "jp" && tal.name_jp) return tal.name_jp
    if (lang === "kr" && tal.name_kr) return tal.name_kr
    return tal.name
  }


  const setCombos = useMemo(() => {
    if (!Array.isArray(currentBuild.Set)) return []
    return currentBuild.Set.map((option) => {
      // option: MiniSet[]
      // cas 4p: [{name:X, count:4}]
      if (option.length === 1 && option[0].count === 4) {
        const setA = resolveSet(option[0].name, sets)
        return setA ? ({ kind: "solo" as const, set: setA }) : null
      }
      // cas 2x2p: [{name:A, count:2}, {name:B, count:2}]
      if (option.length === 2 && option[0].count === 2 && option[1].count === 2) {
        const left = resolveSet(option[0].name, sets)
        const right = resolveSet(option[1].name, sets)
        return (left && right) ? ({ kind: "pair" as const, left, right }) : null
      }
      // autres cas → ignore (ou tu peux étendre plus tard)
      return null
    }).filter((x): x is { kind: "solo", set: ArmorSet } | { kind: "pair", left: ArmorSet, right: ArmorSet } => x !== null)
  }, [currentBuild.Set, sets])


  return (
    <section className="space-y-4">
      {buildKeys.length > 1 && (
        <div className="flex justify-center mb-4">
          <AnimatedTabs
            tabs={tabs}
            selected={selected}
            onSelect={setSelected}
            pillColor="#0ea5e9"
            scrollable
          />
        </div>
      )}
      <div className="rounded-xl border border-zinc-700/60 bg-zinc-900/40 p-5">
        {/* ---- Disposition 3 colonnes comme ta capture ---- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Weapons */}
          <div>
            <h4 className="text-xl font-semibold text-zinc-100 text-center mb-3">
              {t("weapons", { defaultValue: "Weapons" })}
            </h4>
            <div className="flex flex-col items-center gap-6">
              {weaponMinis.map((weapon, idx) => (
                <WeaponMiniCard key={`${weapon.name}-${idx}`} weapon={weapon} />
              ))}
            </div>
          </div>
          {/* Accessories */}
          <div>
            <h4 className="text-xl font-semibold text-zinc-100 text-center mb-3">
              {t("accessories", { defaultValue: "Accessories" })}
            </h4>
            <div className="flex flex-col items-center gap-6">
              {amuletMinis.map((amulet, idx) => (
                <AmuletMiniCard key={`${amulet.name}-${idx}`} amulet={amulet} />
              ))}
            </div>
          </div>
          {/* Sets */}
          <div>
            <h4 className="text-xl font-semibold text-zinc-100 text-center mb-3">
              {t("sets", { defaultValue: "Sets" })}
            </h4>
            {/* Rangée horizontale de combos, comme sur la capture */}
            <div className="flex flex-wrap justify-center gap-3">
              {setCombos.map((combo, idx) => (
                <div key={idx} className="shrink-0">
                  {combo.kind === "solo" ? (
                    <SetComboCard
                      solo={{ set: combo.set, count: 4 }}
                      langue={lang as TenantKey}
                    />
                  ) : (
                    <SetComboCard
                      left={{ set: combo.left, count: 2 }}
                      right={{ set: combo.right, count: 2 }}
                      langue={lang as TenantKey}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Talismans + Substat Priority en grille responsive */}
          {/* Talismans */}
          {talismanMinis.length > 0 && (
            <div className="flex flex-col items-center">
              <h5 className="text-lg font-semibold text-zinc-100 text-center mb-2">
                {t("talisman", { defaultValue: "Talismans" })}
              </h5>
              <div className="flex flex-col items-center gap-6">
                {talismanMinis.map((talisman, idx) => (
                  <TalismanMiniCard key={`${talisman.name}-${idx}`} talisman={talisman} />
                ))}
              </div>
            </div>
          )}
          {/* Substat Priority */}
          {currentBuild.SubstatPrio && (
            <div className="flex justify-center">
              <SubstatPriorityBar
                priorities={parseSubstatPrio(currentBuild.SubstatPrio, t)}
                title={t("substat_priority", { defaultValue: "Substat Priority" })}
                iconAlt={t("substat_icon_alt", { defaultValue: "Substat" })}
              />
            </div>
          )}
          {/* Notes */}
          {currentBuild.Note && (
            <div className="flex flex-col items-center">
              <h5 className="text-lg font-semibold text-zinc-100 mb-2">
                {t("notes", { defaultValue: "Notes" })}
              </h5>
              <div className="text-gray-300 text-base space-y-3">
                {currentBuild.Note.split("\n").map((line, i) => {
                  const idx = line.indexOf(":")
                  const label = idx >= 0 ? line.slice(0, idx).trim() : ""
                  const rest = idx >= 0 ? line.slice(idx + 1).trim() : line.trim()
                  const entries = extractCharmRatings(rest)

                  if (entries.length === 0) return <p key={i}>{line}</p>

                  return (
                    <div key={i}>
                      <p className="font-semibold text-white text-base">{label}:</p>
                      <ul className="ml-4 space-y-1">
                        {entries.map((e, j) => (
                          <li key={`${i}-${j}`} className="flex items-center gap-2">
                            <span className="text-white">
                              {getLocalizedTalismanName(e.name, lang as TenantKey, talismanByName)}
                            </span>
                            <div className="flex gap-[2px]">
                              {Array.from({ length: 3 }).map((_, idx) => (
                                <Image
                                  key={idx}
                                  src={`/images/ui/${idx < e.rating ? "CM_icon_star_y.webp" : "CM_icon_star_w.webp"}`}
                                  alt={idx < e.rating ? "★" : "☆"}
                                  width={16}
                                  height={16}
                                  className="object-contain"
                                />
                              ))}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  )
}
