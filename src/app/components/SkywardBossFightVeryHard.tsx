"use client"

import { useMemo, useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/app/components/ui/card"
import CompactTeamTabSelector from "@/app/components/compact/CompactTeamTabSelector"

type NoteEntry =
  | { type: "p"; string: string }
  | { type: "ul"; items: string[] }

export type FloorTeam = {
  label: string
  icon: string
  setup: string[][]
  note?: NoteEntry[]
  conditions?: string[]
}

export type FloorData = {
  floor: number
  boss: { name: string; image: string | string[] }
  note?: NoteEntry[]
  teams: Record<string, FloorTeam>
}

type TabKey = "normal" | "special_5_10_15" | "special_20"

export default function SkywardBossFightVeryHard({
  data,
  scale = 1,
}: { data: FloorData[]; scale?: number }) {
  // Groupes d’affichages
  const { normals, f5_10_15, f20 } = useMemo(() => {
    const normals: FloorData[] = []
    const f5_10_15: FloorData[] = []
    const f20: FloorData[] = []
    for (const d of data) {
      if (d.floor === 20) f20.push(d)
      else if (d.floor === 5 || d.floor === 10 || d.floor === 15) f5_10_15.push(d)
      else normals.push(d)
    }
    return { normals, f5_10_15, f20 }
  }, [data])

  const availableTabs = useMemo(() => {
    const tabs: { key: TabKey; label: string; count: number }[] = []
    if (normals.length) tabs.push({ key: "normal", label: "Normal fights", count: normals.length })
    if (f5_10_15.length) tabs.push({ key: "special_5_10_15", label: "Floors 5 / 10 / 15", count: f5_10_15.length })
    if (f20.length) tabs.push({ key: "special_20", label: "Floor 20", count: f20.length })
    return tabs
  }, [normals.length, f5_10_15.length, f20.length])

  const [tab, setTab] = useState<TabKey>(availableTabs[0]?.key ?? "normal")
  useEffect(() => {
    // réaligne l’onglet si les données changent
    if (!availableTabs.find(t => t.key === tab)) {
      setTab(availableTabs[0]?.key ?? "normal")
    }
  }, [availableTabs, tab])

  const currentList = tab === "normal" ? normals : tab === "special_5_10_15" ? f5_10_15 : f20

  return (
    <div className="grid gap-6">
      {/* Info Very Hard */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm leading-relaxed space-y-1">
            <p>Floor and condition are random (choose between 3-4 sets for every player)</p>
            <p>Floor 5/10/15 are random in position : Demiurge Stella, Demiurge Drakhan and Demiurge Vlada</p>
            <p>Floor 20 can alternate between 2 sets of boss</p>
          </div>
        </CardContent>
      </Card>

      {/* Onglets */}
      {availableTabs.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          {availableTabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={[
                "px-3 py-1.5 rounded-full text-sm border transition",
                tab === t.key
                  ? "bg-zinc-800 border-zinc-700"
                  : "bg-zinc-900/40 border-zinc-800 hover:bg-zinc-800/60"
              ].join(" ")}
            >
              {t.label}
              <span className="ml-2 text-xs text-zinc-400">({t.count})</span>
            </button>
          ))}
        </div>
      )}

      {/* Liste des combats du groupe courant */}
      <div className="grid gap-8">
        {currentList.map((fight, idx) => (
          <FightCard key={`${fight.boss.name}-${idx}`} data={fight} scale={scale} />
        ))}
        {!currentList.length && (
          <p className="text-sm text-zinc-400">No fights to display in this category.</p>
        )}
      </div>
    </div>
  )
}

/** Carte d’un combat (sans dépendre du n° d’étage dans le titre). */
function FightCard({ data, scale }: { data: FloorData; scale: number }) {
  const { boss, teams, note } = data
  const bossImages = Array.isArray(boss.image) ? boss.image : [boss.image]

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-6">
          {/* Boss */}
          <div className="flex flex-col items-center shrink-0">
            <Image
              src={`/images/characters/boss/mini/IG_Turn_${bossImages[0]}.webp`}
              alt={boss.name}
              width={80}
              height={80}
              className="rounded-lg"
            />
            <p className="mt-2 font-semibold text-[14px]">{boss.name}</p>

            {bossImages.length > 1 && (
              <div className="flex gap-1 mt-1 flex-wrap justify-center">
                {bossImages.slice(1).map((img, i) => (
                  <Image
                    key={i}
                    src={`/images/characters/boss/mini/IG_Turn_${img}.webp`}
                    alt={`${boss.name} alt ${i + 1}`}
                    width={32}
                    height={32}
                    className="rounded"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Note générale (taille limitée) */}
          {note && note.length > 0 && (
            <div className="mt-1 space-y-2 max-w-[220px] break-words">
              {note.map((n, i) =>
                n.type === "p" ? (
                  <p key={i} className="text-[13px]">{n.string}</p>
                ) : (
                  <ul key={i} className="list-disc list-outside ml-5 text-[13px]">
                    {n.items.map((it, j) => <li key={j}>{it}</li>)}
                  </ul>
                )
              )}
            </div>
          )}

          {/* Teams */}
          <TeamBlock teams={teams} scale={scale} />
        </div>
      </CardContent>
    </Card>
  )
}

function TeamBlock({
  teams,
  scale,
}: {
  teams: Record<string, FloorTeam>
  scale: number
}) {
  const teamKeys = useMemo(() => Object.keys(teams), [teams])
  const firstKey = teamKeys[0] ?? ""
  const [selectedKey, setSelectedKey] = useState<string>(firstKey)

  useEffect(() => {
    if (!selectedKey || !teams[selectedKey]) {
      setSelectedKey(firstKey)
    }
  }, [firstKey, teams, selectedKey])

  const selected = teams[selectedKey]

  if (teamKeys.length === 0) {
    return <p className="text-sm text-zinc-400">No teams available.</p>
  }

  return (
    <div className="flex-1">
      <CompactTeamTabSelector
        teams={teams}
        scale={scale}
        selectedKey={selectedKey}
        onSelect={setSelectedKey}
      />

      {selected?.conditions?.length ? (
        <div className="mt-4">
          <p className="font-semibold text-[14px]">Conditions :</p>
          <ol className="list-outside ml-5 text-[13px]">
            {selected.conditions.map((cond, i) => (
              <li key={i}>{cond}</li>
            ))}
          </ol>
        </div>
      ) : null}

      {selected?.note?.length ? (
        <div className="mt-3 space-y-2">
          {selected.note.map((n, i) =>
            n.type === "p" ? (
              <p key={i} className="text-[13px]">{n.string}</p>
            ) : (
              <ul key={i} className="list-disc list-outside ml-5 text-[13px]">
                {n.items.map((it, j) => <li key={j}>{it}</li>)}
              </ul>
            )
          )}
        </div>
      ) : null}
    </div>
  )
}
