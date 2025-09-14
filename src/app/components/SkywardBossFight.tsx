"use client"

import { useMemo, useState,useEffect } from "react"
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
  conditions?: string[] // ← conditions liées à CETTE équipe
}

export type FloorData = {
  floor: number
  boss: { name: string; image: string | string[] }
  note?: NoteEntry[]
  teams: Record<string, FloorTeam>
}

export default function SkywardBossFight({
  data,
  scale = 1,
}: { data: FloorData[]; scale?: number }) {
  return (
    <div className="grid gap-8">
      {data.map(({ floor, boss, teams, note }) => {
        // normalisation → toujours un tableau
        const bossImages = Array.isArray(boss.image) ? boss.image : [boss.image]

        return (
          <Card key={floor}>
            <CardContent>
              <h3 className="font-bold mb-4" style={{ fontSize: `20px` }}>
                Floor {floor}
              </h3>

              <div className="flex items-start gap-6">
                {/* Boss */}
                <div className="flex flex-col items-center">
                  {/* image principale */}
                  <Image
                    src={`/images/characters/boss/mini/IG_Turn_${bossImages[0]}.webp`}
                    alt={boss.name}
                    width={80}
                    height={80}
                    className="rounded-lg"
                  />
                  <p className="mt-2 font-semibold text-[14px]">{boss.name}</p>

                  {/* images secondaires si existantes */}
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

                {/* Note générale du floor */}
                {note && note.length > 0 && (
                  <div className="mt-4 space-y-2 max-w-[200px] break-words">
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
      })}
    </div>
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

  // si teams change (nouvelles clés, ordre différent), réaligner la sélection
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
          <p className="font-semibold text-[14px]">
            Conditions :
          </p>
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
